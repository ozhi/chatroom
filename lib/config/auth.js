module.exports = {
    'facebookAuth' : {
        'clientID'      : 'secret', // your App ID
        'clientSecret'  : 'secret', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback',
        'profileFields' : ['displayName']
    }
};
