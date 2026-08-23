import os
import sys
import time
import requests

BASE_URL = "http://localhost:8000"

def print_status(step: str, success: bool, details: str = ""):
    symbol = "✅ PASSED" if success else "❌ FAILED"
    print(f"[{symbol}] {step} - {details}")

def run_verification():
    print("=" * 60)
    print("🚀 INTELLIGENT INVOICE PROCESSING ENGINE - SYSTEM VERIFICATION")
    print("=" * 60)

    # 1. Health Check Endpoint
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=3)
        if r.status_code == 200 and r.json().get("status") == "healthy":
            print_status("1. Health Endpoint (/health)", True, f"Services: {r.json().get('services')}")
        else:
            print_status("1. Health Endpoint (/health)", False, f"Status code: {r.status_code}")
    except Exception as e:
        print_status("1. Health Endpoint (/health)", False, f"Connection Error: {e}")

    # 2. Get Invoices Directory (/api/v1/invoices)
    try:
        r = requests.get(f"{BASE_URL}/api/v1/invoices", timeout=3)
        if r.status_code == 200:
            data = r.json()
            total = data.get("total", 0)
            print_status("2. Fetch Invoices List (GET /api/v1/invoices)", True, f"Total records: {total}")
        else:
            print_status("2. Fetch Invoices List (GET /api/v1/invoices)", False, f"Status code: {r.status_code}")
    except Exception as e:
        print_status("2. Fetch Invoices List (GET /api/v1/invoices)", False, f"Error: {e}")

    # 3. Vector Similarity Search (/api/v1/invoices/search)
    try:
        search_query = "shipping logistics freight"
        r = requests.post(f"{BASE_URL}/api/v1/invoices/search?query={search_query}&limit=5", timeout=5)
        if r.status_code == 200:
            data = r.json()
            mode = data.get("search_mode")
            matches = data.get("total_matches", 0)
            print_status("3. Strict Qdrant Vector Search (POST /api/v1/invoices/search)", True, f"Mode: {mode}, Matches: {matches}")
        else:
            print_status("3. Strict Qdrant Vector Search (POST /api/v1/invoices/search)", False, f"Status code: {r.status_code}")
    except Exception as e:
        print_status("3. Strict Qdrant Vector Search (POST /api/v1/invoices/search)", False, f"Error: {e}")

    # 4. OpenAPI / Swagger Docs Verification
    try:
        r = requests.get(f"{BASE_URL}/docs", timeout=3)
        if r.status_code == 200:
            print_status("4. Interactive Swagger UI Docs (/docs)", True, "API OpenAPI Docs operational")
        else:
            print_status("4. Interactive Swagger UI Docs (/docs)", False, f"Status code: {r.status_code}")
    except Exception as e:
        print_status("4. Interactive Swagger UI Docs (/docs)", False, f"Error: {e}")

    print("=" * 60)
    print("💡 To verify interactively, open http://localhost:8000/docs in your browser.")
    print("=" * 60)

if __name__ == "__main__":
    run_verification()
