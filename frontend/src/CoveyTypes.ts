import { Socket } from 'socket.io-client';
import Player, { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';

export type VideoRoom = {
  twilioID: string;
  id: string;
};

export type UserProfile = {
  displayName: string;
  id: string;
};

export type NearbyPlayers = {
  nearbyPlayers: Player[];
};

export type CoveyAppState = {
  sessionToken: string;
  userName: string;
  currentTownFriendlyName: string;
  currentTownID: string;
  currentTownIsPubliclyListed: boolean;
  myPlayerID: string;
  players: Player[];
  currentLocation: UserLocation;
  nearbyPlayers: NearbyPlayers;
  emitMovement: (location: UserLocation) => void;
  socket: Socket | null;
  apiClient: TownsServiceClient;
  isLoggedIn: boolean;
  isRegistering: boolean;
};

export type CoveyAppUpdate =
  | {
      action: 'doConnect';
      data: {
        userName: string;
        townFriendlyName: string;
        townID: string;
        townIsPubliclyListed: boolean;
        sessionToken: string;
        myPlayerID: string;
        socket: Socket;
        players: Player[];
        emitMovement: (location: UserLocation) => void;
      };
    }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'disconnect' }
  | { action: 'register'; data: { isRegistering: boolean } }
  | { action: 'loggedIn'; data: { isLoggedIn: boolean } };
