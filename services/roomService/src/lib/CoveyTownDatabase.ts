const { Client } = require('pg');

export default class CoveyTownDatabase {
  private static _instance: CoveyTownDatabase;

  private client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  constructor() {
    this.client.connect();
  }

  static getInstance(): CoveyTownDatabase {
    if (CoveyTownDatabase._instance === undefined) {
      CoveyTownDatabase._instance = new CoveyTownDatabase();
    }
    return CoveyTownDatabase._instance;
  }

  async processLogin(userName: string, password: string): Promise<boolean> {
    const text = 'SELECT * FROM users WHERE users.username=$1 and users.password=$2';
    const values = [userName, password];

    // async/await
    try {
      const res = await this.client.query(text, values);

      if (res.rows[0] != undefined) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err.stack);
      return false;
    }
  }
}
