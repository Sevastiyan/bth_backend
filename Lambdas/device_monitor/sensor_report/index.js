const CryptoJS = require('crypto-js')
const serverMaterPermission = 'serverToServerToken'
const pk = 'aaC2H20lkVbQDfakxcrtNMQrd0FloLyw'
const AWS = require('aws-sdk')
AWS.config.region = process.env.REGION ?? 'ap-northeast-2'
const server = process.env.SERVER
process.stdout.setMaxListeners(20)
const Base64 = require('Base64')

exports.handler = async function (event, context, callback) {
  const eventText = JSON.stringify(event, null, 2)
  const json = JSON.parse(eventText)
  console.log('🚀 ~ Input:', json)

  const d_id = json.id
  if (json.sensor != null) {
    const { buffer } = json.sensor

    let payload = {
      id: id,
      data: translateData(buffer),
    }
    console.log('🚀 ~ lambda payload:', payload)

    const stage = process.env.STAGE ?? 'dev'
    const name = `${server}-${stage}-api`
    const path = '/logics/deviceReport'
    const timeStamp = String(Math.floor(Date.now() / 1000))
    const token = serverMaterPermission + timeStamp
    const hash = CryptoJS.HmacSHA256(token, pk).toString()

    try {
      console.log('Invoke Server for Peak Detect')
      await invokeServer(name, path, hash, timeStamp, payload) // sends a post request to the server
      await invokeLambda(`saveToDynamo-dev`, payload, true) // Can be saveToDynamo lambda above
      console.log('Done.')
    } catch (error) {
      console.log('api send error: ', error)
    }
  }
  context.succeed()
}

/* ------------------------------------------------------------------------------------ */
/*                                       Lambdas                                        */
/* ------------------------------------------------------------------------------------ */

function invokeLambda(funcName, payload, sync) {
  const lambda = new AWS.Lambda()

  const lambdaParam = {
    FunctionName: funcName,
    InvocationType: sync ? 'RequestResponse' : 'Event',
    Payload: JSON.stringify(payload),
  }

  return new Promise((resolve, reject) => {
    try {
      lambda.invoke(lambdaParam, (err, data) => {
        if (err) {
          console.log('invokeLambda error: ', err, err.stack)
          reject(err)
        } else {
          resolve(data)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

function invokeServer(name, path, hash, timeStamp, payload) {
  const lambda = new AWS.Lambda()
  const sendParams = {
    httpMethod: 'POST',
    path: path,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Authorization: hash,
      t: timeStamp,
    },
    body: JSON.stringify(payload),
    isBase64Encoded: false,
  }
  const lambdaParam = {
    FunctionName: name,
    InvocationType: 'Event',
    Payload: JSON.stringify(sendParams),
  }
  return new Promise((resolve, reject) => {
    try {
      lambda.invoke(lambdaParam, (err, data) => {
        if (err) {
          console.log('invokeLambda error: ', err, err.stack)
          reject(err)
        } else {
          resolve(data)
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

/* -------------------------------------- Decode -------------------------------------- */
function base64Decode(base64) {
  const str = base64.replace(/^\s+|\s+$/g, '')
  const raw = Base64.atob(str)
  const len = raw.length
  let bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = raw.charCodeAt(i)
  }
  return bytes
}

function translateData(buffer) {
  const decodedBytes = base64Decode(buffer)
  const adcList = [] // 16bit adc array
  for (let index = 0; index < decodedBytes.length; index = index + 2) {
    let value = (decodedBytes[index] << 8) | decodedBytes[index + 1]
    /**
     * @todo this functionality can change,
     */
    const uint16_int16_threshold = 32768
    const uint16_maximum = 65535
    if (value > uint16_int16_threshold) {
      value = value - uint16_maximum
    }
    adcList.push(value)
  }
  return adcList
}
