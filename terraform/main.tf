terraform {
  backend "gcs" {} # Empty - config provided externally

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.8.0"
    }
  }
}

resource "google_storage_bucket" "terraform_state" {
  name     = "${var.project_id}-terraform-state"
  location = var.region

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
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

# Enable Firestore API
resource "google_project_service" "firestore" {
  service            = "firestore.googleapis.com"
  disable_on_destroy = false
}

# Create Firestore database in native mode
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.firestore_location
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.firestore]
}

# Setup Cloud Run
resource "google_cloud_run_v2_service" "app" {
  name     = var.repository_name
  location = var.region

  deletion_protection = false

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_name}/app:${var.app_image_tag}"

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }
    }
  }

  scaling {
    min_instance_count = 0
  }

  depends_on = [google_firestore_database.database]
}

# Allow unauthenticated access to Cloud Run service
resource "google_cloud_run_service_iam_member" "noauth" {
  service  = google_cloud_run_v2_service.app.name
  location = google_cloud_run_v2_service.app.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
