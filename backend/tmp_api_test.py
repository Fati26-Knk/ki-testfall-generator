import httpx
import json
API='http://127.0.0.1:8000/api/v1'
print('Health:')
try:
    r=httpx.get(f'{API}/health', timeout=5)
    print(r.status_code, r.json())
except Exception as e:
    print('Health failed', e)

print('\nGenerate:')
try:
    r=httpx.post(f'{API}/generate-test-cases', json={'user_story':'Als Benutzer möchte ich mich anmelden, damit ich mein Profil sehe','num_test_cases':2}, timeout=20)
    print('STATUS', r.status_code)
    try:
        print(json.dumps(r.json(), ensure_ascii=False, indent=2))
    except Exception:
        print(r.text)
except Exception as e:
    print('Generate failed', e)

print('\nAdopt:')
try:
    r=httpx.post(f'{API}/adopt-test-cases?project=demo', json={'user_story':'Als Benutzer möchte ich mich anmelden, damit ich mein Profil sehe','num_test_cases':2}, timeout=20)
    print('STATUS', r.status_code)
    print(r.text)
except Exception as e:
    print('Adopt failed', e)
