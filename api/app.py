import json
import cgi
from pathlib import Path

FIELD_MAPPING_PATH = Path(__file__).resolve().parent.parent / 'backend' / 'fieldMapping.json'
with FIELD_MAPPING_PATH.open() as f:
  FIELD_MAPPING = json.load(f)

USER_LIST = [
  {'id': '1', 'displayName': 'Alice'},
  {'id': '2', 'displayName': 'Bob'}
]

def app(environ, start_response):
  method = environ.get('REQUEST_METHOD', 'GET')
  path = environ.get('PATH_INFO', '/')

  if method == 'GET' and path == '/fields':
    start_response('200 OK', [('Content-Type', 'application/json')])
    return [json.dumps(FIELD_MAPPING).encode()]

  if method == 'GET' and path == '/users':
    start_response('200 OK', [('Content-Type', 'application/json')])
    return [json.dumps(USER_LIST).encode()]

  if method == 'POST' and path == '/upload':
    form = cgi.FieldStorage(fp=environ['wsgi.input'], environ=environ, keep_blank_values=True)
    files = form['files'] if 'files' in form else []
    if not isinstance(files, list):
      files = [files]
    if not files or all(not f.filename for f in files):
      start_response('400 Bad Request', [('Content-Type', 'application/json')])
      return [json.dumps({'error': 'No files uploaded'}).encode()]
    data = [{'success': True, 'data': {'filename': f.filename}} for f in files if f.filename]
    start_response('200 OK', [('Content-Type', 'application/json')])
    return [json.dumps(data).encode()]

  if method == 'POST' and path == '/submit':
    try:
      length = int(environ.get('CONTENT_LENGTH') or 0)
    except (ValueError):
      length = 0
    body = environ['wsgi.input'].read(length) if length else b'{}'
    try:
      payload = json.loads(body)
    except json.JSONDecodeError:
      payload = {}
    start_response('200 OK', [('Content-Type', 'application/json')])
    return [json.dumps({'success': True, 'received': payload}).encode()]

  start_response('404 Not Found', [('Content-Type', 'application/json')])
  return [json.dumps({'error': 'Not found'}).encode()]

if __name__ == '__main__':
  from wsgiref.simple_server import make_server

  with make_server('', 8000, app) as server:
    print('Serving on http://localhost:8000')
    server.serve_forever()
