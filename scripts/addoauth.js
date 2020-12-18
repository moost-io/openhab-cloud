// Author: Pedro Garcia. Please feel free to redistribute and modify at wish keeping this line :)

var config = require('../config.json'),
    mongoose = require('mongoose'),
    system = require('../system'),
    MongoConnect = require('../system/mongoconnect'),
    OAuth2Client = require('../models/oauth2client'),
    OAuth2Scope = require('../models/oauth2scope'),
    OAuth2Token = require('../models/oauth2token'),
    mongoConnect;

clientName = process.argv[2];
clientId = process.argv[3];
clientSecret = process.argv[4];
clientToken = process.argv[5]
clientUserId = process.argv[6];

if (!clientName || !clientId || !clientSecret) {
    console.log('openHAB-cloud: Usage: node addoauth.js <clientName> <clientId> <clientSecret> <clientToken> <clientUserId>');
    process.exit(0);
}

system.setConfiguration(config);
mongoConnect = new MongoConnect(system);
mongoConnect.connect(mongoose);

client = new OAuth2Client({
    name: clientName,                           // Client name
    clientId: clientId,                         // Client oauth2 id
    clientSecret: clientSecret,                  // Client oauth2 secret
    // homeUrl: "https://ifttt.com/channels/MyServiceName/authorize",
    // icon: String,
    // active: true,
    // created: Date.now,
    // last_change: Date.now
});

scope = new OAuth2Scope({
    name: clientName,                            // name of the scope
    description: clientName,                    // description of what this scope permits to do
    // valid: true,
    // created: Date.now
});

token = new OAuth2Token({
    user: clientUserId,
    //oAuthClient: mongoose.Types.ObjectId(clientId),
    token: clientToken
});

console.log('Creating oauth2 scope');
scope.save(function (error) {
    if (error) console.log('Error: ' + error);
    else console.log('Scope created');
    console.log('Creating oauth2 client');

    client.save(function (error) {
        if (error) {
            console.log('Error: ' + error);
            process.exit(0);
        } else {
            console.log('Client created');

            token.oAuthClient = client.id;
            token.save(function (error) {
                if (error) console.log('Error: ' + error);
                else console.log('Token created');
                process.exit(0);
            });
        }

    });
});