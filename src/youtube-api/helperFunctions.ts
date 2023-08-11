import { Game } from "@prisma/client";
import { VideoObj } from "./fetchAllVideoData";

export const getGameForVideo = (games: Game[], video: VideoObj): Game | null => {

    const title = video.snippet.title.toLowerCase();

    if (!title.includes('top 8') || title.includes('ratio') || title.includes('palette') || title.includes('swap')) {
        return null;
    }

    for (const game of games) {
        if (title.includes(game.name)) return game;
    }

    return null;
}