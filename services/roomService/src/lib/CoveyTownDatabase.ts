import { Client } from 'pg';
import {
  Friend,
  Friendship,
  FriendsListActionName,
  FriendsListDatabaseResponse,
  RegisterDatabaseResponse,
  SearchResponse,
} from '../CoveyTypes';
import CoveyTownsStore from './CoveyTownsStore';

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
    action: string,
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

  async processFriendRemoveAction(friend: string, user: string): Promise<boolean> {
    let friendId: number;
    let userId: number;

    const friendIdQuery = 'SELECT id FROM users WHERE username=$1';
    const userIdQuery = 'SELECT id FROM users WHERE username=$1';

    try {
      const friendRes = await this.client.query(friendIdQuery, [friend]);
      const userRes = await this.client.query(userIdQuery, [user]);
      friendId = friendRes.rows[0].id;
      userId = userRes.rows[0].id;

      const friendDeletionQuery =
        'DELETE FROM friends WHERE (sender_id=$1 and recipient_id=$2) OR (sender_id=$2 and recipient_id=$1)';
      const friendDeletionQueryValues = [friendId, userId];

      await this.client.query(friendDeletionQuery, friendDeletionQueryValues);

      return true;
    } catch (err) {
      return false;
    }
  }

  async cancelFriendRequest(sender: string, recipient: string): Promise<boolean> {
    let senderId: number;
    let recipientId: number;

    const senderIdQuery = 'SELECT id FROM users WHERE username=$1';
    const recipientIdQuery = 'SELECT id FROM users WHERE username=$1';

    try {
      const senderRes = await this.client.query(senderIdQuery, [sender]);
      const recipientRes = await this.client.query(recipientIdQuery, [recipient]);
      senderId = senderRes.rows[0].id;
      recipientId = recipientRes.rows[0].id;

      const requestCancelQuery =
        'DELETE FROM friend_requests WHERE (sender_id=$1 and recipient_id=$2)';

      await this.client.query(requestCancelQuery, [senderId, recipientId]);

      return true;
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

  async searchUsers(userName: string, currUser: string): Promise<SearchResponse> {
    const currUserIdQuery = 'SELECT id FROM users WHERE username=$1';
    const currUserIdQueryValues = [currUser];

    try {
      // get the user Id of the current user
      const currUserIdResponse = await this.client.query(currUserIdQuery, currUserIdQueryValues);
      const currUserId = currUserIdResponse.rows[0].id;

      // search for all users matching the given username and friendship information
      const query =
        'SELECT DISTINCT users.id, username, friends.sender_id as friends, friend_requests.sender_id as requests FROM users FULL JOIN friends ON (users.id = friends.sender_id AND $2 = friends.recipient_id) OR (users.id = friends.recipient_id AND $2 = friends.sender_id) FULL JOIN friend_requests ON (users.id = friend_requests.sender_id AND $2 = friend_requests.recipient_id) OR (users.id = friend_requests.recipient_id AND $2 = friend_requests.sender_id) WHERE username LIKE $1';
      const values = [`${userName}%`, currUserId];

      const res = await this.client.query(query, values);

      // if no users match the given username, return
      if (res.rows.length === 0) {
        return {
          success: true,
          listOfUsers: [],
        };
      }

      const fetchedUsers: Friendship[] = [];

      // if there are users that match the given username, determine if they are friends with the current user
      res.rows.forEach(row => {
        let friends = false;

        if (row.friends != null || row.requests != null) {
          friends = true;
        }

        const friendship = { username: row.username, friendship: friends };

        fetchedUsers.push(friendship);
      });

      return {
        success: true,
        listOfUsers: fetchedUsers,
      };
    } catch (err) {
      return {
        success: false,
        listOfUsers: [],
      };
    }
  }

  async sendFriendRequest(sender: string, recipient: string): Promise<boolean> {
    let senderId: number;
    let recipientId: number;

    const senderIdQuery = 'SELECT id FROM users WHERE username=$1';
    const senderIdQueryValues = [sender];

    const recipientIdQuery = 'SELECT id FROM users WHERE username=$1';
    const recipientIdQueryValues = [recipient];

    try {
      const senderRes = await this.client.query(senderIdQuery, senderIdQueryValues);
      const recipientRes = await this.client.query(recipientIdQuery, recipientIdQueryValues);

      if (senderRes.rows[0] === undefined || recipientRes.rows[0] === undefined) {
        return false;
      }

      senderId = senderRes.rows[0].id;
      recipientId = recipientRes.rows[0].id;

      const friendRequestEntryQuery =
        'INSERT INTO friend_requests (sender_id, recipient_id) VALUES ($1, $2)';
      const friendRequestEntryValues = [senderId, recipientId];

      await this.client.query(friendRequestEntryQuery, friendRequestEntryValues);

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
    const values: string[] | number[] | [number[]] = [forUser];

    try {
      // get the user id for the passed in username
      const userIdRes = await this.client.query(query, values);

      if (userIdRes.rows[0] === undefined) {
        throw Error();
      }

      forUserId = userIdRes.rows[0].id;
      const fetchedUsers: Friend[] = [];

      // query the appropriate tables to get a list of user info
      if (action === 'getPendingFriendRequests') {
        query =
          'SELECT DISTINCT * FROM users AS u INNER JOIN friend_requests AS f1 ON (u.id = f1.sender_id OR u.id = f1.recipient_id) WHERE (f1.recipient_id = $1 OR f1.sender_id = $1)';

        const queryRes = await this.client.query(query, [forUserId]);

        if (queryRes.rows.length === 0) {
          return {
            success: true,
            response: [],
          };
        }

        queryRes.rows.forEach(row => {
          let friend: Friend;
          if (row.sender_id === forUserId) {
            friend = {
              username: row.username,
              online: false,
              room: '',
              requestSender: forUser,
              requestRecipient: row.username,
            };
          } else {
            friend = {
              username: row.username,
              online: false,
              room: '',
              requestSender: row.username,
              requestRecipient: forUser,
            };
          }
          fetchedUsers.push(friend);
        });
      } else {
        query =
          'SELECT * FROM users INNER JOIN friends ON (users.id = friends.sender_id OR users.id = friends.recipient_id) WHERE (friends.recipient_id = $1 OR friends.sender_id = $1)';

        const queryRes = await this.client.query(query, [forUserId]);

        if (queryRes.rows.length === 0) {
          return {
            success: true,
            response: [],
          };
        }

        const townsStore = CoveyTownsStore.getInstance();
        const towns = townsStore.getTowns();

        queryRes.rows.forEach(row => {
          let friend: Friend;
          if (row.current_room) {
            const currRoom = towns.find(t => t.friendlyName === row.current_room);
            if (currRoom) {
              const controller = townsStore.getControllerForTown(currRoom.coveyTownID);
              if (controller && controller.isPubliclyListed) {
                friend = {
                  username: row.username,
                  online: true,
                  room: row.current_room,
                  roomId: row.room_id,
                  requestSender: '',
                  requestRecipient: '',
                };
              } else {
                friend = {
                  username: row.username,
                  online: true,
                  room: '',
                  requestSender: '',
                  requestRecipient: '',
                };
              }
            } else {
              friend = {
                username: row.username,
                online: true,
                room: '',
                requestSender: '',
                requestRecipient: '',
              };
            }
          } else {
            friend = {
              username: row.username,
              online: false,
              room: '',
              requestSender: '',
              requestRecipient: '',
            };
          }
          fetchedUsers.push(friend);
        });
      }

      return {
        success: true,
        response: fetchedUsers,
      };
    } catch (err) {
      return {
        success: false,
        response: [],
      };
    }
  }

  async updateUserCurrentRoom(
    userName: string,
    roomName: string,
    roomId: string,
  ): Promise<boolean> {
    const query = 'UPDATE users SET current_room=$1, room_id=$2 WHERE username=$3';
    const queryValues = [roomName, roomId, userName];

    try {
      await this.client.query(query, queryValues);
      return true;
    } catch (err) {
      return false;
    }
  }
}
