# Chatroom
A **Chatroom** app that I work on for my SAP Labs Bulgaria internship.
It uses Node.js, MongoDB and Passport server-side,
JavaScript, HTML & some CSS client-side and
Socket.io for real-time Web socket communication.

###Description
After you log in with your facebok account of local nickname,
you can create a chatroom or join an exisitng one for instant messenging.
Rooms have a members limit and optional password protection.

### To do:
* move color generation to the server
* remember which page is requested without authentication so that user can be redirected after login
* (bad practice?) currently using middleware to attach the req.user object, which Passport creates, to req.session, which the local logic uses.
* separate router functions in files for better readability
* add exclusive features to fb users

### Bugs:
* when you are alone in a room and refresh the page you end up in a functioning room which does not exist in the db
  (solved by sending 'room leave' msg from server)
* when a room is full and a member refreshes the page they get a message that the room is full (second refresh solves it)

### Future features (?):
* public chat for people in the lobby
* show which/how many users are in room/lobby/general
* UI
* show that someone is typing
* message seen by
* emoticons
* ~show progressbar at room members

### To read:
* Still have <a href='https://github.com/mkdynamic/omniauth-facebook/issues/61'>issue</a> with accessing fb users' emails
* Finish reading <a href='http://backlinko.com/google-ranking-factors'>SEO tips</a> (around 162?)