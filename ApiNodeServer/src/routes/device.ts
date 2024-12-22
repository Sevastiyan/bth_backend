import * as express from 'express'
import { device, deviceLogTable, cert } from '../module/apis'
import * as mqtt from '../module/mqtt'
import { checkDevice, checkFromServer, checkUser } from '../module/permission'
import { removeRelations } from '../module/utils/sweeper'
import * as firmware from '../module/data/Firmware'
import { RespSuccess } from '../resp'

/**
 *  @swagger
 *  tags:
 *    name: Device
 *    description: API to manage Device
 */
const router = express.Router()

/**
 *  @swagger
 *  paths:
 *   /device/query:
 *     get:
 *       summary: 디바이스 리스트 수집
 *       tags: [Device]
 *       parameters:
 *         - in: query
 *           name: u_id
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiSuccess'
 *         "404":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiFail'
 */
router.get('/query', (req, res) => {
    const authId = res.locals.user
    const u_id = req.query.u_id as string
    checkUser({ authUId: authId, reqId: u_id })
        .then(res => {
            return device.queryDataByUid(u_id)
        })
        .then(data => {
            res.status(200).json(data)
        })
        .catch(e => {
            console.log('/device/queryList/:id error: ', e)
            res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /device/register:
 *     post:
 *       summary: 새로운 디바이스 등록
 *       tags: [Device]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 u_id:
 *                   type: string
 *                 item:
 *                   type: object
 *               example:
 *                 u_id: userId
 *                 item:
 *                   id: testId
 *                   name: testName
 *                   rev: 0
 *                   fv: 0
 *       responses:
 *         "200":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiSuccess'
 *         "404":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiFail'
 */
router.post('/register', async (req, res) => {
    const authId = res.locals.user
    const { u_id, item } = req.body
    const d_id = item.id
    try {
        await checkUser({ authUId: authId, reqId: u_id })
        // await deviceLogTable.createData({
        //     id: d_id,
        // }) // Create a record in deviceLogTable
        await removeRelations(d_id)
        await cert.activateDeviceCert(d_id)
        // Led and Manual should be on by default
        const result = device.registerDevice(u_id, {
            ...item,
            isLedOn: true,
            sleepInductionState: {
                ...item.sleepInductionState,
                ...item.apneaBuzzState,
                isManual: true,
            },
        })
        res.status(200).json(result)
    } catch (error) {
        console.log('/device/register error: ', error)
        res.status(404).json(error)
    }
})

/**
 *  @swagger
 *  paths:
 *   /device/get:
 *     get:
 *       summary: 특정 디바이스 정보 수집
 *       tags: [Device]
 *       parameters:
 *         - in: query
 *           name: d_id
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiSuccess'
 *         "404":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiFail'
 */
router.get('/get', async (req, res) => {
    const authId = res.locals.user
    const d_id = req.query.d_id as string

    try {
        await checkDevice({ authUId: authId, reqId: d_id })
        const data: any = await device.readData(d_id)
        const deviceObject: any = data.data
        const d_type = 1
        // Check for updates
        const canUpdate = firmware.getOtaStatus(d_type, deviceObject.rev, deviceObject.fv)

        const result = {
            ...data,
            isUpdated: canUpdate === 'cannotUpdate',
        }
        res.status(200).json(result)
    } catch (e) {
        console.log('/device/get/:id error: ', e)
        res.status(404).json(e)
    }
})

/**
 *  @swagger
 *  paths:
 *   /device/update:
 *     post:
 *       summary: Update device information
 *       tags: [Device]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 d_id:
 *                   type: string
 *                 item:
 *                   type: object
 *               example:
 *                 d_id: deviceId
 *                 item:
 *                   name: testName
 *                   rev: 0
 *                   fv: 0
 *       responses:
 *         "200":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiSuccess'
 *         "404":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiFail'
 */
router.post('/update', async (req, res) => {
    const param = req.body
    const authId = res.locals.user
    const { d_id, item } = param
    console.log('update item:', item)
    try {
        await checkDevice({ authUId: authId, reqId: d_id })
        console.log('check done:')
        const oldDevice = await device.readData(d_id)
        console.log('oldDevice:', oldDevice)
        let updatedDevice: any = await device.updateData(d_id, item)
        console.log('updated device:', updatedDevice)
        let deviceObject: any = updatedDevice.data

        // if updatedDevice.data does not include apneaBuzzState. make a second update with that.
        if (deviceObject.apneaBuzzState === undefined) {
            updatedDevice = await device.updateData(d_id, {
                ...updatedDevice.data,
            })
            deviceObject = updatedDevice.data
        }

        console.log('mqtt updated')

        res.status(200).json(updatedDevice)
    } catch (error) {
        console.log('/device/update error: ', error)
        res.status(404).json(error)
    }
})

/**
 *  @swagger
 *  paths:
 *   /device/unregister:
 *     delete:
 *       summary: 디바이스 삭제
 *       tags: [Device]
 *       parameters:
 *         - in: query
 *           name: d_id
 *           schema:
 *             type: string
 *       responses:
 *         "200":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiSuccess'
 *         "404":
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ApiFail'
 */
router.delete('/unregister', async (req, res) => {
    const authId = res.locals.user
    const d_id = req.query.d_id as string
    try {
        try {
            //? If request is from device (reset lambda)
            await checkFromServer({ authUId: authId })
            console.log('Remove Device From Server')
            const result = await removeRelations(d_id) //unregisterDevice in this function
            console.log(result)

            return res.status(200).json(result)
        } catch (e) {
            //? If request is from phone app
            await checkDevice({ authUId: authId, reqId: d_id })
            console.log('Remove Device From Phone')
            await mqtt.resetDevice(d_id)
            const result = await device.unregisterDevice(authId, d_id)
            return res.status(200).json(result)
        }
    } catch (error) {
        console.log('/device/unregister error: ', error)
        return res.status(404).json(error)
    }
})

export default router
