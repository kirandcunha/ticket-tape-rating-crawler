const axios = require('axios');
const cheerio = require('cheerio');
const ttBase = "https://www.tickertape.in/stocks?filter=";
const alphabets = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
const ALLOW_DELAY = false;
const DELAY_TIME = 10;
const MIN_RATING = 90;
const MAX_RATING = 1000;
const ALLOW_DEBUG = false
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const FINAL_ARRAY = []


async function fetchWebsiteData(url, page) {
    if (ALLOW_DEBUG) {
        // console.log("fetchWebsiteData", url)
    }
    // make http call to url  
    let response = await axios(url).catch(() => {
        // console.log("Error occurred while fetching data", url, page);
    });

    if (response?.status !== 200) {
        return;
    }
    response.page = page
    return response;
}
async function fetchTTScore(url) {
    if (ALLOW_DEBUG) {
        console.log("fetchTTScore:", url)
    }
    if (ALLOW_DELAY) {
        await delay(DELAY_TIME);
    }
    const res = await fetchWebsiteData(url)
    // console.log("fetchTTScore", res?.data)
    if (res?.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        const stock = $(".security-name").text();
        const scoreText = $('.percBuyReco-value')
        const score = $(scoreText).text().replace("%", '');
        // console.log("stock:" + stock)
        // console.log("score:" + score)
        // console.log("MIN_RATING:" + MIN_RATING, score >= MIN_RATING)
        // console.log("MAX_RATING:" + MAX_RATING, score < MAX_RATING)
        if (!isNaN(score) & score > 10) {
            // console.log("score:" + score)
            if (score >= MIN_RATING && score < MAX_RATING) {
                console.log(url + "," + stock + "," + score)
                FINAL_ARRAY.push(url + "," + stock + "," + score)
            }
            // else {
            //     console.log(url + "," + stock + "," + score)
            // }
        }
    }

}

async function fetchStocks(url) {
    if (ALLOW_DEBUG) {
        console.log("fetchStocks:", url)
    }
    if (ALLOW_DELAY) {
        await delay(DELAY_TIME);
    }
    const res = await fetchWebsiteData(url)
    // console.log("fetchStocks", res?.data)
    // fetchTTScore("https://www.tickertape.in/stocks/adani-ports-and-special-economic-zone-APSE")
    // fetchTTScore("https://www.tickertape.in/stocks/zen-technologies-ZETE")
    if (res?.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        const stocksList = $('.index-page a')

        // fetchTTScore(stocksList[0].attribs.href)

        for (let i = 0; i < stocksList.length; i++) {
            // console.log("stocksList: ", stocksList[index].attribs.href)
            await fetchTTScore("https://www.tickertape.in" + stocksList[i].attribs.href)
        };
    }
}
async function start() {
    // fetchStocks(ttBase + 'z')
    for (let i = 0; i < alphabets.length; i++) {
        // console.log(val);
        // const href = alphabeticalList?.[index].attribs.href
        // console.log("alphabeticalList: ", alphabeticalList?.[index].attribs.href)
        // console.log("alphabets[i]", alphabets[i]);
        await fetchStocks(ttBase + alphabets[i])
    };
    console.log("FINAL_ARRAY", FINAL_ARRAY)

}

start()
