const glob = require('glob')
const fs = require('fs')
const utils = require('@/lib/utils')
const uploadToStorage = require('./uploader')
const converter = require('./converter')

async function cleanUpFiles (input, output) {
  try {
    const idxFile = input.replace(/\.dav/, '.idx')

    await fs.promises.unlink(input)
    if (fs.existsSync(idxFile)) await fs.promises.unlink(idxFile)
    if (fs.existsSync(output)) await fs.promises.unlink(output)
  } catch (e) {
    console.error(e)
  }
}

module.exports = async (ffmpegPath, FTP_FOLDER_PATH) => {
  const processing = async () => {
    utils.memoryUsage('processing start')
    await new Promise(resolve => {
      glob(`${FTP_FOLDER_PATH}/**/**.dav`, async (err, files) => {
        if (err) console.error('Glob err', err)

        if (files.length) {
          for (const input of files) {
            try {
              await utils.sleep(500)
              if (!fs.statSync(input).size) {
                await cleanUpFiles(input)
                continue
              }

              const outputFileName = utils.renameFile(input)

              await converter(ffmpegPath, input, outputFileName)

              if (!fs.existsSync(input) || !fs.existsSync(outputFileName)) resolve()

              await uploadToStorage(outputFileName)

              await cleanUpFiles(input, outputFileName)
            } catch (e) {
              console.error(e)
            }
          }
          resolve()
        } else
          await utils.exponentialBackoff(processing, 2)
      })
    })
    await processing()
  }

  return processing()
}
