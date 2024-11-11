import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { decodeJwt } from './auth'
import { specs, swaggerOption } from './module/swagger'
import { RespSuccess } from './resp'
import { requestLoger } from './module/utils/loger'

//------  routers ------//
import user from './routes/user'

const app = express()
app.use(cors())
app.use(express.json())
// app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    '/api-docs',
    (req, res, next) => {
        if (req.originalUrl == '/api-docs') return res.redirect('api-docs/')
        next()
    },
    swaggerUi.serve,
    swaggerUi.setup(specs, swaggerOption),
)

// app.use('/stores', stores) // Public endpoint
// Public route example
app.use('/public', (req, res) => {
    res.json({ message: 'This is a public endpoint and does not require authentication.' })
})

// QR route (assuming it doesn't need authentication)

// Authentication middleware
app.use((req, res, next) => {
    // Skip authentication for specific routes
    if (req.path.startsWith('/public') || req.path.startsWith('/api-docs')) {
        return next()
    }

    const accessToken: string = req.headers.authorization!
    const time: any = req.headers.t!
    decodeJwt(accessToken, time)
        .then((result: RespSuccess) => {
            res.locals.user = result.data.userName
            next()
        })
        .catch(error => {
            console.log('decodeJwt err: ', error)
            res.status(401).json(error)
        })
})

app.use(requestLoger)
app.use('/user', user)

export default app
