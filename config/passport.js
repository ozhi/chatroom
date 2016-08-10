var FacebookStrategy = require('passport-facebook').Strategy;
var User             = require('../models/user.js');
var configAuth       = require('./auth.js');

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findOne({'id' : id}, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL
    },
    function(token, refreshToken, profile, done) { //facebook will send back the token and profile

        process.nextTick(function() { //asynchronous

            // find the user in the database based on their facebook id
            User.findOne({ 'id' : profile.id }, function(err, user) {

                if (err)
                    return done(err);

                if (user) {
                    console.log("User '" + profile.displayName + "' found in db");
                    return done(null, user); // user found, return that user
                }

                console.log(profile);
                
                // if there is no user found with that facebook id, create them
                var newUser = new User();

                newUser.id    = profile.id; // set the users facebook id                   
                newUser.token = token; // we will save the token that facebook provides to the user                    
                newUser.name  = profile.displayName; // look at the passport user profile to see how names are returned
                //fix?? //newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                newUser.save(function(err) {
                    if (err)
                        throw err;
                    else {
                        console.log("User '" + profile.displayName + "' added to db");
                        return done(null, newUser);
                    }
                });

            });
        });

    }));

};
