# Unit 5 : User, Roles & Permissions

In this unit, we will have an introduction to roles based access permissions and users.

AEP Features covered :
* User
* Roles
* Labels



## Users

The administration of users is central to the security model within Davra. An administrator may create/delete users but also may assign other users the capacity to create and delete users. Users may be assigned roles and through the roles, their permissions and visibility of devices, applications & data are managed. See the roles page for further details.

If the logged-in user has sufficient permissions, the "Users" menu item will be visible along with the main left menu under the Settings heading. Navigating to this page will list the users and the ability to assign them roles etc.


Before starting this unit let's look at the following definitions...

## Roles

Roles allow Davra to control access in two key ways:

what features are visible to a user and, if relevant, can create new instances within that feature
to finely control which users may view, edit or delete which resources within the platform
Central to this fine control facility is the concept of "Labels". A label has a key and value. A label may be applied to a resource and a role may use the label to define who can interact with those resources in what way. Labels can also be applied to users and the roles themselves for very fine-grained hierarchies.


## Permissions

If the logged-in user has sufficient permission, there is a menu item in the main left menu for "Roles". Navigating to this shows a listing of all the roles and one role selected in the list. For the selected role, the properties of this role are shown in tabs, "Features", "Resources" and "Users".

The "Features" tab shows a list of features for which users with this role may "Access" various menu items along with the main lefthand menu and for which features they may "Create" a new item. For example, if there is a tick beside "Access" for the "Users" feature, then the user with this role will see the "Users" page along with their left menu and will be able to administer existing users. If there is a tick beside the "Create" for "Users" feature, then the user with this role will be able to create new users. To change feature permission, click the tick to remove it or the dash to add it.

The "Resources" tab displays the list of "Access Control Statements" applicable for this role. Each statement added to this list alters the range of permissions for the role and any user assigned that role. Precise statements can be made to apply "view", "edit" or "delete" abilities for applications, devices, and data, etc. It is at this point that the scope of the statement may be applied to "Everything" or restricted to those items which have a particular "Label" applied.

Note: The Administrator and Operator roles which are initially installed are not editable. Attempts to alter the access controls for these two special roles will appear to work for a moment but will be reinstated as the original. It is advisable to create new roles for these matters.



## Defining our roles

Let's jump to the roles page under settings.

We can see there 2 default role already created :
* administrator
* operator

These two roles have a high level of permission and you may not want your user to have too much power as it requires a lot of responsibilities.

### Creation
From there let's create a new Role, we will call it **AppUser**. We want this role to give access to only our applications. However, we'll need our users to have visibility over twins, devices, and IoT data. To be able to look at our charts and tables.

Once created click on your new role. You should land on the feature section.

### Features Section

As mention above we want our users to only have access to applications so we will untick the **access** to **devices** and enable the **access** to **applications**.

once done let's switch to the Ressources tab

### Ressources Section

In the Ressources, Section let's add a new row to give visibility on the resource we need.

Select the following:

`AppUser can` **VIEW Devices, Applications, IoT Data, Digital Twins Type, Digital Twins** `with` **everything**

Click **ADD**


## Creating new Users

Now our roles are ready to be assigned to a new User.
Go now to the users' page under settings

### User creation

We will now create a new user, pick whatever name you want and provide a password with at least 1 uppercase letter, a number, and a special character.
In the role's select box picks our freshly created role, and click **CREATE**.

Now open a new browser and log in with your new user. You should only the apps page and be able to access the app we created in the previous unit.

## Ressource Labeling
To go deeper into the resources management for users you can now go play inside the roles Ressource Tab and restrict certain type of device or twin based on a specific label. You can try to create a role that can only see the devices created in unit 2 using a specific label.



## Conclusion

In the unit we covered the main feature of the roles and users. The platform allows more depth to it with the concept of Oauth client but we wont cover it in this training. If you want to know more about it check the following ressource https://help.davra.com/#/oauthclients or https://www.developer.davra.com/api/#oauth-clients