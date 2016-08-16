# Chatroom
A Node.js Chatroom app that I work on for my SAP Labs Bulgaria Internship.
It uses Express, Passport and Socket.IO

### To do:
* introduce facebook login
  - facebook user is stored in req.user, while local user is stored both in req.user and req.session (Add consistency and store everything in re.user?)
* make /rooms the homepage
* add a public chat for people in the lobby

### Bugs:
* when you are alone in a room and refresh the page you end up in a functioning room which does not exist in the db
* when a room is full and a member refreshes the page he gets a message that the room is full and needs a second refresh

### Future features:
* show which/how many users are in room/lobby/general
* UI
* show that someone is typing
* show progressbar at room members
* message seen by?

### Read:
* Still have <a href='https://github.com/mkdynamic/omniauth-facebook/issues/61'>issue</a> with accessing fb users' emails
* Finish reading <a href='http://backlinko.com/google-ranking-factors'>SEO tips</a> (around 162?)