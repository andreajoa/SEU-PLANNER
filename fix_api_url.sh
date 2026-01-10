#!/bin/bash
# Auto-fix API URL in render.yaml

echo "🔧 Auto-fixing API URL..."
echo ""

# List of possible backend URLs
urls=(
  "https://seu-planner-api.onrender.com/api"
  "https://planner-api.onrender.com/api"
  "https://api-seu-planner.onrender.com/api"
)

echo "Testing possible backend URLs..."
echo ""

found_url=""

for url in "${urls[@]}"; do
  echo "Testing: $url"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url/health" --max-time 3)

  if [ "$status" = "200" ]; then
    echo "✅ FOUND! Backend URL: $url"
    found_url="$url"
    break
  fi
done

if [ -z "$found_url" ]; then
  echo "❌ No working backend found!"
  echo ""
  echo "Please go to https://dashboard.render.com"
  echo "and tell me what services you see."
  exit 1
fi

echo ""
echo "📝 Updating render.yaml..."

# Backup original
cp render.yaml render.yaml.backup

# Update render.yaml
sed -i '' "s|value: https://.*.onrender.com/api|value: $found_url|g" render.yaml

echo "✅ Updated!"
echo ""
echo "NEW CONFIGURATION:"
grep "VITE_API_URL" render.yaml
echo ""
echo "📤 Committing changes..."

git add render.yaml
git commit -m "Fix: Set correct API URL - $found_url"

echo ""
echo "⚠️  RUN THIS TO PUSH:"
echo "   git push origin main"
echo ""
echo "Then wait 2-3 minutes for redeploy!"
