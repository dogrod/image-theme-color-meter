// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import tinycolor from 'tinycolor2'

type Data = {
  success: boolean
  message?: string
  data?: IColorEntity
}

interface IColorEntity {
  color: string
  isDark: boolean
}

export const config = {
  api: {
    bodyParser: false,
  },
}

import { createCanvas, loadImage } from 'canvas'

const getMostAppearingColor = (pixelData: Uint8ClampedArray) => {
  let colorShowTimeRecord: Record<string, number> = {}
  let rgbaStr = ''

  // Loop in RGBA order
  for (let i = 0; i < pixelData.length; i += 4) {
    // Drop A in RGBA
    const rgbColor = `${pixelData[i]},${pixelData[i + 1]},${pixelData[i + 2]}`

    if (colorShowTimeRecord[rgbColor]) {
      ++colorShowTimeRecord[rgbColor]
    } else {
      colorShowTimeRecord[rgbColor] = 1
    }
  }

  const colors = []

  for (let rgbColor in colorShowTimeRecord) {
    const count = colorShowTimeRecord[rgbColor]

    // Only take the pixel points that appear more than 100 times
    if (count > 100) {
      colors.push({
        color: `rgb(${rgbColor})`,
        rgb: rgbColor.split(','),
        count,
      })
    }
  }

  colors.sort((a, b) => {
    return b.count - a.count
  })

  const mostAppearingColor = colors[0]
  console.log(
    'The color that appears most often is: ',
    mostAppearingColor.color,
    'it appeared ',
    mostAppearingColor.count,
    'times',
  )

  return mostAppearingColor.color
}

const getImageThemeColorByPath = (imagePath: string): Promise<IColorEntity> => {
  return new Promise((resolve) => {
    loadImage(imagePath).then((image) => {
      console.log('Image has been successfully loaded from ', imagePath)

      const canvas = createCanvas(image.width, image.height)
      const context = canvas.getContext('2d')

      context.drawImage(image, 0, 0)

      // 获取像素数据
      let pixelData = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data

      const themeColor = getMostAppearingColor(pixelData)

      return resolve({
        color: themeColor,
        isDark: tinycolor(themeColor).isDark(),
      })
    })
  })
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm()
    form.parse(req, (err, fields, files) => {
      console.log(err, fields, files)

      const imageFile = files.image

      if (!Array.isArray(imageFile)) {
        getImageThemeColorByPath(imageFile.path).then((color) => {
          res.status(200).json({ success: true, data: color })
        })
      }
    })
  } else {
    res.status(400).json({ success: false, message: 'Only support POST' })
  }
}
