import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { sendSimpleNotification } from './telegram.mjs';

// 保活脚本 - 更新repo状态
async function keepRepoAlive() {
    try {
        console.log('🤖 开始执行repo保活操作...');
        
        // 创建或更新保活文件
        const keepaliveContent = `# Repo Keepalive

Last updated: ${new Date().toISOString()}
This file is automatically updated to keep the repository active.

## 保活记录
- 文件创建/更新时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
- 触发原因: VPS续费完成后的保活操作
- 状态: ✅ 成功

---
*此文件由自动化脚本维护，请勿手动修改*
`;

        writeFileSync('keepalive.md', keepaliveContent);
        console.log('✅ 保活文件已更新');

        // 配置Git用户信息
        execSync('git config --local user.email "action@github.com"', { stdio: 'inherit' });
        execSync('git config --local user.name "GitHub Action"', { stdio: 'inherit' });

        // 添加文件到Git
        execSync('git add keepalive.md', { stdio: 'inherit' });
        console.log('✅ 文件已添加到Git暂存区');

        // 提交更改
        const commitMessage = `🤖 Auto update: Keep repository active after VPS renewal [skip ci]`;
        execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        console.log('✅ 更改已提交');

        // 推送到远程仓库
        execSync('git push', { stdio: 'inherit' });
        console.log('✅ 更改已推送到远程仓库');
        
        console.log('🎉 Repo保活操作完成！');
        
        // 发送Telegram通知（可选）
        await sendSimpleNotification(`🔄 <b>Repo保活完成</b>\n\n📅 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n✅ 状态: 成功\n\n💡 仓库已更新，保持活跃状态`);
        
    } catch (error) {
        console.error('❌ Repo保活操作失败:', error.message);
        
        // 发送失败通知
        await sendSimpleNotification(`❌ <b>Repo保活失败</b>\n\n📅 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n💬 错误: ${error.message}`);
        
        // 不抛出错误，避免影响主流程
    }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
    keepRepoAlive();
}

export { keepRepoAlive }; 