# Covey.Town CS4530 Final Project DESIGN.md

## High Level Architecture

![High Level Architecture Diagram](High-Level-Architecture.png)

## App State

### `CoveyAppState`

Two new properties were added to the `CoveyAppState` type: a `friendsAPIClient` and a `userAPIClient`. In addition, the previous `apiClient` was more specifically renamed to `townsAPIClient` to reflect the more specific role it would be taking as part of overall revamped app's architecture.

## Services

### `RoomsService`

The previous implementation of the `RoomsService` from the original repository was essentially kept intact, with some additions of new routes that had to deal with operations dealing with rooms (or towns). 

## `UserService`

`UserService`'s architecture was inspired by the architecture used for `RoomsService`, and it follows the same logical pattern. 

## `FriendsService`
[ WIP ]
