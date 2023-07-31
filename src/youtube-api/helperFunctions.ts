import axios from "axios";
import { z } from 'zod';

const VideoSchema = z.object({
    id: z.object({
        videoId: z.string()
    }),
    snippet: z.object({
        description: z.string()
    }),
});

type VideoObj = z.infer<typeof VideoSchema>;

export async function fetchAllChannelVideos(channelId: string, apiKey: string): Promise<VideoObj[]> {
    const maxResults = 50; // Maximum number of results per API call
    let nextPageToken: string | undefined = undefined;
    const allVideos: VideoObj[] = [];

    try {
        do {
            const url: string = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&pageToken=${nextPageToken}&key=${apiKey}`;
            const response = await axios.get(url);
            const searchData = response.data;

            for (const item of searchData.items) {
                const videoData = VideoSchema.parse(item);
                allVideos.push(videoData);
            }

            nextPageToken = searchData.nextPageToken;
        } while (nextPageToken);

        return allVideos;
    } catch (error: any) {
        if (axios.isAxiosError(error)) throw new Error('Failed to fetch videos from the channel: ' + error.message);
        else throw new Error('Unknown error: ' + error.message);
    }
}
