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
                url: 'https://9w88ibphh6.execute-api.ap-northeast-2.amazonaws.com/dev/',
                description: 'Development server',
            },
        ],
        userPoolId: 'ap-northeast-2_j96syhJCn', //'ap-northeast-2_0CBUImR4l',
        authUrl: `https://ecoeats.auth.${EnvironmentRegion.Korea}.amazoncognito.com/login`,
        redirectUrl:
            'https://9w88ibphh6.execute-api.ap-northeast-2.amazonaws.com/dev/api-docs/oauth2-redirect.html',
        clientId: '6b4rl4hjbpp2r787vua0tesjjg',
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
