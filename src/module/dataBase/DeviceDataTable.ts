import * as AwsCrudFunctions from './AwsCrudFunctions'
const tableName = 'DeviceTable'

const mainIndex: AwsCrudFunctions.IndexData = {
    pKey: 'id',
}

const defineDataParam: AwsCrudFunctions.DefineDataParam = {
    typeDefinition,
}

/**
 *  @swagger
 *  components:
 *   schemas:
 *     Device:
 *       type: object
 *       required:
 *         - id
 *         - mac
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         mac:
 *           type: string
 *         fv:
 *           type: integer
 *         rev:
 *           type: integer
 *         isTested:
 *           type: boolean
 *         isLedOn:
 *           type: boolean
 *         wifiStrength:
 *           type: number
 *         version:
 *           type: string
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
        mac: {
            type: 'string',
        },
        fv: {
            type: 'number',
        },
        rev: {
            type: 'number',
        },
        version: {
            type: 'string',
        },
        updated: {
            type: 'dateTime',
        },
        created: {
            type: 'dateTime',
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

export function readData(pValue: string, atts?: string[]) {
    return AwsCrudFunctions.readData({
        TableName: tableName,
        indexData: mainIndex,
        pValue,
        defineDataParam,
        atts,
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

export function scanDataAll() {
    return AwsCrudFunctions.scanData({
        TableName: tableName,
    })
}
