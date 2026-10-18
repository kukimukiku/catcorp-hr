#!/bin/bash
set -e

cat > /etc/cron.d/catcorp-hr <<'EOF'
CRON_TZ=UTC
0 6 * * * root /bin/bash /var/app/current/scripts/run-employee-of-day.sh >> /var/log/catcorp-hr-cron.log 2>&1
EOF

chmod 644 /etc/cron.d/catcorp-hr

systemctl enable --now crond

echo "CatCorp HR daily cron installed for 06:00 UTC"
