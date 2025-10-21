#!/bin/bash
# Rocket.Chat Meteor 包发布脚本
# 用途：批量将 apps/meteor/packages/ 目录下的所有 Meteor 包发布到 Meteor 包仓库

# 设置 bash 严格模式：
# -x: 显示执行的命令（调试模式）
# -e: 遇到错误立即退出
# -u: 引用未定义变量时退出
# -v: 执行命令前显示命令
# -o pipefail: 管道中的任一命令失败时退出
set -x
set -euvo pipefail
# 设置 IFS 为换行符和制表符，避免处理文件名中的空格问题
IFS=$'\n\t'

# 遍历 packages 目录下的所有子目录
# 每个子目录代表一个独立的 Meteor 包
for d in packages/* ; do
  # 输出当前正在处理的包路径，用于日志记录和调试
  echo "$d"

  # 切换到当前包目录
  cd $d

  # 该命令会将包发布到 Meteor 包仓库（atmospherejs.com）
  # 注意：执行此命令需要有效的 Meteor 账户身份验证
  meteor publish

  # 切换回脚本的原始工作目录（apps/meteor）
  cd ../../
done
