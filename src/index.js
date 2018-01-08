import { version } from "punycode";

/* eslint-disable */
const cvs = document.querySelector('#canvas')
const ctx = cvs.getContext('2d')
const imgsrc = '/static/2.png'

// const pieceColor = '#2b2b49'
const pieceRed = 43
const pieceGreen = 43
const pieceBlue = 73
const MAX_PIECE_WIDTH = 200
const PIECE_DIFF_CUT = 50
const BCK_DIFF_CUT = 50
const CENTER_X_DISTANCE = 50
const PLATFORM_WIDTH_CUT = 200
// const MIN_DEVIATION = 5

let imgWidth, imgHeight, imgData, pieceCenter
const img = new Image()
img.src = imgsrc

img.onload = function () {
  imgWidth = img.width
  imgHeight = img.height
  start()
}

function start() {
  cvs.width = imgWidth * 2.5
  cvs.height = imgHeight
  ctx.drawImage(img, 0, 0, imgWidth, imgHeight)
  const { data: imageData } = imgData = ctx.getImageData(0, 0, imgWidth, imgHeight)
  console.log(getColor(imageData, 0, 0))
  const [x] = pieceCenter = drawPieceBoundary(imageData)
  // console.log('pieceCenter', pieceCenter)
  const vertex = getVertex(imageData, x < imgWidth / 2 ? imgWidth / 2 : 0, x)
  const platformCenter = drawPlatformBoundary(imageData, vertex, x)
  drawPixel(imageData, platformCenter[1], platformCenter[0])
  drawElImg()
  ctx.beginPath()
  ctx.moveTo(...pieceCenter)
  ctx.lineTo(...platformCenter)
  ctx.stroke()
  console.dir(ctx)
  console.log(...pieceCenter)
  console.log(...platformCenter)
}

// async function test() {
//   const data = imgData.data
//   for (let i = 0; i < data.length; i += 4) {
//     data[i] = data[i + 1] = data[i + 2] = 0
//     await sleep(1000)
//     drawElImg()
//   }
// }

function drawPlatformBoundary(colorArr, [vertexX, vertexY], pieceX) {
  const YE = Math.floor(imgHeight / 3 * 2)
  let j, minLeft, maxRight, l, r, cnt, lp, rp, ll, lr
  l = r = minLeft = maxRight = vertexX
  cnt = 0
  for (j = vertexY + 1; j < YE; j++) {
    lp = rp = false
    while (1) {
      --l
      if (!diffColor(getColor(colorArr, 0, l), getColor(colorArr, j, l))) {
        // 是界线
        minLeft = ++l
        break
      }
      if (Math.abs(pieceX - l) <= PLATFORM_WIDTH_CUT) {
        minLeft = pieceX + PLATFORM_WIDTH_CUT
        lp = true
        break
      }
      if (l < 0) {
        throw 'left platformErr'
      }
    }
    while (1) {
      ++r
      if (!diffColor(getColor(colorArr, 0, r), getColor(colorArr, j, r))) {
        // 是界线
        maxRight = --r
        break
      }
      if (Math.abs(pieceX - r) <= PLATFORM_WIDTH_CUT) {
        maxRight = pieceX - PLATFORM_WIDTH_CUT
        rp = true
        break
      }
      if (r > imgWidth) {
        throw 'right platformErr'
      }
    }
    // drawPixel(colorArr, j, minLeft)
    // drawPixel(colorArr, j, maxRight)
    // drawElImg()
    if ((minLeft === ll && !lp) || (maxRight === lr && !rp)) {
      cnt++
      if (cnt >= 3) return [vertexX, j]
    } else {
      cnt = 0
    }
    ll = minLeft
    lr = maxRight
  }
}

function drawPieceBoundary(colorArr) {
  let i, j
  const XS = Math.floor(imgWidth / 5)
  const XE = Math.floor(imgWidth / 5 * 4)
  const YS = Math.floor(imgHeight / 2)
  const YE = Math.floor(imgHeight / 3 * 2)
  let pieceLeft, pieceRight, color
  for (i = XS; i < XE; i++) {
    for (j = YS; j < YE; j++) {
      color = getColor(colorArr, j, i)
      if (isToken(color)) {
        pieceLeft = i
        pieceRight = getPieceRight(colorArr, j, i)
        const center = [Math.floor((pieceLeft + pieceRight) / 2), j]
        drawPixel(colorArr, center[1], center[0])
        // drawElImg()
        return center
      }
    }
  }
}

function getVertex(colorArr, XS, centerX) {
  const XE = Math.floor(XS + imgWidth / 2)
  const YS = Math.floor(imgHeight / 3)
  const YE = Math.floor(imgHeight / 3 * 2)
  let i, j, k, bck, vertexLeft, vertexRight, vertexTop, vertexX
  for (j = YS; j < YE; j++) {
    for (i = XS; i < XE; i++) {
      bck = getColor(colorArr, 0, i)
      if (Math.abs(i - centerX) < CENTER_X_DISTANCE) continue
      if (diffColor(bck, getColor(colorArr, j, i))) {
        // 是顶点
        // console.log(i, j)
        // drawPixel(colorArr, vertexTop, vertexX)
        // drawElImg()
        vertexRight = vertexLeft = i
        vertexTop = j

        for (k = i + 1; k < XE; k++) {
          if (!diffColor(bck, getColor(colorArr, j, k))) {
            vertexRight = k - 1
            break
          }
        }
        vertexX = Math.floor((vertexLeft + vertexRight) / 2)
        // console.log(vertexRight)
        // drawPixel(colorArr, vertexTop, vertexX)
        // drawElImg()
        return [vertexX, vertexTop]
      }
    }
  }
  throw '没找到'
}

function diffColor(color1, color2) {
  return Math.abs(color1.red - color2.red) +
    Math.abs(color1.green - color2.green) +
    Math.abs(color1.blue - color2.blue) > BCK_DIFF_CUT
}

function getPieceRight(colorArr, j, left) {
  let color, i
  for (i = MAX_PIECE_WIDTH + left; i > left; i--) {
    color = getColor(colorArr, j, i)
    if (isToken(color)) return i
  }
  throw '没找到'
}

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms))
// }

function getColor(arr, j, i) {
  const redIdx = (j * imgWidth + i) * 4
  return {
    red: arr[redIdx],
    green: arr[redIdx + 1],
    blue: arr[redIdx + 2]
  }
}

function isToken(color) {
  return Math.abs(color.red - pieceRed) +
    Math.abs(color.green - pieceGreen) +
    Math.abs(color.blue - pieceBlue) < PIECE_DIFF_CUT
}

function drawPixel(arr, j, i) {
  const redIdx = (j * imgWidth + i) * 4
  arr[redIdx] = arr[redIdx + 2] = arr[redIdx + 1] = 0
}

function drawElImg(data = imgData) {
  ctx.putImageData(data, imgWidth + 20, 0)
}
