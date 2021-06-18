# Unit 7: Advanced concepts

In this unit, we will talk about advanced concepts, custom web applications, timeseries queries, and few REST APIs the platform offers.

AEP Features covered :
* Microservices
* Timeseries queries
* APIs

## Our first web app

To simplify our task we will download a sample app available on GitHub. Download the following repo [github](https://github.com/Davra/MicroServices-Samples) Copy the file the vue-sample-app
to a new folder and open it with your IDE. This is a VueJs app a great framework to work with really easy to pick up and get stuff done.

Let's look at the following steps to see what's inside this app.

### Project setup
```
npm install
```

### Add environment variables setup

create a `.env` file with the following :
```
VUE_APP_USERNAME - Your username to access your Davra tenant
VUE_APP_PASSWORD - Your password to access your Davra tenant
VUE_APP_TENANT_URL - Your tenant name
```

### Compiles and hot-reloads for development
```
npm run serve
```


This should open a web server on your http://localhost:8080

now open `src/plugins/vuetify.js`

you see there few color settings you can change for your app, feel free to play with this variable to try different colors.

Let's have a look now at the Sidebar component `src/components/Sidebar.vue` you can see here a list of links, you can change here the name of your links. Don't change the path of the links as it is directly linked to a route inside our vue-router.

## Building a custom chart

### Pie Chart

Now that we had a really quick look at our application let's focus on one specific area, the charts page.
Go to http://localhost:8080/charts

You will see there 3 charts. They are currently showing dummy data. What we will do in this section is making them display data from our devices.

inside `src/views/Charts.vue`
add the **getPieCharData** function inside the **methods** object
```
methods:{
getPieChartData() {
return this.axios.getAuth('api/v1/iotdata/devices/counters?start=0&length=10').then(({data}) => {
let result = []
for( const key in data){
result.push({'name': data[key].device.name, count:data[key].count})
}
return result
}).catch(err => console.log(err))
},
...
}
```
Make the createFirstChart function asynchronous by changing :
```
createFirstChart() {

//with

async createFirstChart() {
```

then inside **createFirstChart** change the name of the chart to **Datapoints count per device**
```
title.text = "Datapoint Count per device";
```

change the data source by replacing

```
chart.data = [{...} , ...]

// with

chart.data = await this.getPieChartData()

```

and reduce the size of the legend by adding `pieSeries.labels.template.fontSize = 10` like so :

```
let pieSeries = chart.series.push(new am4charts.PieSeries());
pieSeries.dataFields.value = "count";
pieSeries.dataFields.category = "name";
pieSeries.slices.template.stroke = am4core.color("#fff");
pieSeries.slices.template.strokeWidth = 2;
pieSeries.slices.template.strokeOpacity = 1;
pieSeries.labels.template.fontSize = 10 // <-- add this line
```

Once done you should see your Chart now loading data from your Davra tenant.

### Column Chart

Now let's work on our second chart


add the **getColumnChartData** function inside the **methods** object this function will pull the list of the top five most used metrics.
```
methods:{
getColumnChartData() {
return this.axios.getAuth('api/v1/iotdata/metrics/counters').then(({data}) => {
let result = []
data.filter(metric => metric.name.indexOf('davra') == -1 ).forEach(metric => {
if(metric.count !== 0){
result.push({'name': metric.name, count: metric.count})
}
})
return result.sort(function(a,b){
return a.count < b.count
}).slice(0,5);
}).catch(err => console.log(err))
},
...
}
```
Make the createFirstChart function asynchronous by changing :
```
createSecondChart() {

//with

async createSecondChart() {
```

then inside **createSecondChart** change the name of the chart to **Top 5 used metrics**
```
title.text = "Top 5 used metrics";
```

change the data source by replacing

```
chart.data = [{...} , ...]

// with

chart.data = await this.getColumnChartData()
```
And Voila! your second graph is now configured.
Let's wrap up this app and edit our last chart: the line chart.

### Line Chart

We will use this chart to display data from the timeseries API


Now let's deploy our app!

## Deploy a Web application

In this tutorial, we will cover how to simply host a custom web application inside a microservice from the platform.

First, we will need to zip the folder containing your applications files ( index.html , index.js, etc...)

Once done open or create a new microservice.


Open the index.js inside the microservice editor and copy the content of the following [file](https://github.com/Davra/MicroServices-Samples/blob/master/sample-webserver/index.js)

```
"use strict";

/******************************************************************************
This is a simple express js microservice which serves out static content from
the public subfolder. All static content be they HTML files, images etc should
be placed in public or subfolders for the public dir
e.g. a common structure looks as follows:
public
|_ index.html
|_ css
|_style.css
|_ imgs
|_ logo.png
|_ js
|_ index.js
*/

const express = require('express');
const app = express();

app.use(express.static('public'));


const SERVER_PORT = 8080;
app.listen(SERVER_PORT, function () {
console.log('davra.com node microservice listening on port ' + SERVER_PORT + '!');
});
```

Edit app.use(express.static('public')); to whatever folder you want to serve your app from.

### Building the app for production

In your IDE open the `vue.config.js` file and edit the public path.
```
module.exports = {
transpileDependencies: [
'vuetify'
],
publicPath: /microservice/YOUR_MICROSERVICE_NAME, <--- change this
}
```

Terminate your webserver and run `npm run build` this should create a dist folder at the root of your project

Once done upload the zip file of your web app.

Open a terminal and run `unzip YOURFILE.zip`

Then do an `rm YOURFILE.zip ; git add . ; git commit -m "new version" ; git push ;`

Once the command is fully executed open the build page and press **deploy**


## Conclusion

It's a wrap! Well done you have now completed all the units of our training course, you can now explore deeper any of the topics covered in this course and start building your very own IoT application. For more information about the Davra platform go check out the [Developer Portal](https://www.developer.davra.com) You can find there a load of resources and tutorial. You can also directly book a demo with one of our team members [HERE](https://davra.com/demo/).