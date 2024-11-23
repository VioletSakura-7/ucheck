const languages = {
    en: {
        title: "Address Check in TRON USDT",
        label: "Enter TRON Address:",
        button: "Check",
        checking: "Checking...",
        invalid: "Invalid TRON address format",
        highRisk: " High-risk address, please attention",
        safe: " Safe address, please use in safe",
        balance: "Balance: ",
        error: "There was an error checking the blacklist status:"
    },
    zh: {
        title: "TRON USDT 地址检查",
        label: "输入 TRON 地址:",
        button: "检查",
        checking: "检查中...",
        invalid: "无效的 TRON 地址格式",
        highRisk: "您输入的地址检查为高危地址,请注意风险。",
        safe: "您输入的地址检查为安全地址,请安全使用。",
        balance: "余额: ",
        error: "检查黑名单状态时出错:"
    }
};

// Retrieve user's language preference from localStorage
// Default to Chinese if not set

function updateLanguage() {
    const lang = languages[currentLanguage];
    document.querySelector('h1').textContent = lang.title;
    document.querySelector('label[for="address"]').textContent = lang.label;
    document.querySelector('button').textContent = lang.button;
}

function updateResultText(status, balance) {
    const lang = languages[currentLanguage];
    const statusText = document.getElementById('status-text');
    const balanceText = document.getElementById('balance-text');
    const statusIcon = document.getElementById('status-icon');

    if (status === 'checking') {
        statusText.textContent = lang.checking;
    } else if (status === 'invalid') {
        statusText.textContent = lang.invalid;
        statusText.className = 'blacklisted';
        statusIcon.className = 'red';
        balanceText.textContent = ''; // Clear balance display
    } else if (status === 'highRisk') {
        statusText.textContent = `${lang.highRisk}`;
        statusText.className = 'blacklisted';
        statusIcon.className = 'red';
    } else if (status === 'safe') {
        statusText.textContent = `${lang.safe}`;
        statusText.className = 'not-blacklisted';
        statusIcon.className = 'green';
    } else if (status === 'error') {
        statusText.textContent = `${lang.error} ${balance}`;
        statusText.className = 'blacklisted';
        statusIcon.className = 'red';
        balanceText.textContent = ''; // Clear balance display
    }

    // Only show balance when status is safe or highRisk
    if ((status === 'safe' || status === 'highRisk') && balance !== undefined) {
        balanceText.textContent = `${lang.balance} ${balance} USDT.`;
    }
}

document.querySelector('.close').onclick = function() {
    document.getElementById('languageModal').style.display = 'none';
};

document.getElementById('englishBtn').onclick = function() {
    currentLanguage = 'en';
    localStorage.setItem('userLanguage', 'en'); // Save preference
    updateLanguage();
    updateResultText(lastStatus, lastBalance); // Update display
    document.getElementById('languageModal').style.display = 'none';
};

document.getElementById('chineseBtn').onclick = function() {
    currentLanguage = 'zh';
    localStorage.setItem('userLanguage', 'zh'); // Save preference
    updateLanguage();
    updateResultText(lastStatus, lastBalance); // Update display
    document.getElementById('languageModal').style.display = 'none';
};

document.addEventListener('DOMContentLoaded', function() {
    updateLanguage();

    // Prevent default right-click menu behavior
    EventUtil.bindEvent(document.body, 'longpress', function() {
        document.getElementById('languageModal').style.display = 'block';
    });
});

// Event utility for long press detection
const EventUtil = (function() {
    let eventArr = ['eventlongpress'];

    function isInsideForm(element) {
        // Check if the element is inside a specific form
        return element.closest('#blacklist-form') !== null;
    }

    function touchStart(event) {
        if (isInsideForm(event.target)) {
            return; // Do not process language switch if inside form
        }

        event.target.style.userSelect = 'none';
        this.delta = {};
        this.delta.time = new Date().getTime();
    }

    function touchEnd(event) {
        if (isInsideForm(event.target)) {
            return; // Do not process language switch if inside form
        }
        let delta = this.delta;
        delete this.delta;
        let timegap = new Date().getTime() - delta.time;

        if (timegap >= 500) { // Long press time threshold
            event.preventDefault(); // Prevent default copy behavior
            if (this['eventlongpress']) {
                this['eventlongpress'].forEach(function(fn) {
                    fn(event);
                });
            }
        }
    }

    function bindEvent(dom, type, callback) {
        if (!dom) {
            console.error('dom is null or undefined');
            return;
        }

        if (isInsideForm(dom)) {
            return;
        }
        let flag = eventArr.some(key => dom[key]);
        if (!flag) {
            dom.addEventListener('touchstart', touchStart);
            dom.addEventListener('touchend', touchEnd);
        }
        if (!dom['event' + type]) {
            dom['event' + type] = [];
        }
        dom['event' + type].push(callback);
    }

    function removeEvent(dom, type, callback) {
        if (dom['event' + type]) {
            for (let i = 0; i < dom['event' + type].length; i++) {
                if (dom['event' + type][i] === callback) {
                    dom['event' + type].splice(i, 1);
                    i--;
                }
            }
            if (dom['event' + type] && dom['event' + type].length === 0) {
                delete dom['event' + type];
                let flag = eventArr.every(key => !dom[key]);
                if (flag) {
                    dom.removeEventListener('touchstart', touchStart);
                    dom.removeEventListener('touchend', touchEnd);
                }
            }
        }
    }

    return {
        bindEvent,
        removeEvent
    }
})();