# API Service

The API service exposes endpoints for retrieving field mappings, uploading files, and submitting payloads.

## Environment Variables

- `FIELD_MAPPINGS_DIR`: path to the directory containing field mapping JSON files. Defaults to `../backend/fieldMappings` relative to this file. Set this if the mappings are stored elsewhere.

## Development

Install dependencies and run the test suite:

```bash
pip install -r requirements.txt
pytest
```
