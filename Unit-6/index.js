var layer;
var layerLabels;
var map;
var imagePath = "/eem/img/html5map/";
var fileType = "png";

var gpsDiffToConsiderAsNoMovement = 0.0001;

var ArrayOfDevices = []; // An array to store the IDs of devices to draw on screen
var ArrayOfMarkers = []; // An array of all the marker objects which are placed on screeen
var ArrayOfTracks = []; // An array for each device's layer on the map showing tracks
var ArrayOfTrackPoints = [];
var ArrayOfAlarms = []; // An array which holds the alarm information for a given device. 
var DeviceGeoJson = []; // An array to hold each device and its geoJson so quick access to. Index is the id of device

// When jQuery has loaded
// This function load the settings of your widget that are implemented in settings.html, settings.js and settings.css respectively
// This component do not use settings part of the widget

$(function() {
    console.log('Widget Index, deciding which type of initialisation to pursue');
    if(window.location.href.toLowerCase().indexOf('context=connecthing') > -1) {
        // Await the invocation of connecthingWidgetInit which will have the context passed in
        console.log('Widget, Init: will wait for context to arrive');
    } else {
        if(window.location.href.toLowerCase().indexOf('widgetid=') > -1) {
            // We have a widgetId so could go get the configuration for api/v1/widgetconfig
            // However, this widget would like to be aware of the page lvel filters so we will not implement this section now.
            // Instead, we expect the connecthingWidgetInit function to be called by the outer page.
            // Note, for a standalone page, it would be appropriate to include the handling here.
        } else {
            // This window has neither widgetId nor a context (widgetTemplate in preview mode) so display sample data.
            connecthingWidgetInit();
        }
    }
    
    console.log('Widget starting to load configuration');
    // Load the configuration for this widget

    widgetUtils.loadWidgetSettings(function(err, data) {
        if (data && data !== null) {
            // Place the configuration data into the div to demonstrate it loaded
            $("#myConfiguration").val(data);
        }
    });
});

function connecthingWidgetInit(context) {
    console.log('Init: context arrived, starting widget initialisation');
    // Listen for filter updates
    if (context !== undefined) {
        console.log("QUENIN",context.filters.getFilterValues())
        context.filters.subscribe(handleFilterChange);
        
    }

    map = L.map('leafletmap', {
        attributionControl: false,
        zoomControl: false,
        zoom: 13,
        minZoom: 3,
        maxZoom: 18,
    }).setView([53.3498, -6.2603]);

    layer = L.esri.basemapLayer("Streets").addTo(map);
    new L.Control.Zoom({ position: 'bottomright' }).addTo(map);
    
    $(".toggleBasemaps").click(function() {
        $(this).find('img').toggle();
        var basemapid = $(this).find('img:visible').attr('id');
        setBasemap(basemapid);
    });
  //when the map is clicked create a buffer around the click point of the specified distance.
    map.on("click", function(evt){
    console.log('Left click on map noticed. Maybe move device to here ', evt, evt.latlng.lat, evt.latlng.lng);
    var htmlPopup = '<div class="custompopupmovement ">Change Device Location<hr>Move device to selected location?<hr>' +
    '<div style="text-align: right; padding-top: 6px;">' +
    '<button class="btn btn-info float-right" onclick="$(this).closest(\'.leaflet-popup\').hide()">Cancel</button>' +
    '<button class="btn btn-primary float-right" onclick="moveDeviceTo(' +
    evt.latlng.lat.toString() + ',' + evt.latlng.lng.toString() + ')">Move</button></div>' +
    '</div>';
    // Create a circle marker at candidate location
    var markerCandidate = L.circleMarker([evt.latlng.lat, evt.latlng.lng], {
    radius: 0.1,
    weight: 1,
    opacity: 1,
    fillOpacity: 1
    });
    markerCandidate.bindPopup(htmlPopup, {'className' : 'popup-leaflet-underneath', 'width' : '120px'});
    markerCandidate.addTo(map);
    markerCandidate.openPopup();
    });  
    if (context !== undefined) {
    handleFilterChange(context.filters.getFilterValues())
        
    }
}
// Move the device to a new location
var moveDeviceTo = function (newLat, newLng) {
    console.log('Moving device via map to ', newLat, newLng);
    $('.custompopupmovement').html('Moving device...');

    if (!deviceUUID) {
        console.log('Cannot move device, unknown device uuid');
        return false;
    }

    var latitude = parseFloat(newLat);
    var longitude = parseFloat(newLng);

    widgetUtils.ajaxPut('/api/v1/iotdata', {
        "UUID": deviceUUID,
        "latitude": latitude,
        "longitude": longitude,
        "name": "noname",
        "value": 100,
        "msg_type": "datum"
    }, function (err, response) {
        console.log('After device movement upload: ', err, response);

        if (err !== undefined && err !== null) {
            console.log("ERROR:", err);
            comDavraPNotifyError("Failed to update device location due to network connection issues");
            return;
        }

        var deviceLocation = {
            latitude: latitude,
            longitude: longitude
        };

        console.log('Publishing device to message bus:', deviceLocation);
        widgetUtils.comDavraDeviceLocationMessageBus.publish(deviceLocation);

        setTimeout(function () { // Timeout of 1 sec to allow server to propagate changes
            window.location.reload();
        }, 1500);
    });
}

// This function remove all layers from the map
function removeAllLayers() {
    map.eachLayer(function(layer) {
        if ((layer.options.type == "marker") || (layer.options.type ==  "polyline") || (layer.options.type == "track") || (layer.options.hasOwnProperty('layerType') && layer.options.layerType == "alarm") ) {
            map.removeLayer(layer);
        }
    });
}

// This function return the path of the marker icon
function buildAssetImage(assetType) {
    return imagePath + "asset_type/" + assetType + "." + fileType;
}

// This function get all the devices icon name
function getDevicesIcon() {
    var url = "/eem/api/v1_1/devices/bulkload";
    return ($.ajax({
        type: 'GET',
        url: url,
        dataType: 'json',
        global: false,
        async: false,
        success: function(data) {
            return data;
        },
        error: function(datarerror) {
            return "{}";
        }
    }).responseJSON);
}

function GetTimeLocationPair(timestamp, idOfDevice) {
    //console.log('GetLocationAndTimePair starting for ' + idOfDevice);
    if (DeviceGeoJson[idOfDevice]) {
        var timeArray = DeviceGeoJson[idOfDevice].properties.time; // An easier array for iterating through
        var locationArray = DeviceGeoJson[idOfDevice].geometry.coordinates; 
        var timeLocationPair = {};
        var numItems = timeArray.length; // The total number of items in the coordinates and time arrays
        // Establish minimum default response
        timeLocationPair.before = { "timestamp": timeArray[0], "latitude": locationArray[0][1], "longitude": locationArray[0][0] };
        timeLocationPair.after = { "timestamp": timeArray[numItems - 1], "latitude": locationArray[numItems - 1][1], "longitude": locationArray[numItems - 1][0] };
        // Search through all the timestamps to find the first entry which is after the "needle" time
        for (var i = 0; i < numItems; i++) {
            if (timeArray[i] > timestamp) {
                //console.log('Found a timeLocation pair which are after the sought time, so use this pair');
                timeLocationPair.after = { "timestamp": timeArray[i], "latitude": locationArray[i][1], "longitude": locationArray[i][0] };
                if (i > 0) {
                    timeLocationPair.before = { "timestamp": timeArray[i - 1], "latitude": locationArray[i - 1][1], "longitude": locationArray[i - 1][0] };
                } else {
                    timeLocationPair.before = { "timestamp": timeArray[i], "latitude": locationArray[i][1], "longitude": locationArray[i][0] };
                }
                return timeLocationPair;
            }
        }
        return timeLocationPair;
    } else {
        console.log('Apparently do not have geoJson data for this device ', idOfDevice);
    }
}

function FindInterpolatedPosition(timestamp, timeLocationPair) {
    var resultObj = { "latitude": 0, "longitude": 0 };
    if (timestamp < timeLocationPair.before.timestamp) {
        resultObj.latitude = timeLocationPair.before.latitude;
        resultObj.longitude = timeLocationPair.before.longitude;
        return resultObj;
    }
    if (timestamp > timeLocationPair.after.timestamp) {
        resultObj.latitude = timeLocationPair.after.latitude;
        resultObj.longitude = timeLocationPair.after.longitude;
        return resultObj;
    }
    var totalTimeBetweenBeforeAndAfter = timeLocationPair.after.timestamp - timeLocationPair.before.timestamp;
    if (totalTimeBetweenBeforeAndAfter > 1) {
        var timeFractionElapsed = (timestamp - timeLocationPair.before.timestamp) / (totalTimeBetweenBeforeAndAfter);
        var proportionalLatitude = (timeLocationPair.after.latitude - timeLocationPair.before.latitude) * timeFractionElapsed;
        var proportionalLongitude = (timeLocationPair.after.longitude - timeLocationPair.before.longitude) * timeFractionElapsed;
        resultObj.latitude = timeLocationPair.before.latitude + proportionalLatitude;
        resultObj.longitude = timeLocationPair.before.longitude + proportionalLongitude;
    }
    return resultObj;
}

function convertEventsListToGeoJson(ajaxResponseListEvents) {
    var geoJsonData = {
        "type": "Feature",
        "geometry": {
            "type": "MultiPoint",
            "coordinates": [ /*array of [lng,lat] coordinates*/ ]
        },
        "properties": {
            "time": [ /*array of UNIX timestamps*/ ],
            "geohash": [ /*array of geoHashes*/ ],
            "device": null // This will get updated with information from the ajax call about the device
        }
    };
    var previousLat = 999;  // Used to Examine if datapoints are at the same Lat,Long thus no need to duplicate
    var previousLong = 999;

    $(ajaxResponseListEvents.queries[0].results[0].values).each(function(index, element) { // element == this
        // eg element[0] : 1488900776495
        // eg element[1] : "{"latitude":"53.0","longitude":-7.5,"geohash":245}"
        var coord = JSON.parse(element[1]);
        if (coord.latitude && coord.longitude) {
            // We will check if 2 consecutive datapoints are so close to each other (in location) that we need not plot 2 markers on the map
            var diffSincePreviousDatapoint = Math.abs(coord.latitude - previousLat) + Math.abs(coord.longitude - previousLong);
            if(diffSincePreviousDatapoint > gpsDiffToConsiderAsNoMovement) {
                geoJsonData.geometry.coordinates.push([parseFloat(coord.longitude), parseFloat(coord.latitude)]);
                geoJsonData.properties.time.push(element[0]);
                var geohash = coord.geohash ? parseFloat(coord.geohash) : 0; // geohash may not exist
                geoJsonData.properties.geohash.push(geohash);
                previousLat = parseFloat(coord.latitude);
                previousLong = parseFloat(coord.longitude);
            }
        }
    });
    
    if (ajaxResponseListEvents.queries[0].labelData) {
        geoJsonData.properties.device = ajaxResponseListEvents.queries[0].labelData.labelGroups[0].device;
    }
    geoJsonData.bbox = findLatLngBounds(geoJsonData.geometry.coordinates); // The bounding box. Helpful for zooming to
    //console.log('After conversion to geoJson, data is: ', geoJsonData);
    return geoJsonData;
}

// In order to use map.fitBounds, this method finds the bounding box to support that
function findLatLngBounds(arrayCoordinates) {
    var maxLat = -180,
        maxLng = -180;
    var minLat = 180,
        minLng = 180;
    //console.log('arrayCoordinates ', arrayCoordinates)
    $(arrayCoordinates).each(function(index, element) {
        var latitude = element[0];
        var longitude = element[1];
        if (latitude > maxLat) { maxLat = latitude; }
        if (longitude > maxLng) { maxLng = longitude; }
        if (latitude < minLat) { minLat = latitude; }
        if (longitude < minLng) { minLng = longitude; }
    });
    //console.log('findLatLngBounds ', [minLat, minLng], [maxLat, maxLng]);
    return [
        [minLat, minLng],
        [maxLat, maxLng]
    ];
}

// In multiple places a dot or icon with a certain color is used to signify an alarm of a particular type. This method gets an appropriate RGB color
function getColorForAlarmSeverity (severityString) {
    var strValue = "#4aba6a"; // Default green for info alarms
    if (severityString.toString().toUpperCase() == "CRITICAL") { strValue = '#b4272d'; }
    if (severityString.toString().toUpperCase() == "WARN") { strValue = '#ea861e'; }
    return strValue;
}

function GetMarkerImageForDevice(idOfDevice) {
    var markerImage = 'x.png';
    // Find what the "index" of this id is in the array of devices
    for (var i = 0; i < ArrayOfDevices.length; i++) {
        if (idOfDevice == ArrayOfDevices[i]) {
            markerImage = (i % 12).toString() + '.png'; // Because we have 12 various marker images available
        }
    }
    return '/eem/img/html5map/markers/' + markerImage;
}

function GetMarkerColorForDevice(idOfDevice) {
    var markerColors = ["#237CC9", "#9823C9", "#518791", "#25AA22", "#CB8325", "#CBC525", "#747474", "#3A3A3A", "#6985FC", "#012E9E", "#4ACDF5", "#CA263D", "#FFFFFF"];
    var markerColorIndex = 0;
    // Find what the "index" of this id is in the array of devices
    for (var i = 0; i < ArrayOfDevices.length; i++) {
        if (idOfDevice == ArrayOfDevices[i]) {
            markerColorIndex = (i % 12); // Because we have 12 various marker images available
        }
    }
    return markerColors[markerColorIndex];
}

function AddTracksToMap(idOfDevice, geoJsonData) {
    var numberPairsTotal = geoJsonData.geometry.coordinates.length;
    var fillColorForDotsOnMap = GetMarkerColorForDevice(idOfDevice);

    // Only show the individual dots on the map if the number of datapoints is less than 1000, 
    // otherwise, just show the line of travel. This is to reduce client memory and CPU. 
    // eg. a device which send 1 datapoint per second would hit 86,400 points in a day, which can cause 2GB mem on browser 
    if(numberPairsTotal < 200) {
        var geoJsonMarkerOptions = {
            radius: 5,
            fillColor: fillColorForDotsOnMap,
            color: fillColorForDotsOnMap,
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };
        ArrayOfTracks[idOfDevice] = L.geoJson(geoJsonData, {
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, geoJsonMarkerOptions);
            }
                
        }).addTo(map);
    }
    // The GPS point locations along the tracks
    // The Leaflet system requires [Latitude, Longitude] but geoJSON is in [Lng, Lat] so convert first
    var pointListLatLng = [];
    
    for (var tmpIndex = 0; tmpIndex < numberPairsTotal; tmpIndex++) {
        pointListLatLng.push([geoJsonData.geometry.coordinates[tmpIndex][1], geoJsonData.geometry.coordinates[tmpIndex][0]]);
    }
    ArrayOfTrackPoints[idOfDevice] = new L.polyline(pointListLatLng, {
        color: fillColorForDotsOnMap,
        weight: 3,
        smoothFactor: 1,
        type: "track"
    }).addTo(map);
}


function convertTimestampToDate(timestamp) {
    var date = moment(timestamp).format("h:mm:ss a MM/DD/YYYY,");
    return date;
}

// Draw the list of alarm severity on the map
// It relies on the global variable ArrayOfAlarms which stores all the alarm data for these devices for this date
function drawAllApplicableAlarms() {
    var timeStart = Date.now();
    var countAllAlarmsToBeShown = 0;
    // Create the geoJson object. It will be added to for each alarm we wish to plot on the map
    var geoJsonData = { "type": "FeatureCollection", "features": [] }; // The overall geoJson object. Each alarm will be a feature within the array "features"
    // Create a local variable for speed. It is an array of all the alarm "name---severity" types which we wish to show onscreen
    
    // Loop through all the alarms and if the alarm matches the filter for displaying it, then add the point to the map
    // console.log('About to examine the array of alarms to decide if to show each based on alarm:', ArrayOfAlarms);
    for (var tmpAlarmIndex = 0; tmpAlarmIndex < ArrayOfAlarms.length; tmpAlarmIndex++) {
        var tmpAlarm = ArrayOfAlarms[tmpAlarmIndex];
        //console.log('Examining alarm to decide if to show it based on alarm:', tmpAlarm);
        var tmpAlarmName = tmpAlarm.config.name ? tmpAlarm.config.name.trim() : "No-Alarm-Name-Specified"; // It is possible an alarm has no name
        var tmpAlarmNameAndSeverity = tmpAlarmName + '---' + tmpAlarm.severity;
        var tmpDeviceid = tmpAlarm.deviceId;
        // which type of alarm is it, and should we show it based on the filter in play. Also, is the ID one of the list of devices we are showing now.
        
            //console.log('Alarm matched the filter with alarmtype ', tmpAlarmNameAndSeverity, tmpAlarm);
            if (tmpAlarm.hasOwnProperty('longitude') == false || tmpAlarm.hasOwnProperty('longitude') == false) {
                // Option now is to make an estimate of location based on iterpolating known poisitions from other davranetworks.event-gps events?
                var timeLocationPairForDevice = GetTimeLocationPair(tmpAlarm.timestamp, tmpDeviceid);
                var interpolatedPosition = FindInterpolatedPosition(tmpAlarm.timestamp, timeLocationPairForDevice);
                tmpAlarm.longitude = interpolatedPosition.longitude;
                tmpAlarm.latitude = interpolatedPosition.latitude;
            } 
            // Create the overall structure in geoJson format for this feature (alarm)
            var geoJsonFeature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [parseFloat(tmpAlarm.longitude), parseFloat(tmpAlarm.latitude)] /*array of [lng,lat] coordinates*/
                },
                'layerType': 'alarm',
                "properties": {
                    "time": tmpAlarm.timestamp,
                    "alarmdata": tmpAlarm,
                }
            };
            countAllAlarmsToBeShown++;
            geoJsonData.features.push(geoJsonFeature);  // Add this feature (alarm) to the array within the geoJsonObject
    }
    console.log('drawAllApplicableAlarms Adding ' + countAllAlarmsToBeShown + ' of ' + ArrayOfAlarms.length + ' alarm points to map.');

     


    // Now that the geoJson data for alarms has been populated, add it as a layer to the map
    L.geoJson(geoJsonData, {
        layerType: "alarm", // Setting this allows us to quickly remove the alarms from the map by removing any layer with this option set
        style: function (feature) {
            var fillColorForDotsOnMap = getColorForAlarmSeverity(feature.properties.alarmdata.severity);
            return {color: fillColorForDotsOnMap, fillcolor: fillColorForDotsOnMap};
        },
        pointToLayer: function(feature, latlng) {
            // FYI, if want variable radius for diff alarms: var radiusHere = 5; if(feature.properties.alarmdata.severity== 'WARN') { radiusHere = 100; }
            // create popup contents
            var severity = "";
            var iconclass = "";
            var severityString = feature.properties.alarmdata.severity;
            if (severityString.toString().toUpperCase() == "CRITICAL") { severity = 'Critical'; iconclass = "circlecolorred";}
            if (severityString.toString().toUpperCase() == "WARN") { severity = 'Warning'; iconclass = "circlecoloryellow";}
            if (severityString.toString().toUpperCase() == "INFO") { severity = 'Information'; iconclass = "circlecolorgreen";}

            var customPopup =   '<div class="custompopupimg '+ iconclass +'"></div>'+
                                '<div class="custompopupalerttext">' + severity + '</div>'+
                                '<div class="custompopuptitle">' + feature.properties.alarmdata.config.name + '</div>'+
                                '<div class="custompopupdate">' + convertTimestampToDate(feature.properties.alarmdata.timestamp) + '</div>'+
                                '<div class="custompopuplatlng">' + latlng.lat +', ' + latlng.lng + '</div>'+
                                '<hr />'+
                                '<div class="custompopupdescriptiontitle">Description</div>'+
                                '<div class="custompopupdescriptiontext">' + feature.properties.alarmdata.message + '</div>';
            
            // specify popup options 
            var customOptions = {'width':400, 'maxWidth': '500', 'className' : 'custom'};
            
            
            var marker = L.circleMarker(latlng, {
                radius: 7,
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            });
            marker.bindPopup(customPopup,customOptions);
            return marker; 
            
        }
        
    }).addTo(map);
}

function getDeviceFromServer(id, callback) {

    $.ajax('/api/v1/devices/' + id, {
        cache: false,
        context: this,
        dataType: "json",
        method: "GET",
        processData: true,
        contentType: "application/json",

        error: function (xhr, status, err) {
            console.log('Error getting connecthingGetDevicesFromServer', err);
        },

        success: function (data, status, xhr) {
            console.log('Got list of devices from server:', data);
            if (data) {
                if (callback) {
                    callback(null, data);
                }
            }
        }
    });
}

var deviceUUID;
// this function is called when a filter is updated
function handleFilterChange(filters) {
    console.log('widget filterChange occurred ', filters);
    
    if (filters.tags && filters.tags.deviceId && filters.tags.deviceId.length > 0) {
        var deviceid = filters.tags.deviceId[0];    
        var allassetswithicons = getDevicesIcon().records;
        var filtered = _.filter(allassetswithicons, {"id": Number(deviceid)})[0];
        getDeviceFromServer(deviceid, function( err, data ){
            console.log(data,data.records[0].UUID)
            deviceUUID = data.records[0].UUID
            
        })
        ArrayOfDevices = []; // An array to store the IDs of devices to draw on screen
        ArrayOfMarkers = []; // An array of all the marker objects which are placed on screeen
        ArrayOfTracks = [];
        ArrayOfTrackPoints = [];
        DeviceGeoJson = []; // An array to hold each device and its geoJson so quick access to. Index is the id of device
        
        var iconType = filtered.iconType;
        var iconUrl = buildAssetImage(iconType);
        var idToRetrieveGps = Number(deviceid);
        
        removeAllLayers();
        
        var itemIcon = L.icon({
            iconUrl: iconUrl.toLowerCase(),
            iconSize: [39, 64],
            iconAnchor: [19, 64]
        });

        var marker = L.marker([filtered.latitude, filtered.longitude], {
            icon: itemIcon,
            serialNumber: filtered.serialNumber,
            title: filtered.name,
            id: filtered.id,
            type: "marker"
        });

        marker.addTo(map);

        ArrayOfDevices.push(idToRetrieveGps);
        
        var requiredDate = new Date();
        var timestampAtStartOfDay = new Date(requiredDate.getFullYear(), requiredDate.getMonth(), requiredDate.getDate(), 0, 0, 0, 0).getTime();
        var timestampAtEndOfDay = new Date(requiredDate.getFullYear(), requiredDate.getMonth(), requiredDate.getDate(), 23, 59, 59, 0).getTime();

        var objForQuery = {
            "metrics": [{
                "name": "davranetworks.event-gps",
                "tags": { "deviceId": [deviceid] }
            }],
            "start_absolute": timestampAtStartOfDay,
            "end_absolute": timestampAtEndOfDay
        };
        
        var dataForQuery = JSON.stringify(objForQuery);
        $.ajax({
            url: '/api/v1/timeseriesData',
            type: 'POST',
            data: dataForQuery,
            dataType: 'json',
            success: function(response, status) {
                if (response.queries[0].results[0].values.length > 0) {
                    var geoJsonData = convertEventsListToGeoJson(response); // Convert the list of event data into geoJson

                    if (geoJsonData.geometry.coordinates.length > 0) { // If there actually any coordinates available
                        // Add this geoJson data to the "global" cache object
                        DeviceGeoJson[idToRetrieveGps] = geoJsonData; // Note this is a special array, notably it uses the .object rather than array entry
                        // Draw the tracks of the device on the map
                        AddTracksToMap(idToRetrieveGps, geoJsonData);
                    }

                    var boundsLatLng = geoJsonData.bbox;
                    
                    // Increase the bounding box by 10% to fit the tracks in a more user friendly window
                    var dist20 = Math.max(Math.abs(boundsLatLng[0][0] - boundsLatLng[1][0]), Math.abs(boundsLatLng[0][1] - boundsLatLng[1][1])) * 0.10;
                    boundsLatLng[0][0] = boundsLatLng[0][0] - dist20;
                    boundsLatLng[0][1] = boundsLatLng[0][1] - dist20;
                    boundsLatLng[1][0] = boundsLatLng[1][0] + dist20;
                    boundsLatLng[1][1] = boundsLatLng[1][1] + dist20;
                    map.fitBounds([
                        [boundsLatLng[1][1], boundsLatLng[1][0]],
                        [boundsLatLng[0][1], boundsLatLng[0][0]]
                    ]); 
                    
                    var alarmobjForQuery = {
                        "metrics": [{
                            "name": "davranetworks.alarm",
                            "tags": {
                                "deviceId": deviceid
                            },
                            "order": "desc",
                            "limit": 1000,  // Limit the number of alarms we handle for each device. eg 20000 alarms is 20MB of data for the client to process
                            "group_by": [{
                                "name": "tag",
                                "tags": ["deviceid"] // Breaks out the metric by associated device
                            }]
                        }],
                        "start_absolute": timestampAtStartOfDay,
                        "end_absolute": timestampAtEndOfDay
                    };
                    
                    var alarmdataForQuery = JSON.stringify(alarmobjForQuery);
                    ArrayOfAlarms = [];
                    $.ajax({
                        url: '/api/v1/timeseriesData',
                        type: 'POST',
                        data: alarmdataForQuery,
                        dataType: 'json',
                        success: function(response, status) {
                            
                            if (response.queries[0].results[0].values) {
                                console.log('retrieveApiIncidents Ajax response for device:', deviceid, ', got number of alarms:', response.queries[0].results[0].values.length);
                                for (var tmpIndex = 0; tmpIndex < response.queries[0].results[0].values.length; tmpIndex++) {
                                    // The alarm data from the API call comes back with timestamp in [0] and alarm data in [1], so amalgamate it before storing in the global variable
                                    var tmpAlarmItem = response.queries[0].results[0].values[tmpIndex][1];
                                    if(typeof tmpAlarmItem === 'string') { tmpAlarmItem = JSON.parse(tmpAlarmItem); }
                                    tmpAlarmItem.timestamp = response.queries[0].results[0].values[tmpIndex][0];
                                    tmpAlarmItem.deviceId = deviceid;
                                    ArrayOfAlarms.push(tmpAlarmItem); // Store the API results in an array for quick parsing later
                                }
                                drawAllApplicableAlarms();
                            }
                        }
                    });
                } else {
                    map.setView([filtered.latitude, filtered.longitude], 15, {animate: true});
                }
            }
        });
    }
}

// This function set the basemap layer
function setBasemap(basemap) {
    if (layer) {
        map.removeLayer(layer);
    }

    layer = L.esri.basemapLayer(basemap);

    map.addLayer(layer);

    if (layerLabels) {
        map.removeLayer(layerLabels);
    }

    if (basemap === 'ShadedRelief' ||
        basemap === 'Oceans' ||
        basemap === 'Gray' ||
        basemap === 'DarkGray' ||
        basemap === 'Imagery' ||
        basemap === 'Terrain'
    ) {
        layerLabels = L.esri.basemapLayer(basemap + 'Labels');
        map.addLayer(layerLabels);
    }
}