# Chatroom
I am working on this app for my internship at SAP Labs Bulgaria.
Technologies used:
* Serverside - Node.js + MongoDB, PassportJs for authentication
* Clientside - Javascript & Bootstrap CSS
* Socket.io  - Web sockets provide fast real-time communication between the server and client.

###Description
After you log in with your facebook account of local nickname,
you can join a room and chat with others, or create your own room and send a link to your friends.
You can also set up a password-protected room.

### To do:
* make 'new room' input field red if user enter a name of already existing room
* move db connection info to /lib/config
* move transformation of room to table row in one place only (now it is separate for initial /rooms load and after room create/update) 
* remember which page is requested without authentication so that user can be redirected after login
* (bad practice?) currently using middleware to attach the req.user object, which Passport creates, to req.session, which the local logic uses.
* separate router functions in files for better readability
* make tests

### Unsolved bugs:
* when a room is full and a member refreshes the page they get a message that the room is full
(second refresh solves it)

### Future features (?):
* Public chat for people in the lobby
* Show which/how many users are in the lobby/each room
* Show when someone is typing
* Timestamp of when each msg is sent
* Message is seen by
* Emoticons
* Exclusive features to Facebook users

### To read:
* <a href='https://github.com/mkdynamic/omniauth-facebook/issues/61'>Issue</a> with accessing fb users' emails
* Finish reading <a href='http://backlinko.com/google-ranking-factors'>SEO tips</a> (up to 162?)