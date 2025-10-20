# Rocket.Chat 项目结构说明文档

本文档详细描述了 Rocket.Chat 项目的目录层次结构及其用途，帮助开发者理解项目架构和各模块的功能。

## 根目录结构

| 目录/文件 | 用途 |
|---------|------|
| `.changeset/` | 变更集管理，用于版本发布和变更日志生成 |
| `.devcontainer/` | 开发容器配置，用于标准化开发环境 |
| `.github/` | GitHub 相关配置，包括工作流、贡献指南、ISSUE 模板等 |
| `.gitignore` | Git 忽略文件配置 |
| `.gitpod/` | GitPod 开发环境配置 |
| `.houston/` | Houston 部署工具配置 |
| `.yarn/` | Yarn 包管理器缓存和配置 |
| `apps/` | 主要应用代码，包含 meteor 和 uikit-playground |
| `development/` | 开发环境配置文件 |
| `ee/` | 企业版功能代码 |
| `notebook/` | 安装和开发笔记 |
| `packages/` | 核心包和模块集合 |
| `scripts/` | 项目构建和维护脚本 |
| `turbo.json` | Turbo 构建系统配置 |
| `package.json` | 项目依赖和脚本定义 |
| `yarn.lock` | Yarn 依赖版本锁定文件 |

## 详细目录说明

### apps/

应用程序主目录，包含主要的应用代码。

#### apps/meteor/

Meteor 框架实现的主应用代码。

| 子目录 | 用途 |
|-------|------|
| `.babelrc` | Babel 转译配置 |
| `.docker/` | Docker 相关配置 |
| `.meteor/` | Meteor 框架配置和依赖 |
| `app/` | 应用核心代码 |
| `client/` | 客户端代码 |
| `imports/` | 可导入的共享代码模块 |
| `server/` | 服务器端代码 |
| `tests/` | 测试代码 |
| `public/` | 静态资源文件 |
| `private/` | 私有资源文件 |

#### apps/uikit-playground/

UI Kit 组件的开发和测试环境。

### ee/

企业版功能相关代码。

| 子目录 | 用途 |
|-------|------|
| `apps/` | 企业版应用 |
| `packages/` | 企业版专用包 |

### packages/

项目核心包和模块集合，包含各种功能组件。

#### 核心功能包

| 包名 | 用途 |
|-----|------|
| `account-utils/` | 账户相关工具函数 |
| `agenda/` | 任务调度系统 |
| `api-client/` | API 客户端实现 |
| `apps/` | 应用系统核心 |
| `apps-engine/` | 应用引擎，用于应用开发和管理 |
| `base64/` | Base64 编解码工具 |
| `core-services/` | 核心服务集合 |
| `core-typings/` | TypeScript 核心类型定义 |
| `cron/` | 定时任务系统 |
| `ddp-client/` | DDP (Distributed Data Protocol) 客户端实现 |
| `freeswitch/` | FreeSWITCH 集成 |
| `gazzodown/` | 自定义 Markdown 解析器 |
| `http-router/` | HTTP 路由系统 |
| `i18n/` | 国际化和本地化支持 |
| `jwt/` | JWT (JSON Web Token) 实现 |
| `livechat/` | 实时聊天功能模块 |
| `log-format/` | 日志格式化工具 |
| `logger/` | 日志系统 |
| `message-parser/` | 消息解析器 |
| `models/` | 数据模型定义 |
| `mongo-adapter/` | MongoDB 适配器 |
| `node-poplib/` | POP3 邮件客户端实现 |
| `omni-core/` | 全渠道通信核心 |
| `random/` | 随机数生成工具 |
| `rest-typings/` | REST API 类型定义 |
| `server-fetch/` | 服务器端 fetch 实现 |
| `sha256/` | SHA-256 加密工具 |
| `tracing/` | 分布式跟踪系统 |
| `ui-avatar/` | 头像 UI 组件 |
| `ui-client/` | UI 客户端组件 |
| `ui-composer/` | 消息编辑器组件 |
| `ui-contexts/` | UI 上下文管理 |
| `ui-kit/` | UI 组件库 |
| `ui-video-conf/` | 视频会议 UI 组件 |
| `ui-voip/` | VoIP 通信 UI 组件 |

#### 开发工具包

| 包名 | 用途 |
|-----|------|
| `eslint-config/` | ESLint 配置 |
| `jest-presets/` | Jest 测试预设 |
| `storybook-config/` | Storybook 配置 |
| `tools/` | 开发和构建工具 |
| `tsconfig/` | TypeScript 配置 |

### .github/

GitHub 相关配置和工作流。

| 子目录/文件 | 用途 |
|-----------|------|
| `CODEOWNERS` | 代码所有者配置 |
| `CONTRIBUTING.md` | 贡献指南 |
| `ISSUE_TEMPLATE/` | Issue 模板 |
| `actions/` | GitHub Actions 工作流 |
| `workflows/` | CI/CD 工作流配置 |

### 开发配置目录

| 目录 | 用途 |
|-----|------|
| `.devcontainer/` | VS Code 开发容器配置 |
| `.gitpod/` | GitPod 开发环境配置 |
| `.vscode/` | VS Code 编辑器配置 |

## 项目架构说明

Rocket.Chat 采用模块化架构，将功能分解为多个独立的包和模块。主要架构特点：

1. **Meteor 应用**：核心应用基于 Meteor 框架开发，提供实时通信能力
2. **模块化设计**：功能被拆分为多个独立的包，位于 `packages/` 目录
3. **企业版扩展**：企业版功能通过 `ee/` 目录下的代码扩展基础功能
4. **应用系统**：通过 apps-engine 提供插件式应用扩展能力
5. **UI 组件库**：提供完整的 UI 组件系统，支持主题定制和国际化

## 核心功能模块

### 1. 实时通信系统
- 基于 Meteor 的 DDP 协议实现实时消息传递
- 支持文本、图片、文件等多种消息类型
- 提供消息历史、搜索和过滤功能

### 2. 用户认证与权限
- 多种认证方式支持（密码、OAuth、LDAP 等）
- 细粒度的角色权限控制系统
- 用户和团队管理

### 3. 应用生态系统
- 通过 apps-engine 支持第三方应用集成
- 提供应用开发 API 和 SDK
- 支持应用市场和插件管理

### 4. 全渠道通信
- 支持多种通信渠道（Web、Mobile、Email、Social 等）
- 统一消息管理和路由
- 客户服务和支持功能

### 5. 视频会议
- 集成视频会议功能
- 支持屏幕共享和协作
- 会议预约和管理

## 开发与构建

项目使用 Yarn 作为包管理器，Turbo 作为构建系统。主要构建和开发命令：

- 安装依赖：`yarn install`
- 开发模式运行：`yarn dev`
- 构建项目：`yarn build`
- 运行测试：`yarn test`

## 部署方式

项目支持多种部署方式：

- Docker 容器化部署
- 传统服务器部署
- 云平台部署
- Kubernetes 集群部署

## 总结

Rocket.Chat 是一个功能丰富的开源通信平台，采用模块化架构设计，支持实时消息、视频会议、应用集成等多种功能。项目目录结构清晰，各模块职责明确，便于开发和维护。通过了解这些目录结构和模块功能，开发者可以更快地熟悉项目并参与贡献。