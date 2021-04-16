import { Client } from 'pg';
import {
  FriendRequestAction,
  FriendsListActionName,
  FriendsListDatabaseResponse,
  RegisterDatabaseResponse,
} from '../CoveyTypes';

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

      if (res.rows[0] !== undefined) {
        return true;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  async processRegister(userName: string, password: string): Promise<RegisterDatabaseResponse> {
    try {
      const lookUpUser = 'SELECT * FROM users WHERE username=$1';
      const lookUpUserValues = [userName];
      const res = await this.client.query(lookUpUser, lookUpUserValues);

      if (res.rows.length === 0) {
        const registerUser = 'INSERT INTO users (username,password) VALUES($1,$2)';
        const registerUserValues = [userName, password];
        await this.client.query(registerUser, registerUserValues);

        return {
          success: true,
        };
      }

      return {
        success: false,
        errorMessage: 'That username is already in use. Please enter a different name.',
      };
    } catch (err) {
      return {
        success: false,
        errorMessage: err.toString(),
      };
    }
  }

  async processFriendRequestAction(
    action: FriendRequestAction,
    sender: string,
    recipient: string,
  ): Promise<boolean> {
    let senderId: number;
    let recipientId: number;

    const senderIdQuery = 'SELECT id FROM users WHERE username=$1';
    const senderIdQueryValues = [sender];

    const recipientIdQuery = 'SELECT id FROM users WHERE username=$1';
    const recipientIdQueryValues = [recipient];

    try {
      // get the ids of the users involved in this friend request
      const senderRes = await this.client.query(senderIdQuery, senderIdQueryValues);
      const recipientRes = await this.client.query(recipientIdQuery, recipientIdQueryValues);

      if (senderRes.rows[0] === undefined || recipientRes.rows[0] === undefined) {
        return false;
      }

      senderId = senderRes.rows[0].id;
      recipientId = recipientRes.rows[0].id;

      // delete the friend request related to these users from the friend_requests table
      const friendRequestDeletionQuery =
        'DELETE FROM friend_requests WHERE sender_id=$1 and recipient_id=$2';
      const friendRequestDeletionQueryValues = [senderId, recipientId];

      await this.client.query(friendRequestDeletionQuery, friendRequestDeletionQueryValues);

      if (action === 'deny') {
        return true;
      }

      return await this.processAcceptFriendRequest(senderId, recipientId);
    } catch (err) {
      return false;
    }
  }

  async processAcceptFriendRequest(senderId: number, recipientId: number): Promise<boolean> {
    try {
      // insert a new friend row into the friends table
      const friendEntryQuery = 'INSERT INTO friends (sender_id, recipient_id) VALUES ($1, $2)';
      const friendEntryValues = [senderId, recipientId];

      await this.client.query(friendEntryQuery, friendEntryValues);

      return true;
    } catch (err) {
      return false;
    }
  }

  async processFriendsListAction(
    action: FriendsListActionName,
    forUser: string,
  ): Promise<FriendsListDatabaseResponse> {
    let forUserId: number;
    let query = 'SELECT id FROM users WHERE username=$1';
    let values: string[] | number[] | [number[]] = [forUser];

    try {
      // get the user id for the passed in username
      const userIdRes = await this.client.query(query, values);

      if (userIdRes.rows[0] === undefined) {
        throw Error();
      }

      forUserId = userIdRes.rows[0].id;

      // query the appropriate table to get a list of user IDs
      const tableToQuery = action === 'getPendingFriendRequests' ? 'friend_requests' : 'friends';

      query = `SELECT * FROM ${tableToQuery} WHERE recipient_id=$1`;
      values = [forUserId];

      let queryRes = await this.client.query(query, values);

      if (queryRes.rows.length === 0) {
        return {
          success: true,
          response: [],
        };
      }

      const listOfIds = queryRes.rows.map(row => row.sender_id);

      // get the list of names for the list of ids above
      query = 'SELECT * FROM users WHERE id = ANY($1)';
      values = [listOfIds];

      queryRes = await this.client.query(query, values);

      if (queryRes.rows.length !== listOfIds.length) {
        return {
          success: false,
          response: [],
        };
      }

      const listOfUsernames = queryRes.rows.map(row => row.username);

      return {
        success: true,
        response: listOfUsernames,
      };
    } catch (err) {
      return {
        success: false,
        response: [],
      };
    }
  }
}
