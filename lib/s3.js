const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3 = new S3Client({
  endpoint: process.env.ACECLOUD_S3_ENDPOINT,
  region: process.env.ACECLOUD_S3_REGION || 'ap-south-noi-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.ACECLOUD_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.ACECLOUD_S3_SECRET_ACCESS_KEY,
  },
});

// Generates a fresh, time-limited link for one object. Default: 6 hours,
// long enough to watch a full episode without the link dying mid-way.
async function getStreamUrl(objectKey, expiresInSeconds = 6 * 60 * 60) {
  const command = new GetObjectCommand({
    Bucket: process.env.ACECLOUD_S3_BUCKET,
    Key: objectKey,
  });
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });
}

module.exports = { getStreamUrl };
