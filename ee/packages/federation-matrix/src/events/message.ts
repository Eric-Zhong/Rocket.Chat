import type { HomeserverEventSignatures } from '@hs/federation-sdk';
import { FederationMatrix, Message } from '@rocket.chat/core-services';
import { UserStatus } from '@rocket.chat/core-typings';
import type { IUser } from '@rocket.chat/core-typings';
import type { Emitter } from '@rocket.chat/emitter';
import { Logger } from '@rocket.chat/logger';
import { Users, MatrixBridgedUser, MatrixBridgedRoom, Rooms, Subscriptions, Messages } from '@rocket.chat/models';
import { MatrixMediaService } from '../services/MatrixMediaService';

const logger = new Logger('federation-matrix:message');

export function message(emitter: Emitter<HomeserverEventSignatures>) {
	emitter.on('homeserver.matrix.message', async (data) => {
		try {
			const content = data.content as any;
			const msgtype = content?.msgtype;
			const messageBody = content?.body?.toString();
			if (!messageBody && !msgtype) {
				logger.debug('No message content found in event');
				return;
			}

			const isMediaMessage = ['m.image', 'm.file', 'm.video', 'm.audio'].includes(msgtype);
			const threadRelation = content?.['m.relates_to'];
			const isThreadMessage = threadRelation?.rel_type === 'm.thread';
			const threadRootEventId = isThreadMessage ? threadRelation.event_id : undefined;

			const [userPart, domain] = data.sender.split(':');
			if (!userPart || !domain) {
				logger.error('Invalid Matrix sender ID format:', data.sender);
				return;
			}
			const username = userPart.substring(1);

			let user = await Users.findOneByUsername(data.sender);

			if (!user) {
				logger.info('Creating new federated user:', { username: data.sender, externalId: data.sender });

				const userData: Partial<IUser> = {
					username: data.sender,
					name: username, // TODO: Fetch display name from Matrix profile
					type: 'user',
					status: UserStatus.ONLINE,
					active: true,
					roles: ['user'],
					requirePasswordChange: false,
					federated: true, // Mark as federated user
					createdAt: new Date(),
					_updatedAt: new Date(),
				};

				const { insertedId } = await Users.insertOne(userData as IUser);

				await MatrixBridgedUser.createOrUpdateByLocalId(
					insertedId,
					data.sender,
					true, // isRemote = true for external Matrix users
					domain,
				);

				user = await Users.findOneById(insertedId);
				if (!user) {
					logger.error('Failed to create user:', data.sender);
					return;
				}

				logger.info('Successfully created federated user:', { userId: user._id, username });
			} else {
				await MatrixBridgedUser.createOrUpdateByLocalId(user._id, data.sender, false, domain);
			}

			const internalRoomId = await MatrixBridgedRoom.getLocalRoomId(data.room_id);
			if (!internalRoomId) {
				logger.error('Room not found in bridge mapping:', data.room_id);
				// TODO: Handle room creation for unknown federated rooms
				return;
			}

			const room = await Rooms.findOneById(internalRoomId);
			if (!room) {
				logger.error('Room not found:', internalRoomId);
				return;
			}

			if (!room.federated) {
				logger.error('Room is not marked as federated:', { roomId: room._id, matrixRoomId: data.room_id });
				// TODO: Should we update the room to be federated?
			}

			const existingSubscription = await Subscriptions.findOneByRoomIdAndUserId(room._id, user._id);

			if (!existingSubscription) {
				logger.info('Creating subscription for federated user in room:', { userId: user._id, roomId: room._id });

				const { insertedId } = await Subscriptions.createWithRoomAndUser(room, user, {
					ts: new Date(),
					open: false,
					alert: false,
					unread: 0,
					userMentions: 0,
					groupMentions: 0,
					// Federation status is inherited from room.federated and user.federated
				});

				if (insertedId) {
					logger.debug('Successfully created subscription:', insertedId);
					// TODO: Import and use notifyOnSubscriptionChangedById if needed
					// void notifyOnSubscriptionChangedById(insertedId, 'inserted');
				}
			}

			let tmid: string | undefined;
			if (isThreadMessage && threadRootEventId) {
				const threadRootMessage = await Messages.findOneByFederationId(threadRootEventId);
				if (threadRootMessage) {
					tmid = threadRootMessage._id;
					logger.debug('Found thread root message:', { tmid, threadRootEventId });
				} else {
					logger.warn('Thread root message not found for event:', threadRootEventId);
				}
			}

			if (isMediaMessage && content?.url) {
				const fileInfo = content.info || {};
				const mimeType =
					fileInfo.mimetype ||
					(msgtype === 'm.image'
						? 'image/jpeg'
						: msgtype === 'm.video'
							? 'video/mp4'
							: msgtype === 'm.audio'
								? 'audio/mpeg'
								: 'application/octet-stream');

				let fileRefId: string;
				try {
					fileRefId = await MatrixMediaService.createRemoteFileReference(
						content.url, // MXC URI
						{
							name: messageBody || 'unnamed',
							size: fileInfo.size || 0,
							type: mimeType,
							roomId: internalRoomId,
							userId: user._id,
						},
					);
				} catch (fileRefError: any) {
					throw fileRefError;
				}

				const fileName = messageBody || 'unnamed';
				const fileExtension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() || '' : mimeType.split('/')[1] || '';

				const fileUrl = `/file-upload/${fileRefId}/${encodeURIComponent(fileName)}`;
				const attachment: any = {
					title: fileName,
					type: 'file',
					title_link: fileUrl,
					title_link_download: true,
				};

				if (msgtype === 'm.image') {
					attachment.image_url = fileUrl;
					attachment.image_type = mimeType;
					attachment.image_size = fileInfo.size || 0;
					attachment.description = ''; // Empty description like normal uploads
					if (fileInfo.w && fileInfo.h) {
						attachment.image_dimensions = {
							width: fileInfo.w,
							height: fileInfo.h,
						};
					}
				} else if (msgtype === 'm.video') {
					attachment.video_url = fileUrl;
					attachment.video_type = mimeType;
					attachment.video_size = fileInfo.size || 0;
					attachment.description = '';
				} else if (msgtype === 'm.audio') {
					attachment.audio_url = fileUrl;
					attachment.audio_type = mimeType;
					attachment.audio_size = fileInfo.size || 0;
					attachment.description = '';
				} else {
					// Generic file
					attachment.description = '';
				}

				const fileData = {
					_id: fileRefId,
					name: fileName,
					type: mimeType,
					size: fileInfo.size || 0,
					format: fileExtension,
				};

				const room = await Rooms.findOneById(internalRoomId);
				if (!room) {
					logger.error('Room not found for media message:', { roomId: internalRoomId });
					return;
				}

				const messageData = {
					rid: internalRoomId,
					msg: '',
					file: fileData,
					files: [fileData],
					attachments: [attachment],
					federation: {
						eventId: data.event_id,
					},
					tmid,
				};

				try {
					await Message.sendMessageWithValidation(user, messageData, room);
				} catch (sendMessageError: any) {
					throw sendMessageError;
				}
			} else {
				await Message.saveMessageFromFederation({
					fromId: user._id,
					rid: internalRoomId,
					msg: messageBody || '',
					federation_event_id: data.event_id,
					tmid,
				});
			}
		} catch (error) {
			logger.error('Error processing Matrix message:', error);
		}
	});

	emitter.on('homeserver.matrix.redaction', async (data) => {
		try {
			const redactedEventId = data.redacts;
			if (!redactedEventId) {
				logger.debug('No redacts field in redaction event');
				return;
			}

			const messageEvent = await FederationMatrix.getEventById(redactedEventId);
			if (!messageEvent || messageEvent.type !== 'm.room.message') {
				logger.debug(`Event ${redactedEventId} is not a message event`);
				return;
			}

			const rcMessage = await Messages.findOneByFederationId(data.redacts);
			if (!rcMessage) {
				logger.debug(`No RC message found for event ${data.redacts}`);
				return;
			}

			const user = await Users.findOneByUsername(data.sender);
			if (!user) {
				logger.debug(`User not found: ${data.sender}`);
				return;
			}

			await Message.deleteMessage(user, rcMessage);
		} catch (error) {
			logger.error('Failed to process Matrix removal redaction:', error);
		}
	});
}
