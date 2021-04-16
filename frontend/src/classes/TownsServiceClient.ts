import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ServerPlayer } from './Player';

type FriendsListActionName = 'getPendingFriendRequests' | 'getCurrentListOfFriends';

export type Friend = {
  username: string;
  online: boolean;
  room: string;
  requestSender: string;
  requestRecipient: string;
};

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
 * The format of a request to perform a friends list action on behalf of a user, as dispatched by server
 * middleware
 */
export interface FriendsListActionRequest {
  /** the friends list action to perform */
  action: FriendsListActionName;
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
export interface SearchUsersRequest {
  /** userName to be searched for */
  userName: string;
  currUser: string;
}

export type Friendship = {
  username: string;
  friendship: boolean;
};

export interface SearchUsersResponse {
  /** Does a user exist that matches the given username? */
  listOfUsers: Friendship[];
}

export interface AddFriendRequest {
  /** userName to be searched for */
  recipient: string;
  sender: string;
}

export interface AddFriendResponse {
  /** Does a user exist that matches the given username? */
  requestSentSuccess: boolean;
}

export interface RemoveFriendRequest {
  /** userName to be searched for */
  friend: string;
  user: string;
}

export interface RemoveFriendResponse {
  /** Does a user exist that matches the given username? */
  requestSentSuccess: boolean;
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
  currentPlayers: ServerPlayer[];
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
  towns: CoveyTownInfo[];
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

export type CoveyTownInfo = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number;
};

export default class TownsServiceClient {
  private _axios: AxiosInstance;

  /**
   * Construct a new Towns Service API client. Specify a serviceURL for testing, or otherwise
   * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
   * @param serviceURL
   */
  constructor(serviceURL?: string) {
    const baseURL = serviceURL || process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(baseURL);
    this._axios = axios.create({ baseURL });
  }

  static unwrapOrThrowError<T>(
    response: AxiosResponse<ResponseEnvelope<T>>,
    ignoreResponse = false,
  ): T {
    if (response.data.isOK) {
      if (ignoreResponse) {
        return {} as T;
      }
      assert(response.data.response);
      return response.data.response;
    }
    throw new Error(`Error processing request: ${response.data.message}`);
  }

  async createTown(requestData: TownCreateRequest): Promise<TownCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<TownCreateResponse>>(
      '/towns',
      requestData,
    );
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async login(requestData: LoginRequest): Promise<LoginResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<LoginResponse>>(
      '/login',
      requestData,
    );
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async register(requestData: RegisterRequest): Promise<RegisterResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<RegisterResponse>>(
      '/register',
      requestData,
    );

    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async processFriendRequestAction(requestData: FriendRequest): Promise<void> {
    let responseWrapper: AxiosResponse<ResponseEnvelope<void>>;

    if (requestData.action === 'accept') {
      responseWrapper = await this._axios.post<ResponseEnvelope<AddFriendResponse>>(
        '/acceptFriendRequest',
        requestData,
      );
    } else {
      responseWrapper = await this._axios.post<ResponseEnvelope<AddFriendResponse>>(
        '/denyFriendRequest',
        requestData,
      );
    }

    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async processFriendsListAction(
    requestData: FriendsListActionRequest,
  ): Promise<FriendsListActionResponse> {
    let responseWrapper: AxiosResponse<ResponseEnvelope<FriendsListActionResponse>>;

    if (requestData.action === 'getCurrentListOfFriends') {
      responseWrapper = await this._axios.get<ResponseEnvelope<FriendsListActionResponse>>(
        `/listOfFriends/${requestData.forUser}`,
      );
    } else {
      responseWrapper = await this._axios.get<ResponseEnvelope<FriendsListActionResponse>>(
        `/pendingFriendRequests/${requestData.forUser}`,
      );
    }
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async searchUsers(requestData: SearchUsersRequest): Promise<SearchUsersResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<SearchUsersResponse>>(
      `/searchUsers/${requestData.currUser}/${requestData.userName}`);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async addFriend(requestData: AddFriendRequest): Promise<AddFriendResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<AddFriendResponse>>(
      '/addFriend', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async removeFriend(requestData: RemoveFriendRequest): Promise<RemoveFriendResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<RemoveFriendResponse>>(
      '/removeFriend', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async cancelFriendRequest(requestData: FriendRequest): Promise<RemoveFriendResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<RemoveFriendResponse>>(
      '/cancelFriendRequest', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }


  async updateTown(requestData: TownUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(
      `/towns/${requestData.coveyTownID}`,
      requestData,
    );
    return TownsServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async deleteTown(requestData: TownDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(
      `/towns/${requestData.coveyTownID}/${requestData.coveyTownPassword}`,
    );
    return TownsServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listTowns(): Promise<TownListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<TownListResponse>>('/towns');
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinTown(requestData: TownJoinRequest): Promise<TownJoinResponse> {
    const responseWrapper = await this._axios.post('/sessions', requestData);
    return TownsServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
