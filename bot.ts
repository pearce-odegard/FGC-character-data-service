import dotenv from 'dotenv';
dotenv.config();

import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());

import { getVideoURLs, scrapeCharactersUsed, determineGameInVideo } from "./functions";
import { Character, PrismaClient } from '@prisma/client';
import { CharacterLists, CharacterPartial } from './types';
import { tallyFunctions } from './tallyFunctions';

const prisma = new PrismaClient();

(async () => {
    const browser = await puppeteer.launch({ headless: false });

    // the slice removes the first and last items, which for some reason are showing up as empty strings
    // const videoList = (await getVideoURLs(process.env.SEARCHURL ?? "", browser)).slice(1, -1);

    // await prisma.videoURL.createMany({
    //     data: videoList.map(url => {
    //         return { url };
    //     })
    // })

    const videoList = (await prisma.videoURL.findMany()).map(obj => obj.url);

    await scrapeCharactersUsed(videoList, tallyFunctions, determineGameInVideo, browser, prisma);

    const tournaments = await prisma.tournament.findMany();
    console.log(tournaments.length);

    await browser.close();
})();