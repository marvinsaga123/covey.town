import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import CoveyTownDatabase from '../lib/CoveyTownDatabase';
import addFriendsRoutes from '../router/friends';
import FriendsServiceClient from './FriendsServiceClient';

CoveyTownDatabase.prototype.processFriendRequestAction = jest.fn(() => Promise.resolve(true));
CoveyTownDatabase.prototype.processFriendsListAction = jest.fn(() =>
  Promise.resolve({ success: true, response: [] }),
);
CoveyTownDatabase.prototype.sendFriendRequest = jest.fn(() => Promise.resolve(true));
CoveyTownDatabase.prototype.processFriendRemoveAction = jest.fn(() => Promise.resolve(true));
CoveyTownDatabase.prototype.cancelFriendRequest = jest.fn(() => Promise.resolve(true));

describe('FriendsServiceAPIREST', () => {
  let server: http.Server;
  let friendsClient: FriendsServiceClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addFriendsRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    friendsClient = new FriendsServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });
  describe('CoveyTownProcessFriendRequestActionAPI', () => {
    it('Allows the user to accept a friend request with no error', async () => {
      try {
        await friendsClient.processIncomingFriendRequestAction({
          action: 'accept',
          friendRequestSender: 'Marvin',
          friendRequestRecipient: 'Mike',
        });
      } catch (e) {
        fail('An error occurred when attempting to accept a friend request.');
      }
    });
    it('Allows the user to deny a friend request with no error', async () => {
      try {
        await friendsClient.processIncomingFriendRequestAction({
          action: 'deny',
          friendRequestSender: 'Marvin',
          friendRequestRecipient: 'Mike',
        });
      } catch (e) {
        fail('An error occurred when attempting to deny a friend request.');
      }
    });
  });

  describe('CoveyTownProcessFriendsListAction', () => {
    it('Allows the user to get their current list of friends with no error', async () => {
      try {
        await friendsClient.processFriendsListAction({
          action: 'getCurrentListOfFriends',
          forUser: 'Marvin',
        });
      } catch (e) {
        fail('An error occurred when attempting to get the current list of friends for the user.');
      }
    });
    it('Allows the user to see their pending friend requests with no error', async () => {
      try {
        await friendsClient.processFriendsListAction({
          action: 'getPendingFriendRequests',
          forUser: 'Marvin',
        });
      } catch (e) {
        fail('An error occurred when attempting to get the pending friend requests for the user.');
      }
    });
  });

  describe('CoveyTownSendFriendRequestAPI', () => {
    it('Allows the user to send a friend request with no error', async () => {
      try {
        const sendFriendRequestRes = await friendsClient.sendOutgoingFriendRequest({
          recipient: 'Danny',
          sender: 'Rachel',
        });
        expect(sendFriendRequestRes.requestSentSuccess).toBe(true);
      } catch (e) {
        fail('An error occurred when sending a friend request to a user.');
      }
    });
  });

  describe('CoveyTownCancelFriendRequestAPI', () => {
    it('Allows the user to cancel a friend request with no error', async () => {
      try {
        const cancelFriendRequestRes = await friendsClient.cancelOutgoingFriendRequest({
          action: 'deny',
          friendRequestSender: 'Rachel',
          friendRequestRecipient: 'Danny',
        });
        expect(cancelFriendRequestRes.requestSentSuccess).toBe(true);
      } catch (e) {
        fail('An error occurred when cancelling a friend request to a user.');
      }
    });
  });

  describe('CoveyTownRemoveFriendAPI', () => {
    it('Allows the user to remove a friend from their friends list with no error', async () => {
      try {
        const removeFriendRes = await friendsClient.removeFriend({
          friend: 'Mike',
          user: 'Marvin',
        });
        expect(removeFriendRes.requestSentSuccess).toBe(true);
      } catch (e) {
        fail('An error occurred when removing a friend for a user.');
      }
    });
  });
});
