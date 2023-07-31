import axios from "axios";
import { z } from 'zod';
import { backOff } from "exponential-backoff";

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
    let nextPageToken: string = '';
    const allVideos: VideoObj[] = [];

    try {
        do {
            const url: string = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=${maxResults}&pageToken=${nextPageToken}&key=${apiKey}`;
            const response = await backOff(() => axios.get(url));
            const searchData = response.data;

            // slice to remove the first item as it is the channel itself
            for (const item of searchData.items.slice(1, -1)) {
                const videoData = VideoSchema.safeParse(item);
                if (videoData.success) allVideos.push(videoData.data);
                else throw videoData.error;
            }

            nextPageToken = searchData.nextPageToken;
        } while (nextPageToken);

        return allVideos;
    } catch (error) {
        if (axios.isAxiosError(error)) throw new Error('Failed to fetch videos from the channel: ' + error.message);
        else throw error;
    }
}
