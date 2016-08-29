# Chatroom
I am working on this app for my internship at SAP Labs Bulgaria.
Technologies used:
* Serverside - Node.js + MongoDB, PassportJs for authentication
* Clientside - some Javascript + some Bootstrap CSS
* Socket.io  - Web sockets provide fast real-time communication between the server and client.

###Description
After you log in with your facebook account of local nickname,
you can join a room and chat with others, or create your own room and send a link to your friends.
You can also set up a password-protected room.

### To do:
* move db connection info to /lib/config
* remember which page is requested without authentication so that user can be redirected after login
* (bad practice?) currently using middleware to attach the req.user object, which Passport creates, to req.session, which the local logic uses.
* separate router functions in files for better readability
* add exclusive features to fb users (not happening?)
* make tests

### Bugs:
* when you are alone in a room and refresh the page you end up in a functioning room which does not exist in the db
...solved by sending 'room leave' msg from server
* when a room is full and a member refreshes the page they get a message that the room is full
...second refresh solves it

### Future features (?):
* public chat for people in the lobby
* show which/how many users are in room/lobby/general
* UI
* show that someone is typing
* message seen by
* emoticons
* show progressbar at room members

### To read:
* <a href='https://github.com/mkdynamic/omniauth-facebook/issues/61'>Issue</a> with accessing fb users' emails
* Finish reading <a href='http://backlinko.com/google-ranking-factors'>SEO tips</a> (up to 162?)