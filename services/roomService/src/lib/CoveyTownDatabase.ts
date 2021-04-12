import { Client } from 'pg';

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

    try {
      const res = await this.client.query(text, values);
      console.log(res.rows[0]);

      if (res.rows[0] !== undefined) {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  async processAcceptFriendRequest(sender: string, recipient: string): Promise<boolean> {
    // const senderId: number;
    // const recipientId: number;
    const senderIdQuery = 'SELECT id FROM users WHERE username=$1';
    const senderIdQueryValues = [sender];

    const recipientIdQuery = 'SELECT id FROM users WHERE username=$1';
    const recipientIdQueryValues = [recipient];

    try {
      // get the ids of the users involved in this friend request
      const senderRes = await this.client.query(senderIdQuery, senderIdQueryValues);
      const recipientRes = await this.client.query(recipientIdQuery, recipientIdQueryValues);

      if (senderRes.rows[0] === undefined || recipientRes.rows[0] === undefined) {
        console.log('ERROR!');
        return false;
      }

      const senderId = senderRes.rows[0].id;
      const recipientId = recipientRes.rows[0].id;

      // delete the friend request related to these users from the friend_requests table
      const friendRequestDeletionQuery =
        'DELETE FROM friend_requests WHERE sender_id=$1 and recipient_id=$2';
      const friendRequestDeletionQueryValues = [senderId, recipientId];

      await this.client.query(friendRequestDeletionQuery, friendRequestDeletionQueryValues);

      // insert a new friend row into the friends table
      const friendEntryQuery = 'INSERT INTO friends (sender_id, recipient_id) VALUES ($1, $2)';
      const friendEntryValues = [senderId, recipientId];

      await this.client.query(friendEntryQuery, friendEntryValues);

      return true;
    } catch (err) {
      return false;
    }
  }
}
