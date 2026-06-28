import { environment } from './environment.js';

export const databaseConfig = {
  url: environment.databaseUrl,
  provider: 'mysql',
};
