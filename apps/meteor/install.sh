#!/bin/bash
# Rocket.Chat 安装脚本
# 用途：从官方发布渠道下载并安装 Rocket.Chat 应用
# 支持两种模式：生产环境和开发环境

# 设置 bash 严格模式：
# -e: 遇到错误立即退出
# -u: 引用未定义变量时退出
# -v: 执行命令前显示命令
# -o pipefail: 管道中的任一命令失败时退出
set -x
set -euvo pipefail
# 设置 IFS 为换行符和制表符，避免处理文件名中的空格问题
IFS=$'\n\t'

# 默认配置：生产环境安装路径和 PM2 配置文件
ROOTPATH=/var/www/rocket.chat
PM2FILE=pm2.json

# 检查第一个参数是否为 "development"
# 如果是，则使用开发环境配置
if [ "$1" == "development" ]; then
  # 开发环境安装路径
  ROOTPATH=/var/www/rocket.chat.dev
  # 开发环境 PM2 配置文件
  PM2FILE=pm2.dev.json
fi

# 切换到安装目录
cd $ROOTPATH

# 导入 Rocket.Chat 发布密钥用于验证下载包的完整性
gpg --keyserver ha.pool.sks-keyservers.net --recv-keys 0E163286C20D07B9787EBE9FD7F9D0414FD08104

# 下载最新版本的 Rocket.Chat 发布包
curl -SLf "https://releases.rocket.chat/latest/download/" -o rocket.chat.tgz

# 下载发布包的数字签名文件用于验证
curl -SLf "https://releases.rocket.chat/latest/asc" -o rocket.chat.tgz.asc 

# 使用导入的密钥验证发布包的完整性
gpg --verify rocket.chat.tgz.asc

# 检查验证结果
if [ $? -eq 0 ]; then
    # 验证成功，显示确认信息
    echo "Verified download integrity"
else
    # 验证失败，显示错误信息并退出脚本
    echo "Invalid file, download corrupted or incomplete"
    exit 1
fi

# 解压下载的发布包
tar zxf rocket.chat.tgz  &&  rm rocket.chat.tgz rocket.chat.tgz.asc

# 切换到解压后的服务端目录
cd $ROOTPATH/bundle/programs/server

# 安装服务端依赖包
npm install

# 使用 PM2 管理工具启动或重启 Rocket.Chat 服务
# 使用对应的 PM2 配置文件（生产或开发环境）
pm2 startOrRestart $ROOTPATH/current/$PM2FILE
