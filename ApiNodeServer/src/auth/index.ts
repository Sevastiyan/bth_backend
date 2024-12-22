import * as util from 'util'
import axios from 'axios'
import * as crypto from 'crypto-js'
import { getRespSuccess, getRespFail, RespFail, RespSuccess } from '../resp'
import { serverMaterPermission, deviceMaterPermission } from '../module/permission'
import { API_ERROR_CODE } from '../module/data/dataCenter'
import { getEnvironmentServer, getEnvironmentRegion } from '../environment'

const jsonwebtoken = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')
const verifyPromised = util.promisify(jsonwebtoken.verify.bind(jsonwebtoken))
const region = getEnvironmentRegion()
const cognitoPoolId: string = getEnvironmentServer().userPoolId

// const cognitoIssuer = `https://cognito-idp.ap-northeast-2.amazonaws.com/${cognitoPoolId}`;
const cognitoIssuer = `https://cognito-idp.${region}.amazonaws.com/${cognitoPoolId}`
const pk = 'aaC2H20lkVbQDfakxcrtNMQrd0FloLyw'

const { TOKEN_EXPIRED, TOKEN_INVALID } = API_ERROR_CODE

let cacheKeys: any
const getPublicKeys = async () => {
    if (!cacheKeys) {
        const url = `${cognitoIssuer}/.well-known/jwks.json`
        const publicKeys = await axios.get(url)
        cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
            const pem = jwkToPem(current)
            agg[current.kid] = { instance: current, pem }
            return agg
        }, {})
        return cacheKeys
    } else {
        return cacheKeys
    }
}

function checkFromServer(token: string, time: string) {
    try {
        const data = serverMaterPermission + time
        const hash = crypto.HmacSHA256(data, pk)
        const hashInBase64 = hash.toString()
        return hashInBase64 == token
    } catch (error) {
        return false
    }
}

export function decodeJwt(accessToken: string, time: string): Promise<RespFail | RespSuccess> {
    return new Promise(async function (resolve, reject) {
        try {
            let token = accessToken.replace('Bearer ', '')
            token = token.replace('Basic ', '')
            if (token == deviceMaterPermission) {
                resolve(getRespSuccess({ data: { userName: deviceMaterPermission } }))
            }

            if (time != null && checkFromServer(token, time)) {
                resolve(getRespSuccess({ data: { userName: serverMaterPermission } }))
            }

            if (token == null) {
                reject(
                    getRespFail({
                        code: TOKEN_INVALID,
                        error: 'please check token. token is null',
                    }),
                )
            }

            const tokenSections = (token || '').split('.')
            if (tokenSections.length < 2) {
                reject(getRespFail({ code: TOKEN_INVALID, error: 'please check token length' }))
            }

            const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8')
            const header = JSON.parse(headerJSON)
            const keys = await getPublicKeys()
            const key = keys[header.kid]
            if (key === undefined) {
                reject(getRespFail({ code: TOKEN_INVALID, error: 'please check key. key is null' }))
            }

            const claim = await verifyPromised(token, key.pem)
            const currentSeconds = Math.floor(new Date().valueOf() / 1000)
            if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
                reject(getRespFail({ code: TOKEN_EXPIRED, error: 'token is expired' }))
            }

            if (claim.iss !== cognitoIssuer) {
                reject(getRespFail({ code: TOKEN_INVALID, error: 'please check issuer' }))
            }

            if (claim.token_use !== 'access') {
                reject(getRespFail({ code: TOKEN_INVALID, error: 'token_use is not accessible' }))
            }

            const result = { userName: claim.username, clientId: claim.client_id }
            resolve(getRespSuccess({ data: result }))
        } catch (error) {
            reject(getRespFail({ code: TOKEN_INVALID, error: 'validate token error' }))
        }
    })
}
