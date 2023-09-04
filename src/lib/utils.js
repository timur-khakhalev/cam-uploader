const glob = require('glob')
const path = require('path')
const fs = require('fs')
const NodeCache = require('node-cache')
const ffbinaries = require('ffbinaries')

const cache = new NodeCache()

async function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function cleanEmptyDirectories (folder) {
  try {
    /*
   Remove old unfinished videos
   */
    glob(`${folder}/**/**.{*_,tmp}`, async (err, files) => {
      if (err) console.error(err)
      if (!files.length) return

      for (const file of files) {
        if (fs.existsSync(file)) {
          const birthtime = fs.statSync(file).birthtime
          const now = new Date()
          if (now - birthtime >= 1000 * 60 * 60) await fs.promises.unlink(file)
        }
      }
    })

    const isDir = fs.statSync(folder).isDirectory()
    if (!isDir)
      return

    let files = await fs.promises.readdir(folder)
    if (files.length > 0) {
      for (const file of files) {
        const fullPath = path.join(folder, file)

        await cleanEmptyDirectories(fullPath)
      }
      files = await fs.promises.readdir(folder)
    }

    if (!files.length) fs.rmdirSync(folder)
  } catch (e) {
    console.error(e)
  }
}

async function exponentialBackoff (func, initValue) {
  const exponentTTL = 30
  if (!cache.has('exponentialBackoffExponent')) {
    cache.set('exponentialBackoffExponent', 2, exponentTTL)
    await sleep(initValue * 1000)
    await func()
  } else {
    let exponent = cache.take('exponentialBackoffExponent')
    const secsToStart = initValue * 1000 * exponent
    console.log('Exponential Backoff. Function will start in next sec:', secsToStart / 1000)
    exponent = exponent * 2
    cache.set('exponentialBackoffExponent', exponent, exponentTTL)
    await sleep(secsToStart)
    await func()
  }
}

module.exports = {
  sleep,
  renameFile: file => {
    const createdAt = fs.statSync(file).birthtime.toLocaleDateString('ru-RU')
    const basename = process.env.NODE_ENV === 'development' ? path.basename(file).replace('dav', 'mp4') : path.basename(file).replace(/\[.*/g, '.mp4')
    return `${path.join(process.env.OUTPUT_FOLDER)}/${createdAt}@${basename}`
  },
  cleanEmptyDirectories,
  downloadFfmpeg: async ffmpegPath => {
    const exists = fs.existsSync(ffmpegPath)

    if (!exists) {
      return new Promise(resolve => {
        ffbinaries.downloadBinaries(['ffmpeg'], { destination: __dirname }, function () {
          console.log('Downloaded ffmpeg binaries to ' + ffmpegPath + '.')
          resolve()
        })
      })
    }
  },
  memoryUsage: event => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024
    console.log(`Event ${event}. The script uses approximately ${Math.round(used * 100) / 100} MB`)
  },
  exponentialBackoff
}
