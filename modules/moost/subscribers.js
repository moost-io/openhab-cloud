const axios = require('axios');
const logger = require('../../logger');
const systemConfig = require('../../config.json')
const moostConfig = require('./config.json')
const OAuth2Token = require('../../models/oauth2token');
const User = require('../../models/user');
const Openhab = require('../../models/openhab');
const https = require('https')
const jwt_decode = require("jwt-decode");

const OPENHAB_CLOUD_REST_HOST = `https://${systemConfig.system.host}/rest`;
const MOOST_API_HOST = moostConfig.api.host;
const MOOST_API_EVENTS_ENDPOINT = `${MOOST_API_HOST}/${moostConfig.api.events}`;
const MOOST_API_LOGIN_ENDPOINT = `${MOOST_API_HOST}/${moostConfig.api.login}`;
const MOOST_API_CUSTOMER_ID = '1';
let MOOST_API_AUTH_TOKEN = '';
const AXIOS_AGENT= new https.Agent({
    rejectUnauthorized: !moostConfig.openhabcloud.ignoressl
});

module.exports = {
    // Listen for itemUpdate Events emitted by the app
    itemUpdateListener: function (itemUpdate) {
        logger.debug('MOOST: Received ItemUpdate via eventEmitter: ' + itemUpdate);
        Openhab.findById(itemUpdate.openhab, function (error, openhab) {
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
                },  async function (error, oauth2token) {
                    let moostDevice;
                    //This Part loads the corresponding item and maps it to the moostState
                    const openHABItem = await loadItemByItemName(oauth2token.token, itemUpdate.name);
                    const moostState = convertOpenHABItemToMOOSTState(openHABItem, itemUpdate);

                    //This Part identifies the connected thing and maps it to a MOOST Device
                    //Same item can be linked to different things
                    //(f.e. left home item can be updated by multiple different buttons)
                    const configuredLinksForItem = await loadLinksByItemName(oauth2token.token, openHABItem.name);
                    //We need to define what we will do if an item is linked to multiple devices
                    //which device will be associated to the event in the MOOST Platform?
                    //If we have here > 0 than there is a physical thing configured in OpenHAB for this Item
                    //which we can load an convert to device information for the MOOST Platform
                    //Otherwise we will just leave the DEVICE part empty
                    //and assume the event is not triggered through a specific device
                    if(configuredLinksForItem?.length === 1){
                        const linkFromItemToThing = configuredLinksForItem[0];
                        const thingUID = convertChannelUIDToThingUID(linkFromItemToThing.channelUID);
                        const thing = await loadThingByThingUID(oauth2token.token, thingUID);
                        moostDevice = convertOpenHABThingToMOOSTDevice(thing, itemUpdate);
                    }

                    sendEventToMOOST(itemUpdate, moostDevice, moostState)
                });
            })
        });
    },
};

/**
 * Load Item from the OpenHAB instance by ItemName
 * @param oauth2token The Token which is used for authentication against the openHAB instance
 * @param itemName The name of the OpenHAB Item for which we want to retrieve the full Item Object
 * @returns {Promise<AxiosResponse<any>>}
 */
async function loadItemByItemName(oauth2token, itemName) {
    logger.info("Get OpenHAB Item from " + systemConfig.system.host + " for item " + itemName);

     return axios.get(`${OPENHAB_CLOUD_REST_HOST}/items/${encodeURIComponent(itemName)}`, {
        headers: {
            Authorization: `Bearer ${oauth2token}`,
            "WWW-Authenticate": "Basic"
        },
        httpsAgent: AXIOS_AGENT
    }).then((res) => {
        logger.debug("OpenHAB Item instance: " + JSON.stringify(res.data))
        return res.data;
    }).catch((err) => {
        logger.error('Error loading item from OpenHAB: ' + err);
        return null;
    })
}

/**
 * Load links form the OpenHAB Instance by itemName
 * @param oauth2token The Token which is used for authentication against the openHAB instance
 * @param itemName The name of the OpenHAB Item for which we want to retrieve all links
 * @returns {Promise<AxiosResponse<any>>}
 */
async function loadLinksByItemName(oauth2token, itemName) {
    logger.info("Get OpenHAB Links for item " + itemName);

    return axios.get(`${OPENHAB_CLOUD_REST_HOST}/links/?itemName=${encodeURIComponent(itemName)}`, {
        headers: {
            Authorization: `Bearer ${oauth2token}`,
            "WWW-Authenticate": "Basic"
        },
        httpsAgent: AXIOS_AGENT
    }).then((res) => {
        logger.debug("Configured Links instance: " + JSON.stringify(res.data))
        return res.data;
    }).catch((err) => {
        logger.error('Error loading Links from OpenHAB: ' + err);
        return null;
    })
}

/**
 * Load thing from the OpenHAB Instance by thingUID
 * @param oauth2token The Token which is used for authentication against the openHAB instance
 * @param thingUID The UID of the thing that should be loaded
 * @returns {Promise<AxiosResponse<any>>}
 */
async function loadThingByThingUID(oauth2token, thingUID) {
    logger.info("Get OpenHAB Thing from " + systemConfig.system.host + " for thingUID " + thingUID);

    return axios.get(`${OPENHAB_CLOUD_REST_HOST}/things/${encodeURIComponent(thingUID)}`, {
        headers: {
            Authorization: `Bearer ${oauth2token}`,
            "WWW-Authenticate": "Basic"
        },
        httpsAgent: AXIOS_AGENT
    }).then((res) => {
        logger.debug("Successfully loaded OpenHAB Thing instance")
        return res.data;
    }).catch((err) => {
        logger.error('Error loading Thing from OpenHAB: ' + err);
        return null;
    })
}

/**
 * Assembes the final event that will be eventually sent to the MOOST API
 * @param itemUpdate The update event that has occurred
 * @param moostDevice The value for the "device" property in MOOST Schema format
 * @param moostState The value for the "state" property in MOOST Schema format
 * @returns {Promise<AxiosResponse<any>>}
 */
async function sendEventToMOOST(itemUpdate, moostDevice, moostState) {
    const eventToSend = {
        "timestamp": Math.floor(+itemUpdate.last_change / 1000),
        "customerId": MOOST_API_CUSTOMER_ID,
        "type": "DEVICE_EVENT_EMITTED",
        "user": {
            "id": itemUpdate.openhab,
        },
        "device": moostDevice,
        "state": moostState,
    }

    if (isAPITokenEmptyOrExpired()) {
        await leaseNewMOOSTAPIToken();
    }

    logger.debug('MOOST: Sending event ' + JSON.stringify(eventToSend))
    return axios.post(`${MOOST_API_EVENTS_ENDPOINT}`, eventToSend, {
        headers: {
            'Authorization': `${MOOST_API_AUTH_TOKEN}`
        }
    }).then((res) => {
        logger.debug('openHAB-cloud: Sending event to MOOST ended with status: ' + res.status);
    }).catch((error) => {
        logger.error('openHAB-cloud: Error sending event to MOOST: ' + error);
    });
}

/**
 * Leases a new MOOST API Token from the auth Endpoint and stores it within MOOST_API_AUTH_TOKEN
 * @returns {Promise<void>}
 */
async function leaseNewMOOSTAPIToken() {
    await axios.post(`${MOOST_API_LOGIN_ENDPOINT}`, {
            username: moostConfig.api.creds.username,
            password: moostConfig.api.creds.password
        }
    ).then((res) => {
        if ('authorization' in res.headers) {
            MOOST_API_AUTH_TOKEN = res.headers['authorization']
            logger.info('Successful received a new MOOST API Token. ' + MOOST_API_AUTH_TOKEN)
        } else {
            logger.error('Response from MOOST Auth Service did not include an Authorization Header.')
        }
    }).catch((error) => {
        logger.error('openHAB-cloud: Error receiving JWT from MOOST: ' + error)
    });
}

/**
 * Helper function which transforms the OpenHAB Item and the itemUpdate into the MOOST State Schema
 * @param openHABItem The OpenHAB Item which was updated
 * @param itemUpdate The update event which occurred
 * @returns string  JSON representing the MOOST State
 */
function convertOpenHABItemToMOOSTState(openHABItem, itemUpdate) {
    if(openHABItem?.stateDescription?.options.length > 0) {
        const stateOptions = openHABItem.stateDescription.options;
        return {
            // which type can we use ? this is tricky
            type: stateOptions.filter(so => so.value === "moost_state_type")[0]?.label,
            object: stateOptions.filter(so => so.value === "moost_state_object")[0]?.label,
            value_after: itemUpdate.status,
            value_before: itemUpdate.prev_status
        }
    } else {
        logger.error("Please configure the needed MOOST options in the items Metadata!")
    }
}

/**
 * Helper function which transforms the OpenHAB thing properties into the MOOST Device Schema
 * @param thing The loaded OpenHAB Thing which should be transformed
 * @returns string JSON representing the MOOST Device
 */
function convertOpenHABThingToMOOSTDevice(thing) {
    return {
        "device": {
            "id": thing.UID,
            "location":  thing.location,
            "type": thing.label,
            "vendor_name": thing.properties.vendor,
            "product_name": thing.properties.modelId
        }
    }
}

/**
 * Checks if the API Token in MOOST_API_AUTH_TOKEN is empty or has expired
 * @returns {boolean} True if the token is empty or expired
 */
function isAPITokenEmptyOrExpired() {
    if (MOOST_API_AUTH_TOKEN !== '') {
        const decoded = jwt_decode(MOOST_API_AUTH_TOKEN);
        return Math.floor(new Date() / 1000) >= decoded.exp
    } else {
        return true;
    }
}

/**
 * The channelUID has the format of 4 element seperated by a colon (:).
 * The first three parts are the same as the thingUID. By removing the last part from the String
 * we get the thingUID out of the channelUID
 * @param channelUID The channelUID which should be transformed into a thingUID
 * @returns {string} The thingUID which is extracted from the channelUID
 */
function convertChannelUIDToThingUID(channelUID) {
    let splittedChannelUID = channelUID.split(":");
    return splittedChannelUID.slice(0, splittedChannelUID.length - 1).join(":");
}