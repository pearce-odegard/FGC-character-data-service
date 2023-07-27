import { Game } from "@prisma/client";
import { Page } from "puppeteer";

export const determineGameInVideo = (videoTitle: string, games: Game[]) => {
    const normalizedTitle = videoTitle.toLowerCase();
    const gameNames = games.map(game => game.name);

    if (!normalizedTitle.includes('top 8') || normalizedTitle.includes("palette") || normalizedTitle.includes("swap")) {
        return 'Video not applicable!';
    }

    for (const name of gameNames) {
        if (normalizedTitle.includes(name)) {
            return name;
        }
    }

    return 'Video not applicable!';
}

export const waitThenClick = async (selector: string, page: Page, clicks = 1) => {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    if (element !== null) await element.click({ clickCount: clicks });
    return element;
}