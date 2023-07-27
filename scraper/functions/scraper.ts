import { Tournament } from "@prisma/client";
import { ScrapeCharactersUsedParams, TourneyData } from "./types";

export const scrapeCharactersUsed = async ({
    videoUrlList,
    tallyFunction,
    prismaWrapperFunctions,
    determineGameTitleFunction,
    waitThenClick,
    browser,
    prisma,
}: ScrapeCharactersUsedParams): Promise<Tournament[]> => {

    const tournaments: Tournament[] = [];

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

        const descriptionSpanArray = await page.$$eval('span.yt-core-attributed-string--link-inherit-color', spans => {
            // the slice method eliminates pesky line breaks
            return spans.map(span => (span.textContent ?? "").slice(0, -2));
        })

        const currentGame = allGames.filter(game => game.name === gameTitle)[0];

        const [charactersUsed, teamsUsed] = await tallyFunction(
            prisma,
            currentGame,
            descriptionSpanArray,
            prismaWrapperFunctions.getCharacterByGameIdAndNameOrNull
        );

        if (Object.keys(charactersUsed).length === 0) {
            await page.close();
            continue;
        }

        const dateString = await page.$eval('yt-formatted-string#info', info => info.children[2].textContent) ?? "";

        const tourneyData: TourneyData = {
            title: titleString,
            gameId: currentGame.id,
            url: videoUrl,
            date: new Date(dateString)
        };

        const newTournament: Tournament = await prismaWrapperFunctions.saveTournament(prisma, tourneyData, charactersUsed, teamsUsed);

        console.log(newTournament);
        tournaments.push(newTournament);

        await page.close();
    }

    await browser.close();

    return tournaments;
};
