const rp = require('request-promise');
const deviceUUIDs = require('./devices.json');
const fs = require('fs');
const token = fs.readFileSync('/etc/connecthing-api/token')
const platformURL = "http://api.connecthing/"
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function deviceExist(UUID) {
    var options = {
        method: 'GET',
        url: platformURL + 'api/v1/devices/' + UUID,
        rejectUnauthorized: false,
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true,
    };
    return rp(options);
}

function sendToIotdata(payload) {

    var options = {
        method: 'PUT',
        url: platformURL + 'api/v1/iotdata',
        rejectUnauthorized: false,
        headers: {
          'Authorization': 'Bearer ' + token
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
        console.log(uuid)
        deviceExist(uuid).then(res => {
            if (res.totalRecords && res.records
                && res.records[0]
                && res.records[0].UUID == uuid){
                    var datapoints = generateDataPoints(uuid)
                    sendToIotdata(datapoints)
                } else {
                    console.error("No device matching :" + uuid)
                }
        })


    })
}

runAutmation()

setInterval(runAutmation, 60000)
