var SAMPLE_DATA_DIV = '<div class="sample-data-msg" style="position:fixed;z-index:1;text-align:center;padding: 4px 5px 3px 5px;width: 150px;left: 50%;margin-left: -75px;top: 0;color: #FF665E;background: white;border-radius: 20px;border: 1px solid #FF665E;"><i class="fal fa-chart-bar"></i> Sample Data</div>';
var NO_DATA_DIV = '<div class="no-data-msg" style="display:none; position:fixed;right: 0px;bottom:50px; background-color: rgba(200,200,200,0.5);z-index:1; padding: 3px 5px">No Data For Query</div>';
var LOADING_DIV = '<div class="chart-loading-msg" style="display:none; position:fixed;right: 0px;bottom:50px; background-color: rgba(200,200,200,0.5);z-index:1; padding: 3px 5px">Loading...</div>';

var chart = {};

var refreshTimer = null;

function comDavraGenerateSampleData(){
    var sampleData = [];
    var startTime = new Date().valueOf() - 29 * 24 * 60 * 60 * 1000;
    var DAY = 24 * 60 * 60 * 1000;
    for(var i=0; i<30; i++){
        sampleData.push({
            timestamp: new Date(startTime + i * DAY),
            value: Math.random() * 100
        });
    } 
    
    return sampleData;
}

function comDavraGetChartConfig(){
    // If no default was set, at least set up a basic starter config
    var chartCfg = {
        "theme": "connecthing",
        "type": "serial",
        "dataProvider": [],
        "categoryField": "timestamp",
        "categoryAxis": {
            "parseDates": true,
            "dashLength": 1,
            "minorGridEnabled": true,
            "minPeriod": "ss"
        },
        "graphs": [ {
            "id": "g1",
            "valueField": "value",
            "type": "line",
            "bullet": "round"
        }],
        "chartScrollbar": {
            "autoGridCount": true,
            "graph": "g1",
            "scrollbarHeight": 40
        },
        "chartCursor": {
           "limitToGraph":"g1"
        },
        "valueAxes": [
            {
              "title": ""
            }
        ],
        "requireDeviceSelection": false
    };

    // window.connecthingChartConfig may be set by index.html for a template, thus it establishes what type of graph it is
    if(window.connecthingChartConfig){
        chartCfg = connecthingChartConfig;
    }
    
    if (!_.isUndefined(chartCfg.export)) {
        var filename = "";
        if (chartCfg.titles && chartCfg.titles.length > 0) {
            filename = chartCfg.titles[0].text + '-';    
        }
        chartCfg.export.fileName = filename + getTimestamp();
        chartCfg.export.pageOrigin = false;
    }
    
    return chartCfg;
}

function getTimestamp() {
    var rightNow = new Date();
    var timestamp = rightNow.toISOString().slice(0,19);
    timestamp = timestamp.replace(/-/g,"");
    timestamp = timestamp.replace(/T/g,"_");
    timestamp = timestamp.replace(/:/g,"");
    return timestamp;
}

// General initialisation of the widget
$(document).ready(function(){
    console.log('Deciding which type of initialisation to pursue');
    if(window.location.href.toLowerCase().indexOf('context=connecthing') > -1) {
        // await the invocation of connecthingWidgetInit which will have the context passed in
        console.log('amCharts-connecthing-widgets, Init: will wait for context to arrive');
    } else {
        if(window.location.href.toLowerCase().indexOf('widgetid=') > -1) {
            // We have a widgetId so go get the configuration for api/v1/widgetconfig
            populateWidgetWithWidgetId();
        } else {
            // This window has neither widgetId nor a context (widgetTemplate in preview mode) so display sample data.
            populateWidgetWithoutWidgetId();
        }
    }

    // Some basic styling for use across the board
    $('body').css('margin', '0px').css('color', '#000000').css('font-family', '"Poppins", Arial, "Droid Sans", sans-serif');

});

function populateWidgetWithoutWidgetId() {
    console.log('Init: populating without widgetId');
    var msgs = $(".sample-data-msg");
    if(msgs.length == 0){
        $(document.body).append(SAMPLE_DATA_DIV);
    }
    var chartCfg = comDavraGetChartConfig();

    // Setup sample data if not already supplied
    if(chartCfg.dataProvider == undefined || $.isEmptyObject(chartCfg.dataProvider)) {
        chartCfg.dataProvider = comDavraGenerateSampleData();
    }
    
    // reduce the hover tooltips to 3 decimal places
    if(chartCfg.graphs && !chartCfg.graphs[0].balloonText){
        chartCfg.graphs[0].balloonFunction = function(dataItem){
            if(dataItem.values){
                return dataItem.values.value.toFixed(3);
            }
        };
    }
    // draw the chart
    chart = AmCharts.makeChart("chartdiv", chartCfg);
    // resize as appropriate
    var width = $(window).width() * 0.98;
    var height = $(window).height() * 0.98;;
    //var aspectRatio = 3/1;
    //var height = width / aspectRatio;
    $("#chartdiv").width(width).height(height); 
}

function populateWidgetWithWidgetId() {
    console.log('Init: populating with widgetId - not implemented yet.');
}

// This function is called by the connecthing application manager when the widgets document has loaded
// The parameter context provides the widget useful hooks into the application eco system 
function connecthingWidgetInit(context){
    console.log('Init: context arrived, starting widget initialisation');
    var queryTpl = null;
    if(window.connecthingChartQueryTpl){
        queryTpl = window.connecthingChartQueryTpl;
    }
    else{
        queryTpl = {
            metrics: [{
                name: "",
                tags: {},
                group_by: [],
                aggregators:[{
                    name: "avg",
                    sampling: {
                        "value": "auto",
                        "unit": "minutes"
                    }
                }]
            }]
        };
    }

    function getTargetNumberOfPoints(){
        if(window.connecthingChartTargetNumberOfPoints){
            return connecthingChartTargetNumberOfPoints;
        } else {
            return 120;
        }
    }

    var chartCfg = comDavraGetChartConfig();    // The most basic chart configuration, probably provided by index.html. May get overwritten by the widgetConfig

    var metaData = null;
    var resizerSet = false;

    
    // A widely scoped variable which holds the device name, UUID, tags etc.
    var deviceInfo = [];
    widgetUtils.getDevicesFromServer(function(err, deviceInfoFromServer) {
        deviceInfo = JSON.parse(JSON.stringify(deviceInfoFromServer)); // Copy the array
        console.log('Device Info looks like ', deviceInfo);
    });


     function getTwinsFromServer (callback) {
        $.ajax('/api/v1/twins', {
            cache: false,
            context: this,
            dataType: "json",
            method: "GET",
            processData: true,
            contentType: "application/json",
            error: function(xhr, status, err) {
                console.log('Error getting connecthingGetTwinsFromServer', err);
            },
            success: function(data, status, xhr) {
                console.log('Got list of twins from server:', data);
                if(data && data.length) {
                    if(callback) {
                        callback(null, data);
                    }
                }
            }
        });
    }
    var twins = []
    getTwinsFromServer(function(err, twinsInfoFromServer) {
        twins = JSON.parse(JSON.stringify(twinsInfoFromServer)); // Copy the array
        console.log('Device Info looks like ', twins);
    });

    //Request this widgets configuration from the connecthing app runtime
    context.loadConfig(function(error, config){
        if(error){
            console.error(error);
            return;
        }

        // For the situation of a Misconfigured chart 
        if(!config || !config.metrics || !config.metrics[0].name || config.metrics[0].name == undefined || config.metrics[0].name == ""){
            $(document).ready(function(){
                console.log('Misconfigured chart, just drawing sample data');
                adjustChartDiv();
                if(!resizerSet){
                    $(window).resize(function(){adjustChartDiv();});
                    resizerSet = true;
                }

                var msgs = $(".sample-data-msg");
                if(msgs.length == 0){
                    $(document.body).append(SAMPLE_DATA_DIV);
                }

                // Setup sample data if not already supplied
                if(chartCfg.dataProvider == undefined || $.isEmptyObject(chartCfg.dataProvider)) {
                    chartCfg.dataProvider = comDavraGenerateSampleData();
                }
                
                if(chartCfg.graphs && chartCfg.graphs.length > 0 && !chartCfg.graphs[0].balloonText){
                    chartCfg.graphs[0].balloonFunction = function(dataItem){
                        if(dataItem.values){
                            return dataItem.values.value.toFixed(3);
                        }
                    };
                }
                chart = AmCharts.makeChart("chartdiv", chartCfg);
            });
            return;
        }

        // For the situation where we have good config
        if (config.chartCfg) {
            if (_.isString(config.chartCfg)) {
                config.chartCfg = JSON.parse(config.chartCfg);
            }
            console.log('chartCfg before extending ', chartCfg);
            console.log('amCharts, config from widgetConfig ', config.chartCfg);
            chartCfg = $.extend(true, {}, chartCfg, config.chartCfg);
            console.log('amCharts, config after extending widgetConfig onto default config ', chartCfg);
        }

        // Set the metrics in the API timeseries data query for the metrics identified in the loaded widgetConfig
        queryTpl = {
            metrics: [] 
        };
        metaData = [];

        $.each(config.metrics, function(index, metric) {
            var metricDef = {
                name: metric.name,
                tags: {},
                group_by: [],
                aggregators: [{
                    name: "avg",
                    sampling: {
                        value: "minutes",
                        unit: "auto"
                    }
                }]
            };

            if (metric.timeBucket) {
                metricDef.aggregators[0].sampling.unit = metric.timeBucket;
            }
            if (metric.aggregator) {
                metricDef.aggregators[0].name = metric.aggregator;
                metricDef.aggregators[0].sampling.value = metric.timeBucketValue;
            }
            
            if (metric.dimensions && metric.dimensions.length) {
                metricDef.group_by.push({"name":"tag","tags": metric.dimensions });
                
            }

            queryTpl.metrics.push(metricDef);

            $.each(config.metrics, function(index, item) {
                var metricMetaData = {
                    name: metric.name,
                    label: metric.name,
                    units: ""
                };
                metaData.push(metricMetaData);
            });
        });

        queryTpl.config = config;

        //Load the metric meta-data
        $.ajax("/api/v1/iotdata/meta-data", {
            contentType: "application/json",
            context: this,
            dataType: "json",
            method: "GET",
            error: function(xhr, status, err){
                console.error(err);
            },
            success: function(data, status, xhr){
                for (var metaIndex = 0; metaIndex < metaData.length; metaIndex++) {
                    for (var fieldsIndex=0; fieldsIndex < data.fields.length; fieldsIndex++) {
                        if (data.fields[fieldsIndex].name === metaData[metaIndex].name) {
                            metaData[metaIndex] = data.fields[fieldsIndex];
                        }
                    }
                }
                
                initChart();
            }
        });


        function adjustChartDiv(){
            //Using the body's width calc height keeping a 4:3 aspect ratio
            var width = $(window).width() * 0.95;
            var height = $(window).height();
            $("#chartdiv").width(width).height(height);  
            // if(chart){
            //     chart.invalidateSize();
            // }          
        }

        function initChart(){
            adjustChartDiv();
            if(!resizerSet){
                $(window).resize(function(){adjustChartDiv();});
                resizerSet = true;
            }

            // Setup some userfeedback while data is loading
            $(document.body).append(NO_DATA_DIV);
            $(document.body).append(LOADING_DIV);
            
            var chartConfigCopy = JSON.parse(JSON.stringify(chartCfg)); // Need to make a clone of it or it will get all messed up later
            console.log('Creating initial chart canvas with config ', chartConfigCopy);
            chart = AmCharts.makeChart("chartdiv", chartConfigCopy);

            // Listen for filter updates later
            context.filters.subscribe(handleFilterChange);

            var devicefilters = getDeviceFilter(context.filters.getFilterValues(), chartConfigCopy)
            if(!(devicefilters && devicefilters.deviceId && devicefilters.deviceId.length) && chartConfigCopy.requireDeviceSelection === true){  
                window.top.comDavraPNotifyInfo("Please select a device")
                return 
            }
            // Get the current values of the filters and assemble the approopriate timeseries API query
            var query = updateQuery(queryTpl, context.filters.getFilterValues());
            
            // Load the chart based on current filter settings
            doRequest(query);
        }
    });

    function transformData(data){
        // if(window.widgetUtils.simpleTransformData){
        //     console.log('amcharts-connecthing-widgets, transforming data via widget-utils');
        //     return widgetUtils.simpleTransformData(data);
        // }
        // else{
        var dataIndex = {};
        var amResult = [];
        var arrts = [];
        
        for (var index = 0; index < data.queries.length; index++) {

            for (var resultCount = 0; resultCount < data.queries[index].results.length; resultCount++) {
                var result = data.queries[index].results[resultCount];

                var seriesName = result.name;
                if (result.group_by && result.group_by[0].tags && result.group_by[0].tags.length > 0) {
                    // gateway, gateway-name
                    
                    var keys = result.group_by[0].tags;
                    $.each(keys, function(index,  key) {
                        if (result.tags[key]) {
                            seriesName += key + '-' + result.tags[key];
                        }
                    });
                }

                $.each(data.queries[index].results[resultCount].values, function(index, datapoint) {

                    if(_.contains(arrts, datapoint[0])) {
                        amResult[dataIndex[datapoint[0]]][seriesName] = datapoint[1];
                    } else {                   
                        var newIndex = amResult.length;
                        amResult[newIndex] = {  timestamp: new Date(datapoint[0]) };
                        amResult[newIndex][seriesName] = datapoint[1];
                        dataIndex[datapoint[0]] = newIndex;
                        arrts.push(datapoint[0]);
                    }
                });
            }
        }

        // It is ESSENTIAL that the data is sorted by timestamp
        if(amResult.length > 0 && amResult[0].hasOwnProperty('timestamp')) {
            console.log('Sorting the dataProvider for amChart by timestamp');
            amResult.sort(function (a, b) { return a['timestamp'] - b['timestamp']; });
        }

        return amResult;
    }

    // Make a request to the API server for the metrics data then refresh the chart with that data
    comDavraFlagAmchartsQueryCurrentlyRunning = false;
    function doRequest(_query) {    
        if(comDavraFlagAmchartsQueryCurrentlyRunning == false && comDavraFlagAmchartsCurrentlyRunningBuildChart == false) {
            console.log('doRequest running API query', _query);
            comDavraFlagAmchartsQueryCurrentlyRunning = true;
            // User feedback onscreen
            $(".chart-loading-msg").show();
            $(".no-data-msg").hide();

            $.ajax("/api/v2/timeseriesData", {
                contentType: "application/json",
                context: this,
                data: JSON.stringify(_query),
                dataType: "json",
                method: "POST",
                error: function(xhr, status, err){
                    console.error('Amcharts doRequest error ', err);
                    $(".chart-loading-msg").hide();
                    $(".no-data-msg").show();
                    comDavraFlagAmchartsQueryCurrentlyRunning = false;
                    window.top.comDavraPNotifyError("Error requesting data")

                },
                success: function(data, status, xhr){
                    console.log('doRequest query returned data ', data);
                    $(".chart-loading-msg").hide();
                    var count = data.queries.reduce(function(total, cur, ix, all){return total + cur.sample_size}, 0);
                    if(count == 0){
                        $(".no-data-msg").show();
                    }

                    console.log('doRequest returned count: ', count);
                    // Convert the data so it is suitable for charting
                    chart.dataProvider = transformData(data);
                    console.log('amcharts, building chart with dataProvider: ', chart.dataProvider);

                    buildChartGraphs(data);
                    chart.validateData();
                    setTimeout(function() { // Wait a moment before even attempting to run another query
                        comDavraFlagAmchartsQueryCurrentlyRunning = false;   
                        


                    }, 1000);
                }
            });
        } else {
            console.log('doRequest was going to run a query, but already processing the last one, so ignoring for now.');
        }
    }
    
    comDavraFlagAmchartsCurrentlyRunningBuildChart = false;
    function buildChartGraphs(data) {
        comDavraFlagAmchartsCurrentlyRunningBuildChart = true;
        var series = [];
        for (var index = 0; index < data.queries.length; index++) {

            for (var resultCount = 0; resultCount < data.queries[index].results.length; resultCount++) {
                var result = data.queries[index].results[resultCount];

                var metric = result.name;
                var item = _.find(metaData, function(data){ return data.name == metric; });

                if (result.group_by && result.group_by[0].tags && result.group_by[0].tags.length > 0) {
                    // gateway, gateway-name
                    var graphName = metric;
                    var graphLabel = item.label;
                    
                    var keys = result.group_by[0].tags;
                    $.each(keys, function(index,  key) {
                        if (result.tags[key]) {
                            // For the special condition of grouping by device, replace the deviceId or UUID with the device name
                            if(key == 'deviceId' || key == 'UUID') {
                                var deviceName = key;
                                for(var tmpIndexDevice = 0; tmpIndexDevice < deviceInfo.length; tmpIndexDevice++) {
                                    if(deviceInfo[tmpIndexDevice].id == result.tags[key] 
                                        || deviceInfo[tmpIndexDevice].UUID == result.tags[key]) {
                                        deviceName = deviceInfo[tmpIndexDevice].name;
                                    }
                                }
                                graphLabel += "-" + deviceName;
                                graphName += key + '-' + result.tags[key];
                            } else {
                                console.log("Quentin", twins,result.tags[key])
                                twinName = key 
                                for(var tmpIndexTwin = 0; tmpIndexTwin < twins.length; tmpIndexTwin++) {
                                    if( twins[tmpIndexTwin].UUID == result.tags[key]) {
                                        twinName = twins[tmpIndexTwin].name;
                                    }
                                }
                                
                                graphLabel += "-" + twinName;
                                graphName += key + '-' + result.tags[key];
                            }
                        }
                    });
                    series.push({ label: graphLabel, labelText: graphLabel, title: graphLabel, name: graphName, units: item.units } );    
                }
                else {
                    series.push({ label: item.label, labelText: item.label, title: item.label, name: metric, units: item.units } );
                }
            }
        }

        var currentCountGraphs = (chart.graphs) ? chart.graphs.length : 0;
        console.log('Amcharts clearing current graphs ', currentCountGraphs);
        for(var tmpIndex = currentCountGraphs; tmpIndex >= 0; tmpIndex--) {
            console.log('Removing graphItem ', chart.graphs[tmpIndex]);
            if(chart.graphs[tmpIndex] != undefined) {
                chart.hideGraph(chart.graphs[tmpIndex]);
                chart.removeGraph(chart.graphs[tmpIndex]);
            }
        }
        chart.validateNow();
        console.log('Amcharts current graphs after deletion ', chart.graphs.length);
        console.log('Amcharts, adding graphs, series looks like:', series);
        $.each(series, function(index, item) {
            var graph = new AmCharts.AmGraph();

            // Was there a setting indicated in the config to apply to all graphs?
            console.log('extending chartCfg.graphs ', chartCfg.graphs[0]);
            if (chartCfg.graphs && chartCfg.graphs.length > 0) {
                graph = $.extend({}, graph, chartCfg.graphs[0]);
                // It is not safe to use the id property though so delete it in case it was inserted somehow by the authors configuration
                if(graph.hasOwnProperty('id')) {
                    delete(graph.id);
                }
            }    

            // In tooltip fashion, display a reasonable value
            graph.balloonFunction = function(dataItem){
                if(dataItem.values && dataItem.values.value){
                    if(item.label.length > 12) {
                        return item.label.replace('-', ' <br/> ') + " <br/> " + dataItem.values.value.toFixed(3) + " " + item.units;
                    } else {
                        return item.label.replace('-', ' <br/> ') + " " + dataItem.values.value.toFixed(3) + " " + item.units;
                    }
                    
                }
            };

            graph.valueField = item.name;
            //graph.legendPeriodValueText = item.label;
            //graph.legendValueText = "";
            graph.title = item.label;   // Setting the title is essential for legends to work
            console.log('amcharts, adding graph ', item.name);
            chart.addGraph(graph);
        });
        chart.validateNow();

        // Legend formatting
        if(chart.legend) {
            // Use a function to format it on -the-fly
            chart.legend.valueFunction = function(graphDataItem, valueText) {
                //check if valueText is empty. Only occurs when you're not currently hovered over a value and if you don't have a periodValueText set.
                if (typeof(valueText) !== 'undefined' && valueText !== NaN && valueText.trim() !== "" && parseFloat(valueText) !== NaN) { 
                    valueText = valueText.replace(/,/g,''); // unfortunately the toFixed functin in JS cannot handle commas, sheesh
                    var numberInDecimalPlaces = parseFloat(valueText).toFixed(3);
                    if(numberInDecimalPlaces == parseFloat(valueText).toFixed(0)) {
                        return parseFloat(valueText).toFixed(0);    // If it was an integer, show as such
                    } else {
                        return parseFloat(valueText).toFixed(3);    // Show 3 decimal places
                    }
                } else {
                    return ""; 
                }
            }
        }
        console.log('amChart graph added with datapoints:', chart.dataProvider.length);
        console.log('Amcharts current graphs after additions ', chart.graphs.length);
        //chart.zoomToIndexes(0, chart.dataProvider.length - 1);
        //chart.zoomOut();
        zoomChart();
        comDavraFlagAmchartsCurrentlyRunningBuildChart = false;
    }

    
    chart.addListener("dataUpdated", zoomChart);
    function zoomChart(){
        chart.zoomToIndexes(0, chart.dataProvider.length - 1);
    }

    function handleFilterChange(filters) {
        console.log('widget filterChange occurred ', filters);
        var query = updateQuery(queryTpl, filters);
        if(typeof(series) == "undefined") {
            series = [];
        } 
        var chartConfigCopy = JSON.parse(JSON.stringify(chartCfg)); // Need to make a clone of it or it will get all messed up later

        var devicefilters = getDeviceFilter(filters, chartConfigCopy)
        if(!(devicefilters && devicefilters.deviceId && devicefilters.deviceId.length) && chartConfigCopy.requireDeviceSelection === true){
            window.top.comDavraPNotifyInfo("Please select a device")
            return
        }
        doRequest(query);
    }

    function getTimerangeFilter(filter, queryConfig) {
        // If filters have been specified at a page level then these override the global controls
        if (queryConfig && queryConfig.timerange) {
            filter.timerange = calculateTimeRange(queryConfig.timerange);
        }

        return filter.timerange;           
    }

    function calculateTimeRange(timerange) {
        if (timerange.relTimeOption) {
            timerange.endTime = new Date().valueOf();
            timerange.starttime = reltimeranges[timerange.relTimeOption];
        }
        return timerange;
    }

    function checkForTimerangeRefresh(filter, timerange) {
        var reltimeranges = {
            "last-60-mins": 60 * 60 * 1000,
            "last-8-hours": 8 * 60 * 60 * 1000,
            "last-24-hours": 24 * 60 * 60 * 1000,
            "last-7-days": 7 * 24 * 60 * 60 * 1000,
            "last-30-days": 30 * 24 * 60 * 60 * 1000
        };

        var refreshrates = {
            "last-60-mins": 5000,
            "last-8-hours": 60000,
            "last-24-hours": 60000,
            "last-7-days": 60000,
            "last-30-days": 5 * 60000
        }

        if(timerange.relTimerange && timerange.relTimerange == "last-60-mins") {
            clearInterval(refreshTimer);
            refreshTimer = setInterval(function() {
                handleFilterChange(filter);
            }, refreshrates[timerange.relTimerange]);
        }
        else {
            clearInterval(refreshTimer);
        }
    }

    function getDeviceFilter(filter, queryConfig) {
        if (queryConfig && queryConfig.deviceId) {
            // handle page device control where all devices have been specified
            if (queryConfig.deviceId === 'all') {
                delete filter.tags;
            }
            else {
                if (_.isUndefined(filter.tags)) {
                    filter.tags = {};
                }
                filter.tags.deviceId = queryConfig.deviceId;
            }   
        }
        return filter.tags;
    }

    function updateQuery(query, filter){
        var _query = _.clone(query);
        delete _query.config;

        if (!_query || !_query.metrics || !filter) {
            return;
        }
        
        // Set the timerange and bucketise
        var timerange = getTimerangeFilter(filter, query.config);
        var tags = getDeviceFilter(filter, query.config);
        
        //checkForTimerangeRefresh(filter, timerange);
        console.log("config",query.config)
        // Auto granularity
        _query.metrics.forEach(function(metric){

            // If a chart explicitly requests raw data then honour it otherwise bucketise
            var sampling = 60000;
            if(metric.aggregators && metric.aggregators[0].sampling.unit == "raw"){
                delete metric.aggregators;
                return;
            }
            else if (metric.aggregators && metric.aggregators[0].sampling.unit == "auto") {
                metric.aggregators[0].name = "avg";
                metric.aggregators[0].align_sampling = true;
                metric.aggregators[0].sampling = {
                    unit: "milliseconds"
                };

                sampling = context.utils.TimeBucketiser.bucketSize(timerange.startTime, timerange.endTime, getTargetNumberOfPoints());
                metric.aggregators[0].sampling.value = sampling;
            }
            
            timerange.startTime = timerange.startTime - (timerange.startTime % sampling);
            timerange.endTime = timerange.endTime - (timerange.endTime % sampling) + sampling;
        });
        _query.start_absolute = timerange.startTime;
        _query.end_absolute = timerange.endTime;
        

        // Apply tags
        _query.metrics.forEach(function(metric) {
            metric.tags = tags || {};
        });
        return _query;        
    }
}