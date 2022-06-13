

import sirv from 'sirv';
import polka from 'polka';
import bodyParser from 'body-parser';

import compression from 'compression';
import * as sapper from '@sapper/server';
import session from 'express-session';
import sessionFileStore from 'session-file-store';

const FileStore = sessionFileStore(session);

console.log('port ', process.env.PORT);

let { PORT, HOST, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';


polka()
  .use(bodyParser.json())
  .use(
    session({
      secret: 'orans',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 8 * 60 * 60 * 1000,
      },
      store: new FileStore({
        path: process.env.NOW ? '/tmp/sessions' : '.sessions',
      }),
    }),
  )

  .use(
    compression({ threshold: 0 }),
    sirv('static', { dev }),
    sapper.middleware({
      session: req => ({
        user: req.session.user,
        current_page: req.session.current_page,
        lgin_flg: req.session.lgin_flg
      }),
    }),
  )
  .listen(PORT, '0.0.0.0', (err) => {
    if (err) console.log('error', err);
  });
