import { DeviceCertInfoTable } from '../dataBase'
import { getRespFail, RespSuccess } from '../../resp'
import { applyCert } from '../cert'
import { API_ERROR_CODE } from '../data/dataCenter'

export function activateDeviceCert(serialNumber: string) {
    return new Promise(async function (resolve) {
        let api: RespSuccess = {}
        try {
            api = await DeviceCertInfoTable.readData(serialNumber)
            const certData = api.data
            certData.activated = true
            if (
                certData.certinfo == null ||
                certData.certinfo == '' ||
                certData.certinfo == 'none' ||
                typeof certData.certinfo != 'string'
            ) {
                const certInfo: any = await applyCert(serialNumber)
                certData.certinfo = certInfo.data
            }
            api = await DeviceCertInfoTable.updateData(serialNumber, certData)
        } catch (error) {
            const certInfo: any = await applyCert(serialNumber)
            const item = {
                serialNumber,
                deviceToken: serialNumber,
                activated: true,
                certinfo: certInfo.data,
            }
            api = await DeviceCertInfoTable.createData(item)
        }
        resolve(api)
    })
}

export function getCertInfo(serialNumber: string) {
    return new Promise(async function (resolve, reject) {
        let api: RespSuccess = {}
        try {
            api = await DeviceCertInfoTable.readData(serialNumber)
            const certData = api.data
            await DeviceCertInfoTable.updateData(serialNumber, { activated: false })
            if (certData.activated) {
                resolve(JSON.parse(certData.certinfo))
            } else {
                reject(getRespFail({ code: API_ERROR_CODE.DATA_IS_INVALID }))
            }
        } catch (error) {
            console.log('getCertInfo error: ', error)
            reject(getRespFail({ error: String(error) }))
        }
    })
}
