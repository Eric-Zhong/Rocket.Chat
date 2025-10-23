/**
 * 音频消息录制器组件
 * 用于录制、管理和上传音频消息的React组件
 * 该组件提供音频录制界面，支持开始录音、停止录音、取消录音和上传音频文件功能
 */
import type { IRoom } from '@rocket.chat/core-typings';
import { Box, Icon, Throbber } from '@rocket.chat/fuselage';
import { useEffectEvent } from '@rocket.chat/fuselage-hooks';
import { MessageComposerAction } from '@rocket.chat/ui-composer';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// 引入音频录制核心类
import { AudioRecorder } from '../../../../app/ui/client/lib/recorderjs/AudioRecorder';
import type { ChatAPI } from '../../../lib/chats/ChatAPI';
import { useChat } from '../../room/contexts/ChatContext';

// 创建音频录制器实例
const audioRecorder = new AudioRecorder();

/**
 * AudioMessageRecorder组件的属性类型定义
 */
type AudioMessageRecorderProps = {
	// 房间ID
	rid: IRoom['_id'];
	// 聊天上下文（未来会移除，因为composer将迁移到React）
	chatContext?: ChatAPI; // TODO: remove this when the composer is migrated to React
	// 麦克风权限是否被拒绝
	isMicrophoneDenied?: boolean;
};

/**
 * 音频消息录制器组件
 * 负责处理音频录制的整个流程，包括开始、停止、取消和上传
 */
const AudioMessageRecorder = ({ rid, chatContext, isMicrophoneDenied }: AudioMessageRecorderProps): ReactElement | null => {
	// 使用翻译钩子
	const { t } = useTranslation();

	// 组件状态管理
	// 当前录制状态：loading表示正在处理上传，recording表示正在录制
	const [state, setState] = useState<'loading' | 'recording'>('recording');
	// 录音时长显示
	const [time, setTime] = useState('00:00');
	// 录音计时器的引用
	const [recordingInterval, setRecordingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
	// 当前正在录音的房间ID
	const [recordingRoomId, setRecordingRoomId] = useState<IRoom['_id'] | null>(null);

	/**
	 * 停止录音函数
	 * 清理录音计时器、重置状态、停止录音并返回录音数据
	 */
	const stopRecording = useEffectEvent(async () => {
		// 清理计时器
		if (recordingInterval) {
			clearInterval(recordingInterval);
		}
		setRecordingInterval(null);
		setRecordingRoomId(null);

		// 重置录音时长显示
		setTime('00:00');

		// 通知聊天上下文停止录音操作
		chat?.action.stop('recording');

		// 设置composer的录音模式为false
		chat?.composer?.setRecordingMode(false);

		// 停止录音并获取录音数据
		const blob = await new Promise<Blob>((resolve) => audioRecorder.stop(resolve));

		return blob;
	});

	/**
	 * 组件卸载时处理函数
	 * 如果组件卸载时仍在录音状态，则停止录音
	 */
	const handleUnmount = useEffectEvent(async () => {
		if (state === 'recording') {
			await stopRecording();
		}
	});

	/**
	 * 开始录音函数
	 * 设置录音模式、启动录音、设置计时器更新录音时长
	 */
	const handleRecord = useEffectEvent(async () => {
		// 设置composer为录音模式
		chat?.composer?.setRecordingMode(true);

		// 如果已经在其他房间录音，则不进行新的录音
		if (recordingRoomId && recordingRoomId !== rid) {
			return;
		}

		try {
			// 开始录音
			await audioRecorder.start();
			// 通知聊天上下文执行持续录音操作
			chat?.action.performContinuously('recording');
			// 记录开始时间，用于计算录音时长
			const startTime = new Date();
			// 设置计时器，每秒更新录音时长显示
			setRecordingInterval(
				setInterval(() => {
					const now = new Date();
					const distance = (now.getTime() - startTime.getTime()) / 1000;
					const minutes = Math.floor(distance / 60);
					const seconds = Math.floor(distance % 60);
					setTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
				}, 1000),
			);
			// 设置当前录音的房间ID
			setRecordingRoomId(rid);
		} catch (error) {
			// 捕获并记录错误
			console.log(error);
			// 发生错误时，退出录音模式
			chat?.composer?.setRecordingMode(false);
		}
	});

	/**
	 * 取消录音按钮点击处理函数
	 * 调用停止录音函数，不保存录音结果
	 */
	const handleCancelButtonClick = useEffectEvent(async () => {
		await stopRecording();
	});

	// 获取聊天上下文，优先使用React Context中的chat，否则使用传入的chatContext
	const chat = useChat() ?? chatContext;

	/**
	 * 完成录音按钮点击处理函数
	 * 设置状态为加载中，停止录音并上传音频文件
	 */
	const handleDoneButtonClick = useEffectEvent(async () => {
		// 设置状态为加载中，表示正在处理上传
		setState('loading');

		// 停止录音并获取录音数据
		const blob = await stopRecording();

		// 创建音频文件对象，格式为MP3
		const fileName = `${t('Audio_record')}.mp3`;
		const file = new File([blob], fileName, { type: 'audio/mpeg' });

		// 上传音频文件
		await chat?.flows.uploadFiles([file]);
	});

	/**
	 * 组件挂载时的副作用
	 * 自动开始录音，并在组件卸载时停止录音
	 */
	useEffect(() => {
		handleRecord();

		return () => {
			handleUnmount();
		};
	}, [handleUnmount, handleRecord]);

	// 如果麦克风权限被拒绝，则不渲染任何内容
	if (isMicrophoneDenied) {
		return null;
	}

	// 渲染音频录制界面
	return (
		<Box display='flex' position='absolute' color='default' pi={4} pb={12} role='group' aria-label={t('Audio_recorder')}>
			{state === 'recording' && (
				<>
					{/* 取消录音按钮 */}
					<MessageComposerAction icon='circle-cross' title={t('Cancel_recording')} onClick={handleCancelButtonClick} />
					{/* 录音指示器和时长显示 */}
					<Box display='flex' alignItems='center' mi={4} justifyContent='center'>
						<Icon name='rec' color='red' />
						<Box fontScale='p2' mis={4} is='span' minWidth='x40'>
							{time}
						</Box>
					</Box>
					{/* 完成录音按钮 */}
					<MessageComposerAction icon='circle-check' title={t('Finish_recording')} onClick={handleDoneButtonClick} />
				</>
			)}
			{/* 加载状态显示 */}
			{state === 'loading' && <Throbber inheritColor size='x12' />}
		</Box>
	);
};

export default AudioMessageRecorder;
