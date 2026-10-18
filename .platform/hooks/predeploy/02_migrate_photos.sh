#!/bin/bash
set -e

echo "Migrating CatCorp HR photos from Vercel Blob to S3..."
node scripts/migrate-photos.mjs
echo "Photo migration finished."
