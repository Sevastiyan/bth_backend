import * as AwsCrudFunctions from './AwsCrudFunctions'
import { TableTemplate } from './TableTemplate'

const tableName = 'LogerTable'

const mainIndex = {
    pKey: 'path',
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
 *         - path
 *       properties:
 *         path:
 *           type: string
 *         created:
 *           type: dateTime
 *         counters:
 *           type:object
 *         updated:
 *           type: dateTime
 */

function typeDefinition() {
    return {
        path: {
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
        counters: {
            type: 'object',
        },
    }
}

export const logerTable = new TableTemplate(tableName, mainIndex, defineDataParam)
