
#!/bin/bash
set -euo pipefail

SECRET=$(/opt/elasticbeanstalk/bin/get-config environment -k CRON_SECRET)

if [ -z "$SECRET" ]; then
  echo "ERROR: CRON_SECRET is missing"
  exit 1
fi

echo "Running Employee of the Day job at $(date -u)"

printf 'header = "Authorization: Bearer %s"\n' "$SECRET" |
  curl -q --config - \
    --fail-with-body \
    --silent \
    --show-error \
    --max-time 30 \
    http://127.0.0.1:8080/api/cron/employee-of-the-day

echo
echo "Daily job completed"
