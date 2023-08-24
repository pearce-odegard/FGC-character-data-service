import { PrismaClient } from "@prisma/client";
import { CharacterMap, MatchData, PlayerCharacter } from "./types";

export async function getAllCharacters(prisma: PrismaClient) {
  const characters = await prisma.character.findMany({
    include: {
      altNames: true,
    },
  });

  return characters;
}

export async function getCharactersByGame(
  prisma: PrismaClient,
  gameId: number
) {
  const characters = await prisma.character.findMany({
    include: {
      altNames: true,
    },
    where: {
      gameId: gameId,
      altNames: {
        some: {
          id: {
            not: undefined,
          },
        },
      },
    },
  });

  return characters;
}

export async function getCharacterById(prisma: PrismaClient, id: number) {
  const character = await prisma.character.findUnique({
    where: {
      id: id,
    },
  });

  if (character == null)
    throw new Error(`INTERNAL SERVER ERROR: No character found with id ${id}`);

  return character;
}

export async function getCharacterByGameIdAndNameOrNull(
  prisma: PrismaClient,
  id: number,
  name: string
) {
  const character = await prisma.character.findFirst({
    where: {
      gameId: id,
      name: name,
    },
  });

  if (character) return character;

  const characterAltName = await prisma.characterAltName.findFirst({
    where: { name },
  });

  if (characterAltName) {
    return await prisma.character.findUnique({
      where: {
        id: characterAltName.characterId,
      },
    });
  }

  // Still can return null for use when checking if a character exists in the db

  return null;
}

export async function getGameById(prisma: PrismaClient, id: number) {
  const game = await prisma.game.findUnique({
    where: {
      id: id,
    },
  });

  if (game == null)
    throw new Error(`INTERNAL SERVER ERROR: No game found with id ${id}`);

  return game;
}

export async function getGameByName(prisma: PrismaClient, name: string) {
  const game = await prisma.game.findFirst({
    where: {
      name: name,
    },
  });

  if (game == null)
    throw new Error(`INTERNAL SERVER ERROR: No game found with name ${name}`);

  return game;
}

export async function saveTournamentSolo(
  prisma: PrismaClient,
  matchData: MatchData<PlayerCharacter>
) {
  const url = `https://www.youtube.com/watch?v=${matchData.videoId}`;

  //   const tournament = await prisma.tournament.findUnique({
  //     where: {
  //       url: url,
  //     },
  //   });

  //   if (tournament) {
  //     console.log(`Tournament ${tournament.url} already exists in db`);
  //     return tournament;
  //   }

  const playerCharacters = matchData.playerCharacters;

  if (!playerCharacters) throw new Error("Character teams not found");

  //   const newTournament = await prisma.tournament.create({
  //     data: {
  //       date: matchData.publishedAt,
  //       title: matchData.title,
  //       gameId: matchData.gameId,
  //       url: url,
  //       CharactersOnTournaments: {
  //         createMany: {
  //           data: charactersUsed,
  //         },
  //       },
  //     },
  //   });

  //   for (const team of teamsUsed) {
  //     await prisma.tournament.update({
  //       where: {
  //         id: newTournament.id,
  //       },
  //       data: {
  //         teamsUsed: {
  //           create: {
  //             characters: {
  //               connect: [
  //                 { id: team.character1 },
  //                 { id: team.character2 },
  //                 { id: team.character3 },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //     });
  //   }

  return { url };
}
