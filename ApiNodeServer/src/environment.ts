export enum EnvironmentStage {
    Dev = 'dev',
    Prod = 'prod',
}

export enum EnvironmentRegion {
    Korea = 'ap-northeast-2',
}

export const EnvironmentServers = {
    Korea: {
        baseUrls: [
            {
                url: 'https://klmujas3kk.execute-api.ap-northeast-2.amazonaws.com/dev/',
                description: 'Development server',
            },
        ],
        userPoolId: 'ap-northeast-2_6ex76R3yA', // done
        authUrl: `https://ap-northeast-26ex76r3ya.auth.${EnvironmentRegion.Korea}.amazoncognito.com/login`,
        redirectUrl: 'https://klmujas3kk.execute-api.ap-northeast-2.amazonaws.com/dev/api-docs/oauth2-redirect.html',
        // redirectUrl: 'https://d84l1y8p4kdic.cloudfront.net',
        clientId: '7qv7949ikd698mttf7507hqlme', // done
        mqtt: {
            // done
            endpoint: 'a36mjd5svzxgla-ats.iot.ap-northeast-2.amazonaws.com',
            thingGroupArn: 'arn:aws:iot:ap-northeast-2:515966534149:thinggroup/', //! create Thing Group change for CA
            ThingGroupName: 'BTH_HUM_V4_ESP32',
        },
    },
}

export function getEnvironmentServer() {
    return EnvironmentServers.Korea
}

export function getEnvironmentStage() {
    return process.env.STAGE ?? EnvironmentStage.Dev
}

export function getEnvironmentRegion() {
    return process.env.REGION ?? EnvironmentRegion.Korea
}
