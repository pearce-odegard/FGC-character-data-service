import { Game } from "@prisma/client";
import {
  checkPlayerFormat,
  findRelevantMatchupParagraph,
  translateCharNameToID,
  translateTeamCharactersToIDs,
} from "./helperFunctions";
import {
  CharacterCounts,
  CharacterMap,
  GetCharactersResult,
  MatchData,
  PlayerCharacter,
  PlayerCharacterTeam,
  VideoObj,
} from "./types";

export function extractMatchDataSolo(
  video: VideoObj,
  game: Game,
  gameCharacters: CharacterMap<{ id: number; gameId: number }>
): MatchData<PlayerCharacter> {
  // find the paragraph before the one with Winners Finals/Grand Finals/etc in it
  // checking for game.id 3, AKA Guilty Gear Strive, because it has a more consistent issue with having pools and top 48 matches in desc
  const videoIsStriveAndHasPools =
    game.id === 3 && video.snippet.title.toLowerCase().includes("pools");

  const relevantParagraph = videoIsStriveAndHasPools
    ? findRelevantMatchupParagraph(video)
    : video.snippet.description;

  // filter out irrelevant lines from the paragraph and just check that it's valid
  const lines = relevantParagraph.split("\n").filter((line) => {
    const includesCharacters = Object.keys(gameCharacters).some(
      (characterName) => line.includes(characterName)
    );
    return line.includes(" vs") && line.includes("(") && includesCharacters;
  });

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

      const playerCharUndefinedAndNonEmpty =
        (!player && player !== "") || (!characterName && characterName !== "");

      if (playerCharUndefinedAndNonEmpty) {
        throw new Error(
          `Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part}\nPlayer 1: ${player}\nCharacter 1: ${characterName}`
        );
      }

      const checkedPlayer = checkPlayerFormat(player);

      const playerAlreadyExists = playerCharacters.some(
        (obj) => obj.player === checkedPlayer
      );

      if (playerAlreadyExists) continue;

      const trimmedCharName = characterName.trim();

      const characterId = gameCharacters[trimmedCharName]?.id;

      if (!characterId) {
        throw new Error(
          `Could not find character with name ${characterName} for game ${game.name}`
        );
      }

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
  gameCharacters: CharacterMap<{ id: number; gameId: number }>
): MatchData<PlayerCharacterTeam> {
  const lines = video.snippet.description.split("\n").filter((line) => {
    const includesCharacters = Object.keys(gameCharacters).some(
      (characterName) => line.includes(characterName)
    );
    return line.includes(" vs") && line.includes("(") && includesCharacters;
  });
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

      if ((!player && player !== "") || !characterTeam) {
        throw new Error(
          `Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part}\nPlayer 1: ${player}\nCharacter 1: ${characterTeam}`
        );
      }

      const checkedPlayer = checkPlayerFormat(player);

      const playerAlreadyExists = playerCharactersTeams.some(
        (obj) => obj.player === checkedPlayer
      );

      if (playerAlreadyExists) continue;

      const charsInTeam = translateTeamCharactersToIDs(
        characterTeam,
        gameCharacters
      );

      for (const characterIdName of Object.values(charsInTeam)) {
        const name = characterIdName.name;
        if (characterCounts.hasOwnProperty(name)) {
          characterCounts[name]!.count++;
        } else {
          characterCounts[name] = { id: characterIdName.id, count: 1 };
        }
      }

      const playercharacterTeam = {
        player: checkedPlayer,
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
    playerCharacters: playerCharactersTeams,
    characterCounts,
  };
}
