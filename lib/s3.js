const { SignatureV4 } = require('@smithy/signature-v4');
const { HttpRequest } = require('@smithy/protocol-http');
const { Hash } = require('@smithy/hash-node');

<<<<<<< HEAD
const endpoint = new URL(process.env.ACECLOUD_S3_ENDPOINT || 'https://s3-noi.aces3.ai');
const bucket = process.env.ACECLOUD_S3_BUCKET;

const signer = new SignatureV4({
=======
const s3 = new S3Client({
  endpoint: process.env.ACECLOUD_S3_ENDPOINT,
  region: process.env.ACECLOUD_S3_REGION || 'ap-south-noi-1',
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
>>>>>>> d84d47793c327ee052de52333ea616702e9a5207
  credentials: {
    accessKeyId: process.env.ACECLOUD_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.ACECLOUD_S3_SECRET_ACCESS_KEY,
  },
  region: process.env.ACECLOUD_S3_REGION || 'ap-south-noi-1',
  service: 's3',
  sha256: Hash.bind(null, 'sha256'),
});

<<<<<<< HEAD
// Signs a GET url by hand instead of using @aws-sdk/s3-request-presigner,
// because that S3-specific presigner always adds an
// "X-Amz-Content-Sha256=UNSIGNED-PAYLOAD" query parameter, and AceCloud's
// ActiveScale-based storage replies "501 Not Implemented" for that param.
// A plain SigV4 presign does not add it, and AceCloud accepts that fine.
=======
>>>>>>> d84d47793c327ee052de52333ea616702e9a5207
async function getStreamUrl(objectKey, expiresInSeconds = 6 * 60 * 60) {
  const path = `/${bucket}/${objectKey
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

  const request = new HttpRequest({
    method: 'GET',
    protocol: endpoint.protocol,
    hostname: endpoint.hostname,
    path,
    headers: {
      host: endpoint.hostname,
    },
  });

  const presigned = await signer.presign(request, {
    expiresIn: expiresInSeconds,
  });

  const query = Object.entries(presigned.query || {})
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return `${endpoint.protocol}//${endpoint.hostname}${presigned.path}?${query}`;
}

module.exports = { getStreamUrl };
