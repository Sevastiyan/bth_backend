import * as AwsCrudFunctions from './AwsCrudFunctions'
const tableName = 'DeviceCertInfoTable'

const mainIndex: AwsCrudFunctions.IndexData = {
    pKey: 'serialNumber',
}

const defineDataParam: AwsCrudFunctions.DefineDataParam = {
    typeDefinition,
}

function typeDefinition() {
    return {
        serialNumber: {
            type: 'string',
            required: true,
            ExcludeUpdate: true,
        },
        deviceToken: {
            type: 'string',
            required: true,
            ExcludeUpdate: true,
        },
        certinfo: {
            type: 'string',
        },
        activated: {
            type: 'boolean',
            required: true,
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
