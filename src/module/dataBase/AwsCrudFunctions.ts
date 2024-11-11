import * as AWS from 'aws-sdk'
import * as AwsApis from './AwsApis'
import { getRespFail, getRespSuccess, RespSuccess, RespFail } from '../../resp'
import { API_ERROR_CODE, API_SUCCESS_CODE } from '../data/dataCenter'

export interface IndexData {
    pKey: string
    sKey?: string
    name?: string
}

export interface DefineDataParam {
    typeDefinition: any
    dataToDB?: any
    dataFromDB?: any
}

export interface CreateDataParam {
    TableName: string
    Item: any
    defineDataParam: DefineDataParam
}

export interface ReadDataParam {
    TableName: string
    indexData: IndexData
    defineDataParam: DefineDataParam
    pValue: any
    sValue?: any
    atts?: string[]
}

export interface UpdateDataParam {
    TableName: string
    indexData: IndexData
    defineDataParam: DefineDataParam
    pValue: any
    sValue?: any
    Item: any
}

export interface DeleteDataParam {
    TableName: string
    indexData: IndexData
    pValue: any
    sValue?: any
}

export interface QueryDataParam {
    TableName: string
    indexData: IndexData
    defineDataParam: DefineDataParam
    pValue: any
    all: boolean
    atts?: any
    lastEvaluatedKey?: any
    limit?: number
    start?: any
    end?: any
    forward?: boolean
    filterKey?: string
    filterValue?: any
}

export interface ScanDataParam {
    TableName: string
    filterKey?: string
    filterValue?: any
}

export function createData(params: CreateDataParam) {
    const { TableName, Item, defineDataParam } = params
    const { typeDefinition, dataToDB, dataFromDB } = defineDataParam
    Item.created = new Date().toISOString()
    Item.updated = new Date().toISOString()
    const { code, newItem, requireErrorMsg } = typeValidator(
        typeDefinition(Item),
        Item,
        true,
        false,
    )

    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            if (code != API_SUCCESS_CODE.API_SUCCESS) {
                reject(getRespFail({ code, error: requireErrorMsg }))
                return
            }
            const putItem = dataToDB != null ? dataToDB(newItem) : newItem
            const res: RespSuccess = await AwsApis.execAwsDbCreate({
                TableName,
                Item: putItem,
            })
            const resItem = dataFromDB != null ? dataFromDB(res.data) : res.data
            resolve(getRespSuccess({ data: resItem, code: API_SUCCESS_CODE.API_SUCCESS }))
        } catch (e) {
            reject(e)
        }
    })
}

export function readData(params: ReadDataParam) {
    const { TableName, indexData, defineDataParam, pValue, sValue, atts } = params
    const { typeDefinition, dataFromDB } = defineDataParam
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            const res: RespSuccess = await AwsApis.execAwsDbGet({
                TableName,
                Key: createKey(indexData, pValue, sValue),
                AttributesToGet: atts || undefined,
            })
            const getItem = dataFromDB != null ? dataFromDB(res.data) : res.data
            const { code, newItem } = typeValidator(typeDefinition(getItem), getItem, false, false)
            resolve(getRespSuccess({ data: newItem, code: API_SUCCESS_CODE.API_SUCCESS }))
        } catch (e) {
            reject(e)
        }
    })
}

export function updateData(params: UpdateDataParam) {
    const { TableName, indexData, defineDataParam, pValue, sValue, Item } = params
    const { typeDefinition, dataFromDB, dataToDB } = defineDataParam
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            let res: RespSuccess = await readData(params)
            const getItem = res.data
            const updateItem = mergeObject(getItem, Item)
            updateItem.updated = new Date().toISOString()
            const { code, newItem } = typeValidator(
                typeDefinition(updateItem),
                updateItem,
                false,
                true,
            )
            const putItem = dataToDB != null ? dataToDB(newItem) : newItem
            res = await AwsApis.execAwsDbCreate({
                TableName,
                Item: putItem,
            })
            const resItem = dataFromDB != null ? dataFromDB(res.data) : res.data
            resolve(getRespSuccess({ data: resItem, code: API_SUCCESS_CODE.API_SUCCESS }))
        } catch (e) {
            reject(e)
        }
    })
}

export function deleteData(params: DeleteDataParam) {
    const { TableName, indexData, pValue, sValue } = params
    const param: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
        TableName,
        Key: createKey(indexData, pValue, sValue),
    }
    return AwsApis.execAwsDbDelete(param)
}

export function queryData(params: QueryDataParam) {
    const {
        TableName,
        indexData,
        defineDataParam,
        pValue,
        atts,
        lastEvaluatedKey,
        limit,
        forward,
        all,
        start,
        end,
        filterKey,
        filterValue,
    } = params
    const { typeDefinition, dataFromDB } = defineDataParam
    const between = start != null && end != null
    const KeyConditionExpression = !between
        ? '#pKey = :pValue'
        : `#pKey = :pValue and #sKey between :start and :end`
    const param: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName,
        KeyConditionExpression,
        IndexName: indexData.name,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: forward,
        Limit: limit,
        ProjectionExpression: attsToKey(indexData, atts),
    }
    const ExpressionAttributeNames = { '#pKey': indexData.pKey }
    const ExpressionAttributeValues = { ':pValue': pValue }
    if (between) {
        ExpressionAttributeNames['#sKey'] = indexData.sKey
        ExpressionAttributeValues[':start'] = start
        ExpressionAttributeValues[':end'] = end
    }
    if (filterKey != null && filterValue != null) {
        ExpressionAttributeNames['#fKey'] = filterKey
        ExpressionAttributeValues[':fValue'] = filterValue
        param.FilterExpression = '#fKey = :fValue'
    }
    param.ExpressionAttributeNames = ExpressionAttributeNames
    param.ExpressionAttributeValues = ExpressionAttributeValues

    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            const resList: any[] = []
            const res: RespSuccess = await AwsApis.execAwsDbQuery(param, all)
            for (const item of res.data) {
                const getItem = dataFromDB != null ? dataFromDB(item) : item
                const { code, newItem } = typeValidator(
                    typeDefinition(getItem),
                    getItem,
                    false,
                    false,
                )
                resList.push(newItem)
            }
            resolve(
                getRespSuccess({
                    data: resList,
                    lastEvaluatedKey: res.lastEvaluatedKey,
                    code: API_SUCCESS_CODE.API_SUCCESS,
                }),
            )
        } catch (e) {
            reject(e)
        }
    })
}

export function scanData(params: ScanDataParam) {
    const { TableName, filterKey, filterValue } = params
    const param: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName,
    }

    if (filterKey != null && filterValue != null) {
        const ExpressionAttributeNames = { '#fKey': filterKey }
        const ExpressionAttributeValues = { ':fValue': filterValue }
        param.ExpressionAttributeNames = ExpressionAttributeNames
        param.ExpressionAttributeValues = ExpressionAttributeValues
        param.FilterExpression = '#fKey = :fValue'
    }
    return AwsApis.execAwsDbScanAll(param)
}

function createKey(index: IndexData, pValue: any, sValue: any): object {
    const { pKey, sKey } = index
    const Key: any = {}
    Key[pKey] = pValue
    if (sKey != null) Key[sKey] = sValue
    return Key
}

function attsToKey(indexData: IndexData, atts: string[]): string | undefined {
    if (atts == null) return undefined
    let res = ''
    for (const data of atts) {
        let value = data
        if (data == indexData.pKey) {
            value = '#pKey'
        }
        if (data == indexData.sKey) {
            value = '#sKey' // added this to support the index data with sKey
        }
        res += value + ', '
    }
    res = res.slice(0, -2)
    return res
}

function mergeObject(originItem: any, newItem: any) {
    for (const [key, value] of Object.entries(newItem)) {
        if (originItem[key] == value) {
            continue
        }
        if (
            typeof value == 'object' &&
            !Array.isArray(value) &&
            originItem[key] != null &&
            value != null
        ) {
            for (const [innerKey, innerValue] of Object.entries(value)) {
                const innerOriginItem: any = originItem[key]
                if (innerOriginItem[innerKey] == innerValue) {
                    continue
                }
                originItem[key][innerKey] = innerValue
            }
        } else {
            originItem[key] = value
        }
    }
    return originItem
}

function typeValidator(
    typeDefinition: any,
    item: any,
    checkRequired: boolean,
    checkExclude: boolean,
) {
    const newItem: any = {}
    var code: number = API_SUCCESS_CODE.API_SUCCESS

    //// CHECK!!!!   type
    for (const [key, value] of Object.entries(item)) {
        if (typeDefinition[key] == null) {
            // console.log('not defined key: ', key);
            continue
        }
        const { type, objectType } = typeDefinition[key]

        // normal data
        if (typeof value != 'object' && !checkTypeMatched(value, type)) {
            // console.log('not matched type | key: ', key, ', type: ', type);
            continue
        }

        if (
            typeof value == 'object' &&
            !Array.isArray(value) &&
            objectType != null &&
            value != null
        ) {
            // object
            const objectData: any = value
            newItem[key] = {}
            for (const [innerKey, innerValue] of Object.entries(objectData)) {
                if (objectType[innerKey] == null) {
                    // console.log('not defined object inner  key: ', key, '  innerKey: ', innerKey);
                    continue
                }
                const innerType = objectType[innerKey].type
                if (!checkTypeMatched(innerValue, innerType)) {
                    // console.log('not matched object inner  key: ', key, '  innerKey: ', innerKey, ', innerType: ', innerType);
                    continue
                }
                newItem[key][innerKey] = innerValue
            }
        } else if (
            typeof value == 'object' &&
            Array.isArray(value) &&
            objectType != null &&
            value != null
        ) {
            // array
            newItem[key] = []
            for (const arrPreItem of value) {
                const arrItem: any = {}
                for (const [innerKey, innerValue] of Object.entries(arrPreItem)) {
                    if (objectType[innerKey] == null) {
                        // console.log('not defined array inner  key: ', key, '  innerKey: ', innerKey);
                        continue
                    }
                    const innerType = objectType[innerKey].type
                    if (!checkTypeMatched(innerValue, innerType)) {
                        // console.log('not matched array inner  key: ', key, '  innerKey: ', innerKey, ', innerType: ', innerType);
                        continue
                    }
                    arrItem[innerKey] = innerValue
                }
                newItem[key].push(arrItem)
            }
        } else {
            newItem[key] = value
        }
    }

    //// CHECK!!!!   required, ExcludeUpdate
    let requireErrorMsg: string = 'Required att list: '
    for (const [typeKey, typeValue] of Object.entries(typeDefinition)) {
        const { required, ExcludeUpdate, objectType } = <any>typeValue

        const value = newItem[typeKey]

        if (checkRequired && required && value == null) {
            // console.log('check require - typeKey: ', typeKey, ', value: ', value)
            requireErrorMsg += typeKey + ', '
            code = API_ERROR_CODE.DATA_HAVE_NO_REQUIRED
        }
        if (checkExclude && ExcludeUpdate && value != null) {
            code = API_ERROR_CODE.DATA_HAVE_EXCLUSIVE
        }

        if (value == null || objectType == null) {
            continue
        }

        if (typeof value == 'object' && !Array.isArray(value)) {
            for (const [innerTypeKey, innerTypeValue] of Object.entries(objectType)) {
                const { required, ExcludeUpdate } = <any>innerTypeValue
                if (checkRequired && required && value[innerTypeKey] == null) {
                    // console.log('check require inner object - typeKey: ', innerTypeKey, ', value: ', innerTypeValue);
                    requireErrorMsg += typeKey + '.' + innerTypeKey + ', '
                    code = API_ERROR_CODE.DATA_HAVE_NO_REQUIRED
                }
                if (checkExclude && ExcludeUpdate && value[innerTypeKey] != null) {
                    code = API_ERROR_CODE.DATA_HAVE_EXCLUSIVE
                }
            }
        } else if (typeof value == 'object' && Array.isArray(value)) {
            for (const [innerTypeKey, innerTypeValue] of Object.entries(objectType)) {
                const { required, ExcludeUpdate } = <any>innerTypeValue
                for (const arrItem of value) {
                    if (checkRequired && required && arrItem[innerTypeKey] == null) {
                        // console.log('check require inner array - typeKey: ', innerTypeKey, ', value: ', innerTypeValue);
                        requireErrorMsg += typeKey + '.' + innerTypeKey + ', '
                        code = API_ERROR_CODE.DATA_HAVE_NO_REQUIRED
                    }
                    if (checkExclude && ExcludeUpdate && arrItem[innerTypeKey] != null) {
                        code = API_ERROR_CODE.DATA_HAVE_EXCLUSIVE
                    }
                }
            }
        }
    }

    return { code, newItem, requireErrorMsg }
}

function checkTypeMatched(data: any, type: string) {
    if (typeof data == 'string' && type == 'dateTime') {
        return true
    }
    if (typeof data == type || type == 'any') {
        return true
    }
    // console.log('typeof (data): ', typeof (data));
    return false
}
