var passport = require('passport');
var eventEmitter = require('../../system/eventbus');

function moostAuthenticate(req, res, next) {
    passport.authenticate('bearer', {session: false}, function (error, user, info) {
        if (error) {
            return res.status(401).json({errors: [{message: error}]});
        }
        if (!user) {
            return res.status(401).json({errors: [{message: "Authentication failed"}]});
        }
        req.logIn(user, function (error) {
            if (error) {
                return res.status(401).json({errors: [{message: error}]});
            }
            return next();
        });
    })(req, res, next);
}

exports.v1triggerrecommendation = [
    moostAuthenticate,
    function (req, res) {
        if (!req.body.message) {
            return res.status(400).json({errors: [{message: "Missing Message"}]});
        }
        if (!req.body.priority) {
            return res.status(400).json({errors: [{message: "Missing Priority"}]});
        }
        if (!req.user) {
            return res.status(400).json({errors: [{message: "Missing User"}]});
        }

        //User is enriched through passport
        const data = {
            userId: req.user.id,
            user: req.user,
            message: req.body.message.de,
            icon: '',
            severity: req.body.priority
        }

        eventEmitter.emit('sendRecommendation', data.user, data.message, data.icon, data.severity)
        res.sendStatus(204).end()
    }
]
