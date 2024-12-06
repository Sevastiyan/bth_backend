import { DeviceDataTable, UserDeviceTable } from '../dataBase'
import { getRespSuccess, RespSuccess, getRespFail } from '../../resp'
import { USER_PLACE_PERM } from '../data/dataCenter'
import { getEnvironmentStage } from '../../environment'

export const createData = DeviceDataTable.createData

export const readData = DeviceDataTable.readData

export const updateData = DeviceDataTable.updateData

export const deleteData = DeviceDataTable.deleteData

export const scanDataAll = DeviceDataTable.scanDataAll

export function registerDevice(u_id: string, item: any) {
    const d_id = item.id
    return new Promise(async function (resolve, reject) {
        try {
            await createData(item)
            const api: RespSuccess = await UserDeviceTable.createData({
                u_id,
                d_id,
                perm: USER_PLACE_PERM.master,
                stage: getEnvironmentStage(),
            })
            resolve(getRespSuccess(api))
        } catch (error) {
            console.log('registerDevice: ', error)
            reject(getRespFail({ error: String(error) }))
        }
    })
}

export function unregisterDevice(u_id: string, d_id: string) {
    return new Promise(async function (resolve, reject) {
        try {
            await deleteData(d_id)
            const api: RespSuccess = await UserDeviceTable.deleteData(u_id, d_id)
            console.log('🚀 ~ file: device.ts:40 ~ api', api)
            resolve(getRespSuccess(api))
        } catch (error) {
            console.log('unregisterDevice: ', error)
            reject(getRespFail({ error: String(error) }))
        }
    })
}

export function queryDataByUid(u_id: string) {
    return new Promise(async function (resolve, reject) {
        try {
            let api: RespSuccess = await UserDeviceTable.queryByIdAll(u_id)
            const deviceList: any[] = []
            const userDeviceList: any[] = api.data
            for (const userDevice of userDeviceList) {
                const { d_id } = userDevice
                try {
                    api = await readData(d_id)
                    const device: any = api.data
                    deviceList.push(device)
                } catch (error) {
                    continue
                }
            }
            resolve(getRespSuccess({ data: deviceList }))
        } catch (error) {
            console.log('queryDataByUid: ', error)
            reject(getRespFail({ error: String(error) }))
        }
    })
}
