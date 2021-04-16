# Covey.Town CS4530 Final Project New Features Overview

## New Features Added: High Level

The new features implemented as part of this final project is **user account** and **friends list** capabilities.

## New Features Overview

### Register and Login to a New Account (User Story #1)

- First, navigate to https://peaceful-brattain-c5eb8c.netlify.app/.
- If the current user does not already have a registered account, click the “Register” button.
- Fill in username and password information.
  - If the input does not contain a unique username and a password that meets certain criteria, the user will be notified.
- The current user will be redirected to the Log in page.
- Enter username and password to log in and access Covey.Town.
- To log out, click the Log out button, which can be found on the right side of the header on the Covey.Town home page or on the right side of the bottom menu 
on the video / World Map page.

### View the List of Users in the Same Video Chat Room (User Story #2)

- Once in a video chat room, a list of all users in the room will be displayed to the right of the World Map.
- Users can also be identified by the respective username displayed along the bottom of each room member’s video box.

### Add Other Covey.Town Users to One’s Friend List (User Story #3)

- To search for a user by username, click the “Search Users” button, which is located in the header of the Covey.Town home page and on the right side of the 
World Map image, if the current user is in a video chat room.
- Input a username in the search bar.
- A list of users with matching usernames will be displayed.
- If the current user is not friends with a user that is returned by the search, there will be a button labelled “Send Friend Request” to the right of the 
username.
- Click the button to send a friend request to the respective user. A confirmation message will be returned upon success of the request.

### View and Interact with One's Friends List (User Story #4)

- To view one’s friend list, click the button labelled “Friends Info”, located in the header of the Covey.Town home page and on the right side of the World Map
image, if the current user is in a video chat room.
- In the Friends Info modal, the user can choose from three options in the dropdown, located in the upper right corner, to view different friends information.

  - **Incoming Friend Requests**
    - A list of all incoming, pending friend requests will be displayed with buttons labelled Accept and Deny the request to the right of the username of the user
      who sent the request.
    - Use the Accept button to accept a request.
    - Use the Deny button to deny a request.
    - A confirmation message will be displayed and the request will be removed from the list.

  - **Outgoing Friend Requests**
    - A list of all outgoing, pending friend requests will be displayed with a button labelled Cancel to the right of the username of the user who received the 
      friend request.
    - Use the Cancel button to cancel a request.
    - A confirmation message will be displayed and the request will be removed from the list.

  - **View Friends List**
    - A list of one’s current friends will be displayed with a button labelled Remove to the right of the username. A red circle will be displayed next to a 
      username if the user is offline and a green circle will be displayed if the user is online.
    - Use the Remove button to remove the respective user as a friend.
    - A confirmation message will be displayed and the friend will be removed from the list.
    - If one of the current user's friends is currently online and in a public room, a button labelled Join Room {Room Name} will be displayed to the left of the 
      Remove button. {Room Name} will be filled with the name of the current room that the friend is in. 
    - Use the Join Room {Room Name} button to automatically join the same room the respective friend is in.
