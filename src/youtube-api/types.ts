import z from "zod";

export interface PlayerCharacter {
  player: string;
  character: string;
}

export interface PlayerCharacterTeam {
  player: string;
  character1: string;
  character2: string;
  character3: string;
}

export interface MatchData {
  videoId: string;
  gameId: number;
  playerCharacters: PlayerCharacter[] | PlayerCharacterTeam[];
}

export const VideoSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    channelId: z.string(),
    publishedAt: z.string().datetime(),
    description: z.string(),
  }),
});

export type VideoObj = z.infer<typeof VideoSchema>;

export const QueryResultSchema = z.object({
  items: VideoSchema.array(),
});
