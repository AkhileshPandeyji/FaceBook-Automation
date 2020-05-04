let puppeteer = require("puppeteer");

let cFile = process.argv[2];
let pUrl = process.argv[3];
let nPosts = Number(process.argv[4]);

let fs = require("fs");

(async function () {

    let browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized", "--disable-notifications"]
    });

    let pages = await browser.pages();
    let page = pages[0];

    let data = await fs.promises.readFile(cFile);
    let obj = JSON.parse(data);
    let user = obj["userName"];
    let pwd = obj["password"];
    let url = obj["url"];

    await page.goto(url, { waitUntil: "networkidle2" });

    await page.type("input[type=email]", user, { delay: 100 });
    await page.type("input[type=password]", pwd, { delay: 100 });

    await Promise.all(
        [page.click("input[value='Log In']"),
        page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);

    await Promise.all(
        [page.goto(pUrl),
        page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);

    await Promise.all(
        [page.click("div [data-key='tab_posts']"),
        page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);
    
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    await page.waitForSelector("#pagelet_timeline_main_column ._1xnd .clearfix.uiMorePager");
    
    let idx = 0;
    do{
        await page.waitForSelector("#pagelet_timeline_main_column ._1xnd .clearfix.uiMorePager");
        let postElements = await page.$$("#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8");        
        let likeBtn = await postElements[idx].$("._666k ._8c74");
        await page.waitForSelector("._666k ._8c74");
        await likeBtn.click({delay:500});
        await page.waitForSelector(".uiMorePagerLoader",{ hidden:true });
        idx++;
        console.log(idx);
    }
    while(idx<nPosts);
})();