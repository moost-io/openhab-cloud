const STATE_TYPE_MAPPINGS = {
        BRIGHTNESS: [
            'system:brightness',
            'brightness',
            'deconz:brightness',
            'tradfri:brightness',
            'dmx:brightness',
            'yeelight:brightness',
            'hue:brightness',
            'hyperion:brightness',
            'lifx:brightness',
            'mihome:brightness',
            'miio:brightness',
            'openwebnet:brightness',
            'velbus:brightness',
            'wemo:brightness'
        ],
        SIGNAL_STRENTH: [
            "signal-strength",
            "system:signal-strength"
        ],
        LOW_BATTERY: [
            "low-battery",
            "system:low-battery"
        ],
        BATTERY_LEVEL: [
            "battery-level",
            "system:battery-level"
        ],
        POWER: [
            "power",
            "system:power",
            "atlone:power",
            "bosesoundtouch:power",
            "coolmasternet:power",
            "energenie:power",
            "fsinternetradio:power",
            "lgtvserial:power",
            "miio:power",
            "nanoleaf:power",
            "onkyo:power",
            "orvibo:power",
            "pjLinkDevice:power",
            "rotelra1x:power",
            "samsungtv:power",
            "sonyprojector:power",
            "squeezebox:power",
            "wifiled:power",
            "yamahareceiver:power"
        ],
        COLOR: [
            "color",
            "system:color",
            "lcn:color",
            "deconz:color",
            "dmx:color",
            "feican:color",
            "hue:color",
            "hyperion:color",
            "knx:color",
            "lgtvserial:color",
            "lifx:color",
            "mihome:color",
            "miio:color",
            "mqtt:color",
            "nanoleaf:color",
            "tradfri:color",
            "wifiled:color",
            "wlanthermo:color",
            "yeelight:color"
        ],
        COLOR_TEMPERATURE: [
            "color-temperature",
            "system:color-temperature"
        ],
        LOCATION: [
            "location",
            "system:location"
        ],
        MOTION: [
            "motion",
            "system:motion",
            "helios:motion",
            "bigassfan:motion",
            "mihome:motion",
            "rfxcom:motion"
        ],
        MUTE: [
            "mute",
            "system:mute"
        ],
        VOLUME: [
            "volume",
            "system:volume"
        ],
        MEDIA_CONTROL: [
            "media-control",
            "system:media-control"
        ],
        MEDIA_TITLE: [
            "media-title",
            "system:media-title"
        ],
        OUTDOOR_TEMPERATURE: [
            "outdoor-temperature",
            "system:outdoor-temperature"
        ],
        WIND_DIRECTION: [
            "wind-direction",
            "system:wind-direction"
        ],
        WIND_SPEED: [
            "wind-speed",
            "system:wind-speed"
        ],
        ATMOSPHERIC_HUMIDITY: [
            "atmospheric-humidity",
            "system:atmospheric-humidity"
        ],
        BAROMETRIC_PRESSURE: [
            "barometric-pressure",
            "system:barometric-pressure"
        ]
    }
;

const DEVICE_TYPE_MAPPINGS = {
    LIGHT_BULB: [
        "lifx:colorirlight",
        "lifx:colorlight",
        "lifx:colormzlight",
        "lifx:tilelight",
        "lifx:whitelight",
        "hue:0200",
        "hue:0220",
        "hue:0100",
        "hue:0210",
        "hue:0000",
        "tradfri:0100",
        "tradfri:0220",
        "tradfri:0210"
    ],
    PRINTER: [
        "hpprinter:printer",
        "ipp:printer"
    ],
    SENSOR: [
        "hue:0302"

    ],
    MOTION_SENSOR: [
        "dlinksmarthome:DCH-S150",
        "caddx:zone",
        "hue:0107",
        "doorbird:d101",
        "doorbird:d210x"
    ],
    PLUG: [
        "tradfri:0010"
    ],
    LOUDSPEAKER: [
        "sonos:PLAY1",
        "sonos:PLAY3",
        "sonos:PLAY5",
        "sonos:PLAYBAR",
        "sonos:PLAYBASE",
        "sonos:SYMFONISK",
        "sonos:One",
        "sonos:OneSL",
        "sonos:CONNECT",
        "sonos:CONNECTAMP",
        "sonos:Beam",
        "sonos:Amp",
        "spotify:device",
        "heos:player",
        "spotify:device",
        "spotify:player",
        "heos:player",
        "chromecast:audiogroup",
        "chromecast:audio",
        "chromecast:chromecast",
        "bosesoundtouch:10",
        "bosesoundtouch:20",
        "bosesoundtouch:30",
        "bosesoundtouch:300",
        "bosesoundtouch:wirelessLinkAdapter",
        "bosesoundtouch:sa5Amplifier",
        "bosesoundtouch:device",
        "bosesoundtouch:waveSoundTouchMusicSystemIV"
    ]
};

module.exports = {
    STATE_TYPE_MAPPINGS,
    DEVICE_TYPE_MAPPINGS
}