import sm from './sm'
import { FirmwareType } from './types'
import { OTA_STATUS_TYPE } from '../dataCenter'
const firmwareList = [...sm]

export function getCurrentFirmware(d_type: number, rev: number, fv: number): FirmwareType | null {
    const firmwares: FirmwareType[] = firmwareList.filter(element => {
        if (element.d_type === d_type && element.rev === rev && element.fv === fv) {
            return true
        }
    })
    if (firmwares == null || firmwares.length == 0) {
        return null
    }
    return firmwares[0]
}

export function getCurrentFirmwareName(d_type: number, rev: number, fv: number) {
    const firmware = getCurrentFirmware(d_type, rev, fv)
    if (firmware == null) return ''
    return firmware.version
}

export function getLastestFirmware(d_type: number, rev: number): FirmwareType | null {
    const firmwares: FirmwareType[] = firmwareList.filter(element => {
        if (
            element.d_type === d_type //&& element.rev === rev
        ) {
            return true
        }
    })

    if (firmwares.length == 0) {
        return null
    }
    return firmwares.reduce(function (prev, current) {
        return prev.fv > current.fv ? prev : current
    })
}

export function getOtaStatus(d_type: number, rev: number, fv: number) {
    let otaStatus = OTA_STATUS_TYPE.cannotUpdate
    const firmware = getLastestFirmware(d_type, rev)
    if (firmware != null && firmware.fv > fv) {
        otaStatus = OTA_STATUS_TYPE.canUpdate
    }
    return otaStatus
}
