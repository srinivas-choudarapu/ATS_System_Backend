const { S3Client } = require("@aws-sdk/client-s3");

const required = ["AWS_REGION", "AWS_ACCESS_KEY", "AWS_SECRET_KEY", "AWS_BUCKET_NAME"];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  throw new Error("Missing env vars: " + missing.join(", "));
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = s3;