# Unit 5 : User, Roles & Permissions

In this unit we will 

AEP Features covered : 
* User
* Roles
* Labels



## Users

The administration of users is central to the security model within Davra. An administrator may create/delete users but also may assign other users the capacity to create and delete users. Users may be assigned roles and through the roles, their permissions and visibility of devices, applications & data is managed. See the roles page for further details.

If the logged-in user has sufficient permissions, the "Users" menu item will be visible along the main left menu under the Settings heading. Navigating to this page will list the users and the ability to assign them roles etc.


## Roles 

Roles allow Davra to control access in two key ways:

what features are visible to a user and, if relevant, can create new instances within that feature
to finely control which users may view, edit or delete which resources within the platform
Central to this fine control facility is the concept of "Labels". A label has a key and value. A label may be applied to a resource and a role may use the label to define who can interact with those resources in what way. Labels can also be applied to users and the roles themselves for very fine-grained hierarchies.


## Permissions

If the logged-in user has sufficient permission, there is a menu item in the main left menu for "Roles". Navigating to this shows a listing of all the roles and one role selected in the list. For the selected role, the properties of this role are shown in tabs, "Features", "Resources" and "Users".

The "Features" tab shows a list of features for which users with this role may "Access" various menu items along the main lefthand menu and for which features they may "Create" a new item. For example, if there is a tick beside "Access" for the "Users" feature, then the user with this role will see the "Users" page along their left menu and will be able to administer existing users. If there is a tick beside "Create" for "Users" feature, then the user with this role will be able to create new users. To change a feature permission, click the tick to remove it or the dash to add it.

The "Resources" tab displays the list of "Access Control Statements" applicable for this role. Each statement added to this list alters the range of permissions for the role and any user assigned that role. Precise statements can be made to apply "view", "edit" or "delete" abilities for applications, devices and data etc. It is at this point that the scope of the statement may be applied to "Everything" or restricted to those items which have a particular "Label" applied.

Note: The Administrator and Operator roles which are initially installed are not editable. Attempts to alter the access controls for these two special roles will appear to work for a moment but will be reinstated as original. It is advisable to create new roles for these matters.

