const crypto = require('crypto');

const endpoint = new URL((process.env.ACECLOUD_S3_ENDPOINT || 'https://s3-noi.aces3.ai').trim());
const bucket = (process.env.ACECLOUD_S3_BUCKET || '').trim();
const region = (process.env.ACECLOUD_S3_REGION || 'ap-south-noi-1').trim();
const accessKeyId = (process.env.ACECLOUD_S3_ACCESS_KEY_ID || '').trim();
const secretAccessKey = (process.env.ACECLOUD_S3_SECRET_ACCESS_KEY || '').trim();

function sha256hex(msg) {
  return crypto.createHash('sha256').update(msg, 'utf8').digest('hex');
}
function hmac(key, msg) {
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest();
}

function getStreamUrl(objectKey, expiresInSeconds = 6 * 60 * 60) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const canonicalUri = `/${bucket}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;

  const queryParams = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresInSeconds),
    'X-Amz-SignedHeaders': 'host',
  };

  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join('&');

  const canonicalHeaders = `host:${endpoint.hostname}\n`;
  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalRequest = ['GET', canonicalUri, canonicalQueryString, canonicalHeaders, 'host', payloadHash].join('\n');

  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, credentialScope, sha256hex(canonicalRequest)].join('\n');

  const kDate = hmac('AWS4' + secretAccessKey, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, 's3');
  const kSigning = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

  return `${endpoint.protocol}//${endpoint.hostname}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

module.exports = { getStreamUrl };
