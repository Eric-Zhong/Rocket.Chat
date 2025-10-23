/**
 * LDAP登录功能实现
 * 此文件扩展了Meteor的登录方法，提供LDAP认证和LDAP+TOTP两步验证登录功能
 */

// 导入Meteor核心模块
import { Meteor } from 'meteor/meteor';

// 导入自定义的登录方法处理函数和类型
import { callLoginMethod, handleLogin, type LoginCallback } from '../../lib/2fa/overrideLoginMethod';

/**
 * 扩展Meteor模块的类型声明
 * 为Meteor命名空间添加loginWithLDAP方法的TypeScript类型定义
 */
declare module 'meteor/meteor' {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Meteor {
		/**
		 * LDAP登录方法
		 * @param username - 用户名，可以是字符串或包含用户名、邮箱或ID的对象
		 * @param ldapPass - LDAP密码
		 * @param callback - 可选的登录回调函数
		 */
		function loginWithLDAP(
			username: string | { username: string } | { email: string } | { id: string },
			ldapPass: string,
			callback?: LoginCallback,
		): void;
	}
}

/**
 * 基本LDAP登录函数
 * 构造LDAP登录请求并调用loginWithMethod进行认证
 *
 * @param username - 用户名信息，可以是字符串或包含用户名、邮箱、ID的对象
 * @param ldapPass - LDAP密码
 * @returns 登录方法的调用结果
 */
const loginWithLDAP = (username: string | { username: string } | { email: string } | { id: string }, ldapPass: string) =>
	callLoginMethod({
		methodArguments: [
			{
				ldap: true, // 标识为LDAP登录
				username,  // 用户名信息
				ldapPass,  // LDAP密码
				ldapOptions: {}, // LDAP选项配置（当前为空对象）
			},
		],
	});

/**
 * LDAP+TOTP两步验证登录函数
 * 支持LDAP认证加上时间基一次性密码(TOTP)的两步验证方式
 *
 * @param username - 用户名信息
 * @param ldapPass - LDAP密码
 * @param code - TOTP验证码
 * @returns 登录方法的调用结果
 */
const loginWithLDAPAndTOTP = (
	username: string | { username: string } | { email: string } | { id: string },
	ldapPass: string,
	code: string,
) => {
	// 构建基础LDAP登录请求对象
	const loginRequest = {
		ldap: true,
		username,
		ldapPass,
		ldapOptions: {},
	};

	// 将LDAP登录请求包装在TOTP验证中
	return callLoginMethod({
		methodArguments: [
			{
				totp: {
					login: loginRequest, // 基础LDAP登录请求
					code, // TOTP验证码
				},
			},
		],
	});
};

/**
 * 将LDAP登录方法注册到Meteor对象上
 * 使用handleLogin函数包装基本登录和两步验证登录方法
 * 自动处理是否需要两步验证的逻辑
 */
Meteor.loginWithLDAP = handleLogin(loginWithLDAP, loginWithLDAPAndTOTP);
