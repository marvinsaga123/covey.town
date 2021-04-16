import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import {
  loginHandler,
  performUserSearchAction,
  registerHandler,
  townSubscriptionHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addUserRoutes(http: Server, app: Express): io.Server {
  /**
   * Login to Covey.Town
   */
  app.post('/login', BodyParser.json(), async (req, res) => {
    try {
      const result = await loginHandler({
        userName: req.body.userName,
        password: req.body.password,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Register an account for Covey.Town
   */
  app.post('/register', BodyParser.json(), async (req, res) => {
    try {
      const result = await registerHandler({
        userName: req.body.userName,
        password: req.body.password,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Search for a user using the specified string
   */
  app.get('/searchUsers/:currUser/:userName', BodyParser.json(), async (req, res) => {
    try {
      const result = await performUserSearchAction({
        userName: req.params.userName,
        currUser: req.params.currUser,
      });

      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
