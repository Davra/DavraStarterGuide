# Unit 7 : Advanced concepts

In this unit, we will talk about advanced concept, custom web applications, timeseries queries, and few rest API the platform offers.

AEP Features covered :
* Microservices
* Timeseries queries
* APIs

## Our first web app 

To simplify our task we will download a sample app available on GitHub. Download the following repo [github](https://github.com/Davra/MicroServices-Samples) copy the file the vue-sample-app
to a new folder and open it with your IDE. This is a VueJs app a great framework to work with really easy to pick up and get stuff done.

Let's look at the following steps to see what's inside this app.

### Project setup
```
npm install
```

### Add environment variables setup

create an `.env` file with the following : 
```
VUE_APP_USERNAME - Your username to access your davra tenant
VUE_APP_PASSWORD - Your password to access your davra tenant
VUE_APP_TENANT_URL - Your tenant name 
```

### Compiles and hot-reloads for development
```
npm run serve
```


This should open a webserver on your http://localhost:8080

now open `src/plugins/vuetify.js` 

you see there few color settings you can change for your app, feel free to play with this variable to try different colors. 

Let's have a look now at the Sidebar component `src/components/Sidebar.vue` you can see here a list of links, you can change here the name of you links. Don't change the path of the links as it is directly link to a route inside our vue-router.

## Building a custom graph 

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

Once done you should see you graph now loading data from your Davra tenant. 