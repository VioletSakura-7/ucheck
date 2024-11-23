const USDT_CONTRACT_ADDRESS = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // TRON 上 USDT 的合约地址
const TRON_PRO_API_KEY = '57f1e973-8ffb-46a3-b482-e408ceb0e879';

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { 'TRON-PRO-API-KEY': TRON_PRO_API_KEY },
    privateKey: '01'
});

let lastStatus = null;
let lastBalance = null;

document.getElementById('blacklist-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // 阻止默认提交行为

    const addressInput = document.getElementById('address');
    const address = addressInput.value.trim(); // 获取用户输入的地址

    lastStatus = 'checking';
    updateResultText(lastStatus); // 更新为检查中状态

    // 验证地址格式
    if (!tronWeb.isAddress(address)) {
        lastStatus = 'invalid';
        updateResultText(lastStatus);
        addressInput.value = ''; // 清除输入框内容
        addressInput.placeholder = languages[currentLanguage].invalid; // 提示用户输入有效地址
        return;
    }

    try {
        // 获取 USDT 合约实例
        const contract = await tronWeb.contract().at(USDT_CONTRACT_ADDRESS);

        // 调用 getBlackListStatus 方法，只传入要检查的地址
        const isBlacklisted = await contract.getBlackListStatus(address).call();

        // 获取地址的 USDT 余额
        const usdtBalance = await contract.balanceOf(address).call();
        lastBalance = tronWeb.fromSun(usdtBalance); // 格式化为可读格式

        // 输出结果
        if (isBlacklisted) {
            lastStatus = 'highRisk';
        } else {
            lastStatus = 'safe';
        }
        updateResultText(lastStatus, lastBalance);
    } catch (error) {
        console.error('Error:', error);
        lastStatus = 'error';
        updateResultText(lastStatus, error.message);
    }
});