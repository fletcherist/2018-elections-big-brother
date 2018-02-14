module.exports = {
  TELEGRAM_API_KEY: process.env.TELEGRAM_API_KEY,
  REDIS_SESSION_URL: process.env.REDIS_SESSION_URL,
  MONGODB_DATABASE_PATH: process.env.MONGODB_DATABASE_PATH,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  CLOUDINARY: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }
}
