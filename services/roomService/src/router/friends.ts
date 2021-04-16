import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import {
  acceptFriendRequestHandler,
  denyFriendRequestHandler,
  performAddFriendAction,
  performCancelFriendRequest,
  performFriendRemovalAction,
  performFriendsListAction,
  townSubscriptionHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addFriendsRoutes(http: Server, app: Express): io.Server {
  /**
   * Accept a friend request
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
   * Deny a friend request
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
   * Remove a friend from a user's friend list
   */
  app.post('/removeFriend', BodyParser.json(), async (req, res) => {
    try {
      const result = await performFriendRemovalAction({
        friend: req.body.friend,
        user: req.body.user,
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
   * Cancel a friend request
   */
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
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Accept a friend request
   */
  app.post('/addFriend', BodyParser.json(), async (req, res) => {
    try {
      const result = await performAddFriendAction({
        sender: req.body.sender,
        recipient: req.body.recipient,
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
