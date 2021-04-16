import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import CoveyTownDatabase from '../lib/CoveyTownDatabase';
import addUserRoutes from '../router/users';
import UserServiceClient, { Friendship } from './UserServiceClient';

type User = {
  username: string;
  password: string;
};

CoveyTownDatabase.prototype.processLogin = jest.fn((username: string, password: string) => {
  const usersInDatabase: User[] = [{ username: 'Marvin', password: 'Test' }];
  let userExists = false;

  usersInDatabase.forEach(user => {
    if (user.username === username && user.password === password) {
      userExists = true;
    }
  });

  return Promise.resolve(userExists);
});

CoveyTownDatabase.prototype.processRegister = jest.fn((username: string) => {
  const usersInDatabase: User[] = [{ username: 'Marvin', password: 'Test' }];
  let canRegisterUsername = true;

  usersInDatabase.forEach(user => {
    if (user.username === username) {
      canRegisterUsername = false;
    }
  });

  return Promise.resolve({
    success: canRegisterUsername,
  });
});

CoveyTownDatabase.prototype.searchUsers = jest.fn((searchTerm: string) => {
  const usersInDatabase: User[] = [{ username: 'Mike', password: 'Test' }];
  const usersMatchingSearchTerm: Friendship[] = [];

  usersInDatabase.forEach(user => {
    if (user.username.includes(searchTerm)) {
      usersMatchingSearchTerm.push({ username: user.username, friendship: false });
    }
  });

  return Promise.resolve({ success: true, listOfUsers: usersMatchingSearchTerm });
});

describe('UserServiceAPIREST', () => {
  let server: http.Server;
  let userClient: UserServiceClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addUserRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    userClient = new UserServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });
  describe('CoveyTownLoginAPI', () => {
    it('Allows the user to login with existing user credentials', async () => {
      try {
        const loginRes = await userClient.login({ userName: 'Marvin', password: 'Test' });
        expect(loginRes.loggedInSuccessfully).toBe(true);
      } catch (e) {
        fail('An error occurred when attempting to log in.');
      }
    });
    it('Does not allow the user to login with incorrect user credentials', async () => {
      try {
        const loginRes = await userClient.login({ userName: 'Marvin', password: 'Testing' });
        expect(loginRes.loggedInSuccessfully).toBe(false);
      } catch (e) {
        fail('An error occurred when attempting to log in.');
      }
    });
  });

  describe('CoveyTownRegisterAPI', () => {
    it('Allows the user to register with a username that does not exist', async () => {
      try {
        const registerRes = await userClient.register({ userName: 'Michael', password: 'Testing' });
        expect(registerRes.registerSuccessfully).toBe(true);
      } catch (e) {
        fail('An error occurred when attempting to register the new user.');
      }
    });
    it('Does not allow the user to register with a username that already exists', async () => {
      try {
        const registerRes = await userClient.register({ userName: 'Marvin', password: 'Testing' });
        expect(registerRes.registerSuccessfully).toBe(false);
      } catch (e) {
        fail('An error occurred when attempting to register the new user.');
      }
    });
  });

  describe('CoveyTownSearchUsersAPI', () => {
    it('Returns a user for an appropriate search query', async () => {
      try {
        const searchRes = await userClient.searchUsers({ userName: 'Mike', currUser: 'Marvin' });
        expect(searchRes.listOfUsers).toHaveLength(1);
      } catch (e) {
        fail('An error occurred when searching for a user.');
      }
    });
    it('Returns no users when no usernames match the search query', async () => {
      try {
        const searchRes = await userClient.searchUsers({ userName: 'Frank', currUser: 'Marvin' });
        expect(searchRes.listOfUsers).toHaveLength(0);
      } catch (e) {
        fail('An error occurred when searching for a user.');
      }
    });
  });
});
