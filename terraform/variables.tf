variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "europe-north1"
}

variable "repository_name" {
  description = "Artifact Registry repository name"
  type        = string
  default     = "cloud-run-demo"
}

variable "app_image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}
