const rp = require('request-promise');
const deviceUUIDs = require('./devices.json');


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

function generateDataPoints(uuid){
    return [{
            "UUID": uuid,
            "name": "active.power",
            "value": randomIntFromInterval(40, 75),
            "msg_type": "datum",
        },
        {
            "UUID": uuid,
            "name": "reactive.power",
            "value": randomIntFromInterval(40, 75),
            "msg_type": "datum",
        },
        {
            "UUID": uuid,
            "name": "apparent.power",
            "value": randomIntFromInterval(40, 75),
            "msg_type": "datum",
        },
        {
            "UUID": uuid,
            "name": "voltage",
            "value": randomIntFromInterval(10, 14),
            "msg_type": "datum",
        },
        {
            "UUID": uuid,
            "name": "amperage",
            "value": randomIntFromInterval(5, 10),
            "msg_type": "datum",
        },
        {
            "UUID": uuid,
            "name": "frequency",
            "value": randomIntFromInterval(49, 52),
            "msg_type": "datum",
        }]
}



function runAutmation(){
    deviceUUIDs.forEach( uuid => {
        deviceExist(uuid).then(res => {
            if (res.totalRecords && res.records
                && res.records[0]
                && res.records[0].UUID == config.deviceUUID){
                    var datapoints = generateDataPoints(uuid)
                    sendToIotdata(datapoints)
                } else {
                    console.error("No device matching :" + uuid)
                }
        })


    })
}



setImmediate(runAutmation, 60000)