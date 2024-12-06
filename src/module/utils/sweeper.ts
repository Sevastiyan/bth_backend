import moment from 'moment'
import { unregisterDevice } from '../apis/device'
import { getRespFail, getRespSuccess, RespFail, RespSuccess } from '../../resp'
import { UserDeviceTable } from '../dataBase'

export function removeRelations(d_id: string): Promise<RespFail | RespSuccess> {
    return new Promise(async function (resolve, reject) {
        try {
            const data: any = await UserDeviceTable.queryByDIdAll(d_id)
            const dataArray: any[] = data.data
            if (dataArray.length > 0) {
                for (const element of dataArray) {
                    await unregisterDevice(element.u_id, element.d_id)
                }
            } else {
                console.log('No Links to remove')
            }
            resolve(getRespSuccess({}))
        } catch (error) {
            console.log('Remove Group Error: ', error)
            reject(getRespFail({ error: String(error) }))
        }
    })
}
