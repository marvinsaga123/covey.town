import assert from 'assert';
import { Socket } from 'socket.io';
import { CoveyTownList, FriendsListAction, UserLocation } from '../CoveyTypes';
import CoveyTownDatabase from '../lib/CoveyTownDatabase';
import CoveyTownsStore from '../lib/CoveyTownsStore';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';

type Friendship = {
  username: string;
  friendship: boolean;
};

type Friend = {
  username: string;
  online: boolean;
  room: string;
  requestSender: string;
  requestRecipient: string;
};

/**
 * The format of a request to perform a friends list action on behalf of a user, as dispatched by server
 * middleware
 */
export interface FriendsListActionRequest {
  /** the friends list action to perform */
  action: FriendsListAction;
  /** the user to perform the friends list action for */
  forUser: string;
}

/**
 * The format of a response to perform a friends list action on behalf of a user, as dispatched by the
 * handler to the server middleware
 */
export interface FriendsListActionResponse {
  /** the list of users returned for the friends list action */
  listOfUsers: Friend[];
}
/**
 * The format of a request to accept or deny a friend request, as dispatched by server middleware
 */
export interface FriendRequest {
  /** is the recipient accepting or denying the friend request? */
  action: string;
  /** username of the player who sent the friend request */
  friendRequestSender: string;
  /** username of the player who received and is accepting the friend request */
  friendRequestRecipient: string;
}

/**
 * The format of a request to send a friend request, as dispatched by sever middleware
 */
export interface AddFriendRequest {
  /** userName to be searched for */
  recipient: string;
  sender: string;
}

/**
 * The format of a response to send a friend request, as dispatched by the handler to the server
 * middleware
 */
export interface AddFriendResponse {
  /** Does a user exist that matches the given username? */
  requestSentSuccess: boolean;
}

/**
 * The format of a request to cancel a friend request, as dispatched by sever middleware
 */
export interface RemoveFriendRequest {
  /** userName to be searched for */
  friend: string;
  user: string;
}

/**
 * The format of a response to cancel a friend reques or remove a current friend, as dispatched by the
 * handler to the server middleware
 */
export interface RemoveFriendResponse {
  /** Does a user exist that matches the given username? */
  requestSentSuccess: boolean;
}

/**
 * The format of a request to search for an existing user in Covey.Town, as dispatched by the server
 * middleware
 */
export interface SearchUsersRequest {
  /** userName to be searched for */
  userName: string;
  /** Current user performing the search */
  currUser: string;
}

/**
 * The format of a response to search for an existing user in Covey.Town, as returned by the handler to
 * the server middleware
 */
export interface SearchUsersResponse {
  /** Does a user exist that matches the given username? */
  listOfUsers: Friendship[];
}

/**
 * The format of a request to register an account in Covey.town, as dispatched by the server middleware
 */
export interface RegisterRequest {
  /** userName of the player attempting to login */
  userName: string;
  /** password of the player attempting to login */
  password: string;
}

/**
 * The format of a response to login to Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface RegisterResponse {
  /** Does a user exist with the sent userName and passord? */
  registerSuccessfully: boolean;
  /** Error message if register was not successful */
  errorMessage?: string;
}

/**
 * The format of a request to login to Covey.Town, as dispatched by the server middleware
 */
export interface LoginRequest {
  /** userName of the player attempting to login */
  userName: string;
  /** password of the player attempting to login */
  password: string;
}

/**
 * The format of a response to login to Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface LoginResponse {
  /** Does a user exist with the sent userName and passord? */
  loggedInSuccessfully: boolean;
}

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface TownJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

/**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface TownJoinResponse {
  /** Unique ID that represents this player * */
  coveyUserID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  coveySessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
}

/**
 * Payload sent by client to create a Town in Covey.Town
 */
export interface TownCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
}

/**
 * Response from the server for a Town create request
 */
export interface TownCreateResponse {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  towns: CoveyTownList;
}

/**
 * Payload sent by the client to delete a Town
 */
export interface TownDeleteRequest {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Payload sent by the client to update a Town.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface TownUpdateRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

/**
 * A handler to process a player's request to join a town. The flow is:
 *  1. Client makes a TownJoinRequest, this handler is executed
 *  2. Client uses the sessionToken returned by this handler to make a subscription to the town,
 *  @see townSubscriptionHandler for the code that handles that request.
 *
 * @param requestData an object representing the player's request
 */
export async function townJoinHandler(
  requestData: TownJoinRequest,
): Promise<ResponseEnvelope<TownJoinResponse>> {
  const townsStore = CoveyTownsStore.getInstance();

  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
  if (!coveyTownController) {
    return {
      isOK: false,
      message: 'Error: No such town',
    };
  }
  const newPlayer = new Player(requestData.userName);
  const newSession = await coveyTownController.addPlayer(newPlayer);
  assert(newSession.videoToken);
  return {
    isOK: true,
    response: {
      coveyUserID: newPlayer.id,
      coveySessionToken: newSession.sessionToken,
      providerVideoToken: newSession.videoToken,
      currentPlayers: coveyTownController.players,
      friendlyName: coveyTownController.friendlyName,
      isPubliclyListed: coveyTownController.isPubliclyListed,
    },
  };
}

export async function townListHandler(): Promise<ResponseEnvelope<TownListResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  return {
    isOK: true,
    response: { towns: townsStore.getTowns() },
  };
}

export async function townCreateHandler(
  requestData: TownCreateRequest,
): Promise<ResponseEnvelope<TownCreateResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  if (requestData.friendlyName.length === 0) {
    return {
      isOK: false,
      message: 'FriendlyName must be specified',
    };
  }
  const newTown = townsStore.createTown(requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: true,
    response: {
      coveyTownID: newTown.coveyTownID,
      coveyTownPassword: newTown.townUpdatePassword,
    },
  };
}

export async function loginHandler(
  requestData: LoginRequest,
): Promise<ResponseEnvelope<LoginResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const loggedInSuccessfully = await databaseInstance.processLogin(
    requestData.userName,
    requestData.password,
  );

  return {
    isOK: true,
    response: {
      loggedInSuccessfully,
    },
  };
}

export async function acceptFriendRequestHandler(
  requestData: FriendRequest,
): Promise<ResponseEnvelope<AddFriendResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const success = await databaseInstance.processFriendRequestAction(
    requestData.action,
    requestData.friendRequestSender,
    requestData.friendRequestRecipient,
  );

  return {
    isOK: success,
    response: { requestSentSuccess: success },
    message: !success ? 'Accepting friend request failed, please try again.' : undefined,
  };
}

export async function denyFriendRequestHandler(
  requestData: FriendRequest,
): Promise<ResponseEnvelope<AddFriendResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const success = await databaseInstance.processFriendRequestAction(
    requestData.action,
    requestData.friendRequestSender,
    requestData.friendRequestRecipient,
  );

  return {
    isOK: success,
    response: { requestSentSuccess: success },
    message: !success ? 'Denying friend request failed, please try again.' : undefined,
  };
}

export async function performFriendsListActionHandler(
  requestData: FriendsListActionRequest,
): Promise<ResponseEnvelope<FriendsListActionResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const friendsListDatabaseResponseObject = await databaseInstance.processFriendsListAction(
    requestData.action.actionName,
    requestData.forUser,
  );

  if (!friendsListDatabaseResponseObject.success) {
    return {
      isOK: false,
      message: requestData.action.errorMessage,
    };
  }

  return {
    isOK: true,
    response: { listOfUsers: friendsListDatabaseResponseObject.response },
  };
}

export async function registerHandler(
  requestData: RegisterRequest,
): Promise<ResponseEnvelope<RegisterResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const registerDatabaseResponseObject = await databaseInstance.processRegister(
    requestData.userName,
    requestData.password,
  );

  if (!registerDatabaseResponseObject.success) {
    return {
      isOK: true,
      response: {
        registerSuccessfully: false,
        errorMessage: registerDatabaseResponseObject.errorMessage,
      },
    };
  }

  return {
    isOK: true,
    response: {
      registerSuccessfully: true,
    },
  };
}

export async function performUserSearchAction(
  requestData: SearchUsersRequest,
): Promise<ResponseEnvelope<SearchUsersResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const userListResponseObject = await databaseInstance.searchUsers(
    requestData.userName,
    requestData.currUser,
  );

  return {
    isOK: userListResponseObject.success,
    response: { listOfUsers: userListResponseObject.listOfUsers },
  };
}

export async function sendFriendRequestHandler(
  requestData: AddFriendRequest,
): Promise<ResponseEnvelope<AddFriendResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const addFriendResponseObject = await databaseInstance.sendFriendRequest(
    requestData.sender,
    requestData.recipient,
  );

  return {
    isOK: addFriendResponseObject,
    response: { requestSentSuccess: addFriendResponseObject },
  };
}

export async function removeFriendHandler(
  requestData: RemoveFriendRequest,
): Promise<ResponseEnvelope<RemoveFriendResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const responseObj = await databaseInstance.processFriendRemoveAction(
    requestData.friend,
    requestData.user,
  );

  return {
    isOK: responseObj,
    response: { requestSentSuccess: responseObj },
  };
}

export async function cancelFriendRequestHandler(
  requestData: FriendRequest,
): Promise<ResponseEnvelope<RemoveFriendResponse>> {
  const databaseInstance = CoveyTownDatabase.getInstance();

  const responseObj = await databaseInstance.cancelFriendRequest(
    requestData.friendRequestSender,
    requestData.friendRequestRecipient,
  );

  return {
    isOK: responseObj,
    response: { requestSentSuccess: responseObj },
  };
}

export async function townDeleteHandler(
  requestData: TownDeleteRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const townsStore = CoveyTownsStore.getInstance();
  const success = townsStore.deleteTown(requestData.coveyTownID, requestData.coveyTownPassword);
  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Invalid password. Please double check your town update password.'
      : undefined,
  };
}

export async function townUpdateHandler(
  requestData: TownUpdateRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const townsStore = CoveyTownsStore.getInstance();
  const success = townsStore.updateTown(
    requestData.coveyTownID,
    requestData.coveyTownPassword,
    requestData.friendlyName,
    requestData.isPubliclyListed,
  );
  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Invalid password or update values specified. Please double check your town update password.'
      : undefined,
  };
}

/**
 * An adapter between CoveyTownController's event interface (CoveyTownListener)
 * and the low-level network communication protocol
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
function townSocketAdapter(socket: Socket): CoveyTownListener {
  return {
    onPlayerMoved(movedPlayer: Player) {
      socket.emit('playerMoved', movedPlayer);
    },
    onPlayerDisconnected(removedPlayer: Player) {
      socket.emit('playerDisconnect', removedPlayer);
    },
    onPlayerJoined(newPlayer: Player) {
      socket.emit('newPlayer', newPlayer);
    },
    onTownDestroyed() {
      socket.emit('townClosing');
      socket.disconnect(true);
    },
  };
}

/**
 * A handler to process a remote player's subscription to updates for a town
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
export function townSubscriptionHandler(socket: Socket): void {
  // Parse the client's session token from the connection
  // For each player, the session token should be the same string returned by joinTownHandler
  const { token, coveyTownID } = socket.handshake.auth as { token: string; coveyTownID: string };

  const townController = CoveyTownsStore.getInstance().getControllerForTown(coveyTownID);

  // Retrieve our metadata about this player from the TownController
  const s = townController?.getSessionByToken(token);
  if (!s || !townController) {
    // No valid session exists for this token, hence this client's connection should be terminated
    socket.disconnect(true);
    return;
  }

  // Create an adapter that will translate events from the CoveyTownController into
  // events that the socket protocol knows about
  const listener = townSocketAdapter(socket);
  townController.addTownListener(listener);

  // Register an event listener for the client socket: if the client disconnects,
  // clean up our listener adapter, and then let the CoveyTownController know that the
  // player's session is disconnected
  socket.on('disconnect', () => {
    townController.removeTownListener(listener);
    townController.destroySession(s);
  });

  // Register an event listener for the client socket: if the client updates their
  // location, inform the CoveyTownController
  socket.on('playerMovement', (movementData: UserLocation) => {
    townController.updatePlayerLocation(s.player, movementData);
  });
}
