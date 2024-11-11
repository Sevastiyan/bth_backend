import * as AWS from 'aws-sdk'
import axios from 'axios'
import { getEnvironmentRegion } from '../../environment'

/**
 * Lambda
 *
 * params
 *  - function: Lambda
 *  - paylaod:  Lambda
 *  - sync:  (default: ) [null]
 */
export interface invokeLambdaParam {
    function: string
    payload: any
    sync?: boolean
}

const region = getEnvironmentRegion()

export function invokeLambda(params: invokeLambdaParam) {
    AWS.config.region = region
    const lambda = new AWS.Lambda()

    const lambdaParam = {
        FunctionName: params.function,
        InvocationType: params.sync ? 'RequestResponse' : 'Event',
        Payload: JSON.stringify(params.payload),
    }

    return new Promise((resolve, reject) => {
        try {
            lambda.invoke(lambdaParam, (err, data) => {
                if (err) {
                    console.log('invokeLambda error: ', err, err.stack)
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * HTTP GET
 *
 * params
 *  - url:
 *  - option:
 *    - headers
 */
export function axiosGet(params: any) {
    return new Promise(async function (resolve, reject) {
        try {
            const res = await axios.get(params.url, params.option)
            resolve(res.data)
        } catch (error) {
            console.log('axiosGet error ' + error, ', params: ', params)
            reject(error)
        }
    })
}

export function finishPromise(params: any) {
    return Promise.resolve(params)
}
