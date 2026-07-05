#!/usr/bin/env bash
# Deploy the Hipoteza forms Lambda (Brevo integration) to your own AWS account,
# fronted by an API Gateway HTTP API (public POST endpoint).
# Infrastructure-agnostic: no account identifiers are stored in the repo.
#
# Environment variables:
#   AWS_PROFILE             (optional) AWS CLI profile to use
#   HIPOTEZA_LAMBDA_REGION  (default eu-central-1)
#   HIPOTEZA_LAMBDA_NAME    (default hipoteza-forms)
#   HIPOTEZA_ALLOW_ORIGIN   (default https://hipoteza.isy.sh)
#   HIPOTEZA_NOTIFY_EMAIL   (recipient of notifications, default pz@xfaang.com)
#   HIPOTEZA_SENDER_EMAIL   (verified Brevo sender / From; default = NOTIFY email)
#   BREVO_API_KEY           (optional here; SECRET, better set separately)
#   SIGNUP_LIST_ID          (optional Brevo list id for signups)
#
# Prints the public endpoint to wire into site/assets/config.js.
#
# Note: CORS and the OPTIONS preflight are handled inside the Lambda (see
# lambda/index.mjs), so no API-level CORS config is needed.
set -euo pipefail

# Load local config/secrets if present (gitignored, at repo root).
ENV_LOCAL="$(cd "$(dirname "$0")/.." && pwd)/.env.local"
if [ -f "$ENV_LOCAL" ]; then set -a; . "$ENV_LOCAL"; set +a; fi

REGION="${HIPOTEZA_LAMBDA_REGION:-eu-central-1}"
FN="${HIPOTEZA_LAMBDA_NAME:-hipoteza-forms}"
ORIGIN="${HIPOTEZA_ALLOW_ORIGIN:-https://hipoteza.isy.sh}"
NOTIFY="${HIPOTEZA_NOTIFY_EMAIL:-pz@xfaang.com}"
SENDER="${HIPOTEZA_SENDER_EMAIL:-$NOTIFY}"
POLL_TABLE="${HIPOTEZA_POLL_TABLE:-hipoteza-poll}"
ROLE_NAME="${FN}-role"
API_NAME="${FN}-api"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "-> Ensuring execution role $ROLE_NAME (least privilege: logs only)"
if ! aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam create-role --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' >/dev/null
  aws iam attach-role-policy --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  echo "   waiting for role propagation..."; sleep 12
fi
ROLE_ARN="$(aws iam get-role --role-name "$ROLE_NAME" --query 'Role.Arn' --output text)"

echo "-> Ensuring DynamoDB table $POLL_TABLE (homepage poll, pay-per-request)"
if ! aws dynamodb describe-table --table-name "$POLL_TABLE" --region "$REGION" >/dev/null 2>&1; then
  aws dynamodb create-table --table-name "$POLL_TABLE" \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST --region "$REGION" >/dev/null
  aws dynamodb wait table-exists --table-name "$POLL_TABLE" --region "$REGION"
fi

echo "-> Granting the role least-privilege access to the poll table"
ACCT="$(aws sts get-caller-identity --query Account --output text)"
TABLE_ARN="arn:aws:dynamodb:$REGION:$ACCT:table/$POLL_TABLE"
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name hipoteza-poll-ddb \
  --policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"dynamodb:UpdateItem\",\"dynamodb:GetItem\"],\"Resource\":\"$TABLE_ARN\"}]}" >/dev/null

echo "-> Packaging function"
ZIP="$(mktemp -d)/fn.zip"
( cd "$DIR/lambda" && zip -q -r "$ZIP" index.mjs )

if aws lambda get-function --function-name "$FN" --region "$REGION" >/dev/null 2>&1; then
  echo "-> Updating function code"
  aws lambda update-function-code --function-name "$FN" --zip-file "fileb://$ZIP" --region "$REGION" >/dev/null
  aws lambda wait function-updated --function-name "$FN" --region "$REGION"
else
  echo "-> Creating function $FN"
  aws lambda create-function --function-name "$FN" \
    --runtime nodejs20.x --handler index.handler --role "$ROLE_ARN" \
    --zip-file "fileb://$ZIP" --timeout 15 --memory-size 128 --region "$REGION" >/dev/null
  aws lambda wait function-active --function-name "$FN" --region "$REGION"
fi

echo "-> Setting environment (non-secret unless you pass them in)"
ENVVARS="ALLOW_ORIGIN=$ORIGIN,NOTIFY_EMAIL=$NOTIFY,SENDER_EMAIL=$SENDER,POLL_TABLE=$POLL_TABLE"
[ -n "${SIGNUP_LIST_ID:-}" ] && ENVVARS="$ENVVARS,SIGNUP_LIST_ID=$SIGNUP_LIST_ID"
[ -n "${BREVO_API_KEY:-}" ] && ENVVARS="$ENVVARS,BREVO_API_KEY=$BREVO_API_KEY"
aws lambda update-function-configuration --function-name "$FN" \
  --environment "Variables={$ENVVARS}" --region "$REGION" >/dev/null
aws lambda wait function-updated --function-name "$FN" --region "$REGION"

echo "-> Ensuring API Gateway HTTP API $API_NAME"
API_ID="$(aws apigatewayv2 get-apis --region "$REGION" --query "Items[?Name=='$API_NAME'].ApiId | [0]" --output text)"
if [ "$API_ID" = "None" ] || [ -z "$API_ID" ]; then
  ARN="$(aws lambda get-function --function-name "$FN" --region "$REGION" --query 'Configuration.FunctionArn' --output text)"
  API_ID="$(aws apigatewayv2 create-api --name "$API_NAME" --protocol-type HTTP --target "$ARN" --region "$REGION" --query 'ApiId' --output text)"
  ACCT="$(aws sts get-caller-identity --query Account --output text)"
  aws lambda add-permission --function-name "$FN" --statement-id apigw-invoke \
    --action lambda:InvokeFunction --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCT:$API_ID/*/*" --region "$REGION" >/dev/null 2>&1 || true
fi
ENDPOINT="$(aws apigatewayv2 get-api --api-id "$API_ID" --region "$REGION" --query 'ApiEndpoint' --output text)/"

echo ""
echo "Endpoint: $ENDPOINT"
echo "Wire this into site/assets/config.js as signupEndpoint / reviewerEndpoint / projectEndpoint."
