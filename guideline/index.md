# 学习笔记

## 项目结构

```
├── .changeset/                 # 代码变更集管理
├── .devcontainer/              # 开发容器配置
├── .editorconfig               # 编辑器配置
├── .github/                    # GitHub相关配置和工作流
├── .gitignore                  # Git忽略文件配置
├── .gitpod/                    # Gitpod在线开发环境配置
├── .houston/                   # Houston工具配置
├── .kodiak.toml                # Kodiak自动合并配置
├── .npmrc                      # npm配置
├── .prettierrc                 # Prettier代码格式化配置
├── .tool-versions              # 工具版本管理
├── .vscode/                    # VS Code编辑器配置
├── .yarn/                      # Yarn包管理器数据
├── .yarnrc.yml                 # Yarn配置
├── CODE_OF_CONDUCT.md          # 行为准则
├── FEATURES.md                 # 功能列表（英文）
├── FEATURES.zh-cn.md           # 功能列表（中文）
├── HISTORY.md                  # 项目历史记录
├── LICENSE                     # 许可证文件
├── README.md                   # 项目说明（英文）
├── README.zh-cn.md             # 项目说明（中文）
├── SECURITY.md                 # 安全信息
├── VIP Sponsors.md             # VIP赞助商信息
├── app.json                    # 应用配置
├── apps/                       # 应用程序目录
│   ├── meteor/                 # Meteor主应用
│   └── uikit-playground/       # UI组件 playground
├── codecov.yml                 # Codecov配置
├── development/                # 开发环境配置
├── docker-compose-ci.yml       # CI环境Docker配置
├── docker-compose-local.yml    # 本地开发Docker配置
├── ee/                         # 企业版功能
│   ├── apps/                   # 企业版应用
│   └── packages/               # 企业版包
├── fuselage.sh                 # Fuselage UI工具脚本
├── guideline/                  # 指南文档
├── package.json                # 项目依赖配置
├── packages/                   # 共享包集合
│   ├── account-utils/          # 账户工具
│   ├── agenda/                 # 任务调度
│   ├── api-client/             # API客户端
│   ├── apps/                   # 应用管理
│   ├── apps-engine/            # 应用引擎
│   ├── base64/                 # Base64编码工具
│   ├── cas-validate/           # CAS验证
│   ├── core-services/          # 核心服务
│   ├── core-typings/           # 核心类型定义
│   ├── cron/                   # 定时任务
│   ├── ddp-client/             # DDP客户端
│   ├── eslint-config/          # ESLint配置
│   ├── favicon/                # 图标处理
│   ├── freeswitch/             # FreeSWITCH集成
│   ├── fuselage-ui-kit/        # UI组件库
│   ├── gazzodown/              # 文档处理
│   ├── http-router/            # HTTP路由
│   ├── i18n/                   # 国际化处理
│   ├── instance-status/        # 实例状态
│   ├── jest-presets/           # Jest测试配置
│   ├── jwt/                    # JWT认证
│   ├── livechat/               # 在线客服
│   ├── log-format/             # 日志格式化
│   ├── logger/                 # 日志系统
│   ├── message-parser/         # 消息解析器
│   ├── mock-providers/         # 模拟服务提供者
│   ├── model-typings/          # 模型类型定义
│   ├── models/                 # 数据模型
│   ├── mongo-adapter/          # MongoDB适配器
│   ├── node-poplib/            # POP3客户端
│   ├── omni-core/              # 全渠道核心
│   ├── patch-injection/        # 补丁注入
│   ├── peggy-loader/           # Peggy加载器
│   ├── random/                 # 随机数生成
│   ├── release-action/         # 发布操作
│   ├── rest-typings/           # REST类型定义
│   ├── server-fetch/           # 服务端Fetch
│   ├── sha256/                 # SHA-256工具
│   ├── tools/                  # 通用工具
│   ├── tracing/                # 性能追踪
│   ├── tsconfig/               # TypeScript配置
│   ├── ui-avatar/              # 头像UI组件
│   ├── ui-client/              # UI客户端
│   ├── ui-composer/            # 消息编辑器UI
│   ├── ui-contexts/            # UI上下文
│   ├── ui-kit/                 # UI组件工具包
│   ├── ui-video-conf/          # 视频会议UI
│   └── ui-voip/                # VoIP通信UI
├── postcss.config.js           # PostCSS配置
├── scripts/                    # 脚本工具
├── turbo.json                  # Turborepo配置
└── yarn.lock                   # Yarn依赖锁定文件
```

### 主要目录说明

- **apps/**: 包含主要应用程序，尤其是Meteor主应用
- **packages/**: 共享包集合，包含各种功能模块和工具
- **ee/**: 企业版专有功能和包
- **.github/**: GitHub配置、工作流和CI/CD配置
- **development/**: 开发环境相关配置文件
- **guideline/**: 项目指南和文档

这个项目是一个完整的团队通信平台，使用JavaScript开发，包含服务器端和客户端代码，支持多种部署方式和集成选项。

从项目结构来看，此项目使用了以下软件框架和技术进行开发：

1. **Meteor**：在 `apps/meteor/` 目录可见，Meteor 是一个全栈 JavaScript 开发框架，可用于快速构建实时 Web 应用。
2. **TypeScript**：从 `packages/` 目录下存在 `tsconfig/` 目录可知，项目使用 TypeScript 进行开发，TypeScript 是 JavaScript 的超集，增加了静态类型检查。
3. **Yarn**：从 `.yarn/`、`.yarnrc.yml` 和 `yarn.lock` 文件可知，项目使用 Yarn 作为包管理器。
4. **Jest**：`packages/jest-presets/` 目录表明项目使用 Jest 作为测试框架。
5. **Prettier**：存在 `.prettierrc` 文件，说明项目使用 Prettier 进行代码格式化。
6. **ESLint**：`packages/eslint-config/` 目录显示项目使用 ESLint 进行代码 lint 检查。
7. **Turbo**：`turbo.json` 文件表明项目使用 Turborepo 来优化构建和开发流程。
8. **PostCSS**：`postcss.config.js` 文件说明项目使用 PostCSS 进行 CSS 处理。

### 本地运行项目步骤

#### 环境要求

```shell
# Install init
sudo apt update
sudo apt dist-upgrade -y
sudo apt install git curl unzip make build-essential python3 g++

# Install nvm
./install_mvn.sh

# Install node
cat package.json | grep -A4 engines | grep node
nvm install 22.16
nvm use 22.16

# Install yarn
npm install -g yarn

# Install deno
cat .tool-versions | grep deno
curl -fsSL https://deno.land/install.sh | sh -s v1.43.5
./install_deno.sh v1.43.5

# Install meteor
cat apps/meteor/.meteor/release
curl https://install.meteor.com/\?release\=3.3 | sh

```

#### 1. 安装依赖
确保你已经安装了 Node.js、Yarn 和 Docker。然后在项目根目录下运行以下命令安装依赖：

```bash
yarn install
```
#### 2. 启动本地服务
完成依赖安装后，可使用以下命令启动本地开发环境：

如果是在 windows 环境下，需要在 git bash 或者 wsl 中运行 yarn build。

先进行 build。

```bash
yarn build
```

最后再执行启动。

```bash
yarn dev
```
          
# Rocket.Chat项目的构建流程与Meteor使用方式

## 1. 构建系统概述

Rocket.Chat使用了现代化的monorepo构建架构，具体包含以下核心组件：

- **Yarn Workspaces**：用于管理多个子包
- **Turborepo**：高性能的构建系统，用于并行和增量构建
- **Meteor**：作为主应用的运行时和构建环境

## 2. Yarn Build构建流程详解

当执行`yarn build`命令时，构建流程如下：

1. **触发根目录构建脚本**：
   - 根目录package.json中的`"build": "turbo run build"`脚本被执行

2. **Turbo构建编排**：
   - Turbo根据turbo.json中的配置，确定构建任务的依赖关系和执行顺序
   - 首先构建所有依赖的包（`^build`依赖表示所有上游依赖）
   - 然后构建各个子项目，包括主Meteor应用

3. **Meteor应用构建**：
   - 对于主应用`@rocket.chat/meteor`，turbo.json中特别配置了`"@rocket.chat/meteor#build": {"dependsOn": ["^build"], "cache": false}`
   - 这意味着它依赖于所有其他包的构建完成，但自己不使用缓存

## 3. Meteor构建系统工作原理

Meteor应用的构建有其特殊性：

1. **Meteor特定的构建命令**：
   - 生产构建：`METEOR_DISABLE_OPTIMISTIC_CACHING=1 meteor build --server-only --directory /tmp/dist`
   - 开发构建：直接使用`meteor`命令启动开发服务器

2. **Meteor配置**：
   - Meteor版本：使用METEOR@3.3（从`.meteor/release`文件可见）
   - 支持平台：browser和server（从`.meteor/platforms`文件可见）
   - 入口点配置：
     ```json
     "meteor": {
       "mainModule": {
         "client": "client/main.ts",
         "server": "server/main.ts"
       }
     }
     ```

3. **Meteor构建特点**：
   - 内置热模块替换（HMR）功能
   - 自动处理服务端和客户端代码分离
   - 使用自己的模块系统，而不是标准Node.js模块系统
   - 自动处理依赖管理和构建优化

## 4. 完整构建流程总结

1. 用户执行`yarn build`
2. Turbo根据依赖关系，先构建所有packages
3. 最后构建Meteor应用，触发Meteor自己的构建系统
4. Meteor构建系统处理代码转换、打包和优化
5. 构建结果输出到指定目录（CI环境中是`/tmp/dist`）

## 5. 项目架构特点

- 采用模块化设计，将核心功能拆分为多个独立包
- 主应用使用Meteor框架构建，提供实时通信能力
- 使用TypeScript作为主要开发语言
- 支持多平台部署（浏览器客户端和服务器）

这种架构既保持了Meteor框架的实时性优势，又通过monorepo和现代构建工具提高了开发效率和项目可维护性。


