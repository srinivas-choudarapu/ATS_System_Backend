const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");
const path = require("path");
require("dotenv").config(path.resolve(__dirname, "..", ".env"));

const getBucketName = () => {
  if (!process.env.R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is missing");
  return process.env.R2_BUCKET_NAME;
};

// 📤 Upload file to R2
const uploadToS3 = async (file) => {
  try {
    const bucket = getBucketName();

    if (!file || !file.buffer) {
      throw new Error("File or buffer missing");
    }

    const fileKey = Date.now() + "-" + file.originalname;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3.send(command);

    // ✅ For R2 we use a public domain to serve files
    // You should add R2_PUBLIC_URL in your .env (e.g. https://pub-xxxxxx.r2.dev)
    const publicDomain = process.env.R2_PUBLIC_URL;
    if (!publicDomain) throw new Error("R2_PUBLIC_URL is missing from env. Please provide your R2 public bucket URL.");

    // remove trailing slash if any
    const baseUrl = publicDomain.replace(/\/$/, "");
    const publicUrl = `${baseUrl}/${fileKey}`;

    return { fileUrl: publicUrl, fileKey };

  } catch (error) {
    console.error("R2 Upload Error FULL:", error);
    throw new Error("Failed to upload file: " + error.message);
  }
};


// 🗑 Delete file from R2
const deleteFromS3 = async (fileKey) => {
  try {
    const bucket = getBucketName();
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: fileKey,
    });

    await s3.send(command);

  } catch (error) {
    console.error("R2 Delete Error:", error);
    throw new Error("Failed to delete file");
  }
};


// 🔑 Extract key from URL (important for deletion)
const getKeyFromUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) return "";

  try {
    const parsed = new URL(url);
    // For R2 public URLs, the key is usually the pathname itself
    // e.g., https://pub-12345.r2.dev/163212345-resume.pdf -> 163212345-resume.pdf
    let key = parsed.pathname.replace(/^\/+/, "");
    
    return decodeURIComponent(key);
  } catch {
    // fallback for malformed urls
    const raw = url.split("/").pop() || "";
    return decodeURIComponent(raw.split("?")[0]);
  }
};


module.exports = {
  uploadToS3,
  deleteFromS3,
  getKeyFromUrl
};