const {DEVICE_TYPE_MAPPINGS, STATE_TYPE_MAPPINGS} = require('./constants');
const axios = require('axios');
const logger = require('../../logger');
const systemConfig = require('../../config.json')
const moostConfig = require('./config.json')
const OAuth2Token = require('../../models/oauth2token');
const User = require('../../models/user');
const Openhab = require('../../models/openhab');
const openHabCloudRESTHost = `https://${systemConfig.system.host}/rest`;
const moostAPIHost = moostConfig.api.host;
const moostAPIEvents = moostConfig.api.events;
const moostEventsEndpoint = `${moostAPIHost}/${moostAPIEvents}`;
const https = require('https')

module.exports = {
    // Listen for itemupdate Events emitted by the app
    itemUpdateListener: function (itemToUpdate) {
        logger.debug('MOOST: Received ItemUpdate via eventEmitter: ' + itemToUpdate);
        Openhab.findById(itemToUpdate.openhab, function (error, openhab) {
            if (error) {
                logger.error('openHAB lookup error: ' + error);
                return;
            }
            if (!openhab) {
                logger.debug('openHAB not found');
                return;
            }
            User.findOne({
                account: openhab.account
            }, function (error, user) {
                if (error) {
                    logger.error('openHAB-cloud: Error getting user: ' + error);
                    return;
                }

                if (!user) {
                    logger.debug('openHAB-cloud: No user found for openHAB');
                    return;
                }

                OAuth2Token.findOne({
                    user: user.id
                }, function (error, oauth2token) {
                    // At request level
                    const agent = new https.Agent({
                        rejectUnauthorized: !moostConfig.openhabcloud.ignoressl
                    });

                    axios.get(`${openHabCloudRESTHost}/things`, {
                        headers: {
                            Authorization: `Bearer ${oauth2token.token}`
                        },
                        httpsAgent: agent
                    }).then((res) => {
                        logger.debug('MOOST: Received all Things from local openhab');
                        const allThings = res.data;
                        const thing = allThings.find(thing => {
                            return thing.channels.some(channel => {
                                return channel.linkedItems.some(item => {
                                    return item === itemToUpdate.name
                                });
                            })
                        });

                        if (thing) {
                            logger.debug('MOOST: Found thing ' + thing.label + ' to item ' + itemToUpdate.name);
                            const moostDeviceType = mapToMOOSTDeviceType(thing);
                            const moostLocation = mapToMOOSTLocation(thing);
                            const moostState = mapToMOOSTState(thing, itemToUpdate);

                            sendEventToMOOST(itemToUpdate, thing, moostDeviceType, moostLocation, moostState);
                        } else {
                            logger.error('MOOST: No thing found for item ' + itemToUpdate.name)
                        }
                    }).catch((error) => {
                        logger.error('openHAB-cloud: Error getting thins from openhab: ' + error);
                    });
                });
            })
        });
    },
};

function sendEventToMOOST(itemToUpdate, device, deviceType, deviceLocation, state) {
    const eventType = "DEVICE_EVENT_EMITTED";

    //"category": thingType.category,

    const eventToSend = buildMOOSTEvent(
        Math.floor(+itemToUpdate.last_change / 1000),
        eventType,
        itemToUpdate.openhab,
        device.UID,
        deviceLocation,
        deviceType,
        device.properties.vendorName,
        device.properties.productName,
        state,
        itemToUpdate
    )

    logger.debug('MOOST: Sending event ' + JSON.stringify(eventToSend))
    axios.post(`${moostEventsEndpoint}`, eventToSend)
        .then((res) => {
            logger.debug('openHAB-cloud: Sending event to MOOST ended with status: ' + res.status);
        }).catch((error) => {
            logger.error('openHAB-cloud: Error sending event to MOOST: ' + error);
        }
    );
}

function buildMOOSTEvent(eventTimeStamp, eventType, userid,
                         deviceId, deviceLocation, deviceType, deviceVendorName, deviceProductName,
                         state, rawEvent) {
    return {
        "timestamp": eventTimeStamp,
        "type": eventType,
        "user": {
            "id": userid,
        },
        "device": {
            "id": deviceId,
            "location": deviceLocation,
            "type": deviceType,
            "vendor_name": deviceVendorName,
            "product_name": deviceProductName
        },
        "state": state,
        "raw": rawEvent
    }
}

function mapToMOOSTState(thing, itemToUpdate) {
    let moostState = 'OTHER';

    const channel = thing.channels.find(channel => {
        return channel.linkedItems.some(linkedItem => {
            return linkedItem === itemToUpdate.name
        })
    })

    for (let key in STATE_TYPE_MAPPINGS) {
        if (STATE_TYPE_MAPPINGS.hasOwnProperty(key)) {
            if (STATE_TYPE_MAPPINGS[key].some((channelTypeUID) => {
                return channelTypeUID === channel.channelTypeUID;
            })) {
                moostState = key;
            }
        }
    }

    return {
        type: moostState,
        value_after: itemToUpdate.status,
        value_before: itemToUpdate.prev_status
    }
}

function mapToMOOSTLocation(thing) {
    return thing.location ? thing.location : "OTHER";
}

function mapToMOOSTMaxMinValues(channelType) {

}

function mapToMOOSTDeviceType(thing) {
    let moostDeviceType = "OTHER";

    for (let key in DEVICE_TYPE_MAPPINGS) {
        if (DEVICE_TYPE_MAPPINGS.hasOwnProperty(key)) {
            if (DEVICE_TYPE_MAPPINGS[key].some((thingTypeUID) => {
                return thingTypeUID === thing.thingTypeUID;
            })) {
                moostDeviceType = key;
            }
        }
    }

    return moostDeviceType;
}