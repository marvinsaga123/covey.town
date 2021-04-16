import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import {
  acceptFriendRequestHandler,
  denyFriendRequestHandler,
  loginHandler,
  performFriendsListAction,
  performUserSearchAction,
  performAddFriendAction,
  townCreateHandler,
  townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
  performFriendRemovalAction,
  performCancelFriendRequest
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
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
   * Accept a Friend Request
   */
  app.post('/acceptFriendRequest', BodyParser.json(), async (req, res) => {
    try {
      const result = await acceptFriendRequestHandler({
        action: req.body.action,
        friendRequestSender: req.body.friendRequestSender,
        friendRequestRecipient: req.body.friendRequestRecipient,
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
   * Deny a Friend Request
   */
  app.post('/denyFriendRequest', BodyParser.json(), async (req, res) => {
    try {
      const result = await denyFriendRequestHandler({
        action: req.body.action,
        friendRequestSender: req.body.friendRequestSender,
        friendRequestRecipient: req.body.friendRequestRecipient,
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
   * Remove a Friend
   */
  app.post('/removeFriend', BodyParser.json(), async (req, res) => {
    try {
      const result = await performFriendRemovalAction({
        friend: req.body.friend,
        user: req.body.user
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  app.post('/cancelFriendRequest', BodyParser.json(), async (req, res) => {
    try {
      const result = await performCancelFriendRequest({
          action: 'cancel',
          friendRequestSender: req.body.friendRequestSender,
          friendRequestRecipient: req.body.friendRequestRecipient,
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
   * Get the pending friend requests for a user
   */
  app.get('/pendingFriendRequests/:forUser', BodyParser.json(), async (req, res) => {
    try {
      const result = await performFriendsListAction({
        action: {
          actionName: 'getPendingFriendRequests',
          errorMessage: 'Error occurred while getting pending friend requests. Please try again.',
        },
        forUser: req.params.forUser,
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
   * Get the friends list for a user
   */
  app.get('/listOfFriends/:forUser', BodyParser.json(), async (req, res) => {
    try {
      const result = await performFriendsListAction({
        action: {
          actionName: 'getCurrentListOfFriends',
          errorMessage: 'Error occurred while getting current list of friends. Please try again.',
        },
        forUser: req.params.forUser,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      console.log(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  app.get('/searchUsers/:currUser/:userName', BodyParser.json(), async (req, res) => {
    console.log("in towns")
    try {
      const result = await performUserSearchAction({
        userName: req.params.userName,
        currUser: req.params.currUser
      });

      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  app.post('/addFriend', BodyParser.json(), async (req, res) => {
    try {

      const result = await performAddFriendAction({
        sender: req.body.sender,
        recipient: req.body.recipient
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
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
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
