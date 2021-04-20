# Unit 2 : Custom Microservices

In this unit we will create or first custom microservice. Custom micorservice are probably one of the most powerfull feature of the platform and can be used for many purpose like : integration to third-tier services, rules engine custom action, data aggregation or even custom Single Page Application.  

AEP Features covered : 
* Microservices
* Labels
* IOT datapoints
* API

## 2.1 Our First Microservice 

The first microservice we are going to create will be generating data for us each minutes. It will be hosted and running on the AEP. 

### Creation

To create a microservice click on the **Services** menu item on the left sidebar. Then click on the **+ button** at the bottom righ of the page

Name you microservice **data-generator** and click **Create** we will create a NodeJS microservice we will have to edit in order to get it to do what we want.

### The IDE 

Once you microservice create click on the **Lauch IDE** button

This will open our **workspace**, a place we will be able to build and test our microservice. Building a workspace can take few seconds especially if it's the first time. 

Once fully loaded you should see the IDE where we will be able to edit files

We will not cover all the options and features of the microservice IDE in this section but we will visist it back later in the training.


## 2.2 Quick look at the code

### index.js 

Let's start opening the index.js file inside our microservice IDE. You can see there sample codes. We wont use this code for today's session. 

Replace the content of the index.js file with the content of the `Unit-2/index.js` file. Once done do a **CTRL+S** or **CMD+S** to save your changes.

### devices.json

Create a new file by **right clicking** on the **data-generator** folder then click **new file** and name it **devices.json** copy the content of the `Unit-2/devices.json` inside it.

This will be the list of devices UUIDs we will have to set in order to generate datapoints for them.

On another tab create 3 logical devices with diferent names like we did in the Unit 1.
For example : Device2-1,Device2-2,Device2-3

Copy these devices uuids inside the `devices.json` file. Don't forget to put the UUIDs between quotes `""` and seperate them with a coma `,`.

### terminal 

You may have noticed that some external library are used inside the `index.js` file. We will need to install them using `npm install`. 

In order to do this we will have to open a terminal. You can do it by clicking on the `>_` icon on the left sidebar.

Once the terminal fully loaded let's start by typing `ls` and press enter.
As you can see your files are visible there. You can proceed linux command in this terminal to help you to edit your files. Or run your microservice in dev mode.

Ok let's install our dependencies. 

run the following commands:
`npm install ; npm install -s request ; npm install -s request-promise;`

then run our microservice in dev mode 

`node index.js`

if not error are showing we should be good to go ! 

## 2.3 Deployment of the microservice 

End the node process by doing a CTRL+C. We will now commit our changes and deploy our microservice. The AEP Microservices has git build in and the microservice is pulling the code of its master branch when they deploy themselves.

To commit and push our recent changes lets type the following in the terminal: 

`git add . ; git commit -m "Changes for Unit 2 deployement" ; git push`

Once done click on the last icon on the right of the sidebar (the one with 3 cubes). This will open the build page. The build page shows all the builds previously created for a microservice.

Just click the **BUILD** button to build and deploy our microservice. 

When fully deployed you build will be visible on the builds page with a color indicating the sucess or the failure of the deployement. You can click on it to see the details of the build output logs

We can now leave the idea and go back to the microservice page and see that our microservice is now live and deployed.




## 2.4 What's a label ? 

In the Davra AEP ecosystem a **label** is key:value attribute that can be attached to many ressources like a device, a twin, a role, an application and more ...

**Labels** are really usefull to create relationship between entities (especially twins but this topic is for Unit-3). 

To give us an idea on how labels works will add few of them to the devices we have created in step 2.1 

In the device page find the **Labels** component. Then click on the pencil icon to add new labels. Click **Add a Label**, in the key section select **Add new**, name it `unit` and set a value of 2 press save. Do the same for the other devices created in unit 2. And set a label of unit:1 to the device we created in our unit 1. 

Once all your devices labeled let's go to the application we build in Unit-1 


## 2.5 Labels application 

When a datapoint is pushed to a devices the datapoint gets taged with all the labels of that device. This will be really useful to filter data inside our charts and tables.

### New filter 




## Conclusion


