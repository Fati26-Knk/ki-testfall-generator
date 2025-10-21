"""Small test script to call the backend generate-test-cases endpoint.
Usage:
  .\.venv\Scripts\Activate.ps1
  .\.venv\Scripts\python.exe .\test_generate.py
"""
import httpx
import json

API = "http://127.0.0.1:8000/api/v1"


def main():
    url = f"{API}/generate-test-cases"
    payload = {
        "user_story": "Als Benutzer möchte ich mich anmelden, damit ich mein Profil sehe",
        "num_test_cases": 2,
    }

    try:
        r = httpx.post(url, json=payload, timeout=30)
        print("Status:", r.status_code)
        try:
            print(json.dumps(r.json(), ensure_ascii=False, indent=2))
        except Exception:
            print(r.text)
    except Exception as e:
        print("Request failed:", e)


if __name__ == '__main__':
    main()
