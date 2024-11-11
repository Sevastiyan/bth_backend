# Setting up new data mechanisms:

## Create a new Table

To create a new table please follow these steps and you will be good to go 🚀

Create a new `ExampleTable.ts` file in `src/module/dataBase/`

The information inside must be created using the following template:
```typescript
import * as AwsCrudFunctions from './AwsCrudFunctions'; // Imports the AWS Controls
import { StatisticsTable } from './StatisticsTable'; // currently StatisticsTable is a custom table

const tableName = 'ExampleTable';

const mainIndex = {
    pKey: 'id', // any id that makes sense
    sKey: 'created', // Date created
};

const defineDataParam: AwsCrudFunctions.DefineDataParam = {
    typeDefinition,
};

function typeDefinition() {
    return {
        id: {
            type: 'string',
            required: true,
            ExcludeUpdate: true,
        },
        created: {
            type: 'dateTime',
        },
        // Add other parameters that will be stored here
    }
}

export const ExampleTable: StatisticsTable = new StatisticsTable(tableName, mainIndex, defineDataParam);
```
The new table is created.

The main functionality for handling the AWS actions is done in the AWS controllers within the dataBase folder. If you want to figure out how it works, you can read the code there to see how the data is saved and updated.

After this we have to set up the new table in the `/dataBase/index.ts` file that will control the exports in other applications and `/data/index.ts` that controls the api calls within the server.

---

## Create api routes

If for some reason, you want to expose the functionality of a server function to a user (eg. Get some statistics) you have to expose a REST API call in the `/routes/` folder.

Things to consider when exposing public API:
- Is the API call a function to perform an action?
    - Retreive data
    - Analyse data
    - Perform actions on the data
- Does the API expose any personal data?
    - Is the data for the current user, or anyone else?
- [ Add More? ]

First we need to make sure that the Database has what we need to fetch the data. If thats the case a simple request can suit our needs.

To do this we first look at the `/routes/` folder and determine the correct place for the request. If none of the following `.ts` files is a good match, we can create our own. For the `example` data we can create a new `example.ts` file that can handle all of the requests for this data.

```typescript
import * as express from 'express';

/**
*  @swagger
*  tags:
*    name: Example
*    description: API to manage Example
*/
const router = express.Router();

// Set up the request here

export default router;

```
Express needs to be added and the Router defined to controll the routes.

If the route is defined in a new file, we have to include the exported router in `~/app.ts`.
```typescript
import example from '/routes/example.ts'
//...
app.use('/example', example);
//...
export default app;
```

Now we can write the request method:

```typescript
router.get('/query', (req, res) => {
    const authId = res.locals.user
    const d_id = res.locals.device
    checkDevice({ authUId: authId, reqId: d_id })
        .then((res) => {
            return // some query action
        })
        .then((data) => {
            return res.status(200).json(data);
        })
        .catch((e) => {
            console.log('/sleepInfo/query error: ', e)
            return res.status(404).json(e)
        })
});
```
The query will be first evaluated using the built `checkDevice()` if the request was made to request device data. This is in order to check if the device is connected to the user and will be rejected if it is not. Other checks can be `checkUser()` for users, or `checkFromServer()` if the request is made from another Lambda in the server. This in particular is made to compare the token received from the lambda to authenticate the operation.

When the check is confirmed then the actual operation can happen.

The operation can be built in the `/apis/`, or if more complex operations are needed, in a separate logic.

After the operation is complete the data is returned to the user.

After exposing the endpoint of the API, we can access it using the Phone app (given that the functionality is set up there), Postman (***TODO: Write a Postman guide***), or Swagger.

In the case of Swagger we can write the methods that are going to be visible in there, such as this:
```typescript
/**
*  @swagger
*  paths:
*   /sensor/query:
*     get:
*       summary: Some information for the API call
*       tags: [Example]
*       parameters:
*         - in: query
*           name: d_id
*           schema:
*             type: string
*       responses:
*         "200":
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/ApiSuccess'
*         "404":
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/ApiFail'
*/
```
This will show up as a new API in the swagger API documentation as an executable field.

---

## Server Deployment

To deploy the server we must first understand how the deployment is separated. The server can run in two instances `-prod` and `-dev` corresponding to production and development respectively. Both are working separately from one another, where devices who have been instated using the `dev` version of the app are tagged with the `dev` parameter in the `UserDeviceTable`. The same for `prod`.

This separation allows the development server to act as an experimental server which doesnt interfere with the operations of the production server.

**Both instances operate on the same database.**

The commands for deployment work as follows:
1. Navigate to the folder of the server using any CLI which has npm, serverless installed in the environment
2. Run the following commands:

DEV:

    backend-main\mellowing-node-api-server-main> npm run deploy:dev

PROD:

    backend-main\mellowing-node-api-server-main> npm run deploy:prod

These commands are instantiated in `package.json`

# Features How tos:

**[ Work in progress ]**

# Server deployment:

The current setup is created to be able to deploy the server on different regions on AWS.

To deploy the server to the Canadian Region of AWS use the following command:

```
npm run deploy:canada
```
This will deploy the server to the Canada Central region on the local configuration.

***Please Note*** If a server is to be deployed on a configuration there are a couple of things that need to exist prior to deployment, **OR** at least after deployment, to ensure that the server works properly.

*Please look at the Wiki under AWS Configurations and make sure that all of the setup is correct.


# Groups:

