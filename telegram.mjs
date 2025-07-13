import fetch from 'node-fetch';

// 发送Telegram通知
export async function sendTelegramNotification(results, recordingUrl) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
        console.error('❌ Telegram配置缺失');
        return;
    }
    
    try {
        console.log('📱 开始发送Telegram通知...');
        
        const message = buildNotificationMessage(results, recordingUrl);
        
        // 发送消息
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });
        
        if (response.ok) {
            console.log('✅ Telegram通知发送成功');
        } else {
            const errorData = await response.json();
            console.error('❌ Telegram通知发送失败:', errorData);
        }
        
    } catch (error) {
        console.error('❌ Telegram通知发送异常:', error.message);
    }
}

// 构建通知消息
function buildNotificationMessage(results, recordingUrl) {
    const timestamp = new Date().toLocaleString('zh-CN', { 
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let message = `🤖 <b>XServer VPS 自动续费报告</b>\n\n`;
    message += `📅 执行时间: ${timestamp}\n`;
    message += `📊 处理账号数: ${results.length}\n\n`;
    
    // 统计结果
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;
    
    message += `📈 <b>执行结果统计:</b>\n`;
    message += `✅ 成功: ${successCount} 个账号\n`;
    message += `❌ 失败: ${failCount} 个账号\n\n`;
    
    // 详细结果
    message += `📋 <b>详细结果:</b>\n`;
    results.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        const account = result.account || `账号${index + 1}`;
        
        message += `${status} <b>${account}</b>\n`;
        
        if (!result.success && result.error) {
            // 截断过长的错误信息
            const errorMsg = result.error.length > 100 
                ? result.error.substring(0, 100) + '...' 
                : result.error;
            message += `    💬 ${errorMsg}\n`;
        }
        message += '\n';
    });
    
    // 录屏文件链接
    if (recordingUrl) {
        message += `🎬 <b>录屏文件:</b>\n`;
        message += `<a href="${recordingUrl}">点击下载录屏文件</a>\n\n`;
    }
    
    // 添加提示信息
    message += `💡 <i>此通知由自动化脚本发送，如有问题请检查日志</i>`;
    
    return message;
}

// 发送简单通知（用于保活等简单场景）
export async function sendSimpleNotification(text) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
        return;
    }
    
    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('❌ 简单通知发送失败:', error.message);
    }
} 