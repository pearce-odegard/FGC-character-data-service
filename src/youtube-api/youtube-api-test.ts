import dotenv from 'dotenv';
dotenv.config();

import { fetchAllVideoData } from './fetchAllVideoData';
import { PrismaClient } from '@prisma/client';
import { extractMatchDataSolo } from './tallyDescriptionData';
import { getGameForVideo } from './helperFunctions';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";
// const CHANNEL_ID = process.env.CHANNEL_ID ?? "";

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
        console.log(video.id, video.snippet.title)
        const game = getGameForVideo(games, video);
        if (!game) {
            continue;
        } else if (!game.isTeamGame) {
            console.log(extractMatchDataSolo(prisma, video.snippet.description));
            console.log('---------------------------------');
        } else if (game.isTeamGame) {
            // use other function here
            console.log("Team game function not implemented yet");
        }
    }

    console.log(videos.length)

})();

