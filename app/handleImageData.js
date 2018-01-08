/*
 * @Author: Leat
 * @Date: 2018-01-08 14:48:04
 * @Last Modified by: Leat
 * @Last Modified time: 2018-01-08 16:41:03
 */

const pieceRed = 43
const pieceGreen = 43
const pieceBlue = 73
const MAX_PIECE_WIDTH = 200
const PIECE_DIFF_CUT = 50
const BCK_DIFF_CUT = 45
const CENTER_X_DISTANCE = 50
const PLATFORM_WIDTH_CUT = 200

let imgWidth, imgHeight, imgData, pieceCenter, colorArr

function handleImageData(imagedata, data) {
  imgWidth = imagedata.width
  imgHeight = imagedata.height
  colorArr = data
  const [x] = pieceCenter = drawPieceBoundary()
  const vertex = getVertex(x < imgWidth / 2 ? imgWidth / 2 : 0, x)
  const platformCenter = drawPlatformBoundary(vertex, x)
  setBigPixel(pieceCenter)
  setBigPixel(platformCenter)
  return Math.sqrt((pieceCenter[0] - platformCenter[0]) ** 2 + (pieceCenter[1] - platformCenter[1]) ** 2)
}

const PIXEL_CUT = 5

function setBigPixel([x, y]) {
  for (let i = x - PIXEL_CUT; i <= x + PIXEL_CUT; i++) {
    for (let j = y - PIXEL_CUT; j <= y + PIXEL_CUT; j++) {
      setPixel(i, j)
    }
  }
}

function setPixel(i, j) {
  const redIdx = (j * imgWidth + i) * 4
  colorArr[redIdx] = colorArr[redIdx + 1] = colorArr[redIdx + 2] = 0
}

function drawPlatformBoundary([vertexX, vertexY], pieceX) {
  const YE = Math.floor(imgHeight / 3 * 2)
  let j, minLeft, maxRight, l, r, cnt, lp, rp, ll, lr
  l = r = minLeft = maxRight = vertexX
  cnt = 0
  for (j = vertexY + 1; j < YE; j++) {
    lp = rp = false
    while (1) {
      --l
      if (!diffColor(getColor(l, 0), getColor(l, j))) {
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
      if (!diffColor(getColor(r, 0), getColor(r, j))) {
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

function getVertex(XS, centerX) {
  const XE = Math.floor(XS + imgWidth / 2)
  const YS = Math.floor(imgHeight / 3)
  const YE = Math.floor(imgHeight / 3 * 2)
  let i, j, k, bck, vertexLeft, vertexRight, vertexTop, vertexX
  for (j = YS; j < YE; j++) {
    for (i = XS; i < XE; i++) {
      bck = getColor(i, 0)
      if (Math.abs(i - centerX) < CENTER_X_DISTANCE) continue
      if (diffColor(bck, getColor(i, j))) {
        vertexRight = vertexLeft = i
        vertexTop = j

        for (k = i + 1; k < XE; k++) {
          if (!diffColor(bck, getColor(k, j))) {
            vertexRight = k - 1
            break
          }
        }
        vertexX = Math.floor((vertexLeft + vertexRight) / 2)
        return [vertexX, vertexTop]
      }
    }
  }
  throw '没找到'
}

function drawPieceBoundary() {
  let i, j
  const XS = Math.floor(imgWidth / 5)
  const XE = Math.floor(imgWidth / 5 * 4)
  const YS = Math.floor(imgHeight / 2)
  const YE = Math.floor(imgHeight / 3 * 2)
  let pieceLeft, pieceRight, color
  for (i = XS; i < XE; i++) {
    for (j = YS; j < YE; j++) {
      color = getColor(i, j)
      if (isToken(color)) {
        pieceLeft = i
        pieceRight = getPieceRight(j, i)
        if (!pieceRight) continue
        // if (pieceRight - pieceLeft < 30) continue
        const center = [Math.floor((pieceLeft + pieceRight) / 2), j]
        // drawPixel(colorArr, center[1], center[0])
        // drawElImg()
        return center
      }
    }
  }
}

function getPieceRight(j, left) {
  let color, i
  for (i = MAX_PIECE_WIDTH + left; i > left; i--) {
    color = getColor(i, j)
    if (isToken(color)) return i
  }
}

function isToken(color) {
  return Math.abs(color.red - pieceRed) +
    Math.abs(color.green - pieceGreen) +
    Math.abs(color.blue - pieceBlue) < PIECE_DIFF_CUT
}

function getColor(i, j) {
  const redIdx = (j * imgWidth + i) * 4
  return {
    red: colorArr[redIdx],
    green: colorArr[redIdx + 1],
    blue: colorArr[redIdx + 2]
  }
}

function diffColor(color1, color2) {
  return Math.abs(color1.red - color2.red) +
    Math.abs(color1.green - color2.green) +
    Math.abs(color1.blue - color2.blue) > BCK_DIFF_CUT
}




module.exports = handleImageData