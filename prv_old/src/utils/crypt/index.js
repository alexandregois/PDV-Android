import CryptoJS from 'crypto-js'

export function encrypt (data, salt) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), salt).toString()
}

export function decrypt (data, salt) {
  return JSON.parse(CryptoJS.AES.decrypt(data, salt).toString(CryptoJS.enc.Utf8))
}
