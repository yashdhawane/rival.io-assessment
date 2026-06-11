import cloudinary from '../config/cloudinary.config'

interface UploadSignatureParams {
  publicId?: string
  timestamp: number
  folder?: string
}

interface UploadSignatureResponse {
  signature: string
  timestamp: number
  publicId?: string
  cloudName: string
  apiKey: string
  folder?: string
}

class CloudinaryService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  private readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'text/csv',
    'image/png',
    'image/jpeg',
  ]

  generateUploadSignature(params: UploadSignatureParams): UploadSignatureResponse {
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: params.timestamp,
        folder: params.folder || 'task_attachments',
        public_id: params.publicId,
        upload_preset: undefined, // We'll use signature-based upload
      },
      cloudinary.config().api_secret!
    )

    return {
      signature,
      timestamp: params.timestamp,
      publicId: params.publicId,
      cloudName: cloudinary.config().cloud_name!,
      apiKey: cloudinary.config().api_key!,
      folder: params.folder || 'task_attachments',
    }
  }

  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`,
      }
    }

    // Check MIME type
    if (!this.ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      }
    }

    return { valid: true }
  }

  getAllowedMimeTypes(): string[] {
    return this.ALLOWED_MIME_TYPES
  }

  getMaxFileSize(): number {
    return this.MAX_FILE_SIZE
  }
}

export default new CloudinaryService()
