output "artifact_registry_repository" {
  description = "Artifact Registry repository URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app.repository_id}"
}
output "docker_build_command" {
  description = "Command to build Docker image"
  value       = "docker build -t ${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_name}/app:${var.app_image_tag} ."
}
output "docker_push_command" {
  description = "Command to push Docker image"
  value       = "docker push ${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_name}/app:${var.app_image_tag}"
}
output "cloud_run_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.app.uri
}
