const { SignatureV4 } = require('@smithy/signature-v4');
const { HttpRequest } = require('@smithy/protocol-http');
const { Hash } = require('@smithy/hash-node');

const endpoint = new URL((process.env.ACECLOUD_S3_ENDPOINT || 'https://s3-noi.aces3.ai').trim());
const bucket = (process.env.ACECLOUD_S3_BUCKET || '').trim();

const accessKeyId = (process.env.ACECLOUD_S3_ACCESS_KEY_ID || '').trim();
const secretAccessKey = (process.env.ACECLOUD_S3_SECRET_ACCESS_KEY || '').trim();

console.log('[s3 config]', {
  endpointHost: endpoint.hostname,
  region: (process.env.ACECLOUD_S3_REGION || 'ap-south-noi-1').trim(),
  bucket,
  accessKeyId,
  secretKeyLength: secretAccessKey.length,
  secretKeyPreview: secretAccessKey ? `${secretAccessKey.slice(0, 3)}...${secretAccessKey.slice(-3)}` : '(empty)',
});

const signer = new SignatureV4({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: (process.env.ACECLOUD_S3_REGION || 'ap-south-noi-1').trim(),
  service: 's3',
  sha256: Hash.bind(null, 'sha256'),
  uriEscapePath: false,
});

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
