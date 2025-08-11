import type { HomeserverEventSignatures } from '@hs/federation-sdk';
import type { Emitter } from '@rocket.chat/emitter';
import { Logger } from '@rocket.chat/logger';
import { Users } from '@rocket.chat/models';

import { MatrixMediaService } from '../services/MatrixMediaService';

const logger = new Logger('federation-matrix:file');

export function file(emitter: Emitter<HomeserverEventSignatures>) {
	emitter.on('homeserver.matrix.media.download', async (data) => {
		try {
			const { userId, mediaId, serverName } = data;

			const mxcUri = `mxc://${serverName}/${mediaId}`;

			const localFile = await MatrixMediaService.getLocalFileForMatrixNode(mxcUri);
			if (!localFile) {
				logger.warn('File not found for MXC URI', { mxcUri });
				emitter.emit('homeserver.matrix.media.downloadComplete', {
					mxcUri,
					mediaId,
					serverName,
					userId,
					buffer: null,
					metadata: null,
					success: false,
					error: 'File not found',
				});
				return;
			}

			// Validate requesting user has permission (if we can determine it)
			// For federation, we might not have the user locally, so this is optional
			if (userId && !userId.includes(':')) {
				const user = await Users.findOneByUsername(userId);
				if (user && localFile.rid) {
					const hasAccess = await MatrixMediaService.validateUserAccess(user._id, localFile._id);
					if (!hasAccess) {
						logger.warn('User does not have access to file', {
							userId,
							fileId: localFile._id,
						});

						emitter.emit('homeserver.matrix.media.downloadComplete', {
							mxcUri,
							mediaId,
							serverName,
							userId,
							buffer: null,
							metadata: null,
							success: false,
							error: 'Access denied',
						});
						return;
					}
				}
			}

			const fileBuffer = await MatrixMediaService.getLocalFileBuffer(localFile._id);
			if (!fileBuffer) {
				logger.error('Failed to get file content', {
					fileId: localFile._id,
					fileName: localFile.name,
				});

				emitter.emit('homeserver.matrix.media.downloadComplete', {
					mxcUri,
					mediaId,
					serverName,
					userId,
					buffer: null,
					metadata: null,
					success: false,
					error: 'Failed to retrieve file content',
				});
				return;
			}

			// Send the file data back to the homeserver for Matrix client
			emitter.emit('homeserver.matrix.media.downloadComplete', {
				mxcUri,
				mediaId,
				serverName,
				userId,
				buffer: fileBuffer,
				metadata: {
					fileName: localFile.name || 'unknown',
					mimeType: localFile.type || 'application/octet-stream',
					size: localFile.size || fileBuffer.length,
				},
				success: true,
			});
		} catch (error) {
			logger.error('Error serving file to Matrix:', error);

			if (data?.mediaId && data?.serverName) {
				emitter.emit('homeserver.matrix.media.downloadComplete', {
					mxcUri: `mxc://${data.serverName}/${data.mediaId}`,
					mediaId: data.mediaId,
					serverName: data.serverName,
					userId: data.userId,
					buffer: null,
					metadata: null,
					success: false,
					error: error instanceof Error ? error.message : 'Internal server error',
				});
			}
		}
	});
}
