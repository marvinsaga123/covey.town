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

export type FriendsListDatabaseResponse = {
  success: boolean;
  response: string[];
};

export type RegisterDatabaseResponse = {
  success: boolean;
  errorMessage?: string;
};
