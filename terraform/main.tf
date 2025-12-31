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

data "google_project" "project" {
  project_id = var.project_id
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

      # Startup probe
      startup_probe {
        initial_delay_seconds = 0
        timeout_seconds       = 1
        period_seconds        = 3
        failure_threshold     = 3

        http_get {
          path = "/api/health"
          port = 8080
        }
      }

      # Liveness probe
      liveness_probe {
        initial_delay_seconds = 0
        timeout_seconds       = 1
        period_seconds        = 10
        failure_threshold     = 3

        http_get {
          path = "/api/health"
          port = 8080
        }
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


# Monitoring
locals {
  # Get project number
  project_number = data.google_project.project.number

  # Construct predictable URL
  cloud_run_url = "${var.repository_name}-${local.project_number}.${var.region}.run.app"
}

resource "google_monitoring_uptime_check_config" "health_check" {
  display_name = "Cloud Run Demo Health Check"
  timeout      = "10s"
  period       = "60s"

  http_check {
    path         = "/api/health"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"
    labels = {
      project_id = var.project_id
      host = local.cloud_run_url
    }
  }

  content_matchers {
    content = "\"status\":\"ok\""
    matcher = "CONTAINS_STRING"
  }
}

resource "google_monitoring_alert_policy" "uptime_alert" {
  display_name = "Cloud Run Demo Service Down"
  combiner     = "OR"

  conditions {
    display_name = "Uptime check failed"

    condition_threshold {
      filter          = "metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND resource.type=\"uptime_url\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.health_check.uptime_check_id}\""
      duration        = "60s"
      comparison      = "COMPARISON_LT"
      threshold_value = 1.0

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_NEXT_OLDER"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.id]

  alert_strategy {
    auto_close = "1800s" # Auto-resolve after 30 minutes if recovered
  }
}

# Notification channel (email)
resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Notification"
  type         = "email"

  labels = {
    email_address = var.email
  }
}
