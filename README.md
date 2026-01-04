# Cloud Run Demo

A learning project to explore and experiment with Google Cloud Run, Firebase, Terraform, Docker, GCS, Cloud Monitoring and Next.js.

## Local Development

1. Create `.env.local` file with required environment variables
2. Install dependencies and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

## Deployment

Deploy to Google Cloud Run:

1. Create `terraform/terraform.tfvars`:

```hcl
project_id = "your-gcp-project-id"
region     = "europe-north1"
email      = "your-email@example.com"
```

2. Create `terraform/backend.tfvars`:

```hcl
bucket = "your-terraform-state-bucket"
prefix = "terraform/state"
```

3. Create Artifact Registry repository first:

```bash
cd terraform
terraform init -backend-config=backend.tfvars
terraform apply -target=google_artifact_registry_repository.app
```

4. Build and push Docker image:

```bash
# Set your variables
PROJECT_ID="your-gcp-project-id"
REGION="europe-north1"
REPOSITORY="cloud-run-demo"
IMAGE_TAG="latest"

# Build and push
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/app:${IMAGE_TAG}"
docker build -t ${IMAGE} .
docker push ${IMAGE}
```

5. Deploy remaining infrastructure with Terraform:

```bash
cd terraform
terraform apply
```
