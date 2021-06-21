# Unit 3 : Digital Twins

In this unit, we will focus on the Digital Twin, an essential feature in the architecture of your IoT application.

AEP Features covered :
* Digital Twins
* Digital Twins Types
* Labels
* IOT datapoints
* Custom Widgets

## 3.1 The Twin Type

A Digital Twin Type is a template for what Digital Twins are made from. For example, a Digital Twin for The Empire State Building is a twin of the type "Twin Type Building".

For this unit, we are going to create a new twin type named **Building**

To do so let's go to the **Digital Twin Types** page inside the Settings sub nav

Once on the Digital Twin Types page click `ADD +` and create a new twin type named **Building**, no need to specify any labels or custom attributes for now.


## 3.2 The Digital Twin

A Digital Twin is used to the representation of a physical thing or a concept rather than a device or a sensor. It is really useful when we need to elevate data from a group of devices or sensors and group them into a thing.

For example, a room has 2 sensors, one reports temperature the other reports luminosity. If these sensors are linked to a Room digital twins we will be able to retrieve all the data from this sensor using only the Room twins.

### Creation
Now that our twin type is ready we can create a new twin. Go to the digital twins' page and click `ADD +`

Create a new twin called **Empire State** and select the Digital Twin type **Building**

### Bind devices to a twin

To link a device to a digital Twin we will just need to add a label to a device.

We will now create 2 new devices called **Thermometer** and **HumiditySensor**. Once created we will add a new label to each device as we learned in unit-2.

When adding a new label to the devices you should see a new Label key available called `Building` select it and then pick the value `Empire State` press `SAVE` and that's it your devices are now linked to your digital Twin.


## 3.3 Twin data

When a device linked to a twin receives data the data will be tagged with the twin UUID alongside other labels and device UUID.

### Add new data
We will now use our application to push data against these 2 new devices. Let's first create 2 new metrics like in Unit-1 :

| name | label | unit |
| :--- | :---: | ---: |
| temperature | Temperature | C |
| humidity | Humidity | % |


Once this in done go to your app in edit mode and add a new page called **Building** you can to it using the input on the left side of the page

we will now add two **Input Knob 1** widgets as we did in unit-1
they will be used to push data to the `thermometer` and `humiditySensor` devices.

Set both widgets to push data `temperature` data to the thermometer device and `humidity` to the HumiditySensor let it run for few minutes.

### Add new charts

we will now add a `Multi line Graph` to try to visualize the data and understand what's happening behind the scene.

In order to do so add a new widget. Choose a `Multi line Graph`

Inside the widget Settings select, inside the metrics section, the metric `Humidity` and set the `Group by` to `Device` then add another metric by clicking the `+` button and select the metric `Temperature` and set the `Group by` to `Device` as well.
Feel free to specify a name for this widget.
Once finished press the `APPLY SETTINGS` button and click the `DONE` button.

Back to your application page, you should see the graph rendering datapoints. You can see in the legend that the data is coming from our two devices :
* Humidity-HumiditySensor
* Temperature-Thermometer

We will now create the exact same `Multi line Graph` but this time instead of using a `Group by` : `Device` we will use `Group by` to `Building`

We should see the same data displayed but this time the legend will be changed. We should see the UUID (UUID of the Empire State twin) :
* Humidity-2763917c-6685-45a6-bf41-5d64fb4ebd06
* Temperature-2763917c-6685-45a6-bf41-5d64fb4ebd06

The Twin UUID aren't great to look at, we will have to customize this widget to display the twin name instead of UUID.

## 3.4 Custom Widget

Instead of creating a custom widget from scratch, we are going to clone an existing one and modify few files.

A custom widget is made of few files:
* index.html - File loaded when the widget is rendered.
* index.js (optional) - Custom js to pimp your widget
* index.css (optional) - Custom CSS to pimp your widget
* settings.html (optional) - File loaded inside the config page of the widget
* settings.js (optional) - Custom CSS to pimp your settings page
* settings.css (optional) - Custom CSS to pimp your settings page

### Cloning a widget

Let's leave our app to create our new widget in the platform click on the menu item named **Charts and Graphs** in the Component Toolkit section of the sidebar.

Then click on the clone button. You should land on our widget editor IDE. Here we will edit 2 files.

### Editing a widget
First we will edit the index.html
Replace the line 20 :

` <script src="/ui/assets/templates/amcharts-connecthing-widgets.js"></script> `

with

`<script src="index.js"></script> `

then

`cmd + s ` or `ctrl + s` to save your file.

This would allow us to customize the javascript code that is rendering our chart.

Then select `index.js` in the top-left dropdown and copy the content of this [index.js](https://github.com/Davra/DavraStarterGuide/blob/main/Unit-3/index.js) file from the Unit-3 repository. Save your changes.

You can now test your changes by setting your chart setting to use the `temperature` metric and group it by `building` click apply settings and the widget preview should display the legend with the name of the building

### Publishing a widget

Once you're happy with the result click publish, rename it `custom multi line graph` and click publish again.


### Using your custom widget

Go back to your app in edit mode, select the building page and add a new widget, search for `custom multi line graph` inside the custom category and add it to your app.

Inside the widget Settings select, inside the metrics section, the metric `Humidity` and set the `Group by` to `Building` then add another metric by clicking the `+` button and select the metric `Temperature` and set the `Group by` to `Building` as well.
Feel free to specify a name for this widget.
Once finished press the `APPLY SETTINGS` button and click the `DONE` button.

You should now see a new graph with the legend showing the twin name instead of the twin UUID.

You can delete the previously added chart and replace it with the new one.

## Conclusion

So in this unit, we covered the basics of twins and twin types and went deeper into the widget configuration and customization. In the next Unit, we will discover the device agent, a really useful tool to get and push data from your remote devices.
