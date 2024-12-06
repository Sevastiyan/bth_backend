import { user, relation } from './apis'
import { API_ERROR_CODE, USER_PLACE_PERM } from './data/dataCenter'
import { RespSuccess, RespFail, getRespSuccess, getRespFail } from '../resp'

const eCodes = API_ERROR_CODE

export const serverMaterPermission = 'serverToServerToken'
export const deviceMaterPermission = '1qwefdsvfdasdczxbv'

export interface PermissionParam {
    authUId?: string
    reqId?: string
    shouldMaster?: boolean
    shouldAdmin?: boolean
}

export function checkFromServer(param: PermissionParam) {
    const { authUId } = param
    if (authUId == serverMaterPermission) {
        return Promise.resolve(getRespSuccess({}))
    }
    return Promise.reject(getRespFail({ code: eCodes.PERMISSION_INVALID }))
}

export function checkFromDevice(param: PermissionParam) {
    const { authUId } = param
    if (authUId == deviceMaterPermission) {
        return Promise.resolve(getRespSuccess({}))
    }
    return Promise.reject(getRespFail({ code: eCodes.PERMISSION_INVALID }))
}

export function checkUser(param: PermissionParam) {
    const { authUId, reqId } = param
    //? Consider adding admin permissions here
    if (authUId == serverMaterPermission) {
        return Promise.resolve(getRespSuccess({}))
    }
    if (authUId != reqId) {
        return user
            .readData(authUId)
            .then((api: any) => {
                if (api.data.isAdmin) {
                    // User is an admin
                    return Promise.resolve(getRespSuccess({}))
                } else {
                    // User is not an admin
                    return Promise.reject(getRespFail({ code: eCodes.PERMISSION_INVALID }))
                }
            })
            .catch(error => {
                // Handle any errors that occurred during the API call
                return Promise.reject(getRespFail({ code: eCodes.PERMISSION_INVALID }))
            })
    }
    return Promise.resolve(getRespSuccess({}))
}

export function checkDevice(param: PermissionParam) {
    const { authUId, reqId, shouldMaster } = param
    return new Promise(async function (resolve, reject) {
        try {
            let api: RespSuccess = await user.readData(authUId)
            if (api.data.isAdmin) {
                resolve(api)
                return
            } else {
                api = await relation.readData(authUId, reqId)
                const userDevice = api.data

                if (shouldMaster && userDevice.perm != USER_PLACE_PERM.master) {
                    reject(getRespFail({ code: eCodes.PERMISSION_NOT_MASTER }))
                }
            }
            resolve(api)
        } catch (error) {
            reject(error)
        }
    })
}

export function checkUserName(param: PermissionParam): Promise<RespSuccess | RespFail> {
    const { reqId } = param
    return new Promise(async function (resolve, reject) {
        try {
            let api: RespSuccess = await user.readData(reqId)
            resolve(api)
        } catch (error) {
            reject(getRespFail({ code: eCodes.USER_NAME_EXIST }))
        }
    })
}

async function checkAdminAccess(authUId: string) {
    let api: RespSuccess = await user.readData(authUId)
    return api.data.isAdmin
}
