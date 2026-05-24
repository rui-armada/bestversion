terraform {
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "~> 0.6"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.14"
    }
  }
  required_version = ">= 1.0"
}

provider "kind" {}

resource "kind_cluster" "bestversion" {
  name           = "bestversion"
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
      extra_port_mappings {
        container_port = 30000
        host_port      = 3000
        protocol       = "TCP"
      }
      extra_port_mappings {
        container_port = 30080
        host_port      = 8080
        protocol       = "TCP"
      }
    }
  }
}

provider "kubernetes" {
  host                   = kind_cluster.bestversion.endpoint
  client_certificate     = kind_cluster.bestversion.client_certificate
  client_key             = kind_cluster.bestversion.client_key
  cluster_ca_certificate = kind_cluster.bestversion.cluster_ca_certificate
}

provider "helm" {
  kubernetes {
    host                   = kind_cluster.bestversion.endpoint
    client_certificate     = kind_cluster.bestversion.client_certificate
    client_key             = kind_cluster.bestversion.client_key
    cluster_ca_certificate = kind_cluster.bestversion.cluster_ca_certificate
  }
}

resource "kubernetes_namespace" "app" {
  metadata {
    name = "bestversion"
  }

  depends_on = [kind_cluster.bestversion]
}

# --- Argo CD ---

resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = "7.7.15"
  namespace        = "argocd"
  create_namespace = true
  wait             = true
  timeout          = 600

  set {
    name  = "server.service.type"
    value = "NodePort"
  }

  set {
    name  = "server.service.nodePortHttp"
    value = "30080"
  }

  set {
    name  = "configs.params.server\\.insecure"
    value = "true"
  }

  depends_on = [kind_cluster.bestversion]
}

resource "null_resource" "argocd_app" {
  provisioner "local-exec" {
    command = "kubectl apply -f ${path.module}/argocd-app.yaml --context kind-bestversion"
  }

  depends_on = [helm_release.argocd, kubernetes_namespace.app]
}
