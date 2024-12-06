import * as express from 'express'
import { user, relation } from '../module/apis'
import { checkUser } from '../module/permission'

/**
 *  @swagger
 *  tags:
 *    name: User
 *    description: API to manage User
 */
const router = express.Router()

/**
 *  @swagger
 *  paths:
 *   /user/create:
 *     post:
 *       summary: Create a user to the DataTable (Note that the user that is used to login is through Cognito Not DynamoDB)
 *       tags: [User]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 item:
 *                   type: object
 *               example:
 *                 item:
 *                   id: userId
 *                   name: testName
 *                   lastName: testLastName
 *                   email: testEmail
 *                   age: 20
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
router.post('/create', async (req, res) => {
    const authId = res.locals.user
    const { item } = req.body
    const { id } = item

    try {
        item['id'] = authId

        console.log(item)
        const apiResult = await user.createData(item)
        res.status(200).json(apiResult)
    } catch (error) {
        console.log('/create error, Failed to create item')
        res.status(401).json(error)
    }

    // checkUser({ authUId: authId, reqId: id })
    //     .then(res => {
    //         return user.createData(item)
    //     })
    //     .then(data => {
    //         return res.status(200).json(data)
    //     })
    //     .catch(e => {
    //         console.log('/user/create error: ', e)
    //         return res.status(404).json(e)
    //     })
})

/**
 *  @swagger
 *  paths:
 *   /user/get:
 *     get:
 *       summary: Receive the summary of the user that is logged in (prevents access to other users)
 *       tags: [User]
 *       parameters:
 *         - in: query
 *           name: id
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
router.get('/get', (req, res) => {
    const authId = res.locals.user
    const id = req.query.id as string
    checkUser({ authUId: authId, reqId: id })
        .then(res => {
            return user.readData(id)
        })
        .then(data => {
            res.status(200).json(data)
        })
        .catch(e => {
            console.log('/user/get/:id error: ', e)
            return res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /user/update:
 *     post:
 *       summary: Update user information
 *       tags: [User]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 item:
 *                   type: object
 *               example:
 *                 id: userId
 *                 item:
 *                   name: testName
 *                   lastName: testLastName
 *                   age: 20
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
router.post('/update', (req, res) => {
    const param = req.body
    const authId = res.locals.user
    const { id, item } = param
    checkUser({ authUId: authId, reqId: id })
        .then(res => {
            return user.updateData(id, item)
        })
        .then(data => {
            return res.status(200).json(data)
        })
        .catch(e => {
            console.log('/user/update error: ', e)
            return res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /user/get/device:
 *     get:
 *       summary: 유저데이터 수집
 *       tags: [User]
 *       parameters:
 *         - in: query
 *           name: id
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
router.get('/get/device', async (req, res) => {
    const authId = res.locals.user
    const id = req.query.id as string
    try {
        await checkUser({ authUId: authId, reqId: id })
        const apiResult = await relation.queryByIdAll(id)
        res.status(200).json(apiResult)
    } catch (error) {
        console.log('Permission denied, need admin access')
        res.status(401).json(error)
    }
})

/**
 *  @swagger
 *  paths:
 *   /user/delete:
 *     delete:
 *       summary: Delete User
 *       tags: [User]
 *       parameters:
 *         - in: query
 *           name: id
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
router.delete('/delete', (req, res) => {
    const authId = res.locals.user
    const id = req.query.id as string
    checkUser({ authUId: authId, reqId: id })
        .then(res => {
            return user.deleteData(id)
        })
        .then(message => {
            return res.status(200).json(message)
        })
        .catch(e => {
            console.log('/user/delete error: ', e)
            return res.status(404).json(e)
        })
})

export default router
