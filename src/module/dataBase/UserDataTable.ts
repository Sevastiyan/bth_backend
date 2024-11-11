import * as AwsCrudFunctions from './AwsCrudFunctions'

const tableName = 'UserTable'

const mainIndex = {
    pKey: 'id',
}

const defineDataParam: AwsCrudFunctions.DefineDataParam = {
    typeDefinition,
}

/**
 *  @swagger
 *  components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         familyName:
 *           type: string
 *         email:
 *           type: string
 *         age:
 *           type: integer
 *         height:
 *           type: integer
 *         weight:
 *           type: integer
 *         gender:
 *           type: string
 *         isAdmin:
 *           type: boolean
 *         updated:
 *           type: string
 *         created:
 *           type: string
 */

function typeDefinition() {
    return {
        id: {
            type: 'string',
            required: true,
            ExcludeUpdate: true,
        },
        name: {
            type: 'string',
        },
        familyName: {
            type: 'string',
        },
        email: {
            type: 'string',
        },
        age: {
            type: 'number',
        },
        // height: {
        //     type: 'number',
        // },
        // weight: {
        //     type: 'number',
        // },
        gender: {
            type: 'string',
        },
        offset: {
            type: 'number',
        },
        osVersion: {
            type: 'string',
        },
        isAdmin: {
            type: 'boolean',
        },
        updated: {
            type: 'dateTime',
        },
        created: {
            type: 'dateTime',
        },
        favoriteStores: {
            type: 'array',
            store_id: {
                type: 'string',
            },
        },
    }
}

export function createData(item: any) {
    return AwsCrudFunctions.createData({
        TableName: tableName,
        Item: item,
        defineDataParam,
    })
}

export function readData(pValue?: string, atts?: string[]) {
    return AwsCrudFunctions.readData({
        TableName: tableName,
        indexData: mainIndex,
        pValue,
        defineDataParam,
        atts,
    })
}

export function scanDataAll() {
    return AwsCrudFunctions.scanData({
        TableName: tableName,
    })
}

export function updateData(pValue: string, item: any) {
    return AwsCrudFunctions.updateData({
        TableName: tableName,
        indexData: mainIndex,
        defineDataParam,
        pValue,
        Item: item,
    })
}

export function deleteData(pValue: string) {
    return AwsCrudFunctions.deleteData({
        TableName: tableName,
        indexData: mainIndex,
        pValue,
    })
}
