/**
 * 项目根目录ESLint配置文件
 * 用于覆盖默认规则，解决行尾符号(CR vs CRLF)检查警告问题
 */
module.exports = {
  // 扩展项目默认的ESLint配置
  extends: ['@rocket.chat/eslint-config'],
  // 覆盖规则配置
  rules: {
    // 禁用行尾符号检查，允许混合使用LF和CRLF
    // 解决Windows系统上的'CR 不是 CRLF'警告问题
    'linebreak-style': 'off',
  },
};
