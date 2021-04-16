import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ServerPlayer } from './Player';

export type Friendship = {
  username: string;
  friendship: boolean;
};

export interface SearchUsersRequest {
  /** userName to be searched for */
  userName: string;
  currUser: string;
}

export interface SearchUsersResponse {
  /** Does a user exist that matches the given username? */
  listOfUsers: Friendship[];
}

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

export default class UserServiceClient {
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


  async login(requestData: LoginRequest): Promise<LoginResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<LoginResponse>>(
      '/login',
      requestData,
    );
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }


  async searchUsers(requestData: SearchUsersRequest): Promise<SearchUsersResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<SearchUsersResponse>>(
      `/searchUsers/${requestData.currUser}/${requestData.userName}`);
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
