import * as AWS from 'aws-sdk'
import { getRespFail, getRespSuccess, RespSuccess, RespFail } from '../../resp'
import { API_SUCCESS_CODE } from '../data/dataCenter'
import { axiosGet } from '../utils/func'
import { getEnvironmentServer } from '../../environment'

const RootCA_URL = 'https://www.amazontrust.com/repository/AmazonRootCA1.pem'
const ThingsMqtt = getEnvironmentServer().mqtt

export function applyCert(thingName: string) {
    return new Promise<RespSuccess | RespFail>(async function (resolve, reject) {
        try {
            const iot = new AWS.Iot()

            // Create cert
            const certdata: any = await iot
                .createKeysAndCertificate({
                    setAsActive: true,
                })
                .promise()

            // attachPolicy
            await iot
                .attachPolicy({
                    policyName: 'myIotPolicy',
                    target: certdata.certificateArn,
                })
                .promise()

            // createThing
            const createThing = await iot
                .createThing({
                    thingName: thingName /* required */,
                    attributePayload: {
                        attributes: {
                            RegistrationWay: 'CVM',
                        },
                        merge: true || false,
                    },
                })
                .promise()

            // attachThing
            await iot
                .attachThingPrincipal({
                    principal: certdata.certificateArn /* required */,
                    thingName: thingName /* required */,
                })
                .promise()

            // addThingGroup
            await iot
                .addThingToThingGroup({
                    overrideDynamicGroups: true,
                    thingArn: createThing.thingArn,
                    thingGroupArn: ThingsMqtt.thingGroupArn + ThingsMqtt.ThingGroupName,
                    thingGroupName: ThingsMqtt.ThingGroupName,
                    thingName: thingName,
                })
                .promise()

            certdata.RootCA = await axiosGet({ url: RootCA_URL })
            console.log('🚀 ~ file: index.ts:65 ~ certdata:', certdata)
            resolve(
                getRespSuccess({
                    data: JSON.stringify(certdata),
                    code: API_SUCCESS_CODE.API_SUCCESS,
                }),
            )
        } catch (error) {
            console.log('applycert err: ', error)
            resolve(getRespFail({ error: String(error) }))
        }
    })
}
