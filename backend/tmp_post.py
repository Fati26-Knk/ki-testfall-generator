import httpx

url = 'http://127.0.0.1:8000/api/v1/generate-test-cases'
payload = {"user_story": "Als Benutzer möchte ich mich anmelden, damit ich mein Dashboard sehen kann.", "num_test_cases": 0}

try:
    r = httpx.post(url, json=payload, timeout=10.0)
    print('STATUS', r.status_code)
    print('HEADERS:', r.headers)
    print('TEXT:\n', r.text)
except Exception as e:
    print('ERROR', e)
