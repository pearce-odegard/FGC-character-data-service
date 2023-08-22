import { Game } from "@prisma/client";
import {
  lastWord,
  translateCharNameToID,
  translateTeamCharactersToIDs,
} from "./helperFunctions";
import {
  CharacterCounts,
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
      const includesCharacters = gameCharacters.some((character) => line.includes(character.name));
      return line.includes(" vs") && line.includes("(") && includesCharacters;
    })
    .slice(-4);

  const playerCharacters: PlayerCharacter[] = [];

  const characterCounts: CharacterCounts = {};

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

      const playerEdgeCases = [
        player.includes("Losers Round 1 A"),
        player.includes("Losers Round 1 B"),
      ];

      const checkedPlayer = (playerEdgeCases.includes(true) ? lastWord(player) : player).replace("-", "").trim();

      if (playerCharacters.some(obj => obj.player === checkedPlayer)) continue;

      const characterId = translateCharNameToID(characterName, gameCharacters);

      const trimmedCharName = characterName.trim();

      if (characterCounts.hasOwnProperty(trimmedCharName)) {
        characterCounts[trimmedCharName]!.count++;
      } else {
        characterCounts[trimmedCharName] = { id: characterId, count: 1 };
      }

      playerCharacters.push({
        player: checkedPlayer,
        character: characterId,
      });
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
      const includesCharacters = gameCharacters.some((character) => line.includes(character.name));
      return line.includes(" vs") && line.includes("(") && includesCharacters;
    })
    .slice(-4);

  const playerCharactersTeams: PlayerCharacterTeam[] = [];

  const characterCounts: CharacterCounts = {};

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

      const charsInTeam = translateTeamCharactersToIDs(characterTeam, gameCharacters);

      for (const characterIdName of Object.values(charsInTeam)) {
        const name = characterIdName.name;
        if (characterCounts.hasOwnProperty(name)) {
          characterCounts[name]!.count++;
        } else {
          characterCounts[name] = { id: characterIdName.id, count: 1 }
        }
      }

      const playercharacterTeam = {
        player: (playerEdgeCases.includes(true) ? lastWord(player) : player)
          .replace("-", "")
          .trim(),
        character1: charsInTeam.character1.id,
        character2: charsInTeam.character2.id,
        character3: charsInTeam.character3.id,
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
