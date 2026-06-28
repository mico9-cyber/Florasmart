import path from 'node:path';
import { environment } from './environment.js';

export const uploadConfig = {
  rootDir: path.resolve(process.cwd(), environment.uploads.path),
};

