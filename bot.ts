import dotenv from 'dotenv';
dotenv.config();

import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());

import { characterLists } from "./characterLists";
import { getVideoURLs, scrapeCharactersUsed, determineGameInVideo, tallyCharactersUsed } from "./functions";


(async () => {
    const browser = await puppeteer.launch({ headless: false });

    // the slice removes the first and last items, which for some reason are showing up as empty strings
    const videoList = (await getVideoURLs(process.env.SEARCHURL ?? "", browser)).slice(1, -1);

    console.log(videoList)

    // const testVideoList = [
    //     'https://www.youtube.com/watch?v=Wy8dQtDamVw',
    //     'https://www.youtube.com/watch?v=TQ6di9HVKHY',
    //     'https://www.youtube.com/watch?v=he1Pk77G1C0',
    //     'https://www.youtube.com/watch?v=fIu2ZYEuAts',
    //     'https://www.youtube.com/watch?v=fio48o3zgvE',
    //     'https://www.youtube.com/watch?v=jXnqMRkd7ss',
    //     'https://www.youtube.com/watch?v=Y3A7b3UDM0o',
    //     'https://www.youtube.com/watch?v=TkqAge2GIY8',
    //     'https://www.youtube.com/watch?v=PAGsso4WBNc',
    //     'https://www.youtube.com/watch?v=chTaKH97Ujk',
    //     'https://www.youtube.com/watch?v=I_UNVACKpTQ',
    // ]

    const characterData = await scrapeCharactersUsed(videoList, tallyCharactersUsed, characterLists, determineGameInVideo, browser);
    console.log(characterData);

    await browser.close();
})();