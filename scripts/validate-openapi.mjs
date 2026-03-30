import fs from 'node:fs';
import yaml from 'yaml';

const file = 'docs/api/activity-api-openapi.yaml';
const source = fs.readFileSync(file, 'utf8');
const doc = yaml.parse(source);

if (!doc?.openapi?.startsWith('3.')) {
  throw new Error('OpenAPI version missing or unsupported');
}

const requiredPaths = ['/activity/ingest', '/activity/history'];
for (const path of requiredPaths) {
  if (!doc.paths?.[path]) {
    throw new Error(`Missing required path: ${path}`);
  }
}

console.log('OpenAPI validation passed');
