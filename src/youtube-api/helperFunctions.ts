import { Game } from "@prisma/client";
import { VideoObj } from "./fetchAllVideoData";

export const getGameForVideo = (games: Game[], video: VideoObj): Game | null => {

    const title = video.snippet.title.toLowerCase();

    const isVideoRelevant = !title.includes('top 8') ||
        title.includes('ratio') ||
        title.includes('palette') ||
        title.includes('swap') ||
        title.includes('umvc3 #99');

    if (isVideoRelevant) return null;

    for (const game of games) {
        if (title.includes(game.name)) return game;
    }

    return null;
}

export function lastWord(inputString: string) {
    const words = inputString.trim().split(' ');

    return words[words.length - 1];
}