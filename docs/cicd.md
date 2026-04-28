# CI/CD Pipeline

Stride uses GitHub Actions for CI and a global self-hosted runner on `asus-server` for production deployment.

## Branch Flow

1. Create a feature branch from `dev`.
2. Open a pull request into `dev`.
3. CI must pass before merging.
4. Open a release pull request from `dev` into `main`.
5. Merging into `main` builds and pushes a Docker image.
6. GitHub waits for approval on the `production` environment.
7. After approval, the deploy job runs on the global `asus-server` runner.

## CI Checks

The CI workflow runs on GitHub-hosted `ubuntu-latest` runners:

- `npm ci`
- `npm run prisma:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `docker build`

## Production Deployment

The production workflow builds the image on GitHub-hosted runners, then deploys from the self-hosted runner with labels:

```text
self-hosted
Linux
X64
home-prod
docker
```

Deployment steps:

1. Build the Docker image.
2. Push it to GitHub Container Registry.
3. Wait for `production` environment approval.
4. Sync deployment files into `/home/froztbitez/web-server/stride`.
5. Ensure the shared `home_proxy` Docker network exists.
6. Connect `nginxproxymanager` to `home_proxy` if it is running.
7. Pull the new app image.
8. Start PostgreSQL if needed.
9. Create a pre-deploy database backup.
10. Run `prisma migrate deploy`.
11. Restart the app container.
12. Run a container-local health check against `/api/health/db`.

## Required GitHub Setup

Create a GitHub environment named `production` and add yourself as a required reviewer.

The SSH deploy secrets are not used with the self-hosted runner model:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`

`GITHUB_TOKEN` is used for pushing and pulling the GHCR image.

## Global Runner Setup

The existing `valentine-game` runner is repo-specific and should be left untouched.

Create a global runner for future deployment workflows:

```bash
mkdir -p /home/froztbitez/actions-runner-home-prod
cd /home/froztbitez/actions-runner-home-prod
```

Use GitHub's generated download and configuration commands from an organization-level runner page if available:

```text
GitHub organization settings -> Actions -> Runners -> New self-hosted runner
```

If GitHub does not show account-level runners for your personal repositories, create a small GitHub organization for personal deployments and attach the runner there, or fall back to a repo-level runner for each repository that needs deployment.

Configure the runner with:

```bash
./config.sh \
  --url https://github.com/SebastianAben \
  --token GITHUB_GENERATED_TOKEN \
  --labels home-prod,asus-server,docker
```

Install and start it as a service:

```bash
sudo ./svc.sh install
sudo ./svc.sh start
sudo ./svc.sh status
```

The runner user must be able to run Docker:

```bash
docker ps
```

If Docker access fails:

```bash
sudo usermod -aG docker froztbitez
```

Then log out and back in, or restart the runner service.

## Required Server Setup

Stride deploys from:

```text
/home/froztbitez/web-server/stride
```

Create `.env.production` in that folder. Minimum required values:

```env
DATABASE_URL=postgresql://stride:replace-with-db-password@db:5432/stride?schema=public
AUTH_SECRET=replace-with-long-random-secret
AUTH_URL=https://stride.example.com
NEXTAUTH_URL=https://stride.example.com
NEXT_PUBLIC_APP_URL=https://stride.example.com
EXTENSION_ALLOWED_ORIGIN=chrome-extension://replace-with-extension-id
EXTENSION_PUBLIC_API_BASE_URL=https://stride.example.com
POSTGRES_DB=stride
POSTGRES_USER=stride
POSTGRES_PASSWORD=replace-with-db-password
```

Nginx Proxy Manager should route the Stride domain to:

```text
Scheme: http
Forward Hostname/IP: stride-app
Forward Port: 3000
Websockets Support: enabled
```

The app does not publish host port `3000`; it is only reachable through Docker networks.

## Migrations

Development creates migrations with:

```bash
npx prisma migrate dev --name migration_name
```

Production only applies committed migrations:

```bash
npm run prisma:migrate:deploy
```

Do not edit the production database manually unless it is an emergency fix that will also be captured in a follow-up migration.

## Rollback

If deployment fails after the image is started, set `APP_IMAGE` to the previous commit image and run on `asus-server`:

```bash
cd /home/froztbitez/web-server/stride
APP_IMAGE=ghcr.io/sebastianaben/stride:previous-commit-sha \
docker compose --env-file .env.production -f docker-compose.prod.yml up -d app
```

Database rollback is not automatic. Restore from the pre-deploy backup only after confirming the migration caused the issue.
