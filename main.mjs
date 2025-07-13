import puppeteer from 'puppeteer'
import { setTimeout } from 'node:timers/promises'
import { keepRepoAlive } from './keepalive.mjs'
import { sendTelegramNotification } from './telegram.mjs'

// 解析多账号配置
function parseAccounts(accountsStr) {
    try {
        // 解析格式: ['账号1':'密码1',"账号2":"密码2"]
        const accounts = JSON.parse(accountsStr);
        return accounts;
    } catch (error) {
        console.error('❌ 账号配置解析失败:', error.message);
        return [];
    }
}

// 执行单个账号的VPS续费
async function renewVPSForAccount(page, email, password, accountIndex) {
    const results = {
        account: email,
        success: false,
        error: null,
        recordingUrl: null
    };

    try {
        console.log(`🚀 开始处理账号 ${accountIndex + 1}: ${email}`);
        
        // 登录
        await page.goto('https://secure.xserver.ne.jp/xapanel/login/xserver/');
        await page.locator('#memberid').fill(email);
        await page.locator('#user_password').fill(password);
        await page.click('text=ログインする');
        await page.waitForNavigation();
        
        // 执行续费流程
        await page.goto('https://secure.xserver.ne.jp/xapanel/xvps/index');
        await page.click('.contract__menuIcon');
        await page.click('text=契約情報');
        await page.click('text=更新する');
        await page.click('text=引き続き無料VPSの利用を継続する');
        await page.waitForNavigation();
        await page.click('text=無料VPSの利用を継続する');
        
        results.success = true;
        console.log(`✅ 账号 ${email} 续费成功`);
        
    } catch (error) {
        results.success = false;
        results.error = error.message;
        console.error(`❌ 账号 ${email} 续费失败:`, error.message);
    }
    
    return results;
}

// 主函数
async function main() {
    const browser = await puppeteer.launch({
        defaultViewport: {width: 1080, height: 1024},
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const [page] = await browser.pages();
    const recorder = await page.screencast({ path: 'recording.webm' });
    
    const allResults = [];
    let recordingUrl = null;
    
    try {
        // 解析多账号配置
        const accounts = parseAccounts(process.env.ACCOUNTS);
        if (accounts.length === 0) {
            throw new Error('没有配置有效的账号信息');
        }
        
        console.log(`📋 开始处理 ${accounts.length} 个账号的VPS续费...`);
        
        // 处理每个账号
        for (let i = 0; i < accounts.length; i++) {
            const [email, password] = Object.entries(accounts[i])[0];
            const result = await renewVPSForAccount(page, email, password, i);
            allResults.push(result);
            
            // 账号间稍作延迟
            if (i < accounts.length - 1) {
                await setTimeout(2000);
            }
        }
        
        // 执行repo保活操作
        console.log('🔄 开始执行repo保活操作...');
        await keepRepoAlive();
        
        // 获取录屏文件下载地址（GitHub Actions环境）
        if (process.env.GITHUB_RUN_ID) {
            recordingUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}/artifacts`;
        }
        
    } catch (e) {
        console.error('❌ 执行过程中出现错误:', e);
        
        // 即使VPS续费失败，也尝试执行保活操作
        try {
            console.log('🔄 尝试执行repo保活操作...');
            await keepRepoAlive();
        } catch (keepaliveError) {
            console.error('❌ Repo保活操作也失败了:', keepaliveError);
        }
        
        // 添加错误结果
        allResults.push({
            account: '系统错误',
            success: false,
            error: e.message,
            recordingUrl: null
        });
    } finally {
        await setTimeout(2000);
        await recorder.stop();
        await browser.close();
        console.log('🏁 所有操作已完成');
        
        // 发送Telegram通知
        if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
            await sendTelegramNotification(allResults, recordingUrl);
        } else {
            console.log('⚠️ 未配置Telegram通知，跳过通知发送');
        }
    }
}

// 运行主函数
main().catch(console.error);
