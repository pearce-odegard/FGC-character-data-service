import { Game } from "@prisma/client";
import {
  lastWord,
  splitTeamCharactersToIDs,
  translateCharNameToID,
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
  // filter out irrelevant lines and get last 4 to only include top 8 matches
  const lines = video.snippet.description
    .split("\n")
    .filter(line => {
      return line.includes(" vs") && line.includes("(");
    })
    .slice(-4);

  const playerCharacters: PlayerCharacter[] = [];

  const characterCounts: Record<number, number> = {};

  for (const line of lines) {

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

      const [player, characterName] = part.split(" (");

      if (!player || !characterName && characterName !== "") {
        throw new Error(
          `Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part}\nPlayer 1: ${player}\nCharacter 1: ${characterName}`
        );
      }

      const characterId = characterName === "" ?
        translateCharNameToID(
          "Character Not Available",
          gameCharacters
        ) : translateCharNameToID(
          characterName,
          gameCharacters
        );

      if (characterCounts.hasOwnProperty(characterId)) {
        characterCounts[characterId]++;
      } else {
        characterCounts[characterId] = 1;
      }

      const playerEdgeCases = [
        player.includes("Losers Round 1 A"),
        player.includes("Losers Round 1 B"),
      ];

      const playerCharacter = {
        player: (playerEdgeCases.includes(true) ? lastWord(player) : player)
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
  const lines = video.snippet.description
    .split("\n")
    .filter(line => {
      return line.includes(" vs") && line.includes("(");
    })
    .slice(-4);

  const playerCharactersTeams: PlayerCharacterTeam[] = [];

  const characterCounts: Record<number, number> = {};

  for (const line of lines) {

    // removing the first part of the line, AKA the timestamp
    const restOfLine = line.split(" ").slice(1).join(" ");

    // remove any periods, mainly to normalize cases where the line contains 'vs.' instead of 'vs'
    // also, removes the closing parentheses surrounding the characters, so it doesn't have to be done later

    const lineParts = restOfLine.replace(/[.)]/g, "").split("vs");

    for (const part of lineParts) {
      if (!part) {
        throw new Error(
          `Invalid line in description for ${video.id}\nLine: ${line}\nPart 1: ${part}`
        );
      }

      if (!part.includes("(")) continue;

      // player 1 stuff -----------------------------------------------------------
      const [player, characterTeam] = part.split(" (");

      if (!player || !characterTeam) {
        throw new Error(
          `Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part}\nPlayer 1: ${player}\nCharacter 1: ${characterTeam}`
        );
      }

      const playerEdgeCases = [
        player.includes("Losers Round 1 A"),
        player.includes("Losers Round 1 B"),
      ];

      const charsInTeam = splitTeamCharactersToIDs(characterTeam, gameCharacters);

      for (const characterId of Object.values(charsInTeam)) {
        if (characterCounts.hasOwnProperty(characterId)) {
          characterCounts[characterId]++;
        } else {
          characterCounts[characterId] = 1;
        }
      }

      const playercharacterTeam = {
        player: (playerEdgeCases.includes(true) ? lastWord(player) : player)
          .replace("-", "")
          .trim(),
        ...charsInTeam
      };

      playerCharactersTeams.push(playercharacterTeam);
    }
  }

  return {
    videoId: video.id,
    gameId: game.id,
    ...video.snippet,
    playerCharactersTeams,
    characterCounts,
  };
}
