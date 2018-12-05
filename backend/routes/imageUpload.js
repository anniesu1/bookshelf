// Import frameworks
const multer = require('multer');
const AWS = require('aws-sdk');
const express = require('express');
const router = express.Router();
const hashGenerator = require('random-hash');

// Amazon s3 config
const s3 = new AWS.S3();
AWS.config.update(
  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    subregion: process.env.AWS_REGION,
  });

// Multer config memory storage keeps file data in a buffer
const upload = multer({
  storage: multer.memoryStorage(),
  // file size limitation in bytes
  limits: { fileSize: 52428800 },
});

/**
 * Given a list of files, passed in "uploaded_files" array,
 * Uploads each file to AWS S3 bucket, and returns the list of successfully
 * uploaded file keys
 *
 * An image with key fileKey can be displayed using an img tag
 * with the src = "${process.env.AWS_BUCKET_URL}/${fileKey}"
 */
router.post('/upload', upload.array('uploaded_files'), (req, res) => {
  let foundErr = null;
  const keysList = [];
  const files = [];

  // multer stores uploaded_files so they are now accessible in req.files
  for (let i = 0; i < req.files.length && !foundErr; i++) {
    const file = req.files[i];
    const randomKey = hashGenerator.generateHash({ length: 64 });
    s3.putObject({
      Bucket: 'community-legal-services-bucket',
      Key: randomKey,
      Body: file.buffer,
      ACL: 'public-read',
    }, (err, data) => {
      foundErr = err;
    });

    // if no error, record file key
    if (!foundErr) {
      keysList.push(randomKey);
      files.push(file);
    }
  }

  res.send({
    error: foundErr,
    success: (foundErr === null),
    files: files,
    keysList: keysList,
  });
});

module.exports = router;
