#!/bin/bash
# Deploy front.agentsapp.integration-ai.ru
# Run on server: sudo bash /opt/app-agent/frontforbackagent/deploy.sh
set -e
cd /opt/app-agent/frontforbackagent
DOMAIN=front.agentsapp.integration-ai.ru
SITES_AV="/etc/nginx/sites-available/$DOMAIN"
SITES_EN="/etc/nginx/sites-enabled/$DOMAIN"

echo "[1/8] npm install..."
npm ci 2>/dev/null || npm install

echo "[2/8] npm run build..."
NODE_ENV=production npm run build

echo "[3/8] apt: nginx, certbot..."
apt-get update -qq
apt-get install -y -qq nginx certbot python3-certbot-nginx

echo "[4/8] /var/www/certbot..."
mkdir -p /var/www/certbot

echo "[5/8] nginx: HTTP config (for certbot)..."
cp deploy/nginx-http.conf "$SITES_AV"
ln -sf "$SITES_AV" "$SITES_EN"
nginx -t && systemctl reload nginx

echo "[6/8] PM2: start Node app..."
npm install -g pm2 2>/dev/null || true
pm2 delete front-agentsapp 2>/dev/null || true
pm2 start .output/server/index.mjs --name front-agentsapp
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo "[7/8] certbot: SSL for $DOMAIN..."
certbot certonly --webroot -w /var/www/certbot -d "$DOMAIN" \
  --non-interactive --agree-tos --email admin@integration-ai.ru

echo "[8/8] nginx: HTTPS config..."
cp deploy/nginx-https.conf "$SITES_AV"
nginx -t && systemctl reload nginx

echo "[9] ufw: 80, 443..."
ufw allow 80
ufw allow 443
ufw status | head -5

echo "Done. Open https://$DOMAIN/"
echo "If _nuxt/*.js return 500 or 404, do a hard refresh (Ctrl+Shift+R) to load the new build."
