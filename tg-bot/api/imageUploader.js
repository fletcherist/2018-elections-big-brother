const cloudinary = require('cloudinary')
const cloudinaryConfig = require('../config').CLOUDINARY

cloudinary.config(cloudinaryConfig)
async function uploadImageByURL(imageUrl) {
  const result = await cloudinary.uploader.upload(imageUrl)
  console.log('uploadImageByURL', result)
  return result
}

module.exports.uploadImageByURL = uploadImageByURL
