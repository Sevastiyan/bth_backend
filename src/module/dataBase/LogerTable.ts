import * as AwsCrudFunctions from './AwsCrudFunctions'
import { Table } from './Table'

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

export const logerTable = new Table(tableName, mainIndex, defineDataParam)
