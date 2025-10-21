// 授权服务主启动文件
// 此文件负责初始化和启动Rocket.Chat的授权微服务，处理用户权限验证和授权逻辑

// 导入核心服务组件
import { api, getConnection, getTrashCollection } from '@rocket.chat/core-services';
// 导入数据模型注册器
import { registerServiceModels } from '@rocket.chat/models';
// 导入网络消息代理启动器
import { startBroker } from '@rocket.chat/network-broker';
// 导入分布式跟踪系统启动器
import { startTracing } from '@rocket.chat/tracing';
// 导入轻量级HTTP服务器框架
import polka from 'polka';

// 定义服务端口，从环境变量获取或使用默认值3034
const PORT = process.env.PORT || 3034;

// 自执行异步函数，处理服务初始化流程
(async () => {
	// 建立数据库连接，获取数据库实例和客户端
	const { db, client } = await getConnection();

	// 启动分布式跟踪系统，指定服务名称为'authorization-service'，并关联数据库客户端
	startTracing({ service: 'authorization-service', db: client });

	// 注册服务所需的数据模型，包括主数据库和垃圾回收集合
	registerServiceModels(db, await getTrashCollection());

	// 初始化并设置网络消息代理，用于服务间通信
	api.setBroker(startBroker());

	// 延迟导入Authorization服务，确保在模型注册后再加载
	// 注释说明了延迟导入的原因：需要在模型注册完成后再导入服务
	const { Authorization } = await import('../../../../apps/meteor/server/services/authorization/service');

	// 注册Authorization服务实例到API系统
	api.registerService(new Authorization());

	// 启动API服务，开始处理授权请求
	await api.start();

	// 创建并配置轻量级HTTP服务器
	polka()
		// 定义健康检查端点，用于监控服务状态
		.get('/health', async function (_req, res) {
			try {
				// 尝试获取节点列表，验证服务连接状态
				await api.nodeList();
				// 如果成功，返回'ok'表示服务健康
				res.end('ok');
			} catch (err) {
				// 如果发生错误，记录错误并返回500状态码
				console.error('Service not healthy', err);

				res.writeHead(500);
				res.end('not healthy');
			}
		})
		// 启动HTTP服务器，监听配置的端口
		.listen(PORT);
})();
