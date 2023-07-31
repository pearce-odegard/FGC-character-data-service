import dotenv from 'dotenv';
dotenv.config();

import { fetchAllVideoData } from './fetchAllChannelVideos';
import { PrismaClient } from '@prisma/client';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";
const CHANNEL_ID = process.env.CHANNEL_ID ?? "";

const prisma = new PrismaClient();

(async () => {

    const videoIds = (await prisma.videoURL.findMany()).map(item => item.url.split("=")[1]);

    const videosWithDescriptions = await fetchAllVideoData(YOUTUBE_API_KEY, videoIds);

    if (videosWithDescriptions.length === 0) {
        console.log('No videos found from the "Tampa Never Sleeps" channel.');
        return;
    }

    for (const video of videosWithDescriptions) {
        console.log(`Video ID: ${video.id}`);
        console.log(`Description: ${video.snippet.description}`);
        console.log('----------------------------------');
    }

    console.log(videosWithDescriptions.length)

})();

