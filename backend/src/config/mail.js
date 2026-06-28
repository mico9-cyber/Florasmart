import { environment } from './environment.js';

export const mailConfig = {
  host: environment.mail.host,
  port: environment.mail.port,
  user: environment.mail.user,
  pass: environment.mail.pass,
};

