import { Game } from "@prisma/client";
import {
  lastWord,
  splitTeamCharacters,
  translateCharNameToIDSolo,
} from "./helperFunctions";
import {
  GetCharactersResult,
  MatchData,
  PlayerCharacter,
  PlayerCharacterTeam,
  VideoObj,
} from "./types";

export function extractMatchDataSolo(
  video: VideoObj,
  game: Game,
  gameCharacters: GetCharactersResult
): MatchData {
  const lines = video.snippet.description.split("\n");

  const playerCharacters: PlayerCharacter[] = [];

  const characterCounts: Record<number, number> = {};

  for (const line of lines) {
    const lineConditions = [!line.includes(" vs"), !line.includes("(")];

    if (lineConditions.includes(true)) continue;

    // removing the first part of the line, AKA the timestamp
    const restOfLine = line.split(" ").slice(1).join(" ");

    // remove any periods, mainly to normalize cases where the line contains 'vs.' instead of 'vs'
    // also, removes the closing parentheses surrounding the characters, so it doesn't have to be done later
    const lineParts = restOfLine.replace(/[.)]/g, "").split("vs");

    // I think for loop is fine here because there should only be 2 parts
    for (const part of lineParts) {
      if (!part) {
        throw new Error(
          `Invalid line in description for ${video.id}\nLine: ${line}\nPart ${part}`
        );
      }

      if (!part.includes("(")) continue;

      const [player, characterName] = part.split("(");

      if (!player || !characterName) {
        throw new Error(
          `Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part}\nPlayer 1: ${player}\nCharacter 1: ${characterName}`
        );
      }

      const characterId = translateCharNameToIDSolo(
        characterName.trim(),
        gameCharacters
      );

      if (characterCounts.hasOwnProperty(characterId)) {
        characterCounts[characterId]++;
      } else {
        characterCounts[characterId] = 1;
      }

      const player1EdgeCases = [
        player.includes("Losers Round 1 A"),
        player.includes("Losers Round 1 B"),
      ];

      const playerCharacter = {
        player: (player1EdgeCases.includes(true) ? lastWord(player) : player)
          .replace("-", "")
          .trim(),
        character: characterId,
      };

      playerCharacters.push(playerCharacter);
    }
  }

  return {
    videoId: video.id,
    gameId: game.id,
    ...video.snippet,
    playerCharacters,
    characterCounts,
  };
}

export function extractMatchDataTeam(
  video: VideoObj,
  game: Game,
  gameCharacters: GetCharactersResult
): MatchData {
  const lines = video.snippet.description.split("\n");

  const playerCharactersTeams: PlayerCharacterTeam[] = [];

  const characterCounts: Record<number, number> = {};

  for (const line of lines) {
    const lineConditions = [!line.includes(" vs"), !line.includes("(")];

    if (lineConditions.includes(true)) continue;

    // removing the first part of the line, AKA the timestamp
    const restOfLine = line.split(" ").slice(1).join(" ");

    // remove any periods, mainly to normalize cases where the line contains 'vs.' instead of 'vs'
    // also, removes the closing parentheses surrounding the characters, so it doesn't have to be done later
    const [part1, part2] = restOfLine.replace(/[.)]/g, "").split("vs");

    if (!part1 || !part2) {
      throw new Error(
        `Invalid line in description for ${video.id}\nLine: ${line}\nPart 1: ${part1}\nPart 2: ${part2}`
      );
    }

    if (!part1.includes("(") || !part2.includes("(")) continue;

    // player 1 stuff -----------------------------------------------------------
    const [player1, characterTeam1] = part1.split("(");

    if (!player1 || !characterTeam1) {
      throw new Error(
        `Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part1}\nPlayer 1: ${player1}\nCharacter 1: ${characterTeam1}`
      );
    }

    const player1EdgeCases = [
      player1.includes("Losers Round 1 A"),
      player1.includes("Losers Round 1 B"),
    ];

    const characterObj1 = splitTeamCharacters(characterTeam1);

    const playerCharacterTeam1 = {
      player: (player1EdgeCases.includes(true) ? lastWord(player1) : player1)
        .replace("-", "")
        .trim(),
      ...characterObj1,
    };

    playerCharactersTeams.push(playerCharacterTeam1);

    // player 2 stuff -----------------------------------------------------------
    const [player2, characterTeam2] = part2.split("(");

    if (!player2 || !characterTeam2) {
      throw new Error(
        `Invalid part2 in line for ${video.id}\nLine: ${line}\nPart 2: ${part2}\nPlayer 2: ${player2}\nCharacter 2: ${characterTeam2}`
      );
    }

    const characterObj2 = splitTeamCharacters(characterTeam2);

    const playerCharacterTeam2 = {
      player: player2.replace("-", "").trim(),
      ...characterObj2,
    };

    playerCharactersTeams.push(playerCharacterTeam2);
  }

  return {
    videoId: video.id,
    gameId: game.id,
    ...video.snippet,
    playerCharactersTeams,
    characterCounts,
  };
}
