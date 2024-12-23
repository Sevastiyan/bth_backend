export const API_ERROR_CODE = {
    INTERNAL_SERVER_ERROR: -1,
    DATA_IS_NULL: -2,
    DB_API_ERROR: -3,
    DATA_IS_INVALID: -4,
    DATA_HAVE_NO_REQUIRED: -5,
    DATA_HAVE_EXCLUSIVE: -6,
    GROUP_LIMIT_EXCEEDED: -7,
    GROUP_SIZE_EXCEEDED: -8,
    GROUP_NAME_UNIQUE: -9,

    PERMISSION_INVALID: -21,
    PERMISSION_NOT_MASTER: -22,
    PERMISSION_CANNOT_MATCH_PLACE: -23,
    PERMISSION_NOT_GROUP_ADMIN: -24,
    PERMISSION_NOT_GROUP_MEMBER: -25,

    TOKEN_EXPIRED: -31,
    TOKEN_INVALID: -32,

    LINK_NOT_MATCHED_TYPE: -51,

    DEVICE_CANNOT_COM: -100,
    DEVICE_NOT_CONNECTED: -101,
    DEVICE_ACTION_TIMEOUT: -102,
    DEVICE_CONTROL_ERROR: -103,

    USER_INVALID: -121,
    USER_NAME_EXIST: -122,
}

export const API_SUCCESS_CODE = {
    API_SUCCESS: 0,
}

export const DEVICE_PASS_KEY = [0x66, 0x39]

export const USER_PLACE_PERM = {
    master: 1,
    user: 0,
}

export const GROUP_MEMBER_ROLE = {
    admin: 1,
    member: 0,
}

export const MEMBERSHIP_STATUS = [
    {
        name: 'basic',
        limit: 1,
        size: 2,
    },
    {
        name: 'standard',
        limit: 1,
        size: 4,
    },
    {
        name: 'extended',
        limit: 1,
        size: 10,
    },
]

export const OTA_STATUS_TYPE = {
    canUpdate: 'canUpdate',
    cannotUpdate: 'cannotUpdate',
}
