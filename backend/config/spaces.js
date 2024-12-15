// src/config/spaces.js
const { S3 } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
require("dotenv").config();

// Configure the S3 client for Digital Ocean Spaces
const s3Client = new S3({
  endpoint: process.env.SPACES_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  },
  forcePathStyle: false,
});

// Configure multer for Digital Ocean Spaces
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.SPACES_BUCKET,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-");
      cb(null, `uploads/${uniqueSuffix}-${cleanFileName}`);
    },
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
  }),
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5000000,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png, gif) are allowed!"));
  },
});

// Function to delete file from Spaces
const deleteFile = async (fileKey) => {
  try {
    await s3Client.deleteObject({
      Bucket: process.env.SPACES_BUCKET,
      Key: fileKey,
    });
    return true;
  } catch (error) {
    console.error("Error deleting file from Spaces:", error);
    throw error;
  }
};

// Function to get public URL for a file
const getFileUrl = (fileKey) => {
  return `${process.env.SPACES_URL}/${fileKey}`;
};

// Helper to extract file key from full URL
const getFileKeyFromUrl = (url) => {
  if (!url) return null;
  const urlObj = new URL(url);
  return urlObj.pathname.startsWith("/")
    ? urlObj.pathname.slice(1)
    : urlObj.pathname;
};

module.exports = {
  upload,
  deleteFile,
  s3Client,
  getFileUrl,
  getFileKeyFromUrl,
};
