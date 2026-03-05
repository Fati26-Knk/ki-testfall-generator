import uvicorn
from app.main import app
import sys

print('RUNNER: starting uvicorn programmatically')
uvicorn.run(app, host='127.0.0.1', port=8000, log_level='debug')
print('RUNNER: uvicorn.run returned')
