#!/usr/bin/env python3
"""
Auto-test all possible Render backend URLs
Run this to discover which backend URL is working
"""

import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

# Possible backend names based on "seu-planner" frontend
backend_names = [
    "seu-planner-api",
    "seu-planner-backend",
    "seu-planner-flask",
    "seu-planner-server",
    "seu-planner-python",
    "planner-api",
    "planner-backend",
    "planner-flask",
    "planner-server",
    "planner-python",
    "api-seu-planner",
    "backend-seu-planner",
    "flask-seu-planner",
    "server-seu-planner",
    "python-seu-planner",
    "seuplanner-api",
    "seuplanner-backend",
    "seu-planner-flask-backend",
    "seu-planner-python-api"
]

def test_url(name):
    """Test if a backend URL is working"""
    url = f"https://{name}.onrender.com/api/health"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                return {
                    'name': name,
                    'url': f"https://{name}.onrender.com/api",
                    'status': '✅ WORKING',
                    'response_time': response.elapsed.total_seconds() * 1000
                }
    except:
        pass
    return {
        'name': name,
        'url': f"https://{name}.onrender.com/api",
        'status': '❌ FAILED',
        'response_time': None
    }

def main():
    print("=" * 70)
    print("🔍 AUTO-DISCOVERING RENDER BACKEND URL")
    print("=" * 70)
    print()
    print(f"Testing {len(backend_names)} possible backend names...")
    print()

    working = []
    failed = []

    # Test all URLs
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(test_url, name): name for name in backend_names}

        for future in as_completed(futures):
            result = future.result()
            if result['status'] == '✅ WORKING':
                working.append(result)
                print(f"✅ {result['name']}")
                print(f"   URL: {result['url']}")
                print(f"   Response time: {result['response_time']:.0f}ms")
                print()
            else:
                failed.append(result)

    # Show results
    print("=" * 70)
    print("RESULTS")
    print("=" * 70)
    print()

    if working:
        print(f"✅ FOUND {len(working)} WORKING BACKEND(S):")
        print()
        for i, backend in enumerate(working, 1):
            print(f"{i}. {backend['name']}")
            print(f"   URL: {backend['url']}")
            print()

        print("📝 SET THIS IN YOUR RENDER FRONTEND:")
        print("   Go to: https://dashboard.render.com")
        print("   Open: seu-planner service (frontend)")
        print("   Go to: Environment")
        print("   Edit: VITE_API_URL")
        print(f"   Set to: {working[0]['url']}")
        print()
        print("Then click 'Save Changes' and wait for redeploy!")
    else:
        print("❌ NO WORKING BACKEND FOUND!")
        print()
        print("📝 THIS MEANS:")
        print("   1. Backend doesn't exist yet")
        print("   2. Or has a different name")
        print()
        print("🚀 NEXT STEPS:")
        print("   1. Go to: https://dashboard.render.com")
        print("   2. Check if you have a Python/Flask service")
        print("   3. If not, create one with:")
        print("      - Name: planner-api")
        print("      - Root Directory: backend")
        print("      - Build: pip install -r requirements.txt")
        print("      - Start: gunicorn run:app")
        print()
        print("📖 See: COMO_ENCONTRAR_BACKEND.md for detailed guide")

if __name__ == '__main__':
    main()
