import CORS from 'cors';
import Express from 'express';
import * as http from 'http';
import { AddressInfo } from 'net';
import CoveyTownsStore from './lib/CoveyTownsStore';
import addTownRoutes from './router/towns';

const app = Express();
app.use(CORS());
const server = http.createServer(app);

addTownRoutes(server, app);

server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    CoveyTownsStore.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
  }
});

// DATABASE EXAMPLES

// const { Client } = require('pg');

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });

// client.connect();

// client.query('SELECT * FROM users;', (err: any, res: { rows: any }) => {
//   if (err) console.log('ERROR!');

//   for (let row of res.rows) {
//     console.log(JSON.stringify(row));
//   }
// });

// const insertQuery = {
//   text: 'INSERT INTO users(username, password) VALUES($1, $2)',
//   values: ['Marvin', 'Marvdog'],
// }

// // promise
// client
//   .query(insertQuery)
//   .then((res: { rows: any[]; }) => console.log(res.rows))
//   .catch((e: { stack: any; }) => console.error(e.stack))
