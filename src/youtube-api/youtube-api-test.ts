import dotenv from 'dotenv';
dotenv.config();

import { fetchAllVideoData } from './fetchAllVideoData';
import { PrismaClient } from '@prisma/client';
import { extractMatchData } from './tallyDescriptionData';
import { getGameIdForVideo } from './helperFunctions';

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

    for (const video of videos) {
        const gameId = await getGameIdForVideo(prisma, video);
        console.log(extractMatchData(prisma, video.snippet.description, gameId));
        console.log('---------------------------------');
    }

    console.log(videos.length)

})();

