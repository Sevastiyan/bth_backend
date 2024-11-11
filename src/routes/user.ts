import * as express from 'express'
import { user } from '../module/apis'
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
 *   /user/update/favorite:
 *     post:
 *       summary: Update user favorite store
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
 *                   store_id: storeId
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

router.post('/update/favorite', async (req, res) => {
    const authId = res.locals.user
    const { id, item } = req.body
    console.log('Updating favorite store: ', item)
    try {
        await checkUser({ authUId: authId, reqId: id })
        const request: any = await user.readData(id)

        if (!request?.data?.length) {
            return res.status(404).json({ error: 'No user found in the database' })
        }

        const requestUser = request.data
        console.log('User Found: ', requestUser)

        if (item.store_id) {
            if (!requestUser.favoriteStores) {
                requestUser.favoriteStores = []
            }
            requestUser.favoriteStores.push(item.store_id)
        }

        console.log('User Found: ', requestUser)
        await user.updateData(id, { favoriteStores: requestUser.favoriteStores })
        res.status(200).json(requestUser)
    } catch (error) {
        console.log('/create error, Failed to create item')
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
