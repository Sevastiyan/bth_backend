import moment from 'moment'
import { logerTable } from '../apis'

export const requestLoger = async (request, response, next) => {
    loger.info('Method: ', request.method)
    loger.info('Request: ', request.path)
    loger.info('User:', response.locals.user)
    // loger.info('Headers:', request.headers)

    const path = request.path

    if (path.includes('/user/get')) {
        loger.info('Body:', request.body)
        logUserActivity(path, response.locals.user)
    }

    next()
}

export const loger = {
    info: (...params) => {
        console.log(...params)
    },
    error: (...params) => {
        console.error(...params)
    },
}

async function logUserActivity(path: string, user: string) {
    try {
        const start = moment().startOf('day')
        const end = moment().endOf('day')
        const queryPath = path

        loger.info('Start and End Query', start, end)
        const item = {
            path: queryPath,
            counters: {},
        }

        const api: any = await logerTable.queryByIdWithDate(queryPath, start.unix(), end.unix())
        const result: any[] = api.data

        if (result.length === 0) {
            loger.info('No Item created for today.')
            item.counters[user] = 1
            await logerTable.createData(item)
        } else {
            loger.info('Item already created for today.')

            item.counters = {
                ...result[0].counters,
            }
            item.counters[user] = item.counters[user] ? item.counters[user] + 1 : 1
            //! Save old and new data
            await logerTable.updateData(result[0].path, result[0].created, {
                counters: item.counters,
            })
        }
    } catch (error) {
        loger.error(error)
    }
}
