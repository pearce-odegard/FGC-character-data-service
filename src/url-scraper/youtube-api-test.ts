import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.CHANNEL_ID; // Replace with the actual channel ID

// Function to fetch video details from YouTube API
async function getVideoDetails(videoId: string): Promise<string> {
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;

    try {
        const response = await axios.get(url);
        const videoData = response.data;

        if (videoData.items && videoData.items.length > 0) {
            return videoData.items[0].snippet.description;
        } else {
            throw new Error('Video not found or no description available.');
        }
    } catch (error: any) {
        throw new Error('Failed to fetch video details: ' + error.message);
    }
}

// Function to fetch all videos from the "Tampa Never Sleeps" channel using YouTube API
async function fetchAllChannelVideos(): Promise<string[]> {
    const maxResults = 50; // Maximum number of results per API call
    let nextPageToken: string | undefined = undefined;
    const allVideoIds: string[] = [];

    try {
        do {
            const url: string = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=${maxResults}&pageToken=${nextPageToken}&key=${YOUTUBE_API_KEY}`;
            const response = await axios.get(url);
            const searchData = response.data;

            if (searchData.items && searchData.items.length > 0) {
                for (const item of searchData.items) {
                    if (item.id && item.id.videoId) {
                        allVideoIds.push(item.id.videoId);
                    }
                }
            }

            nextPageToken = searchData.nextPageToken;
        } while (nextPageToken);

        return allVideoIds;
    } catch (error: any) {
        throw new Error('Failed to fetch videos from the channel: ' + error.message);
    }
}

async function main() {
    try {
        const videoIds = await fetchAllChannelVideos();

        if (videoIds.length === 0) {
            console.log('No videos found from the "Tampa Never Sleeps" channel.');
            return;
        }

        const videoDescriptions: string[] = [];

        for (const videoId of videoIds) {
            try {
                const description = await getVideoDetails(videoId);
                videoDescriptions.push(description);
            } catch (error: any) {
                console.error(error.message);
            }
        }

        console.log('Descriptions of videos from the "Tampa Never Sleeps" channel:', videoDescriptions);
    } catch (error: any) {
        console.error(error.message);
    }
}

main();