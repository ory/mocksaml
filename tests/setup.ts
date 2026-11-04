import { readFileSync } from 'fs';
import { join } from 'path';

const fixture = (name: string) => readFileSync(join(__dirname, 'fixtures', name), 'utf8');

process.env.APP_URL = 'https://idp.test';
process.env.ENTITY_ID = 'https://idp.test/entityid';
process.env.PUBLIC_KEY = Buffer.from(fixture('idp-cert.pem')).toString('base64');
process.env.PRIVATE_KEY = Buffer.from(fixture('idp-key.pem')).toString('base64');
