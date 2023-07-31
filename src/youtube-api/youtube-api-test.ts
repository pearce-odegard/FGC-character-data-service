import dotenv from 'dotenv';
dotenv.config();

import { fetchAllChannelVideos } from './fetchAllChannelVideos';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";
const CHANNEL_ID = process.env.CHANNEL_ID ?? "";

(async () => {

    const videosWithDescriptions = await fetchAllChannelVideos(CHANNEL_ID, YOUTUBE_API_KEY);

    if (videosWithDescriptions.length === 0) {
        console.log('No videos found from the "Tampa Never Sleeps" channel.');
        return;
    }

    console.log('Videos from the "Tampa Never Sleeps" channel:');
    for (const video of videosWithDescriptions) {
        console.log(`Video ID: ${video.id.videoId}`);
        console.log(`Description: ${video.snippet.description}`);
        console.log('----------------------------------');
    }

    console.log(videosWithDescriptions.length)

})();

