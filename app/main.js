/*
 * @Author: Leat
 * @Date: 2018-01-08 14:43:50
 * @Last Modified by: Leat
 * @Last Modified time: 2018-01-08 16:36:48
 */
const adb = require('adbkit')
const client = adb.createClient()
const fs = require('fs')
const PNG = require('pngjs').PNG
const handleImageData = require('./handleImageData')


function swipe(device, len) {
  const time = ~~(len * 1.38)
  return client.shell(device.id, `input swipe ${randomSite()} ${randomSite()} ${randomSite()} ${randomSite()} ${time}`)
}

function randomSite() {
  return 30 + ~~(Math.random() * 20)
}

// 截屏 resolve时生成图片到parse
async function screencap(path) {
  const [device] = await client.listDevices()
  const transfer = await client.screencap(device.id)
  await new Promise((resolve, reject) => {
    transfer.on('end', resolve)
    transfer.pipe(fs.createWriteStream(path))
  })
  return device
}

// 获取棋子和目标位置的距离
async function getSite(path) {
  return new Promise(resolve => {
    const img = fs.createReadStream(path)
      .pipe(new PNG({
        filterType: 4
      }))
      .on('parsed', function () {
        const len = handleImageData(this, this.data)
        this.pack().pipe(fs.createWriteStream(path))
        resolve(len)
      })
  })
}

let cnt = 0
let path, len, device

async function test() {
  while(1) {
    path = `./static/test${cnt}.png`
    device = await screencap(path)
    len = await getSite(path)
    // console.log(len)
    await swipe(device, len)
    await sleep(3000)
    ++cnt
    // if (cnt > 10) return
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

test()