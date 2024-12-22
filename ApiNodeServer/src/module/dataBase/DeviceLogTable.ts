import * as AwsCrudFunctions from './AwsCrudFunctions'
import { TableTemplate } from './TableTemplate'

const tableName = 'DeviceLogTable'

const mainIndex = {
    pKey: 'id',
    sKey: 'created',
}

const defineDataParam: AwsCrudFunctions.DefineDataParam = {
    typeDefinition,
}

/**
 *  @swagger
 *  components:
 *   schemas:
 *     AlarmOnTime:
 *       type: object
 *       required:
 *         - id
 *       properties:
 *         id:
 *           type: string
 *         created:
 *           type: dateTime
 *         updated:
 *           type: dateTime
 */

function typeDefinition() {
    return {
        id: {
            type: 'string',
            required: true,
            ExcludeUpdate: true,
        },
        created: {
            type: 'dateTime',
        },
        updated: {
            type: 'dateTime',
        },
    }
}

export const deviceLogTable = new TableTemplate(tableName, mainIndex, defineDataParam)
