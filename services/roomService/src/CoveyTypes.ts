export type Direction = 'front' | 'back' | 'left' | 'right';

export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};

export type CoveyTownList = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number;
}[];

export type FriendRequestAction = 'accept' | 'deny';

export type FriendsListActionName = 'getPendingFriendRequests' | 'getCurrentListOfFriends';

export type FriendsListAction = {
  actionName: FriendsListActionName;
  errorMessage: string;
};

export type Friend = {
  username: string;
  online: boolean;
  room: string;
  roomId?: string;
  requestSender: string;
  requestRecipient: string;
};

export type FriendsListDatabaseResponse = {
  success: boolean;
  response: Friend[];
};

export type RegisterDatabaseResponse = {
  success: boolean;
  errorMessage?: string;
};

export type Friendship = {
  username: string;
  friendship: boolean;
};

export type SearchResponse = {
  success: boolean;
  /** Does a user exist that matches the given username? */
  listOfUsers: Friendship[];
};

export interface SendFriendRequestAction {
  /** userName to be searched for */
  recipient: string;
  sender: string;
}

export interface SendFriendRequestResponse {
  /** Does a user exist that matches the given username? */
  requestSentSuccess: boolean;
}
