const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const trayBtn = document.getElementById('start');
let ChromiumPath = path.join(__dirname, "..", "..", "..", ".local-chromium", "win64-624492", "chrome-win", "chrome.exe");

var successNum = 0;

trayBtn.addEventListener('click', function (event) {
    // const txt = fs.readFileSync('config.txt', {
    //     encoding: 'utf-8'
    // });
    const txt = document.getElementById('text').value;

    const users = txt.split('\n');
    const config = users
        .filter(r => r)
        .map(user => {
            const arr = user.split('----');
            return {
                name: arr[0].trim(),
                pwd: arr[1].trim()
            };
        });

    // const argvs = process.argv;
    const currentIndex = 0;

    startVote(+currentIndex);

    function startVote(num = 0) {
        try {
            document.getElementById("num").innerHTML = num + 1;
            // document.getElementById("success").innerHTML = successNum;
            vote(num);
        } catch (e) {
            console.error(e.stack || e.message);
            var showNum = num + 1;
            console.error('当前账号为第' + showNum + '个，请继续执行！！！');
            alert('当前账号为第' + showNum + '个，请继续执行！！！');
        }
    }

    function vote(num = 0) {
        const info = config[num];
        if (!info) {
            alert('所有账号已全部投票完毕');
            console.error('所有账号已全部投票完毕');
            return;
        }
        const name = info.name;
        const pwd = info.pwd;

        exec('voteScript.py',function(error,stdout,stderr){
            if(error) {
                console.info('stderr : '+stderr);
            }
            console.log('exec: ' + stdout);
        })

        /*
        let driver = new Builder()
            .forBrowser('edge')
            .build()

        driver.get('https://m.iqiyi.com/user.html?redirect_url=http%3A%2F%2Fwww.iqiyi.com%2Fh5act%2FgeneralVotePlat.html%3FactivityId%3D373#baseLogin');
        driver.findElement(By.id('phoneNumber')).sendKeys(name, Key.RETURN);
        driver.findElement(By.xpath('/html/body/div[1]/div[1]/form/section/div[1]/div[2]/div[3]/input')).sendKeys(pwd, Key.RETURN);
        driver.findElement(By.className('c-btn-base')).click();
        try {
            await driver.get('https://m.iqiyi.com/user.html?redirect_url=http%3A%2F%2Fwww.iqiyi.com%2Fh5act%2FgeneralVotePlat.html%3FactivityId%3D373#baseLogin');
            await driver.findElement(By.id('phoneNumber')).sendKeys(name, Key.RETURN);
            await driver.findElement(By.xpath('/html/body/div[1]/div[1]/form/section/div[1]/div[2]/div[3]/input')).sendKeys(pwd, Key.RETURN);
            await driver.findElement(By.className('c-btn-base')).click();
        } finally {
            await driver.quit();
        }*/
/*
        puppeteer
            .launch({
                headless: false,
                defaultViewport: {
                    width: 1280,
                    height: 720
                },
                args: ['--incognito'],
                ChromiumPath: ChromiumPath
            })
            .then(async browser => {
                const pages = await browser.pages();
                const page = pages[0];
                page.setDefaultTimeout(10 * 60 * 1000);
                await page.setUserAgent(
                    'Mozilla/5.0 (Linux; U; Android 8.1.0; zh-cn; BLA-AL00 Build/HUAWEIBLA-AL00) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/8.9 Mobile Safari/537.36'
                );
                const ip = info.ip || genRandomIp();
                await page.setExtraHTTPHeaders({
                    'X-Forwarded-For': ip,
                    'Proxy-Client-IP': ip,
                    'WL-Proxy-Client-IP': ip
                });
                await page.goto('https://m.iqiyi.com/user.html?redirect_url=http%3A%2F%2Fwww.iqiyi.com%2Fh5act%2FgeneralVotePlat.html%3FactivityId%3D373#baseLogin', {
                    waitUntil: 'networkidle2'
                });
                await page.waitForSelector('#phoneNumber', {
                    visible: true
                });
                await page.type('#phoneNumber', name);
                await page.type('#loginPassword', pwd);
                await page.click('#loginAction');
                await page.waitForNavigation({
                    waitUntil: 'networkidle2'
                });
                const tipSelector =
                    '#embed-captcha > div > div.geetest_btn > div.geetest_radar_btn > div.geetest_radar_tip';
                let url = page.url();
                if (url.indexOf('/geetest?') > -1) {
                    await page.waitForSelector(tipSelector, {
                        visible: true
                    });
                }
                let tip = await page.$(tipSelector);
                if (tip) {
                    await page.click(tipSelector, {
                        delay: 150
                    });
                    await page.waitForNavigation({
                        waitUntil: 'networkidle2'
                    });
                    await page.goto('https://energy.tv.weibo.cn/chuangzao2019', {
                        waitUntil: 'networkidle2'
                    });
                }

                const index = await page.$eval('.m-vote-list', div => {
                    const boxes = Array.from(div.querySelectorAll('.m-auto-box'));
                    const index = boxes.findIndex(box => {
                        const h3 = box.querySelector('.m-text-cut');
                        return escape(h3.innerText) === '%u8D75%u78CA';
                    });
                    return index;
                });
                const nextNum = num + 1;
                const btnSelector = `#app > div.m-vote-list > div > div:nth-child(${index +
                    1}) > div > div.m-text-box > h5 > a`;
                await page.waitFor(300);
                await page.click(btnSelector, {
                    delay: 150
                });
                await page.click(btnSelector, {
                    delay: 150
                });

                await clickVote(page, nextNum, browser, true);
                await page.waitForNavigation({
                    waitUntil: 'networkidle2'
                });
                url = page.url();
                if (url.indexOf('/geetest?') > -1) {
                    await page.waitForSelector(tipSelector, {
                        visible: true
                    });
                }
                tip = await page.$(tipSelector);
                if (tip) {
                    await page.click(tipSelector, {
                        delay: 150
                    });
                    await page.waitForNavigation({
                        waitUntil: 'networkidle0'
                    });
                }
                await clickVote(page, nextNum, browser);
            }).catch((res) => {
                // console.error(res);
                console.error('失败账号' + JSON.stringify(config[num]) + "，需要手动重试");
                startVote(num + 1);
            })*/
    }

    async function clickVote(page, num, browser, flag) {
        const btn =
            '#mask > div:nth-child(3) > div.vote-view > div.vote-main > div.vote-btn-box > a';
        const clicked = '#mask > div:nth-child(5)';
        const clicked2 = '#mask > div:nth-child(4)';
        await page.waitFor(300);
        const isClicked = await page.$eval(clicked, el => el.style.display);
        const isClicked2 = await page.$eval(clicked2, el => el.style.display);

        if ('none' === isClicked && 'none' === isClicked2) {
            const clicked3 =
                '#mask > div:nth-child(3) > div.vote-view > div.vote-main > div.vote-btn-box > p > label > input';
            const clickedp = '#mask > div:nth-child(3) > div.vote-view > div.vote-main > div.vote-btn-box > p';
            const isClicked3 = await page.$eval(clicked3, el => el.checked);

            if (isClicked3) {
                await page.click(clickedp, {
                    delay: 100
                });
            }

            await page.waitForSelector(btn, {
                visible: true
            });
            await page.click(btn, {
                delay: 150
            });
            await page.waitFor(300);
            let isError = 'none';
            try {
                isError = await page.$eval('#mask > div.m-popup', el => el.style.display);
            } catch (e) {
                // console.error(e);
            }

            if ('none' === isError && flag) {
                return;
            } else if (flag) {
             console.error('失败账号' + JSON.stringify(config[num - 1]) + "，继续执行下一个账号，如有需要手动重试");
            }
        }
        let num2 = num + 1;
        console.log('下一个账号序号为：' + num2);
        await page.waitFor(300);
        await browser.close();
        startVote(num);
    }


    function r(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }

    function genRandomIp() {
        return r(2, 222) + '.' + r(2, 254) + '.' + r(2, 254) + '.' + r(2, 254);
    }
})
