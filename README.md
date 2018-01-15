# Chatroom

## Description
_Chatroom_ is a web app with minimalistic interface that lets you chat with others online.

Users can log in in two ways:
* anonymously, by  choosing a nickname
* with their Facebook account

You can join an already existing chatroom, or create your own. When creating a new chatroom you can:
* choose its name
* protect it with a password or make it free for all
* restrict the maximum number of people allowed in the room

Once you are in a chatroom, you can:
* see who else is there with you
* send and receive instant messages,
* leave or logout at any time

When the last person in a chatroom leaves, it is automatically deleted.

Thanks to __websockets__, you see everything happen in __real time__, with no page refresh:
* receiving messages
* people joining / leaving rooms
* rooms being created / deleted

## Technologies
_Chatroom_ is a Node.js server, based on the _Express_ framework. It uses _Passport_ for authentication of the users and persists data (active users, chatrooms etc.) in a _Mongodb_ databse.

On the clientside, Javascript and _Bootstrap CSS_ are used.

Fast real-time communication between the client and server are provided by websockets, using _Socket.io_

## Project Structure
* `lib`
  * `config` - Configuration details about the Facebook authentication and user serialization with _Passport_
  * `models` - Description of the two databse models - room and user
  * `public`
    * `javascripts` - Clientside scripts, handling the websocket messages and UI actions for each page
      * `chatSockets.js`
      * `login.js`
      * `js.js`
    * `stylesheets` - Some style definitions
  * `routes`
    * `index.js` - the request handlers for each endpoint of the server
      * `GET /rooms`
      * `GET /isFree/:nickname`
      * `POST /`
      * `GET /logout`
      * `GET /auth/facebook`
      * `all /removeEmptyRooms`
      * `POST /rooms`
      * `GET /rooms/:roomName`
      * `POST /rooms:/roomName`
      * serverside handling of the websocket messages
  * `util` - small utility functions
  * `views` - for each page - a view file defining its HTML structure and bindings to javacript variables
* `app.js` - Entry-point of the application - setup of the server address, port, database and database schemas
* `package.json` - information about the project and its dependencies

## To do:
* make 'new room' input field red if user enter a name of already existing room
* move db connection info to /lib/config
* move transformation of room to table row in one place only (now it is separate for initial /rooms load and after room create/update)
* remember which page is requested without authentication so that user can be redirected after login
* (bad practice?) currently using middleware to attach the req.user object, which Passport creates, to req.session, which the local logic uses.
* separate router functions in files for better readability
* make tests

### Future features (?):
* Public chat for people in the lobby
* Show which/how many users are in the lobby/each room
* Show when someone is typing
* Timestamp of when each msg is sent
* Message is seen by
* Emoticons
* Exclusive features to Facebook users

### To read:
* [Issue with accessing fb users' emails]('https://github.com/mkdynamic/omniauth-facebook/issues/61')
* [How to install Mongo on Ubuntu](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04)
