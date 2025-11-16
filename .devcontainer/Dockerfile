# Rocket.Chat 开发容器 Dockerfile
# 此文件用于定义 Visual Studio Code 开发容器的构建环境
# 提供完整的 Rocket.Chat 开发所需的依赖和工具链

# 使用基于 Ubuntu 的 VS Code 开发容器基础镜像
FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# 复制 package.json 到临时位置，用于后续获取 Node.js 版本要求
COPY package.json /tmp/package.json

# 安装必要的系统依赖和构建工具
# apt-transport-https: 允许通过 HTTPS 使用 APT 仓库
# build-essential: 提供基础构建工具链（gcc, g++, make 等）
# ca-certificates: 提供 CA 证书，支持 HTTPS 连接
# curl: 用于下载文件和 API 请求
# jq: 命令行 JSON 处理工具，用于解析 package.json
# libssl-dev: OpenSSL 开发库，用于加密相关功能
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    build-essential \
    ca-certificates \
    curl \
    jq \
    libssl-dev && \
    rm -rf /var/lib/apt/lists/*  # 清理 APT 缓存，减小镜像体积

# 配置 NVM (Node Version Manager) 环境变量
ENV NVM_DIR /usr/local/nvm

# 安装 NVM 并安装项目所需的 Node.js 版本
# 1. 创建 NVM 目录
# 2. 下载并执行 NVM 安装脚本
# 3. 使用 jq 从 package.json 中提取所需的 Node.js 版本
# 4. 全局安装 Yarn 包管理工具
RUN mkdir -p $NVM_DIR && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash && \
    bash -c ". $NVM_DIR/nvm.sh && nvm install $(jq -r '.engines.node' /tmp/package.json) && npm install -g yarn"

# 将 NVM 配置添加到 bashrc，确保每次启动容器时自动加载 NVM
RUN echo "export NVM_DIR=$NVM_DIR" >> /etc/bash.bashrc && \
    echo "[ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\"" >> /etc/bash.bashrc

# 配置 Deno 环境变量
ENV DENO_INSTALL=/usr/local/deno

# 安装 Deno JavaScript/TypeScript 运行时
# 1. 创建 Deno 安装目录
# 2. 下载并执行 Deno 安装脚本
RUN mkdir -p $DENO_INSTALL && \
    curl -fsSL https://deno.land/install.sh | sh

# 设置 Deno 环境变量，确保命令行可访问
ENV DENO_INSTALL="/usr/local/deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# 将 Deno 配置添加到 bashrc，确保每次启动容器时自动加载
RUN echo 'export DENO_INSTALL="/usr/local/deno"' >> /etc/bash.bashrc && \
    echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> /etc/bash.bashrc

# 配置 Meteor 环境变量
ENV METEOR_INSTALL="/usr/local/meteor"
ENV PATH="$METEOR_INSTALL/bin:$PATH"

# 安装 Meteor 框架
# 1. 下载并执行 Meteor 安装脚本
# 2. 将默认安装在用户目录的 Meteor 移动到全局安装位置
RUN curl https://install.meteor.com/ | sh && \
    mv ~/.meteor $METEOR_INSTALL

# 将 Meteor 配置添加到 bashrc，确保每次启动容器时自动加载
RUN echo 'export METEOR_INSTALL="/usr/local/meteor"' >> /etc/bash.bashrc && \
    echo 'export PATH="$METEOR_INSTALL/bin:$PATH"' >> /etc/bash.bashrc

# 设置容器默认启动命令为 bash shell
CMD ["bash"]
