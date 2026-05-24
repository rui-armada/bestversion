variable "image" {
  description = "Docker image for the bestversion app"
  type        = string
  default     = "bestversion:latest"
}

variable "repo_url" {
  description = "Git repository URL for Argo CD to sync from"
  type        = string
  default     = "https://github.com/rui-armada/bestversion.git"
}
