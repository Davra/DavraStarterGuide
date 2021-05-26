# Unit 1 : First Steps on the AEP
In this unit we will create a device, add few datapoints to it and visualise the data inside an application. 

AEP Features covered : 
* Devices
* Metrics
* IOT datapoints
* Applications
* Widgets
* Rules engine

## Requirements 
During this unit you will need: 
* admin access to your tenant
* node installed on your machine (in order to run scripts to generate resources for you)
* to use the [Developer Portal](https://www.developer.davra.com)

## 1.1 Create a device 

First thing you need to do is **login** to your tenant, then you will go the **Device Registration** page.

You will now create your first device by clicking on **Logical Device**  add a **name** : myFirstDevice and a unique **serialNumber**

Once finished you can click on **add** then **view device list** your newly created device should be now listed

Feel free to click on it and have a first look at the **device page** and its components


## 1.2 Add Data to the Device 
### The Metrics 
In this part we will need to add 2 resources : 
* metrics 
* iot datapoints

### The Metrics 

In order to create metrics, you will need to go to the **metrics page** available under the **settings menu on the left sidebar**

You will see there a list of precreated metrics. 

We will need to add the folowing metrics using the add button
| name | label | unit | 
| :--- | :---: | ---: | 
| voltage | Voltage | V |
| amperage | Amperage | A |
| frequency | Frequency | Hz |
| active.power | Active Power | W |
| reactive.power | Reactive Power | W |
| apparent.power | Apparent Power | W |

### The IOT datapoints 
We will use premade script to generate the datapoints. 
First we will have to edit the config.json file. 
```
{
    "tenantUrl": "demo.davra.com", // url of your tenant 
    "username": "admin", // your username 
    "password": "admin", // your password 
    "deviceUUID": "44b8a7c4-4bf0-4666-a4ac-7f655998d9a8" // uuid of the device you just created in step 1.1
}
```

then run `npm install` and `node 1.2-data.js`

Feel free to look at the outcome of this script which will be the payload that has been PUT to `/api/v1/iotdata`
We will go through this payload later in the course. 

We can now go back to our device page and verify that some datapoints have been pushed. 
Scroll down the device page till the metrics table. You can click on the rows and a quick visualization of the data you just pushed will pop up (please note this preview graph performs a consolidation, so not every raw datapoint will be shown)

## 1.3 Your first application

We have just created our device and added iot datapoints to it. We will now create an app to visualize the data. 

### App Creation
Let's start by going to the **applications list** page. Then click on the bottom green button to add a new app. Fill the **Application Name**  and **Custom Url** fields, then click **Create**. You should see your freshly created app and you can now start building it by clicking on the **pencil icon** when hovering the app title.  

### Adding widgets
We will now add our first widget. Click on the bottom right **+ button** and select **Simple Line Chart**. When the widget settings page is fully loaded, you will see a preview of the widgets you are about the configure on the left and some configuration input on the right

#### Line Charts

Let's configure our line chart. First, in the **Metrics Section** select one of the previously created metric - let's say **Active Power**

Leave the "group by" with default value 

in **Time buckets** section change **auto** to **seconds** and click **Apply Settings**

You should see the left preview getting updated with the new config.
You can change the name of your widget on the top or decide to hide it.

Once you are happy with the result press the **DONE Button**


#### Device Simulator
Let's not waste time and add straight away another widget. Click the add widget button and this time select a widget from another category. You can either use the search input on the top right or Select the Input Controls Category then find the widget called **Input Knob 1**

No config is required for this widget so you can directly click on the **DONE Button**

This widgets will be used to push dynamically data points to a device. 

#### Resizing Widgets
Let's now resize and move our widget on the page. You can drag your widgets by grabbing the top section of the widget. You can also resize them by grabbing the bottom right resize handle. 

### TimeSelectors  
Let's have a quick look at a really cool feature now !

Click on the top right time selector it should expand and you should be able to click on the last 60 minutes button. Once you've done that 
you should see the auto refresh checkbox enabled. Change 5 minutes to 5 seconds and close

Now let's have a look at our Input knob widget.

Select the device we have previously created, select the metric we are loading in the graph and then select send random datapoints every 5 seconds.

Once done, you should start to see data getting pushed and automatically updated inside your chart.


## 1.4 Your first Rule 

Let's leave the application page for few minutes. We will get back to it before the end of this Unit.

We are now going to create a rule to raise an event when a IOT datapoint reaches a certain threshold.

A rule is composed of two things: a trigger and actions 

#### The Trigger
The trigger notices when something has occurred and fire a set of actions

#### The Actions
The actions are executed after the trigger conditions get fulfilled. 

There is a variety of types of triggers and actions. 

### Rule creation
To create a rule, navigate to the rules menu option (if permittted and visible) in the main menu. Click on the **+ button** on bottom right, enter the details and click **create**. The rule will then appear in the listing of rules

Click on your freshly created rules to start setting up your trigger and actions

### Trigger creation
Once inside the rule page click on the add button inside the trigger section, select the first trigger type called **Threshold** 

Enter a name, leave the filter as default, and inside your condition select the **Active Power** metric, and set an amount of 70

your condition should say : `if Active Power greater than 70`

Click **Create** 

### Action creation
Click now on the add button inside the Actions section and select the first action type called **Incident Report** 

Set a **name** , a **message** and a Throttling of: `a maximum of 1 per 1 seconds`

Click **Create** 

### Test the rule 

we can now go back to our application and use the input widget to push **Active Power** greater than 70 to our device. You can to it just by clicking on the **knob** after selecting your **device** and **metric** 

Once done, look back at the rules page and you should see some logs on the left section showing that the rule got triggered. You should also try to go back on the device page, the incident report should be listed there. 

## 1.5 Event visualisation 

We will try now to display the incident report generated by our rule directly inside our application. To do so we will add a new widget named **Table of Events** inside the **Tables** category. 

No need to change any of the default settings for this widget we'll go with the default config. 

Once added to your app, we will now set our **timeselector** to auto **refresh every 5 seconds** like earlier and use our datapoint simulator to push **Active Power** datapoints greater than 70. 

We should see the event tables getting update few seconds after the datapoint get pushed. 

## Conclusion
Congrats ! You have completed your indroduction to the Davra AEP. You just had the first flavor of capabilities the platform enables. Let's jump to the next Unit to discover more ! 
