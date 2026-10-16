import fs from 'node:fs';
import { SEED_FOR_SHEET } from '../src/data/seedForSheet';

const src = fs.readFileSync('./src/services/googleSync.ts', 'utf8');
const marker = 'export const GOOGLE_APPS_SCRIPT_CODE = `';
const start = src.indexOf(marker) + marker.length;
const end = src.indexOf('`;', start);
let body = src.slice(start, end);
const seed = JSON.stringify(SEED_FOR_SHEET, null, 1);
body = body.replace('${JSON.stringify(SEED_FOR_SHEET, null, 1)}', seed);
fs.writeFileSync('./scripts/Code.gs', body, 'utf8');
console.log('OK lines:', body.split('\n').length);
console.log('has GoLink header:', body.includes('"GoLink"'));
console.log('seed replaced:', !body.includes('SEED_FOR_SHEET = ${') && body.includes('"id"'));
console.log('starts with:', JSON.stringify(body.slice(0, 30)));