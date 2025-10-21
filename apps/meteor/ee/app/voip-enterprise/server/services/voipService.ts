// VoIP企业版服务扩展模块
// 此模块通过License系统动态覆盖OmnichannelVoipService中的方法，提供企业级VoIP功能增强

// 导入所需的类型定义
import type { ILivechatAgent, ILivechatVisitor, IVoipRoomClosingInfo, IUser, IVoipRoom } from '@rocket.chat/core-typings';
// 导入License管理模块，用于条件性功能覆盖
import { License } from '@rocket.chat/license';

// 导入VoIP房间关闭消息的类型定义
import type { IOmniRoomClosingMessage } from '../../../../../server/services/omnichannel-voip/internalTypes';
// 导入要被覆盖的OmnichannelVoipService服务类
import { OmnichannelVoipService } from '../../../../../server/services/omnichannel-voip/service';
// 导入计算通话保持时间的工具函数
import { calculateOnHoldTimeForRoom } from '../lib/calculateOnHoldTimeForRoom';

// 使用License系统根据许可证类型动态覆盖OmnichannelVoipService类中的方法
// 只有在拥有'voip-enterprise'许可证时，才会应用此覆盖
await License.overwriteClassOnLicense('voip-enterprise', OmnichannelVoipService, {
	/**
	 * 增强版的获取房间关闭数据方法
	 * 扩展了原始功能，增加了评论、标签和通话保持时间的处理
	 * 
	 * @param _originalFn 被覆盖的原始方法（此处未使用，但作为覆盖机制的标准参数保留）
	 * @param closeInfo 房间关闭信息对象
	 * @param closeSystemMsgData 系统关闭消息数据对象
	 * @param room VoIP房间对象
	 * @param sysMessageId 系统消息ID，标识关闭类型
	 * @param options 可选参数，包含评论和标签
	 * @returns 更新后的房间关闭信息和系统消息数据
	 */
	async getRoomClosingData(
		_originalFn: (
			closer: ILivechatVisitor | ILivechatAgent,
			room: IVoipRoom,
			user: IUser,
			sysMessageId?: 'voip-call-wrapup' | 'voip-call-ended-unexpectedly',
			options?: { comment?: string | null; tags?: string[] | null },
		) => Promise<boolean>,
		closeInfo: IVoipRoomClosingInfo,
		closeSystemMsgData: IOmniRoomClosingMessage,
		room: IVoipRoom,
		sysMessageId: 'voip-call-wrapup' | 'voip-call-ended-unexpectedly',
		options?: { comment?: string; tags?: string[] },
	): Promise<{ closeInfo: IVoipRoomClosingInfo; closeSystemMsgData: IOmniRoomClosingMessage }> {
		// 从选项中解构评论和标签，如果选项不存在则使用空对象
		const { comment, tags } = options || {};
		
		// 如果提供了评论，更新系统消息内容
		if (comment) {
			closeSystemMsgData.msg = comment;
		}
		
		// 如果提供了标签且不为空，更新房间关闭信息的标签
		if (tags?.length) {
			closeInfo.tags = tags;
		}

		// 当系统消息ID为'voip-call-wrapup'且没有提供评论时，设置消息类型为'voip-call-ended'
		if (sysMessageId === 'voip-call-wrapup' && !comment) {
			closeSystemMsgData.t = 'voip-call-ended';
		}

		// 获取当前时间，用于计算通话保持时间
		const now = new Date();
		// 计算房间的总通话保持时间
		const callTotalHoldTime = await calculateOnHoldTimeForRoom(room, now);
		// 将计算得到的通话保持时间添加到房间关闭信息中
		closeInfo.callTotalHoldTime = callTotalHoldTime;

		// 返回更新后的房间关闭信息和系统消息数据
		return { closeInfo, closeSystemMsgData };
	},
});
