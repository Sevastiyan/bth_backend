import * as AWS from 'aws-sdk'
import { getEnvironmentServer } from '../../environment'
import { RespSuccess } from '../../resp'
import * as apis from '../apis'

const endpoint = getEnvironmentServer().mqtt.endpoint
const iotData = new AWS.IotData({ endpoint })

export function publishDeviceControl(d_id: string, payload: any) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    return mqttPublish(topic, payload)
}

export function publishOta(d_id: string, processId: number, firmware: any) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    const payload = {
        method: 25,
        p_id: processId,
        params: {
            bin: '/' + firmware.s3Path,
            fv: firmware.fv,
        },
    }
    return mqttPublish(topic, payload)
}

interface vibrationParams {
    mode: number
    strength: number
    duration?: number // alarms do not use this
    test?: boolean
}

export function setVibrationParams(vibrationParams: vibrationParams): vibrationParams {
    return { ...vibrationParams, test: vibrationParams.test ? vibrationParams.test : false }
}

export function startVibration(d_id: string, processId: number, params: vibrationParams) {
    try {
        const topic = `$aws/things/${d_id}/sm/inTopic`
        const payload = {
            method: 26,
            p_id: processId,
            params,
        }
        return mqttPublish(topic, payload)
    } catch (error) {
        console.log('MQTT Error: ', error)
    }
}

export function stopVibration(d_id: string, processId: number) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    const payload = {
        method: 27,
        p_id: processId,
    }
    return mqttPublish(topic, payload)
}

export function resetFlag(d_id: string, processId: number) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    const payload = {
        method: 35,
        p_id: processId,
    }
    return mqttPublish(topic, payload)
}

export function updateDeviceState(d_id: string, params: {}, processId?: number) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    console.log('mqtt params', params)
    const payload = {
        method: 37,
        params,
        p_id: processId,
    }
    return mqttPublish(topic, payload)
}

export function sendApneaEvent(d_id: string, params: {}, processId: number) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    console.log('Data to MQTT', params)
    const payload = {
        method: 38,
        params: params,
        p_id: processId,
    }
    console.log('publishing timers...')
    return mqttPublish(topic, payload)
}

export function updateApneaBuzzState(d_id: string, params: {}, processId?: number) {
    const topic: string = `$aws/things/${d_id}/sm/inTopic`
    console.log('mqtt params', params)
    const payload: any = {
        method: 39,
        params,
        p_id: processId,
    }
    return mqttPublish(topic, payload)
}

export function resetDevice(d_id: string, processId?: number) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    const payload = {
        method: 29,
    }
    return mqttPublish(topic, payload)
}

//? Send the timers to the device
export function publishTimerData(d_id: string, params: {}, processId: number) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    console.log('Data to MQTT', params)
    const payload = {
        method: 31,
        params: params,
        p_id: processId,
    }
    console.log('publishing timers...')
    return mqttPublish(topic, payload)
}

export function mqttPublish(topic: string, payload: any) {
    const param: AWS.IotData.Types.PublishRequest = {
        topic,
        qos: 0,
        payload: typeof payload == 'string' ? payload : JSON.stringify(payload),
    }
    return iotData.publish(param).promise()
}
