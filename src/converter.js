const ffmpeg = require('fluent-ffmpeg')
const utils = require('@/lib/utils')

module.exports = async (ffmpegPath, input, output) => {
  ffmpeg.setFfmpegPath(ffmpegPath)

  utils.memoryUsage('converter')

  console.log('input', input)
  return new Promise((resolve, reject) => {
    ffmpeg({ source: input })
      .addOutputOptions([
        '-c:v libx264',
        '-filter:v fps=15',
        '-c:a copy'
      ])
      .outputFormat('mp4')
      .output(output)
      .on('progress', ({ percent }) => {
        if (process.env.NODE_ENV === 'development') {
          percent = Math.round(percent)
          if (percent % 3 === 0) console.log(`Current process progress ${percent}%`)
        }
      })
      .on('end', () => resolve())
      .on('error', err => reject(err))
      .run()
  })
}
