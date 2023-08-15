import dotenv from 'dotenv';
dotenv.config();

import { fetchAllVideoData } from './fetchAllVideoData';
import { PrismaClient } from '@prisma/client';
import { extractMatchDataSolo } from './extractMatchData';
import { getGameForVideo } from './helperFunctions';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";

const prisma = new PrismaClient();

(async () => {

    const videoIds = (await prisma.videoURL.findMany()).map(item => item.url.split("=")[1]);

    const videos = await fetchAllVideoData(YOUTUBE_API_KEY, videoIds);

    if (videos.length === 0) {
        console.log('No videos found.');
        return;
    }

    const games = await prisma.game.findMany();

    for (const video of videos) {
        const game = getGameForVideo(games, video);
        switch (game?.isTeamGame) {
            case undefined:
                continue;
            case true:
                console.log(`Video ID: ${video.id}`);
                console.log('Team function not yet implemented!');
                break;
            case false:
                console.log(`Video ID: ${video.id}`);
                const resultSolo = extractMatchDataSolo(video);
                console.log(resultSolo)
                console.log('---------------------------------');
                break;
        }
    }

    console.log(videos.length)

})();

