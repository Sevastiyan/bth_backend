import { API_SUCCESS_CODE, API_ERROR_CODE } from '../module/data/dataCenter'

export interface RespSuccess {
    data?: any
    code?: number
    lastEvaluatedKey?: any
}

export interface RespFail {
    error?: string
    code?: number
}

export function getRespSuccess(params: RespSuccess): RespSuccess {
    const { data, code, lastEvaluatedKey } = params
    return {
        data,
        code: code || API_SUCCESS_CODE.API_SUCCESS,
        lastEvaluatedKey,
    }
}

export function getRespFail(params: RespFail): RespFail {
    const { error, code } = params
    let msg: string = error || getErrorMessage(code!)
    if (typeof error == 'object') msg = JSON.stringify(error)
    return {
        error: msg,
        code: code || API_ERROR_CODE.INTERNAL_SERVER_ERROR,
    }
}

function getErrorMessage(code: number): string {
    let message = ''
    switch (code) {
        case API_SUCCESS_CODE.API_SUCCESS:
            message = 'success'
            break
        case API_ERROR_CODE.INTERNAL_SERVER_ERROR:
            message = 'error_internal_server'
            break
        case API_ERROR_CODE.DATA_IS_NULL:
            message = 'error_data_is_null'
            break
        case API_ERROR_CODE.DATA_IS_INVALID:
            message = 'data invalid.'
            break
        case API_ERROR_CODE.DATA_HAVE_NO_REQUIRED:
            message = 'data have no required att.'
            break
        case API_ERROR_CODE.DATA_HAVE_EXCLUSIVE:
            message = 'data have exclusive att.'
            break
        case API_ERROR_CODE.DB_API_ERROR:
            message = 'error_db_api_error'
            break
        case API_ERROR_CODE.TOKEN_EXPIRED:
            message = 'error_auth_token_expired'
            break
        case API_ERROR_CODE.TOKEN_INVALID:
            message = 'error_auth_token_invalid'
            break
        case API_ERROR_CODE.PERMISSION_INVALID:
            message = 'you dont have permission.'
            break
        case API_ERROR_CODE.PERMISSION_NOT_MASTER:
            message = 'you dont have master permission.'
            break
        case API_ERROR_CODE.PERMISSION_CANNOT_MATCH_PLACE:
            message = 'place is not matched.'
            break
        case API_ERROR_CODE.PERMISSION_NOT_GROUP_ADMIN:
            message = 'you dont have administrative rights to group'
            break
        case API_ERROR_CODE.GROUP_LIMIT_EXCEEDED:
            message = 'you have exceeded the maximum number of groups'
            break
        case API_ERROR_CODE.PERMISSION_NOT_GROUP_MEMBER:
            message = 'you are not a member of this group'
            break
        case API_ERROR_CODE.GROUP_SIZE_EXCEEDED:
            message = 'you have exceeded the maximum number of people you can add'
            break
        case API_ERROR_CODE.USER_NAME_EXIST:
            message = 'the username does not exist'
            break
        case API_ERROR_CODE.GROUP_NAME_UNIQUE:
            message = 'group name must be unique'
            break
        default:
            message = 'default'
            break
    }
    return message
}
