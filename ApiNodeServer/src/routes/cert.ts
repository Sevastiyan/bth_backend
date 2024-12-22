import * as express from 'express'
import * as apis from '../module/apis'
import { checkFromDevice } from '../module/permission'

const router = express.Router()

router.get('/get', (req, res) => {
    const authId = res.locals.user
    const thingName = req.query.thingName as string
    checkFromDevice({ authUId: authId })
        // .then((res) => {
        //     return apis.cert.activateDeviceCert(thingName);
        // })
        .then(res => {
            return apis.cert.getCertInfo(thingName)
        })
        .then(data => {
            return res.status(200).json(data)
        })
        .catch(e => {
            console.log('/cert/get error: ', e)
            return res.status(404).json(e)
        })
})

export default router
