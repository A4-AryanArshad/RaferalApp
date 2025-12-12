import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (hardcoded credentials)
cloudinary.config({
  cloud_name: 'dftnqqcjz',
  api_key: '419724397335875',
  api_secret: 'Q7usOM7s5EsyeubXFzy5fQ1I_7A',
});

export interface UploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Image - Base64 encoded image (data URI format: data:image/jpeg;base64,...)
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with upload result containing URL
 */
export async function uploadImageToCloudinary(
  base64Image: string,
  folder: string = 'airbnb-referral/listings'
): Promise<UploadResult> {
  try {
    // Extract base64 data from data URI if present
    let base64Data = base64Image;
    if (base64Image.startsWith('data:')) {
      // Remove data URI prefix (e.g., "data:image/jpeg;base64,")
      base64Data = base64Image.split(',')[1];
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64Data}`, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    });

    return {
      url: result.url,
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  } catch (error: any) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param base64Images - Array of base64 encoded images
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with array of upload results
 */
export async function uploadImagesToCloudinary(
  base64Images: string[],
  folder: string = 'airbnb-referral/listings'
): Promise<string[]> {
  try {
    const uploadPromises = base64Images.map(image => 
      uploadImageToCloudinary(image, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    // Return array of secure URLs
    return results.map(result => result.secure_url);
  } catch (error: any) {
    console.error('Error uploading images to Cloudinary:', error);
    throw new Error(`Failed to upload images: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image in Cloudinary
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error: any) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error(`Failed to delete image: ${error.message || 'Unknown error'}`);
  }
}

