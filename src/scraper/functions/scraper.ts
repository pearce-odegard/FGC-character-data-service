import { Tournament } from "@prisma/client";
import { ScrapeCharactersUsedParams, TourneyData } from "./types";

export const scrapeCharactersUsed = async ({
    videoUrlList,
    determineGameTitleFunction,
    waitThenClick,
    browser,
    prisma,
}: ScrapeCharactersUsedParams): Promise<TourneyData[]> => {

    const tournaments: TourneyData[] = [];

    for (const videoUrl of videoUrlList) {
        const page = await browser.newPage();

        const maybeTournament = await prisma.tournament.findUnique({
            where: {
                url: videoUrl
            }
        });

        if (maybeTournament) {
            console.log(`Tournament ${maybeTournament.url} already exists in db`);
            continue;
        }

        await page.goto(videoUrl);

        await page.waitForSelector('#title > h1 > yt-formatted-string');

        const titleString = await page.$eval('#title > h1 > yt-formatted-string', title => title.textContent) ?? "";

        const allGames = await prisma.game.findMany();

        const gameTitle = determineGameTitleFunction(titleString, allGames);

        if (gameTitle === 'Video not applicable!') {
            await page.close();
            continue;
        }

        await waitThenClick('tp-yt-paper-button#expand', page);

        const dateString = await page.$eval('yt-formatted-string#info', info => info.children[2].textContent) ?? "";

        const currentGame = allGames.filter(game => game.name === gameTitle)[0];

        const descriptionSpanArray = await page.$$eval('span.yt-core-attributed-string--link-inherit-color', spans => {
            // the slice method eliminates pesky line breaks
            return spans.map(span => (span.textContent ?? ""));
        });

        console.log(descriptionSpanArray);

        const tourneyData: TourneyData = {
            title: titleString,
            gameId: currentGame.id,
            url: videoUrl,
            date: new Date(dateString),
            descriptionSpanArray
        };

        tournaments.push(tourneyData);

        await page.close();
    }

    await browser.close();

    return tournaments;
};
