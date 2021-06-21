# Unit 6: Geofences & Rules

In this unit, we will have deeper look into the rules engines and geofences

AEP Features covered :
* User
* Roles
* Labels


## Geofence

This feature of the Davra Platform allows for the creation of Geofences which can be used to trigger events upon an IoT device entering or leaving. Users can create multiple 'zones' within a single Geofence, or have a single zone.

To create a geofence let's go to the Integrations page under settings and click on the ESRI geofences tile.

Click `NEW+` and let's name our geofence **Paris** and click `next`. Then when the map is fully displayed zoom on France click on the circle on the left side and create a circle around Paris. When you're happy with it click `SUBMIT`

Your freshly created geofence should now be visible in the data table.

## Rules
The rules engine provides a facility to continually monitor the device data and act upon it in an automated fashion. Rules can be set up which are comprised of a trigger (which notices when something has occurred) and a set of actions (which should be enacted when the rule fires). There is a variety of types of triggers and actions. Actions can be limited (throttled) so they do not enact too many times. A rule may be "active" or not to determine whether it should continually monitor the data and run actions or not.

Let's create a new Rules called **Welcome to Paris **

## Trigger Types

Here are the different trigger type available :

**Threshold**
* Monitor a metric upon every new data point arriving at the server to confirm whether it exceeds a threshold limit. For example, check if the temperature is greater than 90 degrees. Note, the comparison is not necessarily "greater than", the user may opt to check if a value is "equal to" or "less than" also. Of particular note is the ability to check if a value for an incoming metric "changes" compared to its previous value. Thus one could watch for a toggling of a value and proceed to actions accordingly.

**Trigger type: Threshold with window**
* Monitor a metric upon every new data point arriving at the server to confirm whether it exceeds a threshold limit and comprehend the concept that the incoming values for this metric must satisfy the condition for a sustained period (time window) as described in the trigger (for Number seconds). For example, check if the temperature is greater than 90 degrees for 30 seconds. Note, the comparison is not necessarily "greater than", the user may opt to check if a value is "equal to" or "less than" also.

**Trigger type: Threshold for Moving Average**
* Monitor a metric upon every new data point arriving at the server and evaluate the average metric value across the last defined period then evaluate if that is greater-than/less-than/equal-to the defined threshold limit. Note, the comparison may also evaluate whether it is within or outside a range rather than a simple threshold

**Trigger type: Delta Threshold with window**
* Monitor a metric upon every new data point arriving at the server to confirm whether it changes by a threshold limit within a specified time window. For example, check if the temperature increases by more than 50 degrees within 30 seconds. Note, the comparison is not necessarily "increases by", the user may opt to check if a value "decreases by" also

**Trigger type: Simple Event**
* Monitor incoming data to the server to notice if an event arrives which has a specific name. The API at /api/v1/iotdata can receive both metrics (datum) and events. Events have a property "name" and if the name matches that identified in the trigger then the trigger is fired and the rule is enacted.

**Trigger type: Event with a value**
* Monitor incoming data to the server to notice if an event arrives which has a specific name and within that event if a parameter of the value matches. The API at /api/v1/iotdata can receive both metrics (datum) and events. Events have a property "name" and if the name matches that identified in the trigger then the rest of the event data is evaluated. Within the "value" parameter of an event data, an attribute may be present with a "key: value" structure. For example, an event might have the name "High-Temperature-Observed" and within the data packet sent to /api/v1/iotdata, the associated value may have a key:value of "observedTemperature: 120". If the trigger is set to watch the event name "High-Temperature-Observed", the item inside the event value of "observedTemperature" and the amount set to 100 then the trigger would fire.

**Trigger Type: Schedule**
* This can be used to trigger an action to occur on a Schedule. There are two modes available, the Basic mode allows you to define your schedule using the user interface, and advanced mode allows you to define a cron string on which the schedule will run. If you are unfamiliar with cron, use the basic mode to define your schedule. Please note that the schedule will run based on the timezone of your browser.

**Trigger Type: Monitor availability**
* Monitor if the time since any device was "last seen" exceeds a configured number of seconds.

**Trigger Type: Geofence**
* Monitor incoming data and trigger based on location, specifically it listens to the latitude and longitude received in an /iotdata API request. This requires a predefined Geofence to be set up, see geofences for details on setting this up. The user can select whether they wish to trigger if the datum is inside or outside the chosen Geofence.


Add a geofence Trigger to our "Welcome to Paris" Rule. Name it **Inside Paris**.

Filter: for each device in all data for all devices.

Condition: if inside Paris


## Actions Types

**Action Type: Incident report**
* Create a Davra Incident event which can be seen in the incident reports. Select one of the 3 severity levels for an incident report. Note the last line which allows the user to set a throttling limit on how many times this action should fire in any time window.

**Action Type: Stateful Incident**
* Generate a Digital Twin of type "stateful_incident". This can be used to track the incident through the resolution process. For example, comments in the customAttributes or files may be added and labels adjusted. The Digital Twin will have the label "status": "open" and the label "created-by": "rules-engine". Throttling is also enabled for this type of action.

**Action Type: Email**
* Send an email from the email account shown in the "From" dropdown. The account details for this account are set in the administration section. The destination email addresses may be separated by semi-colons (;) if more than one address is required. Note the last line which allows the user to set a throttling limit on how many times this action should fire in any time window. The body of the email is an HTML document although if the user wishes, plain text may be used instead.

**Action Type: HTTP Push**
* Make an API call to another system. The type of call made may be "GET", "PUT" or "POST". If "GET" is chosen then no message will be sent, but if "PUT" or "POST" is chosen then the message may be configured. The URL destination may be absolute (include the "http://server") or relative, thus the call may be to a different server outside Davra or internally to a microservice that listens to that URL. Throttling is also enabled for this type of action.

**Action Type: Device Action**
* Instruct a device to perform an action. User may choose the device as the one which triggered the rule initially or specify a particular device from the device dropdown. The dropdown of actions to perform is a full list of all actions known to ensure the action desired is actually one which the device can enact otherwise the instruction will be ignored by the device. Throttling is also enabled for this type of action.

**Action Type: Webex Teams Action**
* Create a space and invite a team in Webex Teams when an event is triggered. For more information on how to set up a Bot on the Davra platform please see http://help.davra.com/#/admin-webex. Throttling is also enabled for this type of action.

**Action Type: InformaCast Singlewire SMS Action**
* Select Singlewire users, and message content to be sent when an event is triggered. For more information on how to import Singlewire users on the Davra platform please see http://help.davra.com/#/integration-singlewiresms. Throttling is also enabled for this type of action


We will create here 2 actions:

First, we will add an incident report action. Which will be an info report with a welcome message.

Then we will add an HTTP Push action. Name it **External webhook**. Change get to POST and go to
https://webhook.site/ . Webhook.site will provide an endpoint you can send requests to and visualize them, a really useful tool to see what's the rule engine is sending you.
Copy `Your unique URL` and paste it inside your action form.
Set a throttling of 1 per 1 second and click **Create**


## GPS event
In order to fire our rule, we will need to trigger our geofence with a GPS event.

There are a few different ways to generate an IoT GPS event into the platform. The first one is by pushing an IoT datapoint or IoT event with a valid latitude and longitude. When the platform process the datapoint it will look if these two long/lat attributes exist and if yes will update the device location and generate the GPS-event.

The second one is to directly add a GPS0-event to the device.

An easy way to create a gps-event is to use the map inside the device page. Go to the device page of one of your existing devices. You should see on the right side a `Device location` block. On the map zoom to Paris and click in the middle of the city. A popup should ask you if you want to move the device to the selected locations. Click **Move**.

That's it your rule has been fired. You can now check your rule page and then go to webhook.site to see the details of the payload received. This payload is really useful for more complex integration.


### Visualization

We will now clone and customize an existing widget in order to visualize the path our device has been doing. To do so go to the **advanced Components** page in the Component toolkit section. Find the widget called **ESRI Map for single device** and clone it. Then in change the content of the index.js file with the one from the [index.js](https://github.com/Davra/DavraStarterGuide/blob/main/Unit-6/index.js) file in the unit-6 directory. Save your changes and publish your new widget.

Go now to your app, add a new page and add your freshly created widget. Resize it widely and select a device inside the device filter. Click now on the map to move your device and see its journey.


## Conclusion

You know have a deeper understanding of the rules engine and the Geofence, but there is more for people willing to build really bespoke use cases. To learn more check the following resources :
* https://help.davra.com/#/rules-engine
* https://help.davra.com/#/admin-geofences