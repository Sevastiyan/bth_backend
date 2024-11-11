import * as AWS from 'aws-sdk'
import { getRespSuccess, getRespFail, RespSuccess, RespFail } from '../../resp'
import { API_ERROR_CODE, API_SUCCESS_CODE } from '../data/dataCenter'
const ddb = new AWS.DynamoDB.DocumentClient()
const sns = new AWS.SNS()

export function execAwsDbCreate(param: AWS.DynamoDB.DocumentClient.PutItemInput) {
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            await ddb.put(param).promise()
            resolve(getRespSuccess({ data: param.Item, code: API_SUCCESS_CODE.API_SUCCESS }))
        } catch (e) {
            console.log('execAwsDbPut err: ', e, ', param.apiParam: ', param)
            reject(getRespFail({ error: 'db put error', code: API_ERROR_CODE.DB_API_ERROR }))
        }
    })
}

export function execAwsDbGet(param: AWS.DynamoDB.DocumentClient.GetItemInput) {
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            const data = await ddb.get(param).promise()
            if (data.Item == null) {
                reject(getRespFail({ error: 'data is null', code: API_ERROR_CODE.DATA_IS_NULL }))
                return
            }
            resolve(getRespSuccess({ data: data.Item, code: API_SUCCESS_CODE.API_SUCCESS }))
        } catch (e) {
            console.log('execAwsDbGet err: ', e, ', param.apiParam: ', param)
            reject(getRespFail({ error: 'db get error', code: API_ERROR_CODE.DB_API_ERROR }))
        }
    })
}

export function execAwsDbDelete(param: AWS.DynamoDB.DocumentClient.DeleteItemInput) {
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            await ddb.delete(param).promise()
            resolve(getRespSuccess({ data: {}, code: API_SUCCESS_CODE.API_SUCCESS }))
        } catch (e) {
            console.log('execAwsDbDelete err: ', e, ', param.apiParam: ', param)
            reject(getRespFail({ error: 'db delete error', code: API_ERROR_CODE.DB_API_ERROR }))
        }
    })
}

export function execAwsDbQuery(param: AWS.DynamoDB.DocumentClient.QueryInput, all: boolean) {
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            let resList: any[] = []
            let lastEvaluatedKey: any = undefined
            if (all) {
                while (true) {
                    param.ExclusiveStartKey = lastEvaluatedKey
                    const datalist = await ddb.query(param).promise()
                    resList = resList.concat(datalist.Items)
                    lastEvaluatedKey = datalist.LastEvaluatedKey
                    if (lastEvaluatedKey == undefined) {
                        break
                    }
                }
            } else {
                const datalist = await ddb.query(param).promise()
                lastEvaluatedKey = datalist.LastEvaluatedKey
                resList = resList.concat(datalist.Items)
            }
            resolve(
                getRespSuccess({
                    data: resList,
                    code: API_SUCCESS_CODE.API_SUCCESS,
                    lastEvaluatedKey: lastEvaluatedKey,
                }),
            )
        } catch (e) {
            console.log('execAwsDbQuery err: ', e, ', param.apiParam: ', param)
            reject(getRespFail({ error: 'db query error', code: API_ERROR_CODE.DB_API_ERROR }))
        }
    })
}

export function execAwsDbScanAll(param: AWS.DynamoDB.DocumentClient.ScanInput) {
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            let preResList: any[] = []
            let lastEvaluatedKey: any = undefined
            while (true) {
                param.ExclusiveStartKey = lastEvaluatedKey
                const datalist = await ddb.scan(param).promise()
                if (datalist.Items != null) preResList = preResList.concat(datalist.Items)
                if (datalist.LastEvaluatedKey != undefined) {
                    lastEvaluatedKey = datalist.LastEvaluatedKey || undefined
                } else {
                    break
                }
            }
            resolve(getRespSuccess({ data: preResList, code: API_SUCCESS_CODE.API_SUCCESS }))
        } catch (e) {
            console.log('execAwsDbScanAll err: ', e, ', param.apiParam: ', param)
            reject(getRespFail({ error: 'db scan error', code: API_ERROR_CODE.DB_API_ERROR }))
        }
    })
}
