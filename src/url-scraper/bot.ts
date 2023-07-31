import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { autoScroll, scrapeVideoURLs } from "./functions";
import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());

const prisma = new PrismaClient();

(async () => {

    const browser = await puppeteer.launch({ headless: "new" });

    // the slice removes the first and last items, which for some reason are showing up as empty strings
    const videoList = (await scrapeVideoURLs(process.env.SEARCHURL ?? "", browser, autoScroll)).slice(1, -1);

    await prisma.videoURL.createMany({
        data: videoList.map(url => {
            return { url };
        }),
        skipDuplicates: true
    });

    await browser.close();

})();