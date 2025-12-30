terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_artifact_registry_repository" "app" {
  location      = var.region
  repository_id = var.repository_name
  description   = "Docker repository for Cloud Run app"
  format        = "DOCKER"
}

resource "google_cloud_run_v2_service" "app" {
  name     = var.repository_name
  location = var.region

  deletion_protection = false

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_name}/app:${var.app_image_tag}"
    }
  }
}

# Allow unauthenticated access to Cloud Run service
resource "google_cloud_run_service_iam_member" "noauth" {
  service  = google_cloud_run_v2_service.app.name
  location = google_cloud_run_v2_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
