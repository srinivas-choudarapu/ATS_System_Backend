const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");
const path = require("path");
require("dotenv").config(path.resolve(__dirname, "..", ".env"));

const getBucketName = () => {
  if (!process.env.AWS_BUCKET_NAME) throw new Error("AWS_BUCKET_NAME is missing");
  return process.env.AWS_BUCKET_NAME;
};

// 📤 Upload file to S3
const uploadToS3 = async (file) => {
  try {
    const bucket = getBucketName();
    const fileKey = Date.now() + "-" + file.originalname;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 3600 });

    return { fileUrl: signedUrl, fileKey };
  } catch (error) {
    console.error("S3 Upload Error:", {
      name: error.name,
      message: error.message,
      metadata: error.$metadata,
    });
    throw new Error("Failed to upload file: " + (error.message || "Unknown S3 error"));
  }
};


// 🗑 Delete file from S3
const deleteFromS3 = async (fileKey) => {
  try {
    const bucket = getBucketName();
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    await s3.send(command);

  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error("Failed to delete file");
  }
};


// 🔑 Extract key from URL (important for deletion)
const getKeyFromUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return "";

  try {
    const parsed = new URL(url);
    const bucket = process.env.AWS_BUCKET_NAME || "";

    // pathname has no query string
    // example: "/1774182099312-srinivasresume%20%283%29.pdf"
    let key = parsed.pathname.replace(/^\/+/, "");

    // if URL is path-style: /bucket-name/key
    if (bucket && key.startsWith(bucket + "/")) {
      key = key.slice(bucket.length + 1);
    }

    return decodeURIComponent(key);
  } catch {
    // fallback for malformed urls
    const raw = url.split(".amazonaws.com/")[1] || "";
    return decodeURIComponent(raw.split("?")[0]);
  }
};


module.exports = {
  uploadToS3,
  deleteFromS3,
  getKeyFromUrl
};