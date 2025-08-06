import json
import cgi
import logging
from pathlib import Path
from urllib.parse import parse_qs

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

FIELD_MAPPINGS_DIR = Path(__file__).resolve().parent.parent / 'backend' / 'fieldMappings'
CONTENT_TYPE_MAP = {
  'vendor-invoice': 'vendor-invoice.json',
  'tcfv-card': 'tcfv-card.json',
  'personal-card': 'personal-card.json'
}
DEFAULT_CONTENT_TYPE = 'vendor-invoice'

USER_LIST = [
  {'id': '1', 'displayName': 'Alice'},
  {'id': '2', 'displayName': 'Bob'}
]


def load_field_mapping(content_type: str):
  filename = CONTENT_TYPE_MAP.get(content_type)
  if not filename:
    raise ValueError(f"unsupported contentType '{content_type}'")
  path = FIELD_MAPPINGS_DIR / filename
  logger.debug('loading field mapping from %s', path)
  with path.open() as f:
    data = json.load(f)
  return data['fields']


def app(environ, start_response):
  method = environ.get('REQUEST_METHOD', 'GET')
  path = environ.get('PATH_INFO', '/')

  if method == 'GET' and path == '/fields':
    qs = parse_qs(environ.get('QUERY_STRING', ''))
    content_type = qs.get('contentType', [DEFAULT_CONTENT_TYPE])[0]
    try:
      fields = load_field_mapping(content_type)
    except ValueError as e:
      logger.warning('invalid contentType %s', content_type)
      start_response('400 Bad Request', [('Content-Type', 'application/json')])
      return [json.dumps({'error': str(e)}).encode()]
    except FileNotFoundError:
      logger.error('mapping file not found for %s', content_type)
      start_response('404 Not Found', [('Content-Type', 'application/json')])
      return [json.dumps({'error': 'Mapping file not found'}).encode()]
    except json.JSONDecodeError:
      logger.error('JSON parse error for %s', content_type)
      start_response('500 Internal Server Error', [('Content-Type', 'application/json')])
      return [json.dumps({'error': 'Error parsing mapping file'}).encode()]

    start_response('200 OK', [('Content-Type', 'application/json')])
    return [json.dumps(fields).encode()]

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

