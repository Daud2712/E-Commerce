import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'freshedtz/products'

export const isCloudinaryEnabled = (): boolean => {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
}

export const initCloudinary = () => {
  if (!isCloudinaryEnabled()) return
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME!,
    api_key: CLOUDINARY_API_KEY!,
    api_secret: CLOUDINARY_API_SECRET!,
  })
}

export const uploadLocalFileToCloudinary = async (filePath: string, folder: string = CLOUDINARY_FOLDER): Promise<string> => {
  initCloudinary()
  const result = await cloudinary.uploader.upload(filePath, { folder })
  // Cleanup local temp file if possible
  try { fs.unlinkSync(filePath) } catch {}
  return result.secure_url
}
