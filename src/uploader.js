const { S3 } = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')

module.exports = async file => {
  if (!fs.existsSync(file)) return

  const client = new S3({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    endpoint: process.env.AWS_ENDPOINT
  })

  return client.putObject({
    Key: process.env.NODE_ENV === 'development' ? `development/${path.basename(file)}` : `videos/${path.basename(file)}`,
    Body: fs.createReadStream(file),
    Bucket: process.env.AWS_BUCKET
  })
    .catch(e => console.error('s3', e))
}
