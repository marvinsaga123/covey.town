# Covey.Town CS4530 Final Project DESIGN Overview

## High Level Architecture

![High Level Architecture Diagram](High-Level-Architecture.png)

## App State

### `CoveyAppState`

Two new properties were added to the `CoveyAppState` type: a `friendsAPIClient` and a `userAPIClient`, each of type `FriendsServiceClient` and `UserServiceClient`, respectively. In addition, the previous `apiClient` was renamed to `townsAPIClient` to reflect the more specific role it would be taking as part of the overall revamped app's architecture.

## Backend Services

### `RoomsService`

The previous implementation of the `RoomsService` from the original repository was essentially kept intact, with some additions of new routes involved with newly added features dealing with rooms.

#### New Features Handled by `RoomsService`

- Join a friend's room if that Covey.Town room is currently public

### `UserService`

`UserService`'s architecture was inspired by the architecture used for `RoomsService`, and it follows the same logical pattern. For user-centered operations, the frontend would use the `userAPIClient` from the app's current `CoveyAppState`. This would make a call to the `UserServiceClient`, which then made a request routed through the `user.ts` file under our `router` folder in the services directory. From here, requests are handled by the same request handler file (`CoveyTownRequestHandlers.ts`) as that for the `RoomsService` API client, and operations to the database and subsequent responses are returned here as well.

#### New Features Handled by `UserService`

**Note:** our login, logout and registration system is a barebones system that does not employ authentication / new page re-direction, and authentication / page re-direction was never a part of the user stories to implement these features. However, were we to release this to an actual production environment, we would ideally integrate an authentication service / page re-direction to make our login, logout and registration systems more robust.

- Registering an account in Covey.Town
- Logging in to Covey.Town
- Logging out of Covey.Town
- Manage friend requests

### `FriendsService`

`FriendsService`'s architecture was inspired by the architecture used for `RoomsService`, and it follows the same logical pattern. For friends-centered operations, the frontend would use the `friendsAPIClient` from the app's current `CoveyAppState`. This would make a call to the `FriendsServiceClient`, which then made a request routed through the `friends.ts` file under our `router` folder in the services directory. From here, requests are handled by the same request handler file (`CoveyTownRequestHandlers.ts`) as that for the `RoomsService` API client, and operations to the database and subsequent responses are returned from here as well.

#### New Features Handled by `FriendsService`

- Search by users by username
- View one's current friends list
- View the rooms friends are currently in if the Covey.Town room is public

## Fronted Updates

## Database

### Architecture

[ WIP ] - Rachel

### Communication with Backend

[ WIP ] - Rachel

## Live Deployment

### Frontend 

A live deployment of our Frontend was accomplished using Netlify, with a new deployment performed every time a new commit is pushed to our `master` branch using GitHub Actions.

### Backend

A live deployment of our Backend was accomplished using Heroku, with a new deployment performed every time a new commit is pushed to our `master` branch using GitHub Actions.
