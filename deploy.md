# Deployment Guide — Engi Connect

This guide walks through deploying the Engi Connect application to a production Linux server using Docker Compose, Nginx reverse proxy, and Let's Encrypt SSL certificates.

---

## Prerequisites

| Requirement     | Details                                             |
| --------------- | --------------------------------------------------- |
| **Server**      | Linux VPS (Ubuntu 22.04+ recommended)               |
| **Docker**      | Docker Engine 24+ & Docker Compose v2                |
| **Domain**      | A registered domain pointing to your server's IP     |
| **Ports**       | 80 (HTTP) and 443 (HTTPS) open on firewall           |

---

## 1. Server Setup

### Install Docker & Docker Compose

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

> Log out and back in for the group change to take effect.

---

## 2. Clone the Repository

```bash
git clone https://github.com/sut68/team21.git
cd team21
```

---

## 3. Configure Environment Variables

Edit the `.env` file in the project root:

```bash
nano .env
```

Update the following values for your production environment:

```env
# Database
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=<your_db_user>
POSTGRES_PASSWORD=<strong_password>
POSTGRES_DB=engiconnect_prod
POSTGRES_SSLMODE=disable

# JWT Secret (generate a strong random key)
JWT_SECRET_KEY=<your_secret_key>

# Backend
BACKEND_PORT=8080

# CORS — replace with your domain
CORS_ALLOW_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Frontend URLs — replace with your domain
VITE_API_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com/api/chat/ws/lobby
```

> **Important:** Use strong, unique passwords for `POSTGRES_PASSWORD` and `JWT_SECRET_KEY` in production.

---

## 4. Configure Nginx

Edit `nginx/nginx.conf` and replace the domain name with your own:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

Update the SSL certificate paths accordingly:

```nginx
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
```

---

## 5. Obtain SSL Certificates

### First-Time Setup (Before HTTPS is active)

Temporarily modify `nginx/nginx.conf` to serve only HTTP for the ACME challenge. Then run:

```bash
# Start only nginx and certbot for certificate provisioning
docker compose up -d nginx

# Request certificates using Certbot
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

After certificates are obtained, restore the full `nginx.conf` with HTTPS configuration.

### Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up automatic renewal:

```bash
# Test renewal
docker compose run --rm certbot renew --dry-run

# Add to crontab for automatic renewal
crontab -e
```

Add this line to renew twice daily and reload Nginx:

```cron
0 0,12 * * * cd /path/to/team21 && docker compose run --rm certbot renew && docker compose exec nginx nginx -s reload
```

---

## 6. Build & Deploy

### Full Deployment (All Services)

```bash
docker compose up -d --build
```

This will build and start all services:

| Service      | Container            | Description                   |
| ------------ | -------------------- | ----------------------------- |
| `db`         | `postgres-prod`      | PostgreSQL 16 database        |
| `backend`    | `backend-prod`       | Go API server (port 8080)     |
| `frontend`   | `frontend-prod`      | React app served by Nginx     |
| `nginx`      | `nginx-proxy`        | Reverse proxy (ports 80/443)  |
| `certbot`    | `certbot`            | SSL certificate management    |

### Verify Deployment

```bash
# Check all containers are running
docker compose ps

# Check logs for errors
docker compose logs -f

# Test the endpoints
curl -I https://yourdomain.com          # should return 200
curl -I https://yourdomain.com/api      # should return backend response
```

---

## 7. Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Update & Redeploy

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build
```

### Stop Everything

```bash
# Stop containers (data preserved)
docker compose down

# Stop containers AND delete all data volumes
docker compose down -v
```

---

## 8. Production Checklist

- [ ] Strong `POSTGRES_PASSWORD` and `JWT_SECRET_KEY` set in `.env`
- [ ] Domain DNS A record pointing to server IP
- [ ] SSL certificates obtained and configured
- [ ] Firewall configured (ports 80, 443 open; 5432 closed to public)
- [ ] Automatic certificate renewal cron job configured
- [ ] Database backup strategy in place
- [ ] `.env` file excluded from version control (`.gitignore`)
- [ ] `GIN_MODE=release` is set for backend (already configured in `compose.yaml`)

---

## Infrastructure Diagram

```
                        Internet
                           │
                    ┌──────▼──────┐
                    │   Domain    │
                    │ DNS A Record│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Server    │
                    │ (Linux VPS) │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │     Docker Compose      │
              │    (prod-network)       │
              └────────────┬────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │    Nginx    │ │   Backend   │ │  PostgreSQL  │
   │  :80/:443   │ │   :8080     │ │   :5432      │
   │  (proxy)    │ │  (Go/Gin)   │ │   (data)     │
   └──────┬──────┘ └─────────────┘ └──────────────┘
          │
   ┌──────▼──────┐
   │  Frontend   │
   │   :3000     │
   │  (React)    │
   └─────────────┘
```

---

## Troubleshooting

| Problem                          | Solution                                                    |
| -------------------------------- | ----------------------------------------------------------- |
| Container won't start            | Check logs: `docker compose logs <service>`                 |
| Database connection refused      | Ensure `db` service is healthy: `docker compose ps`         |
| SSL certificate errors           | Verify certbot ran successfully and paths in `nginx.conf`   |
| 502 Bad Gateway                  | Backend may still be starting — wait and retry              |
| WebSocket not connecting         | Check `VITE_WS_URL` uses `wss://` and Nginx upgrade config |
| Frontend shows blank page        | Verify `VITE_API_URL` is correct and backend is responding  |
