# Unit 4 : Sending data through a Device Agent

In this unit we will:
* install the device Agent (python)
* install a sample Custom Application
* install Node-RED
* deploy a sample Node-RED flow that simulates a sensor
* send sensor data to Davra AEP through the Custom Application 

AEP Features covered : 
* Device Agent
* Custom Application
* IOT datapoints


## 4.1 Device Agent installation 

We will use a RaspberryPi with a fresh installation of Raspbian OS. 

### Agent download
Access the RaspberryPi as user _pi_, then type the following commands at the prompt:

```
curl -LO downloads.davra.com/agents/device-agent-python2/master/davra-agent.tar.gz 
tar -xvf davra-agent.tar.gz
```

### Device creation on AEP
Access AEP, create a new logical device, add a new API Token (copy and store it for future use as it will not be accessible any more).

### Agent installation
Go back to RaspberryPi prompt and type the following command:

```
sudo bash davra-agent/install.sh
```

This script downloads and installs needed packages then asks for some information:
* server location: _https://ags.davra.com_
* API Token: _put here the API Token you just created above_


## 4.2 Node-RED installation 

We will install Node-RED on the RaspberryPi by following the official procedure at https://nodered.org/docs/getting-started/raspberrypi. 

### Node-RED download and installation
Access the RaspberryPi as user _pi_, then type the following command at the prompt:

```
bash <(curl -sL https://raw.githubusercontent.com/node-red/linux-installers/master/deb/update-nodejs-and-nodered)
```

This script will:

* install the current Node.js LTS release
* install the latest version of Node-RED
* ask confirmation to install a collection of useful Pi-specific nodes
* setup Node-RED to run as a service

### Autostart Node-RED at boot time
Type the following commands at the prompt:

```
sudo systemctl enable nodered.service
sudo systemctl start nodered.service
```


## 4.3 Custom Application installation 

We will use a Device Automation on the DAVRA AEP portal to install on the RaspberryPi a Custom Application whose role is to forward data from Node-RED to AEP through the Device Agent.
As Custom Application we will use an official example (_https://github.com/Davra/device-app-sample-python2_) modified to implement the following features:

* listen to local MQTT broker for any incoming message
* filter all messages containing metric values
* send all metric values to the Agent for further propagation to AEP


## 4.4 Node-RED sample sensor flow deployment 

We will build and deploy a sample flow on Node Red that will:

* generate one or more metrics 
* send them to the Custom Application via the local MQTT broker
* to be then forwarded through the Device Agent
* finally reaching the DAVRA AEP APIs

Then we will look for metric values on the AEP graphical interface.

