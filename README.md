# XServer VPS 自动续费工具

这是一个用于自动续费 XServer VPS 服务的工具，特别是针对免费 VPS 的自动续费。

## 功能特性

### 🚀 主要功能
- **多账号VPS续费**: 支持同时管理多个XServer账号的VPS续费
- **自动VPS续费**: 每天上午8点自动执行VPS续费操作
- **Telegram通知**: 实时推送续费结果到Telegram
- **Repo保活**: 防止GitHub因长时间不活动而停止Actions
- **操作录制**: 全程录制操作过程，便于审计和调试

### 🤖 自动化特性
- **每日续费**: 每天上午8点 (UTC) 自动执行VPS续费
- **每周保活**: 每周日2点半 (UTC) 执行repo保活更新
- **失败重试**: 即使VPS续费失败，也会尝试执行保活操作
- **手动触发**: 支持手动启动和推送触发
- **智能通知**: 成功/失败都会发送详细通知

## 文件说明

- `main.mjs` - 主程序，执行多账号VPS续费流程
- `keepalive.mjs` - 保活脚本，更新repo状态
- `telegram.mjs` - Telegram通知模块
- `.github/workflows/main.yml` - GitHub Actions工作流配置

## 使用说明

### 环境变量设置
在GitHub仓库的Settings > Secrets and variables > Actions中设置：

#### 必需配置
- `ACCOUNTS`: 多账号配置，JSON格式
  ```json
  [
    {"your-email1@example.com": "password1"},
    {"your-email2@example.com": "password2"}
  ]
  ```

#### Telegram通知配置（可选）
- `TELEGRAM_BOT_TOKEN`: Telegram Bot Token
- `TELEGRAM_CHAT_ID`: Telegram聊天ID

### Telegram Bot设置
1. 在Telegram中搜索 `@BotFather`
2. 发送 `/newbot` 创建新机器人
3. 获取Bot Token
4. 将机器人添加到目标聊天/频道
5. 获取Chat ID（可通过 `@userinfobot` 获取）

### 手动运行
```bash
# 安装依赖
yarn add puppeteer node-fetch

# 设置环境变量
export ACCOUNTS='[{"your-email@example.com": "your-password"}]'
export TELEGRAM_BOT_TOKEN="your-bot-token"
export TELEGRAM_CHAT_ID="your-chat-id"

# 运行程序
node main.mjs
```

## 通知内容

### VPS续费通知包含：
- 📅 执行时间
- 📊 处理账号数量
- 📈 成功/失败统计
- 📋 每个账号的详细结果
- 🎬 录屏文件下载链接
- 💬 失败原因（如有）

### 保活通知包含：
- 📅 执行时间
- ✅ 操作状态
- 💡 提示信息

## 执行流程

1. **每日上午8点**：处理所有账号VPS续费 → 发送详细通知 → 执行repo保活
2. **每周日2点半**：执行repo保活 → 发送保活通知
3. **手动触发**：执行完整流程

## 手册链接

マニュアル
https://motoki-design.co.jp/wordpress/xserver-vps-auto-renew/

Manual
https://motoki-design.co.jp/wordpress/xserver-vps-auto-renew/

手册 https://motoki-design.co.jp/wordpress/xserver-vps-auto-renew/
