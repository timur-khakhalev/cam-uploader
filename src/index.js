require('dotenv').config()
require('module-alias/register')

const utils = require('@/lib/utils')
const path = require('path')
const fs = require('fs')

const processor = require('./processor')

const FTP_FOLDER_PATH = process.env.FTP_FOLDER
const OUTPUT_FOLDER_PATH = process.env.OUTPUT_FOLDER

const mainThread = async () => {
  const ffmpegPath = path.join(__dirname, 'lib/ffmpeg')

  if (!fs.existsSync(OUTPUT_FOLDER_PATH))
    fs.mkdirSync(OUTPUT_FOLDER_PATH)

  if (!fs.existsSync(FTP_FOLDER_PATH))
    fs.mkdirSync(FTP_FOLDER_PATH)

  await utils.downloadFfmpeg(ffmpegPath)

  utils.memoryUsage('startup')
  await utils.cleanEmptyDirectories(FTP_FOLDER_PATH)

  setInterval(async () => await utils.cleanEmptyDirectories(FTP_FOLDER_PATH), 1000 * 60 * 60 * 4)

  await processor(ffmpegPath, FTP_FOLDER_PATH)
}

mainThread().catch(e => console.error(e))
