import { PrismaClient } from "@prisma/client";
import { VideoObj } from "./fetchAllVideoData";

export const getGameIdForVideo = async (prisma: PrismaClient, video: VideoObj): Promise<number> => {

    const title = video.snippet.title;

    if (!title.includes('top 8') || title.includes('ratio') || title.includes('palette') || title.includes('swap')) {
        return 0;
    }

    const games = await prisma.game.findMany();

    for (const game of games) {
        if (title.includes(game.name)) return game.id;
    }

    return 0;
}