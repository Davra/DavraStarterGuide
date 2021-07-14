const rp = require('request-promise');
const moment = require('moment');
const config = require('./config.json');

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function deviceExist(UUID) {
    var options = {
        method: 'GET',
        url: "https://" + config.tenantUrl + '/api/v1/devices/' + UUID,
        rejectUnauthorized: false,
        auth: {
            'user': config.username,
            'pass': config.password
        },
        json: true,
    };
    return rp(options);
}


function sendToIotdata(payload) {

    var options = {
        method: 'PUT',
        url: "https://" + config.tenantUrl + '/api/v1/iotdata',
        rejectUnauthorized: false,
        auth: {
            'user': config.username,
            'pass': config.password
        },
        json: true,
        body: payload
    };

    return rp(options, function (error, response, body) {
        if (!error && response) {
            console.log("Response from IoT data:", response.statusCode);
        } else {
            console.log('Error sending iotdata', error);        }
    }).catch(error => {
        console.error('Unable to reach Davra');
    });

};

console.log(" -- Script START -- " )

console.log(" -- Config validation -- " )
if (!config) {
    console.error("Please make sure you have a config.json file in the same folder as this file");
    return;
}

if (!config.tenantUrl || config.tenantUrl == "") {
    console.error("Please set your tenantUrl in your config.json file");
    return;
}
if (!config.username || config.username == "") {
    console.error("Please set your username in your config.json file");
    return;
}
if (!config.password || config.password == "") {
    console.error("Please set your password in your config.json file");
    return;
}
if (!config.deviceUUID || config.deviceUUID == "") {
    console.error("Please set your deviceUUID in your config.json file");
    return;
}
console.log(" -- Config Validated -- " )


console.log(" -- Data generation -- " )
const date = moment().subtract(24, "hour");
const data = [];
for (let index = 0; index < 24; index++) {
    let time = date.valueOf();
    data.push({
        "UUID": config.deviceUUID,
        "timestamp": time,
        "name": "active.power",
        "value": randomIntFromInterval(40, 75),
        "msg_type": "datum",
    },
        {
            "UUID": config.deviceUUID,
            "timestamp": time,
            "name": "reactive.power",
            "value": randomIntFromInterval(40, 75),
            "msg_type": "datum",
        },
        {
            "UUID": config.deviceUUID,
            "timestamp": time,
            "name": "apparent.power",
            "value": randomIntFromInterval(40, 75),
            "msg_type": "datum",
        },
        {
            "UUID": config.deviceUUID,
            "timestamp": time,
            "name": "voltage",
            "value": randomIntFromInterval(10, 14),
            "msg_type": "datum",
        },
        {
            "UUID": config.deviceUUID,
            "timestamp": time,
            "name": "amperage",
            "value": randomIntFromInterval(5, 10),
            "msg_type": "datum",
        },
        {
            "UUID": config.deviceUUID,
            "timestamp": time,
            "name": "frequency",
            "value": randomIntFromInterval(49, 52),
            "msg_type": "datum",
        }
    );
    date.add(1, 'hour');
}
console.log(" -- Data generated -- " )

console.log(" -- Validation Device -- " )

deviceExist(config.deviceUUID).then(res => {
    if (res.totalRecords && res.records
        && res.records[0]
        && res.records[0].UUID == config.deviceUUID) {

        console.log(" -- Device Validated-- " )
        console.log(" -- Start Sending Data-- " )
        sendToIotdata(data).then(() => {
            console.log(" -- Data Sent -- " )

            console.log('Script execution completed!');
        });

    } else {
        console.error("No matching device for UUID :" + config.deviceUUID);
    }
});

