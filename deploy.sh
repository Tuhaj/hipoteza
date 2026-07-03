#!/usr/bin/env bash
# Deploy the static Hipoteza site to your own S3 bucket + CloudFront distribution.
#
# This script is infrastructure-agnostic: it reads the target from environment
# variables so no account-specific identifiers live in the repository.
#
#   HIPOTEZA_BUCKET           S3 bucket name (required)
#   HIPOTEZA_DISTRIBUTION_ID  CloudFront distribution id (optional; skips invalidation if unset)
#   AWS_PROFILE               AWS CLI profile to use (optional)
#
# Example:
#   HIPOTEZA_BUCKET=my-bucket HIPOTEZA_DISTRIBUTION_ID=XXXX ./deploy.sh
set -euo pipefail

# Load local config/secrets if present (gitignored).
ENV_LOCAL="$(cd "$(dirname "$0")" && pwd)/.env.local"
if [ -f "$ENV_LOCAL" ]; then set -a; . "$ENV_LOCAL"; set +a; fi

BUCKET="${HIPOTEZA_BUCKET:?Set HIPOTEZA_BUCKET to your S3 bucket name}"
DISTRIBUTION_ID="${HIPOTEZA_DISTRIBUTION_ID:-}"
SITE_DIR="$(cd "$(dirname "$0")/site" && pwd)"

echo "-> Syncing assets (long cache)..."
aws s3 sync "$SITE_DIR/assets" "s3://$BUCKET/assets" \
  --cache-control "public, max-age=86400" \
  --exclude "*.js" \
  --exclude "*.woff2" \
  --delete

echo "-> Uploading fonts (immutable, 1 year)..."
if compgen -G "$SITE_DIR/assets/fonts/*.woff2" > /dev/null; then
  for f in "$SITE_DIR"/assets/fonts/*.woff2; do
    aws s3 cp "$f" "s3://$BUCKET/assets/fonts/$(basename "$f")" \
      --content-type "font/woff2" \
      --cache-control "public, max-age=31536000, immutable"
  done
fi

echo "-> Uploading JS assets with correct content-type..."
for f in "$SITE_DIR"/assets/*.js; do
  aws s3 cp "$f" "s3://$BUCKET/assets/$(basename "$f")" \
    --content-type "application/javascript; charset=utf-8" \
    --cache-control "public, max-age=86400"
done

echo "-> Uploading HTML pages (short cache)..."
for f in "$SITE_DIR"/*.html; do
  aws s3 cp "$f" "s3://$BUCKET/$(basename "$f")" \
    --content-type "text/html; charset=utf-8" \
    --cache-control "public, max-age=300"
done

if [ -f "$SITE_DIR/sitemap.xml" ]; then
  echo "-> Uploading sitemap.xml..."
  aws s3 cp "$SITE_DIR/sitemap.xml" "s3://$BUCKET/sitemap.xml" \
    --content-type "application/xml; charset=utf-8" \
    --cache-control "public, max-age=3600"
fi

if [ -f "$SITE_DIR/robots.txt" ]; then
  echo "-> Uploading robots.txt..."
  aws s3 cp "$SITE_DIR/robots.txt" "s3://$BUCKET/robots.txt" \
    --content-type "text/plain; charset=utf-8" \
    --cache-control "public, max-age=3600"
fi

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "-> Invalidating CloudFront..."
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query "Invalidation.Status" --output text
fi

echo "Done."
