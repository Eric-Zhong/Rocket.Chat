/**
 * uploadFiles.ts - 文件上传流程处理模块
 * 该模块实现了Rocket.Chat客户端中的文件上传功能，包括普通文件上传和端到端加密文件上传
 */
import type { IMessage, FileAttachmentProps, IE2EEMessage, IUpload } from '@rocket.chat/core-typings';
import { isRoomFederated } from '@rocket.chat/core-typings';
import { imperativeModal } from '@rocket.chat/ui-client';

import { e2e } from '../../../../app/e2e/client'; // 端到端加密相关功能
import { settings } from '../../../../app/settings/client'; // 应用设置
import { fileUploadIsValidContentType } from '../../../../app/utils/client'; // 文件类型验证
import { getFileExtension } from '../../../../lib/utils/getFileExtension'; // 获取文件扩展名
import FileUploadModal from '../../../views/room/modals/FileUploadModal'; // 文件上传模态框组件
import { prependReplies } from '../../utils/prependReplies'; // 处理回复消息的工具函数
import type { ChatAPI } from '../ChatAPI'; // 聊天API类型定义

/**
 * 从DataURL获取图片的高度和宽度
 * @param dataURL 图片的DataURL
 * @returns 包含高度和宽度的Promise对象
 */
const getHeightAndWidthFromDataUrl = (dataURL: string): Promise<{ height: number; width: number }> => {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			resolve({
				height: img.height,
				width: img.width,
			});
		};
		img.src = dataURL;
	});
};

/**
 * 文件上传主函数
 * @param chat ChatAPI实例，提供聊天相关功能
 * @param files 要上传的文件数组
 * @param resetFileInput 重置文件输入的回调函数（可选）
 * @returns Promise<void>
 */
export const uploadFiles = async (chat: ChatAPI, files: readonly File[], resetFileInput?: () => void): Promise<void> => {
	// 获取当前引用的消息列表
	const replies = chat.composer?.quotedMessages.get() ?? [];

	// 预处理回复消息，生成消息内容
	const msg = await prependReplies('', replies);

	// 获取当前聊天房间信息
	const room = await chat.data.getRoom();

	// 创建文件上传队列（使用数组的逆序副本，以便从最后一个文件开始上传）
	const queue = [...files];

	/**
	 * 执行单个文件上传的内部函数
	 * @param file 要上传的文件
	 * @param extraData 额外的数据，如描述、类型等（可选）
	 * @param getContent 获取加密内容的回调函数（可选）
	 * @param fileContent 文件内容对象，包含原始和加密内容（可选）
	 */
	const uploadFile = (
		file: File,
		extraData?: Pick<IMessage, 't' | 'e2e'> & { description?: string },
		getContent?: (fileId: string, fileUrl: string) => Promise<IE2EEMessage['content']>,
		fileContent?: { raw: Partial<IUpload>; encrypted: IE2EEMessage['content'] },
	) => {
		// 调用ChatAPI的uploads.send方法发送文件
		chat.uploads.send(
			file,
			{
				msg,
				...extraData,
			},
			getContent,
			fileContent,
		);
		// 清除输入框内容
		chat.composer?.clear();
		// 关闭模态框
		imperativeModal.close();
		// 上传下一个文件
		uploadNextFile();
	};

	/**
	 * 上传队列中的下一个文件
	 */
	const uploadNextFile = (): void => {
		// 从队列尾部取出一个文件
		const file = queue.pop();
		// 如果队列为空，则取消所有引用的消息并返回
		if (!file) {
			chat.composer?.dismissAllQuotedMessages();
			return;
		}

		// 打开文件上传模态框
		imperativeModal.open({
			component: FileUploadModal,
			props: {
				file, // 当前要上传的文件
				fileName: file.name, // 文件名
				fileDescription: chat.composer?.text ?? '', // 文件描述（默认为输入框内容）
				showDescription: room && !isRoomFederated(room), // 在非联合房间显示描述输入框
				// 关闭模态框时上传下一个文件
				onClose: (): void => {
					imperativeModal.close();
					uploadNextFile();
				},
				// 提交文件上传时的处理函数
				onSubmit: async (fileName: string, description?: string): Promise<void> => {
					// 修改文件名
					Object.defineProperty(file, 'name', {
						writable: true,
						value: fileName,
					});

					// 获取房间的端到端加密实例
					const e2eRoom = await e2e.getInstanceByRoomId(room._id);

					// 如果不是端到端加密房间，直接上传文件
					if (!e2eRoom) {
						uploadFile(file, { description });
						return;
					}

					// 如果未启用文件加密，直接上传文件
					if (!settings.get('E2E_Enable_Encrypt_Files')) {
						uploadFile(file, { description });
						return;
					}

					// 检查是否需要转换发送的消息
					const shouldConvertSentMessages = await e2eRoom.shouldConvertSentMessages({ msg });

					// 如果不需要转换，直接上传文件
					if (!shouldConvertSentMessages) {
						uploadFile(file, { description });
						return;
					}

					// 加密文件
					const encryptedFile = await e2eRoom.encryptFile(file);

					// 如果文件加密成功
					if (encryptedFile) {
						// 定义获取加密内容的函数
						const getContent = async (_id: string, fileUrl: string): Promise<IE2EEMessage['content']> => {
							const attachments = [];

							// 创建基础附件对象
							const attachment: FileAttachmentProps = {
								title: file.name,
								type: 'file',
								description,
								title_link: fileUrl,
								title_link_download: true,
								encryption: {
									key: encryptedFile.key,
									iv: encryptedFile.iv,
								},
								hashes: {
									sha256: encryptedFile.hash,
								},
							};

							// 根据文件类型创建不同的附件
							if (/^image\/.+/.test(file.type)) {
								// 图片文件：获取尺寸信息
								const dimensions = await getHeightAndWidthFromDataUrl(window.URL.createObjectURL(file));

								attachments.push({
									...attachment,
									image_url: fileUrl,
									image_type: file.type,
									image_size: file.size,
									...(dimensions && {
										image_dimensions: dimensions,
									}),
								});
							} else if (/^audio\/.+/.test(file.type)) {
								// 音频文件
								attachments.push({
									...attachment,
									audio_url: fileUrl,
									audio_type: file.type,
									audio_size: file.size,
								});
							} else if (/^video\/.+/.test(file.type)) {
								// 视频文件
								attachments.push({
									...attachment,
									video_url: fileUrl,
									video_type: file.type,
									video_size: file.size,
								});
							} else {
								// 其他文件：添加文件大小和格式信息
								attachments.push({
									...attachment,
									size: file.size,
									format: getFileExtension(file.name),
								});
							}

							// 创建文件信息对象
							const files = [
								{
									_id,
									name: file.name,
									type: file.type,
									size: file.size,
								},
							] as IMessage['files'];

							// 加密消息内容
							return e2eRoom.encryptMessageContent({
								attachments,
								files,
								file: files?.[0],
							});
						};

						// 创建文件内容数据
						const fileContentData = {
							type: file.type,
							typeGroup: file.type.split('/')[0],
							name: fileName,
							encryption: {
								key: encryptedFile.key,
								iv: encryptedFile.iv,
							},
							hashes: {
								sha256: encryptedFile.hash,
							},
						};

						// 创建文件内容对象（包含原始和加密内容）
						const fileContent = {
							raw: fileContentData,
							encrypted: await e2eRoom.encryptMessageContent(fileContentData),
						};

						// 上传加密文件
						uploadFile(
							encryptedFile.file,
							{
								t: 'e2e', // 标记为端到端加密消息
							},
							getContent,
							fileContent,
						);
					}
				},
				// 检查文件类型是否有效
				invalidContentType: !fileUploadIsValidContentType(file?.type),
			},
		});
	};

	// 开始上传队列中的第一个文件
	uploadNextFile();
	// 如果提供了重置文件输入的函数，则调用它
	resetFileInput?.();
};
