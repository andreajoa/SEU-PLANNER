#!/usr/bin/env python3
import requests
import sys

URLS_TO_TEST = [
    'https://seu-planner-api.onrender.com',
    'https://planner-api.onrender.com',
    'https://SEU-PLANNER-API.onrender.com',
    'https://planner-backend.onrender.com',
]

print('🔍 Searching for active backend...')
for url in URLS_TO_TEST:
    try:
        r = requests.get(f'{url}/api/health', timeout=10)
        if r.status_code == 200:
            print(f'✅ FOUND: {url}/api')
            print(f'Response: {r.json()}')
            sys.exit(0)
    except:
        print(f'❌ {url}')
        
print('⚠️  No active backend found - it may be sleeping or not deployed yet')
