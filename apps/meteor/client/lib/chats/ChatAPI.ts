/**
 * ChatAPI.ts - 聊天核心API类型定义文件
 * 该文件定义了Rocket.Chat客户端聊天功能的核心接口，包括消息输入、数据处理、文件上传等功能
 */
import type { IMessage, IRoom, ISubscription, IE2EEMessage, IUpload, Subscribable } from '@rocket.chat/core-typings';
import type { IActionManager } from '@rocket.chat/ui-contexts';

import type { Upload } from './Upload';
import type { ReadStateManager } from './readStateManager';
import type { FormattingButton } from '../../../app/ui-message/client/messageBox/messageBoxFormatting';

/**
 * ComposerAPI - 消息输入框API接口
 * 定义了处理聊天消息输入框的各种操作和状态管理
 */
export type ComposerAPI = {
	/**
	 * 释放资源
	 */
	release(): void;

	/**
	 * 当前输入框文本内容
	 */
	readonly text: string;

	/**
	 * 当前文本选择范围
	 */
	readonly selection: { readonly start: number; readonly end: number };

	/**
	 * 设置输入框文本内容
	 * @param text 要设置的文本
	 * @param options 可选配置，包括文本选择范围设置
	 */
	setText(
		text: string,
		options?: {
			selection?:
				| { readonly start?: number; readonly end?: number }
				| ((previous: { readonly start: number; readonly end: number }) => { readonly start?: number; readonly end?: number });
		},
	): void;

	/**
	 * 用指定模式包裹选中文本
	 * @param pattern 包裹模式
	 */
	wrapSelection(pattern: string): void;

	/**
	 * 在当前光标位置插入文本
	 * @param text 要插入的文本
	 */
	insertText(text: string): void;

	/**
	 * 插入新行
	 */
	insertNewLine(): void;

	/**
	 * 清空输入框
	 */
	clear(): void;

	/**
	 * 使输入框获得焦点
	 */
	focus(): void;

	/**
	 * 使输入框失去焦点
	 */
	blur(): void;

	/**
	 * 获取当前光标位置
	 * @returns 光标位置或undefined
	 */
	getCursorPosition(): number | undefined;

	/**
	 * 获取输入框文本的子字符串
	 * @param start 起始位置
	 * @param end 结束位置（可选）
	 * @returns 子字符串
	 */
	substring(start: number, end?: number): string;

	/**
	 * 替换选中文本
	 * @param text 替换文本
	 * @param selection 要替换的文本范围
	 */
	replaceText(
		text: string,
		selection: {
			start: number;
			end: number;
		},
	): void;

	/**
	 * 将光标移动到文本末尾
	 */
	setCursorToEnd(): void;

	/**
	 * 将光标移动到文本开头
	 */
	setCursorToStart(): void;

	/**
	 * 回复消息
	 * @param text 回复文本
	 */
	replyWith(text: string): Promise<void>;

	/**
	 * 引用消息
	 * @param message 要引用的消息对象
	 */
	quoteMessage(message: IMessage): Promise<void>;

	/**
	 * 取消引用特定消息
	 * @param mid 消息ID
	 */
	dismissQuotedMessage(mid: IMessage['_id']): Promise<void>;

	/**
	 * 取消所有引用的消息
	 */
	dismissAllQuotedMessages(): Promise<void>;

	/**
	 * 当前引用的消息列表（可订阅）
	 */
	readonly quotedMessages: Subscribable<IMessage[]>;

	/**
	 * 设置编辑模式状态
	 * @param editing 是否为编辑模式
	 */
	setEditingMode(editing: boolean): void;

	/**
	 * 编辑模式状态（可订阅）
	 */
	readonly editing: Subscribable<boolean>;

	/**
	 * 设置录音模式状态
	 * @param recording 是否为录音模式
	 */
	setRecordingMode(recording: boolean): void;

	/**
	 * 录音模式状态（可订阅）
	 */
	readonly recording: Subscribable<boolean>;

	/**
	 * 设置视频录制状态
	 * @param recording 是否为视频录制状态
	 */
	setRecordingVideo(recording: boolean): void;

	/**
	 * 视频录制状态（可订阅）
	 */
	readonly recordingVideo: Subscribable<boolean>;

	/**
	 * 设置麦克风权限是否被拒绝
	 * @param isMicrophoneDenied 麦克风权限是否被拒绝
	 */
	setIsMicrophoneDenied(isMicrophoneDenied: boolean): void;

	/**
	 * 麦克风权限状态（可订阅）
	 */
	readonly isMicrophoneDenied: Subscribable<boolean>;

	/**
	 * 格式化按钮列表（可订阅）
	 */
	readonly formatters: Subscribable<FormattingButton[]>;
};

/**
 * DataAPI - 聊天数据API接口
 * 定义了处理聊天数据的获取、创建、更新和删除等操作
 */
export type DataAPI = {
	/**
	 * 组合并发送消息
	 * @param text 消息文本
	 * @param options 消息选项，包括是否发送到频道、引用消息等
	 * @returns 创建的消息对象
	 */
	composeMessage(
		text: string,
		options: { sendToChannel?: boolean; quotedMessages: IMessage[]; originalMessage?: IMessage | null },
	): Promise<IMessage>;

	/**
	 * 通过ID查找消息（可能返回null）
	 * @param mid 消息ID
	 * @returns 消息对象或null
	 */
	findMessageByID(mid: IMessage['_id']): Promise<IMessage | null>;

	/**
	 * 通过ID获取消息（必须存在）
	 * @param mid 消息ID
	 * @returns 消息对象
	 */
	getMessageByID(mid: IMessage['_id']): Promise<IMessage>;

	/**
	 * 查找最后一条消息（可能不存在）
	 * @returns 最后一条消息或undefined
	 */
	findLastMessage(): Promise<IMessage | undefined>;

	/**
	 * 获取最后一条消息（必须存在）
	 * @returns 最后一条消息
	 */
	getLastMessage(): Promise<IMessage>;

	/**
	 * 查找前一条自己发送的消息（可能不存在）
	 * @param message 当前消息（可选）
	 * @returns 前一条自己发送的消息或undefined
	 */
	findPreviousOwnMessage(message?: IMessage): Promise<IMessage | undefined>;

	/**
	 * 获取前一条自己发送的消息（必须存在）
	 * @param message 当前消息
	 * @returns 前一条自己发送的消息
	 */
	getPreviousOwnMessage(message: IMessage): Promise<IMessage>;

	/**
	 * 查找后一条自己发送的消息（可能不存在）
	 * @param message 当前消息
	 * @returns 后一条自己发送的消息或undefined
	 */
	findNextOwnMessage(message: IMessage): Promise<IMessage | undefined>;

	/**
	 * 获取后一条自己发送的消息（必须存在）
	 * @param message 当前消息
	 * @returns 后一条自己发送的消息
	 */
	getNextOwnMessage(message: IMessage): Promise<IMessage>;

	/**
	 * 推送临时消息（仅当前会话可见）
	 * @param message 临时消息内容
	 */
	pushEphemeralMessage(message: Omit<IMessage, 'rid' | 'tmid'>): Promise<void>;

	/**
	 * 检查是否可以更新消息
	 * @param message 要检查的消息
	 * @returns 是否可以更新
	 */
	canUpdateMessage(message: IMessage): Promise<boolean>;

	/**
	 * 更新消息
	 * @param message 要更新的消息内容
	 * @param previewUrls 预览URL列表（可选）
	 */
	updateMessage(message: Pick<IMessage, '_id' | 't'> & Partial<Omit<IMessage, '_id' | 't'>>, previewUrls?: string[]): Promise<void>;

	/**
	 * 检查是否可以删除消息
	 * @param message 要检查的消息
	 * @returns 是否可以删除
	 */
	canDeleteMessage(message: IMessage): Promise<boolean>;

	/**
	 * 删除消息
	 * @param msgIdOrMsg 消息ID或消息对象
	 */
	deleteMessage(msgIdOrMsg: IMessage | IMessage['_id']): Promise<void>;

	/**
	 * 获取草稿消息
	 * @param mid 消息ID（可选）
	 * @returns 草稿文本或undefined
	 */
	getDraft(mid: IMessage['_id'] | undefined): Promise<string | undefined>;

	/**
	 * 丢弃草稿消息
	 * @param mid 消息ID（可选）
	 */
	discardDraft(mid: IMessage['_id'] | undefined): Promise<void>;

	/**
	 * 保存草稿消息
	 * @param mid 消息ID（可选）
	 * @param text 草稿文本
	 */
	saveDraft(mid: IMessage['_id'] | undefined, text: string): Promise<void>;

	/**
	 * 查找当前房间（可能不存在）
	 * @returns 房间对象或undefined
	 */
	findRoom(): Promise<IRoom | undefined>;

	/**
	 * 获取当前房间（必须存在）
	 * @returns 房间对象
	 */
	getRoom(): Promise<IRoom>;

	/**
	 * 检查是否已订阅当前房间
	 * @returns 是否已订阅
	 */
	isSubscribedToRoom(): Promise<boolean>;

	/**
	 * 加入房间
	 */
	joinRoom(): Promise<void>;

	/**
	 * 通过ID查找讨论（可能不存在）
	 * @param drid 讨论ID
	 * @returns 讨论房间对象或undefined
	 */
	findDiscussionByID(drid: IRoom['_id']): Promise<IRoom | undefined>;

	/**
	 * 通过ID获取讨论（必须存在）
	 * @param drid 讨论ID
	 * @returns 讨论房间对象
	 */
	getDiscussionByID(drid: IRoom['_id']): Promise<IRoom>;

	/**
	 * 查找当前订阅（可能不存在）
	 * @returns 订阅对象或undefined
	 */
	findSubscription(): Promise<ISubscription | undefined>;

	/**
	 * 获取当前订阅（必须存在）
	 * @returns 订阅对象
	 */
	getSubscription(): Promise<ISubscription>;

	/**
	 * 从消息查找订阅（可能不存在）
	 * @param message 消息对象
	 * @returns 订阅对象或undefined
	 */
	findSubscriptionFromMessage(message: IMessage): Promise<ISubscription | undefined>;

	/**
	 * 从消息获取订阅（必须存在）
	 * @param message 消息对象
	 * @returns 订阅对象
	 */
	getSubscriptionFromMessage(message: IMessage): Promise<ISubscription>;
};

/**
 * UploadsAPI - 文件上传API接口
 * 定义了处理文件上传的各种操作和状态管理
 */
export type UploadsAPI = {
	/**
	 * 获取当前所有上传任务
	 * @returns 上传任务列表
	 */
	get(): readonly Upload[];

	/**
	 * 订阅上传任务状态变化
	 * @param callback 状态变化时的回调函数
	 * @returns 取消订阅的函数
	 */
	subscribe(callback: () => void): () => void;

	/**
	 * 清除失败的上传任务
	 */
	wipeFailedOnes(): void;

	/**
	 * 取消指定的上传任务
	 * @param id 上传任务ID
	 */
	cancel(id: Upload['id']): void;

	/**
	 * 发送文件上传请求
	 * @param file 要上传的文件
	 * @param options 上传选项，包括描述、消息文本等
	 * @param getContent 获取文件内容的函数（可选，用于端到端加密）
	 * @param fileContent 文件内容（可选，包括原始和加密内容）
	 */
	send(
		file: File,
		{ description, msg, t, e2e }: { description?: string; msg?: string; t?: IMessage['t']; e2e?: IMessage['e2e'] },
		getContent?: (fileId: string, fileUrl: string) => Promise<IE2EEMessage['content']>,
		fileContent?: { raw: Partial<IUpload>; encrypted: IE2EEMessage['content'] },
	): Promise<void>;
};

/**
 * ChatAPI - 聊天核心API接口
 * 整合了所有聊天相关的API，提供完整的聊天功能支持
 */
export type ChatAPI = {
	/**
	 * 当前用户ID
	 */
	readonly uid: string | null;

	/**
	 * 消息输入框API实例
	 */
	readonly composer?: ComposerAPI;

	/**
	 * 设置消息输入框API实例
	 * @param composer 消息输入框API实例
	 */
	readonly setComposerAPI: (composer?: ComposerAPI) => void;

	/**
	 * 聊天数据API实例
	 */
	readonly data: DataAPI;

	/**
	 * 文件上传API实例
	 */
	readonly uploads: UploadsAPI;

	/**
	 * 已读状态管理器
	 */
	readonly readStateManager: ReadStateManager;

	/**
	 * 消息编辑相关功能
	 */
	readonly messageEditing: {
		/**
		 * 编辑前一条消息
		 */
		toPreviousMessage(): Promise<void>;

		/**
		 * 编辑后一条消息
		 */
		toNextMessage(): Promise<void>;

		/**
		 * 编辑指定消息
		 * @param message 要编辑的消息
		 * @param options 编辑选项，包括光标位置等
		 */
		editMessage(message: IMessage, options?: { cursorAtStart?: boolean }): Promise<void>;
	};

	/**
	 * 当前正在编辑的消息信息
	 */
	readonly currentEditing:
		| {
				/**
				 * 当前编辑的消息ID
				 */
				readonly mid: IMessage['_id'];

				/**
				 * 重置编辑状态
				 * @returns 是否重置成功
				 */
				reset(): Promise<boolean>;

				/**
				 * 停止编辑
				 */
				stop(): Promise<void>;

				/**
				 * 取消编辑
				 */
				cancel(): Promise<void>;
		  }
		| undefined;

	/**
	 * 表情选择器相关功能
	 */
	readonly emojiPicker: {
		/**
		 * 打开表情选择器
		 * @param el 触发元素
		 * @param cb 选择表情后的回调函数
		 */
		open(el: Element, cb: (emoji: string) => void): void;

		/**
		 * 关闭表情选择器
		 */
		close(): void;
	};

	/**
	 * 用户操作相关功能
	 */
	readonly action: {
		/**
		 * 开始操作
		 * @param action 操作类型（当前仅支持'typing'）
		 */
		start(action: 'typing'): void;

		/**
		 * 停止操作
		 * @param action 操作类型（typing、recording、uploading、playing）
		 */
		stop(action: 'typing' | 'recording' | 'uploading' | 'playing'): void;

		/**
		 * 持续执行操作
		 * @param action 操作类型（recording、uploading、playing）
		 */
		performContinuously(action: 'recording' | 'uploading' | 'playing'): void;
	};

	/**
	 * 操作管理器实例
	 */
	ActionManager: IActionManager;

	/**
	 * 聊天流程相关功能
	 * 提供了高级别的聊天操作流程封装
	 */
	readonly flows: {
		/**
		 * 上传文件流程
		 * @param files 要上传的文件列表
		 * @param resetFileInput 重置文件输入的函数（可选）
		 */
		readonly uploadFiles: (files: readonly File[], resetFileInput?: () => void) => Promise<void>;

		/**
		 * 发送消息流程
		 * @param params 消息参数，包括文本、是否显示、预览URL等
		 * @returns 是否发送成功
		 */
		readonly sendMessage: ({
			text,
			tshow,
		}: {
			text: string;
			tshow?: boolean;
			previewUrls?: string[];
			isSlashCommandAllowed?: boolean;
		}) => Promise<boolean>;

		/**
		 * 处理斜杠命令
		 * @param message 消息对象
		 * @param userId 用户ID
		 * @returns 是否处理成功
		 */
		readonly processSlashCommand: (message: IMessage, userId: string | null) => Promise<boolean>;

		/**
		 * 处理超长消息
		 * @param message 消息对象
		 * @returns 是否处理成功
		 */
		readonly processTooLongMessage: (message: IMessage) => Promise<boolean>;

		/**
		 * 处理消息编辑
		 * @param message 要编辑的消息内容
		 * @param previewUrls 预览URL列表（可选）
		 * @returns 是否处理成功
		 */
		readonly processMessageEditing: (
			message: Pick<IMessage, '_id' | 't'> & Partial<Omit<IMessage, '_id' | 't'>>,
			previewUrls?: string[],
		) => Promise<boolean>;

		/**
		 * 处理添加反应
		 * @param message 消息对象（包含反应信息）
		 * @returns 是否处理成功
		 */
		readonly processSetReaction: (message: Pick<IMessage, 'msg'>) => Promise<boolean>;

		/**
		 * 请求消息删除
		 * @param message 要删除的消息
		 */
		readonly requestMessageDeletion: (message: IMessage) => Promise<void>;

		/**
		 * 回复广播消息
		 * @param message 要回复的广播消息
		 */
		readonly replyBroadcast: (message: IMessage) => Promise<void>;
	};
};
