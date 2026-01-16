#!/bin/bash
set -e

echo '=========================================='
echo 'Installing dependencies...'
npm install

echo ''
echo '=========================================='
echo 'Building frontend...'
npm run build

echo ''
echo '=========================================='
echo 'Verifying build...'
if [ ! -f "dist/index.html" ]; then
  echo 'ERROR: Build failed - dist/index.html not found!'
  exit 1
fi

echo 'Build successful!'
echo 'Files in dist/:'
ls -la dist/

echo ''
echo '=========================================='
echo 'Build complete! Ready to deploy.'
echo '=========================================='
