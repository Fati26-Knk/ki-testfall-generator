import uvicorn
from tmp_min_app import app
import sys

print('RUNNER: starting uvicorn programmatically (lifespan off)')
uvicorn.run(app, host='127.0.0.1', port=8010, log_level='debug', lifespan='off')
print('RUNNER: uvicorn.run returned')
