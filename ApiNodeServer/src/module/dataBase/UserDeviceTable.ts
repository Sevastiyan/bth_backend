import { getEnvironmentStage } from '../../environment'
import * as AwsCrudFunctions from './AwsCrudFunctions'

const tableName = 'UserDeviceTable'

const mainIndex = {
    pKey: 'u_id',
    sKey: 'd_id',
}

const dIdIndex = {
    name: 'd_id-u_id-index',
    pKey: 'd_id',
    sKey: 'u_id',
}

const defineDataParam: AwsCrudFunctions.DefineDataParam = {
    typeDefinition,
}

/**
 *  @swagger
 *  components:
 *   schemas:
 *     Member:
 *       type: object
 *       required:
 *         - u_id
 *         - d_id
 *         - perm
 *       properties:
 *         u_id:
 *           type: string
 *         d_id:
 *           type: string
 *         perm:
 *           type: number
 *         stage:
 *           type: string
 *         updated:
 *           type: string
 *         created:
 *           type: string
 */

function typeDefinition() {
    return {
        u_id: {
            type: 'string',
            required: true,
            ExcludeUpdate: true,
        },
        d_id: {
            type: 'string',
            required: true,
            ExcludeUpdate: true,
        },
        perm: {
            type: 'number',
            required: true,
        },
        updated: {
            type: 'dateTime',
        },
        stage: {
            type: 'string',
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

export function readData(pValue?: string, sValue?: string, atts?: string[]) {
    return AwsCrudFunctions.readData({
        TableName: tableName,
        indexData: mainIndex,
        pValue,
        sValue,
        defineDataParam,
        atts,
    })
}

export function updateData(pValue: string, sValue: string, item: any) {
    return AwsCrudFunctions.updateData({
        TableName: tableName,
        indexData: mainIndex,
        defineDataParam,
        pValue,
        sValue,
        Item: item,
    })
}

export function deleteData(pValue: string, sValue: string) {
    return AwsCrudFunctions.deleteData({
        TableName: tableName,
        indexData: mainIndex,
        pValue,
        sValue,
    })
}

export function queryByIdAll(pValue: string, atts?: string[]) {
    return AwsCrudFunctions.queryData({
        TableName: tableName,
        indexData: mainIndex,
        defineDataParam,
        pValue,
        atts,
        all: true,
        filterKey: 'stage',
        filterValue: getEnvironmentStage(),
    })
}

export function queryByDIdAll(pValue: string, atts?: string[]) {
    return AwsCrudFunctions.queryData({
        TableName: tableName,
        indexData: dIdIndex,
        defineDataParam,
        pValue,
        atts,
        all: true,
        filterKey: 'stage',
        filterValue: getEnvironmentStage(),
    })
}

export function scanDataAll() {
    return AwsCrudFunctions.scanData({
        TableName: tableName,
        filterKey: 'stage',
        filterValue: getEnvironmentStage(),
    })
}
