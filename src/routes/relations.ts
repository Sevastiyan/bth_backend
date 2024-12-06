import * as express from 'express'
import { relation } from '../module/apis'
import { checkDevice, checkUser } from '../module/permission'
import { USER_PLACE_PERM } from '../module/data/dataCenter'

/**
 *  @swagger
 *  tags:
 *    name: Relation
 *    description: API to manage Relation
 */
const router = express.Router()

/**
 *  @swagger
 *  paths:
 *   /relation/query/user:
 *     get:
 *       summary: 특정 유저가 소유한 디바이스 리스트 수집
 *       tags: [Relation]
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
router.get('/query/user', (req, res) => {
    const authId = res.locals.user
    const u_id = req.query.u_id as string
    checkUser({ authUId: authId, reqId: u_id })
        .then(res => {
            return relation.queryByIdAll(u_id)
        })
        .then(data => {
            res.status(200).json(data)
        })
        .catch(e => {
            console.log('/query/user error: ', e)
            res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /relation/query/device:
 *     get:
 *       summary: 특정 디바이스를 소유한 유저 리스트 수집
 *       tags: [Relation]
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
router.get('/query/device', (req, res) => {
    const authId = res.locals.user
    const d_id = req.query.d_id as string
    checkDevice({ authUId: authId, reqId: d_id })
        .then(res => {
            return relation.queryByDIdAll(d_id)
        })
        .then(data => {
            res.status(200).json(data)
        })
        .catch(e => {
            console.log('/query/user error: ', e)
            res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /relation/get:
 *     get:
 *       summary: 특정 유저의 특정 디바이스에 대한 권한 확인
 *       tags: [Relation]
 *       parameters:
 *         - in: query
 *           name: u_id
 *           schema:
 *             type: string
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
router.get('/get', (req, res) => {
    const authId = res.locals.user
    const u_id = req.query.u_id as string
    const d_id = req.query.d_id as string
    checkDevice({ authUId: authId, reqId: d_id })
        .then(res => {
            return relation.readData(u_id, d_id)
        })
        .then(data => {
            res.status(200).json(data)
        })
        .catch(e => {
            console.log('/relation/get error: ', e)
            res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /relation/create:
 *     post:
 *       summary: 특정 디바이스에 대한 특정 유저의 권한 부여
 *       tags: [Relation]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 u_id:
 *                   type: string
 *                 d_id:
 *                   type: string
 *               example:
 *                 u_id: userId
 *                 d_id: deviceId
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
router.post('/create', (req, res) => {
    const authId = res.locals.user
    const { u_id, d_id } = req.body
    checkDevice({ authUId: authId, reqId: d_id, shouldMaster: true })
        .then(res => {
            return relation.createData({ u_id, d_id, perm: USER_PLACE_PERM.user })
        })
        .then(data => {
            return res.status(200).json(data)
        })
        .catch(e => {
            console.log('/user/create error: ', e)
            res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /relation/update:
 *     post:
 *       summary: 특정 디바이스에 대한 특정 유저의 권한 변경
 *       tags: [Relation]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 u_id:
 *                   type: string
 *                 d_id:
 *                   type: string
 *                 perm:
 *                   type: string
 *               example:
 *                 u_id: userId
 *                 d_id: deviceId
 *                 perm: 1
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
    const authId = res.locals.user
    const param = req.body
    const { u_id, d_id, perm } = param
    checkDevice({ authUId: authId, reqId: d_id, shouldMaster: true })
        .then(res => {
            return relation.updateData(u_id, d_id, { perm })
        })
        .then(data => {
            return res.status(200).json(data)
        })
        .catch(e => {
            console.log('/user/update error: ', e)
            res.status(404).json(e)
        })
})

/**
 *  @swagger
 *  paths:
 *   /relation/delete:
 *     delete:
 *       summary: 특정 디바이스에 대한 특정 유저의 권한 삭제
 *       tags: [Relation]
 *       parameters:
 *         - in: query
 *           name: u_id
 *           schema:
 *             type: string
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
router.delete('/delete', (req, res) => {
    const authId = res.locals.user
    const u_id = req.query.u_id as string
    const d_id = req.query.d_id as string
    checkDevice({ authUId: authId, reqId: d_id, shouldMaster: true })
        .then(res => {
            return relation.deleteData(u_id, d_id)
        })
        .then(data => {
            return res.status(200).json(data)
        })
        .catch(e => {
            console.log('/user/delete error: ', e)
            res.status(404).json(e)
        })
})

export default router
