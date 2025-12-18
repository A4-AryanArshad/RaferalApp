import { v2 as cloudinary } from 'cloudinary';

// Hardcoded Cloudinary configuration for APK distribution
cloudinary.config({
  cloud_name: 'dftnqqcjz',
  api_key: '419724397335875',
  api_secret: 'Q7usOM7s5EsyeubXFzy5fQ1I_7A',
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  /**
   * Upload base64 image to Cloudinary with timeout
   */
  static async uploadBase64(base64String: string): Promise<CloudinaryUploadResult> {
    const uploadStartTime = Date.now();
    
    // Hardcoded Cloudinary credentials (for APK distribution)
    const cloudName = 'dftnqqcjz';
    const apiKey = '419724397335875';
    const apiSecret = 'Q7usOM7s5EsyeubXFzy5fQ1I_7A';

    return new Promise((resolve, reject) => {
      // Set a timeout for the upload (30 seconds)
      const timeout = setTimeout(() => {
        reject(new Error('Cloudinary upload timeout after 30 seconds'));
      }, 30000);

      try {
        // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
        const base64Data = base64String.includes(',') 
          ? base64String.split(',')[1] 
          : base64String;

        if (!base64Data || base64Data.length === 0) {
          clearTimeout(timeout);
          reject(new Error('Empty base64 data'));
          return;
        }

        console.log(`[Cloudinary] Starting upload, base64 length: ${base64Data.length} chars`);

        cloudinary.uploader.upload(
          `data:image/jpeg;base64,${base64Data}`,
          {
            folder: 'airbnb-referral/listings',
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
            ],
            timeout: 30000, // 30 second timeout
          },
          (error, result) => {
            clearTimeout(timeout);
            const uploadTime = Date.now() - uploadStartTime;
            
            if (error) {
              console.error(`[Cloudinary] Upload error after ${uploadTime}ms:`, error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
              return;
            }
            if (!result) {
              console.error(`[Cloudinary] No result after ${uploadTime}ms`);
              reject(new Error('Cloudinary upload returned no result'));
              return;
            }
            
            console.log(`[Cloudinary] Upload successful in ${uploadTime}ms, URL: ${result.secure_url}`);
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          }
        );
      } catch (error: any) {
        clearTimeout(timeout);
        console.error('[Cloudinary] Exception during upload:', error);
        reject(new Error(`Cloudinary upload exception: ${error.message}`));
      }
    });
  }

  /**
   * Upload multiple base64 images
   */
  static async uploadMultipleBase64(
    base64Images: string[]
  ): Promise<CloudinaryUploadResult[]> {
    console.log(`[Cloudinary] Uploading ${base64Images.length} images...`);
    const startTime = Date.now();

    // Hardcoded Cloudinary credentials (for APK distribution)
    const cloudName = 'dftnqqcjz';
    const apiKey = '419724397335875';
    console.log(`[Cloudinary] Config check - cloud_name: ${cloudName ? '✓' : '✗'}, api_key: ${apiKey ? '✓' : '✗'}`);

    // Upload in parallel for speed
    const uploadPromises = base64Images.map((img, index) => {
      console.log(`[Cloudinary] Starting upload for image ${index + 1}/${base64Images.length}...`);
      return this.uploadBase64(img).catch(error => {
        console.error(`[Cloudinary] Failed to upload image ${index + 1}:`, error.message);
        throw error;
      });
    });

    try {
      const results = await Promise.all(uploadPromises);
      const totalTime = Date.now() - startTime;
      console.log(`[Cloudinary] All ${results.length} images uploaded successfully in ${totalTime}ms`);
      return results;
    } catch (error: any) {
      const totalTime = Date.now() - startTime;
      console.error(`[Cloudinary] Upload failed after ${totalTime}ms:`, error.message);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
}

