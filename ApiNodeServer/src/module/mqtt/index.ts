import * as AWS from 'aws-sdk'
import { getEnvironmentServer } from '../../environment'

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

export function resetDevice(d_id: string, processId?: number) {
    const topic = `$aws/things/${d_id}/sm/inTopic`
    const payload = {
        method: 29,
    }
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
