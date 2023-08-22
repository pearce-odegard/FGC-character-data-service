import dotenv from "dotenv";
dotenv.config();

import { fetchAllVideoData } from "./fetchAllVideoData";
import { PrismaClient } from "@prisma/client";
import { extractMatchDataSolo, extractMatchDataTeam } from "./extractMatchData";
import { getGameForVideo } from "./helperFunctions";
import {
  getAllCharacters,
} from "./prismaWrapperFunctions";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? "";

const prisma = new PrismaClient();

(async () => {
  const videoURLs = await prisma.videoURL.findMany();

  const videoIds = videoURLs.map((item) => {
    const videoId = item.url.split("=")[1];

    if (!videoId) {
      throw new Error(`INVALID URL: no video ID found for ${item.url}`);
    }

    return videoId;
  });

  const videos = await fetchAllVideoData(YOUTUBE_API_KEY, videoIds);

  if (videos.length === 0) {
    console.log("No videos found.");
    return;
  }

  const games = await prisma.game.findMany();

  const allCharacters = await getAllCharacters(prisma);

  for (const video of videos) {
    const game = getGameForVideo(games, video);

    if (!game) continue;

    const allGameCharacters = allCharacters.filter((character) => {
      return character.gameId === game.id;
    });

    console.log(`Video ID: ${video.id}`);

    switch (game.isTeamGame) {
      case true:
        const resultTeam = extractMatchDataTeam(video, game, allGameCharacters);
        console.log(resultTeam);
        break;
      case false:
        const resultSolo = extractMatchDataSolo(video, game, allGameCharacters);
        console.log(resultSolo);
        // console.log(await saveTournamentSolo(prisma, resultSolo));
        break;
      default:
        console.log("---------------------------------");
    }
  }

  console.log(videos.length);
})();
