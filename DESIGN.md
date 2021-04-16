# Covey.Town CS4530 Final Project DESIGN Overview

## High Level Architecture

![High Level Architecture Diagram](High-Level-Architecture.png)

## App State

### `CoveyAppState`

Two new properties were added to the `CoveyAppState` type: a `friendsAPIClient` and a `userAPIClient`, each of type `FriendsServiceClient` and `UserServiceClient`, respectively. In addition, the previous `apiClient` was renamed to `townsAPIClient` to reflect the more specific role it would be taking as part of the overall revamped app's architecture.

## Services

### `RoomsService`

The previous implementation of the `RoomsService` from the original repository was essentially kept intact, with some additions of new routes involved with newly added features dealing with rooms.

#### New Features Handled by `RoomsService`

- WIP
- WIP
- WIP

### `UserService`

`UserService`'s architecture was inspired by the architecture used for `RoomsService`, and it follows the same logical pattern. For user-centered operations, the frontend would use the `userAPIClient` from the app's current `CoveyAppState`. This would make a call to the `UserServiceClient`, which then made a request routed through the `user.ts` file under our `router` folder in the services directory. From here, requests are handled by the same request handler file (`CoveyTownRequestHandlers.ts`) as that for the `RoomsService` API client, and operations to the database and subsequent responses are returned here as well.

#### New Features Handled by `UserService`

- WIP
- WIP
- WIP

### `FriendsService`

`FriendsService`'s architecture was inspired by the architecture used for `RoomsService`, and it follows the same logical pattern. For friends-centered operations, the frontend would use the `friendsAPIClient` from the app's current `CoveyAppState`. This would make a call to the `FriendsServiceClient`, which then made a request routed through the `friends.ts` file under our `router` folder in the services directory. From here, requests are handled by the same request handler file (`CoveyTownRequestHandlers.ts`) as that for the `RoomsService` API client, and operations to the database and subsequent responses are returned from here as well.

#### New Features Handled by `FriendsService`

- WIP
- WIP
- WIP

## Database

### General Overview

[ WIP ]
