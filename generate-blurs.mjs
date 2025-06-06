// generate-blurs.mjs
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const folders = ['concerts', 'events', 'misc']
const basePath = './public/photos'
const suffix = '-blur.jpg'

for (const folder of folders) {
  const dir = path.join(basePath, folder)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp'))

  for (const file of files) {
    const srcPath = path.join(dir, file)
    const blurName = file.replace('.webp', suffix)
    const blurPath = path.join(dir, blurName)

    if (fs.existsSync(blurPath)) continue

    await sharp(srcPath)
      .resize(20)
      .jpeg({ quality: 40 })
      .toFile(blurPath)

    console.log(`✅ ${blurName} gemaakt`)
  }
}