import z from "zod";
import { getCharactersByGame } from "./prismaWrapperFunctions";

export interface PlayerCharacter {
  player: string;
  character: number;
}

export interface PlayerCharacterTeam {
  player: string;
  character1: number;
  character2: number;
  character3: number;
}

export interface CharacterIdName {
  id: number;
  name: string;
}

export interface CharacterCount {
  id: number;
  count: number;
}

export type CharacterCounts = Record<string, CharacterCount>;

export interface MatchData {
  videoId: string;
  gameId: number;
  title: string;
  channelId: string;
  publishedAt: string;
  description: string;
  playerCharacters?: PlayerCharacter[];
  playerCharactersTeams?: PlayerCharacterTeam[];
  characterCounts: CharacterCounts;
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

export type GetCharactersResult = Awaited<
  ReturnType<typeof getCharactersByGame>
>;

export type TeamPartial = {
  character1: number;
  character2: number;
  character3: number;
}
