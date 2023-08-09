import axios from "axios";
import { z } from 'zod';
// import { backOff } from "exponential-backoff";

const VideoSchema = z.object({
    id: z.string(),
    snippet: z.object({
        title: z.string(),
        channelId: z.string(),
        publishedAt: z.string().datetime(),
        description: z.string(),
    }),
});

export type VideoObj = z.infer<typeof VideoSchema>;

const QueryResultSchema = z.object({
    items: VideoSchema.array()
})

export async function fetchAllVideoData(apiKey: string, videoIds: string[]): Promise<VideoObj[]> {
    const maxResults = 50; // Maximum number of results per API call
    const allVideos: VideoObj[] = [];

    const baseEndpoint = 'https://www.googleapis.com/youtube/v3/videos';

    try {
        for (let i = 0; i < videoIds.length; i += maxResults) {
            const batchVideoIds = videoIds.slice(i, i + maxResults);
            const videoIdsString = batchVideoIds.join(',');

            const url: string = `${baseEndpoint}?part=snippet&id=${videoIdsString}&key=${apiKey}`;
            const response = await axios.get(url);
            const { items } = QueryResultSchema.parse(response.data);

            for (const item of items) {
                const videoData = VideoSchema.safeParse(item);
                if (videoData.success) allVideos.push(videoData.data);
            }
        }

        return allVideos;
    } catch (error) {
        if (axios.isAxiosError(error)) throw new Error('Failed to fetch videos: ' + error.message);
        else throw new Error("Unknown error: " + (error as Error).message);
    }
}
