var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = mongoose.SchemaTypes.ObjectId;

var NotificationSchema = new Schema({
    user: {type: ObjectId, ref: 'User'},
    message: String,
    title: String,
    icon: String,
    severity: String,
    acknowledged: Boolean,
    created: {type: Date, default: Date.now},
    positiveActionText: String,
    positiveActionType: String,
    negativeActionText: String,
    negativeActionType: String
});

NotificationSchema.index({user: 1, created: 1});

module.exports = mongoose.model('Notification', NotificationSchema);
