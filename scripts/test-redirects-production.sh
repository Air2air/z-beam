#!/bin/bash

# Test 301 redirects on production
# Usage: ./scripts/test-redirects-production.sh

echo "🌐 Testing 301 Redirects on Production"
echo "========================================"
echo ""

BASE_URL="https://www.z-beam.com"

test_redirect() {
  local from=$1
  local expected_to=$2
  local description=$3
  
  echo "Testing: $description"
  echo "  From: $from"
  
  # Follow redirects and get final URL and status code
  response=$(curl -s -L -w "\n%{http_code}\n%{url_effective}" "${BASE_URL}${from}")
  
  # Extract status code and final URL
  status_code=$(echo "$response" | tail -2 | head -1)
  final_url=$(echo "$response" | tail -1)
  
  # Get redirect status (301/302/etc) by not following redirects
  redirect_status=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${from}")
  
  if [ "$redirect_status" = "301" ]; then
    echo "  ✅ Status: 301 (Permanent Redirect)"
  else
    echo "  ⚠️  Status: $redirect_status (Expected 301)"
  fi
  
  if [[ "$final_url" == *"$expected_to" ]]; then
    echo "  ✅ Destination: $final_url"
    echo "  ✅ PASS"
  else
    echo "  ❌ Expected: ${BASE_URL}${expected_to}"
    echo "  ❌ Got: $final_url"
    echo "  ❌ FAIL"
  fi
  
  echo ""
}

echo "📋 Testing Material Page Redirects..."
echo ""

# Test flat URLs -> hierarchical
test_redirect "/granite-laser-cleaning" "/materials/stone/igneous/granite-laser-cleaning" "Granite (flat to hierarchical)"
test_redirect "/aluminum-laser-cleaning" "/materials/metal/non-ferrous/aluminum-laser-cleaning" "Aluminum (flat to hierarchical)"
test_redirect "/copper-laser-cleaning" "/materials/metal/non-ferrous/copper-laser-cleaning" "Copper (flat to hierarchical)"
test_redirect "/steel-laser-cleaning" "/materials/metal/ferrous/steel-laser-cleaning" "Steel (flat to hierarchical)"

echo "📋 Testing Category Redirects..."
echo ""

# Test category redirects
test_redirect "/metal" "/materials/metal" "Metal category"
test_redirect "/stone" "/materials/stone" "Stone category"
test_redirect "/ceramic" "/materials/ceramic" "Ceramic category"

echo "📋 Testing Root-Level Categorized URLs..."
echo ""

# Test root-level categorized -> /materials/*
test_redirect "/stone/igneous/granite-laser-cleaning" "/materials/stone/igneous/granite-laser-cleaning" "Stone/igneous/granite (root to materials)"
test_redirect "/metal/non-ferrous/aluminum-laser-cleaning" "/materials/metal/non-ferrous/aluminum-laser-cleaning" "Metal/non-ferrous/aluminum (root to materials)"

echo "========================================"
echo "✅ Testing complete!"
echo ""
echo "To test a specific redirect manually:"
echo "  curl -I ${BASE_URL}/granite-laser-cleaning"
