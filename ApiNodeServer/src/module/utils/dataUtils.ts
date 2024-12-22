const Base64 = require('Base64')

export function base64Encode(data: any) {
    let binary = ''
    const bytes = new Uint8Array(data)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return Base64.btoa(binary)
}

export function base64Decode(base64: string) {
    const str = base64.replace(/^\s+|\s+$/g, '')
    const raw = Base64.atob(str)
    const len = raw.length
    let bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = raw.charCodeAt(i)
    }
    return bytes
}

export function hexToBytes(hex: string) {
    let bytes: any = []
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16))
    }
    return bytes
}

export function bytesToHex(byteArray: any[]) {
    return Array.from(byteArray, function (byte: any) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2)
    }).join('')
}

export function intToBytes(i) {
    let result: any[4] = []
    result[0] = i >> 24
    result[1] = i >> 16
    result[2] = i >> 8
    result[3] = i /*>> 0*/
    return result
}

export function bytesToInt(array: any[4]) {
    return (
        array[array.length - 1] |
        (array[array.length - 2] << 8) |
        (array[array.length - 3] << 16) |
        (array[array.length - 4] << 24)
    )
}
