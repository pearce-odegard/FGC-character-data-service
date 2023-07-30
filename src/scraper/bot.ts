import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdBlockerPlugin from 'puppeteer-extra-plugin-adblocker';
puppeteer.use(StealthPlugin());
puppeteer.use(AdBlockerPlugin());

import { PrismaClient, Tournament } from '@prisma/client';
import {
    scrapeCharactersUsed,
    prismaWrapperFunctions,
    determineGameInVideo,
    waitThenClick,
    tallyCharactersUsed
} from "./functions";

const prisma = new PrismaClient();

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });

    const videoUrlList = (await prisma.videoURL.findMany()).map(obj => obj.url);

    const tourneyDataObjs = await scrapeCharactersUsed({
        videoUrlList,
        determineGameTitleFunction: determineGameInVideo,
        waitThenClick,
        browser,
        prisma
    });

    for (const tourneyData of tourneyDataObjs) {
        const [charactersUsed, teamsUsed] = await tallyCharactersUsed({
            prisma,
            tourneyData,
            getCharacterFunction: prismaWrapperFunctions.getCharacterByGameIdAndNameOrNull
        });

        const newTournament: Tournament = await prismaWrapperFunctions.saveTournament(prisma, tourneyData, charactersUsed, teamsUsed);

        console.log(newTournament);
    }

    await browser.close();
})();