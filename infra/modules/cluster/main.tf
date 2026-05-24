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

variable "cluster_name" {
  description = "Name of the Kind cluster"
  type        = string
}

variable "host_port_http" {
  description = "Host port for app traffic (maps to NodePort 30000)"
  type        = number
  default     = 3000
}

variable "host_port_argocd" {
  description = "Host port for Argo CD UI (maps to NodePort 30080)"
  type        = number
  default     = 8080
}

variable "repo_url" {
  description = "Git repository URL for the App of Apps"
  type        = string
}

variable "repo_path" {
  description = "Path in the repo containing ArgoCD Application manifests"
  type        = string
  default     = "platform/apps"
}

variable "target_revision" {
  description = "Git branch/tag to track"
  type        = string
  default     = "main"
}

# --- Kind Cluster ---

resource "kind_cluster" "this" {
  name           = var.cluster_name
  wait_for_ready = true

  kind_config {
    kind        = "Cluster"
    api_version = "kind.x-k8s.io/v1alpha4"

    node {
      role = "control-plane"
      extra_port_mappings {
        container_port = 30000
        host_port      = var.host_port_http
        protocol       = "TCP"
      }
      extra_port_mappings {
        container_port = 30080
        host_port      = var.host_port_argocd
        protocol       = "TCP"
      }
    }
  }
}

provider "kubernetes" {
  host                   = kind_cluster.this.endpoint
  client_certificate     = kind_cluster.this.client_certificate
  client_key             = kind_cluster.this.client_key
  cluster_ca_certificate = kind_cluster.this.cluster_ca_certificate
}

provider "helm" {
  kubernetes {
    host                   = kind_cluster.this.endpoint
    client_certificate     = kind_cluster.this.client_certificate
    client_key             = kind_cluster.this.client_key
    cluster_ca_certificate = kind_cluster.this.cluster_ca_certificate
  }
}

# --- Argo CD (bootstrap only) ---

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

  depends_on = [kind_cluster.this]
}

# --- App of Apps (bootstraps all platform components) ---

resource "null_resource" "app_of_apps" {
  provisioner "local-exec" {
    command = <<-EOT
      kubectl apply --context kind-${var.cluster_name} -f - <<EOF
      apiVersion: argoproj.io/v1alpha1
      kind: Application
      metadata:
        name: platform
        namespace: argocd
      spec:
        project: default
        source:
          repoURL: ${var.repo_url}
          targetRevision: ${var.target_revision}
          path: ${var.repo_path}
        destination:
          server: https://kubernetes.default.svc
          namespace: argocd
        syncPolicy:
          automated:
            prune: true
            selfHeal: true
          syncOptions:
            - CreateNamespace=true
      EOF
    EOT
  }

  depends_on = [helm_release.argocd]
}

# --- Outputs ---

output "cluster_name" {
  value = kind_cluster.this.name
}

output "cluster_endpoint" {
  value = kind_cluster.this.endpoint
}

output "argocd_url" {
  value = "http://localhost:${var.host_port_argocd}"
}

output "app_url" {
  value = "http://localhost:${var.host_port_http}"
}
