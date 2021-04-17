import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

type FriendsListActionName = 'getPendingFriendRequests' | 'getCurrentListOfFriends';

export type Friend = {
  username: string;
  online: boolean;
  room: string;
  roomId?: string,
  requestSender: string;
  requestRecipient: string;
};

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

export default class FriendsServiceClient {
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

  // accepting or denying a friend quest
  async processIncomingFriendRequestAction(requestData: FriendRequest): Promise<void> {
    let responseWrapper: AxiosResponse<ResponseEnvelope<void>>;

    if (requestData.action === 'accept') {
      responseWrapper = await this._axios.post<ResponseEnvelope<void>>(
        '/acceptFriendRequest',
        requestData,
      );
    } else {
      responseWrapper = await this._axios.post<ResponseEnvelope<void>>(
        '/denyFriendRequest',
        requestData,
      );
    }

    return FriendsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  // process an action on the friends list
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
    return FriendsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  // send a friend request to a user
  async sendOutgoingFriendRequest(requestData: AddFriendRequest): Promise<AddFriendResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<AddFriendResponse>>(
      '/sendOutgoingFriendRequest',
      requestData,
    );
    return FriendsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  // cancel a friend request to a user
  async cancelOutgoingFriendRequest(requestData: FriendRequest): Promise<RemoveFriendResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<RemoveFriendResponse>>(
      '/cancelFriendRequest',
      requestData,
    );
    return FriendsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  // remove a user from a user's friends list
  async removeFriend(requestData: RemoveFriendRequest): Promise<RemoveFriendResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<RemoveFriendResponse>>(
      '/removeFriend',
      requestData,
    );
    return FriendsServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
