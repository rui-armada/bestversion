output "cluster_name" {
  value = kind_cluster.bestversion.name
}

output "cluster_endpoint" {
  value = kind_cluster.bestversion.endpoint
}

output "app_url" {
  value = "http://localhost:3000"
}

output "argocd_url" {
  value = "http://localhost:8080"
}
