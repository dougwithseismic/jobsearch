import { resolve } from 'node:path';

export function getDataPath(): string {
  return resolve(process.cwd(), 'ashby-data');
}
