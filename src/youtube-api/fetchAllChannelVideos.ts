import axios from "axios";
import { ZodError, z } from 'zod';
// import { backOff } from "exponential-backoff";

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
            const url: string = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=tampa%20never%20sleeps&pageToken=${nextPageToken}&key=${apiKey}`;
            const response = await axios.get(url);
            const searchData = response.data;

            // slice to remove the first item as it is the channel itself
            for (const item of searchData.items.slice(1, -1)) {
                const videoData = VideoSchema.parse(item);
                allVideos.push(videoData);
            }

            nextPageToken = searchData.nextPageToken;
        } while (nextPageToken);

        return allVideos;
    } catch (error) {
        if (axios.isAxiosError(error)) throw new Error('Failed to fetch videos from the channel: ' + error.message);
        else if (error instanceof ZodError) throw new Error('Zod parsing error' + error.message);
        else throw error;
    }
}
