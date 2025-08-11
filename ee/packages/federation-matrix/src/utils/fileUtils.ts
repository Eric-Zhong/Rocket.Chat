import crypto from 'crypto';
import { Logger } from '@rocket.chat/logger';

const logger = new Logger('federation-matrix:file-utils');

export interface MXCUriParts {
	serverName: string;
	mediaId: string;
}

/**
 * MIME type mappings between Matrix and Rocket.Chat
 */
const MIME_TYPE_MAPPINGS: Record<string, string> = {
	// Images
	'image/jpeg': 'image/jpeg',
	'image/png': 'image/png',
	'image/gif': 'image/gif',
	'image/webp': 'image/webp',
	'image/svg+xml': 'image/svg+xml',
	'image/bmp': 'image/bmp',
	'image/tiff': 'image/tiff',
	
	// Documents
	'application/pdf': 'application/pdf',
	'application/msword': 'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-excel': 'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.ms-powerpoint': 'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	
	// Text
	'text/plain': 'text/plain',
	'text/html': 'text/html',
	'text/css': 'text/css',
	'text/javascript': 'text/javascript',
	'text/csv': 'text/csv',
	'text/xml': 'text/xml',
	'application/json': 'application/json',
	'application/xml': 'application/xml',
	
	// Archives
	'application/zip': 'application/zip',
	'application/x-rar-compressed': 'application/x-rar-compressed',
	'application/x-7z-compressed': 'application/x-7z-compressed',
	'application/gzip': 'application/gzip',
	'application/x-tar': 'application/x-tar',
	
	// Audio
	'audio/mpeg': 'audio/mpeg',
	'audio/wav': 'audio/wav',
	'audio/ogg': 'audio/ogg',
	'audio/mp4': 'audio/mp4',
	'audio/aac': 'audio/aac',
	'audio/flac': 'audio/flac',
	
	// Video
	'video/mp4': 'video/mp4',
	'video/mpeg': 'video/mpeg',
	'video/quicktime': 'video/quicktime',
	'video/x-msvideo': 'video/x-msvideo',
	'video/webm': 'video/webm',
	'video/ogg': 'video/ogg',
	
	// Generic fallback
	'application/octet-stream': 'application/octet-stream',
};

/**
 * Parse a Matrix Content URI (mxc://) to extract server name and media ID
 */
export function parseMatrixMXCUri(mxcUri: string): MXCUriParts | null {
	try {
		const match = mxcUri.match(/^mxc:\/\/([^\/]+)\/(.+)$/);
		if (!match) {
			logger.warn('Invalid MXC URI format', { mxcUri });
			return null;
		}

		return {
			serverName: match[1],
			mediaId: match[2],
		};
	} catch (error) {
		logger.error('Error parsing MXC URI', { mxcUri, error });
		return null;
	}
}

/**
 * Generate a Matrix Content URI (mxc://) for a file
 */
export function generateMXCUri(mediaId?: string): string {
	try {
		// Get the server name from environment variables or use default
		const serverName = process.env.MATRIX_SERVER_NAME || process.env.HOSTNAME || 'rocket.chat';
		const id = mediaId || crypto.randomBytes(16).toString('hex');
		
		return `mxc://${serverName}/${id}`;
	} catch (error) {
		logger.error('Error generating MXC URI', { mediaId, error });
		// Fallback to basic format
		const id = mediaId || crypto.randomBytes(16).toString('hex');
		return `mxc://rocket.chat/${id}`;
	}
}

/**
 * Validate MXC URI format
 */
export function isValidMXCUri(mxcUri: string): boolean {
	return /^mxc:\/\/[^\/]+\/.+$/.test(mxcUri);
}

/**
 * Convert MIME type from Rocket.Chat format to Matrix format
 */
export function convertMimeTypeToMatrix(rcMimeType: string): string {
	// Normalize the MIME type
	const normalizedType = rcMimeType.toLowerCase().trim();
	
	// Check direct mapping
	if (MIME_TYPE_MAPPINGS[normalizedType]) {
		return MIME_TYPE_MAPPINGS[normalizedType];
	}
	
	// Try to find a compatible mapping for similar types
	for (const [key, value] of Object.entries(MIME_TYPE_MAPPINGS)) {
		if (normalizedType.includes(key.split('/')[1])) {
			return value;
		}
	}
	
	// If no specific mapping found, return as-is (Matrix is generally permissive)
	return normalizedType;
}

/**
 * Convert MIME type from Matrix format to Rocket.Chat format
 */
export function convertMimeTypeFromMatrix(matrixMimeType: string): string {
	// For now, Matrix and Rocket.Chat use the same MIME type standards
	// This function exists for future compatibility if divergence occurs
	const normalizedType = matrixMimeType.toLowerCase().trim();
	
	// Check if it's a known type
	if (MIME_TYPE_MAPPINGS[normalizedType]) {
		return normalizedType;
	}
	
	// Return as-is, but ensure it's properly formatted
	return normalizedType;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extract file metadata from filename and MIME type
 */
export function extractFileMetadata(fileName: string, mimeType: string, fileSize: number) {
	const lastDotIndex = fileName.lastIndexOf('.');
	const extension = lastDotIndex !== -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : '';
	const nameWithoutExtension = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
	
	// Determine file category
	let category = 'other';
	if (mimeType.startsWith('image/')) {
		category = 'image';
	} else if (mimeType.startsWith('video/')) {
		category = 'video';
	} else if (mimeType.startsWith('audio/')) {
		category = 'audio';
	} else if (mimeType.startsWith('text/') || mimeType.includes('document') || mimeType.includes('pdf')) {
		category = 'document';
	} else if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('compressed')) {
		category = 'archive';
	}
	
	return {
		fileName,
		nameWithoutExtension,
		extension,
		mimeType,
		fileSize,
		formattedSize: formatFileSize(fileSize),
		category,
		isImage: category === 'image',
		isVideo: category === 'video',
		isAudio: category === 'audio',
		isDocument: category === 'document',
		isArchive: category === 'archive',
	};
}

/**
 * Generate a unique file identifier
 */
export function generateFileId(): string {
	return crypto.randomBytes(12).toString('hex');
}

/**
 * Validate file extension against MIME type
 */
export function validateFileExtension(fileName: string, mimeType: string): boolean {
	const extension = fileName.split('.').pop()?.toLowerCase() || '';
	
	// Common extension to MIME type mappings for validation
	const extensionMimeMap: Record<string, string[]> = {
		'jpg': ['image/jpeg'],
		'jpeg': ['image/jpeg'],
		'png': ['image/png'],
		'gif': ['image/gif'],
		'pdf': ['application/pdf'],
		'txt': ['text/plain'],
		'zip': ['application/zip'],
		'mp4': ['video/mp4', 'audio/mp4'],
		'mp3': ['audio/mpeg'],
		'wav': ['audio/wav'],
		'doc': ['application/msword'],
		'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
		'xls': ['application/vnd.ms-excel'],
		'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
	};
	
	const expectedMimeTypes = extensionMimeMap[extension];
	if (!expectedMimeTypes) {
		// If we don't have a specific mapping, assume it's valid
		return true;
	}
	
	return expectedMimeTypes.includes(mimeType);
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFileName(fileName: string): string {
	// Remove or replace dangerous characters
	return fileName
		.replace(/[<>:"/\\|?*]/g, '_') // Replace dangerous characters
		.replace(/\.+/g, '.') // Replace multiple dots with single dot
		.replace(/^\./, '_') // Don't start with dot
		.substring(0, 255); // Limit length
}

/**
 * Check if file type is supported for Matrix federation
 */
export function isSupportedFileType(mimeType: string): boolean {
	const normalizedType = mimeType.toLowerCase().trim();
	
	// Check against our mapping table
	return Object.keys(MIME_TYPE_MAPPINGS).includes(normalizedType) || 
	       normalizedType === 'application/octet-stream'; // Generic fallback
}

/**
 * Get content disposition header value for file download
 */
export function getContentDisposition(fileName: string, inline: boolean = false): string {
	const sanitizedName = sanitizeFileName(fileName);
	const disposition = inline ? 'inline' : 'attachment';
	
	// Encode filename to handle special characters
	const encodedName = encodeURIComponent(sanitizedName);
	
	return `${disposition}; filename="${sanitizedName}"; filename*=UTF-8''${encodedName}`;
}