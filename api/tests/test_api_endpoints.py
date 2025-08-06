import json
from io import BytesIO
from wsgiref.util import setup_testing_defaults
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from api.app import app


def wsgi_request(method, path, body=b'', headers=None):
  env = {}
  setup_testing_defaults(env)
  env['REQUEST_METHOD'] = method
  env['PATH_INFO'] = path
  env['CONTENT_LENGTH'] = str(len(body))
  env['wsgi.input'] = BytesIO(body)
  if headers:
    env.update(headers)
  result = {}

  def start_response(status, response_headers):
    result['status'] = status
    result['headers'] = response_headers

  resp = app(env, start_response)
  data = b''.join(resp)
  status_code = int(result['status'].split()[0])
  return status_code, dict(result['headers']), data


def test_get_fields_default():
  status, _, body = wsgi_request('GET', '/fields')
  assert status == 200
  fields = json.loads(body)
  assert any(f['stateKey'] == 'vendorName' for f in fields)


def test_get_fields_content_type():
  status, _, body = wsgi_request('GET', '/fields', headers={'QUERY_STRING': 'contentType=tcfv-card'})
  assert status == 200
  fields = json.loads(body)
  assert fields[0]['stateKey'] == 'fieldA'


def test_get_fields_invalid_content_type():
  status, _, body = wsgi_request('GET', '/fields', headers={'QUERY_STRING': 'contentType=unknown'})
  assert status == 400
  assert 'unsupported contentType' in json.loads(body)['error']


def test_get_users():
  status, _, body = wsgi_request('GET', '/users')
  assert status == 200
  users = json.loads(body)
  assert users[0]['displayName'] == 'Alice'


def test_upload_requires_file():
  boundary = 'BOUND'
  body = f'--{boundary}--\r\n'.encode()
  headers = {'CONTENT_TYPE': f'multipart/form-data; boundary={boundary}'}
  status, _, body = wsgi_request('POST', '/upload', body, headers)
  assert status == 400
  assert 'No files' in json.loads(body)['error']


def test_upload_returns_filename():
  boundary = 'BOUND'
  file_content = b'hello'
  body = (
    f'--{boundary}\r\n'
    'Content-Disposition: form-data; name="files"; filename="test.txt"\r\n'
    'Content-Type: text/plain\r\n\r\n'
  ).encode() + file_content + f'\r\n--{boundary}--\r\n'.encode()
  headers = {'CONTENT_TYPE': f'multipart/form-data; boundary={boundary}'}
  status, _, body = wsgi_request('POST', '/upload', body, headers)
  assert status == 200
  data = json.loads(body)
  assert data[0]['data']['filename'] == 'test.txt'


def test_submit_endpoint():
  payload = {'fields': {'title': 'T'}, 'attachments': [], 'signature': ''}
  body = json.dumps(payload).encode()
  headers = {'CONTENT_TYPE': 'application/json'}
  status, _, body = wsgi_request('POST', '/submit', body, headers)
  assert status == 200
  resp = json.loads(body)
  assert resp['success']
  assert resp['received']['fields']['title'] == 'T'
