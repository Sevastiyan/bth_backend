import swaggerJsdoc from 'swagger-jsdoc'
import { getEnvironmentServer, getEnvironmentRegion } from '../environment'

const region = getEnvironmentRegion()
const myServer = getEnvironmentServer()

const options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        components: {
            securitySchemes: {
                oAuth2: {
                    type: 'oauth2',
                    // description: "For more information, see https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html",
                    description: `clientId is [${myServer.clientId}]`,
                    flows: {
                        implicit: {
                            authorizationUrl: myServer.authUrl,
                            scopes: {
                                openid: 'openid token',
                            },
                        },
                    },
                },
            },
            schemas: {
                ApiSuccess: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'object',
                        },
                        code: {
                            type: 'integer',
                        },
                        msg: {
                            type: 'string',
                        },
                    },
                },
                ApiFail: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                        },
                        code: {
                            type: 'integer',
                        },
                        msg: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        security: [
            {
                oAuth2: ['openid'],
            },
        ],
        info: {
            title: '[EcoEats] Official API Documentation',
            version: '1.0.0',
            description: 'This document defines the API related to ECO_EATS.',
        },
        contact: {
            name: 'EcoEats-API',
            email: 'contact@ecoeats.com',
        },
        servers: [...myServer.baseUrls],
    },
    apis: ['./src/module/dataBase/*.js', './src/routes/*.js'],
}

export const swaggerOption = {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'EcoEats-API',
    swaggerOptions: {
        oauth2RedirectUrl: myServer.redirectUrl,
    },
}

export const specs = swaggerJsdoc(options)
