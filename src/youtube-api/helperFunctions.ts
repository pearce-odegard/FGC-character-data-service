import { Game } from "@prisma/client";
import {
  GetCharactersResult,
  MatchData,
  PlayerCharacter,
  PlayerCharacterTeam,
  VideoObj,
} from "./types";

export function getGameForVideo(games: Game[], video: VideoObj): Game | null {
  const title = video.snippet.title.toLowerCase();

  const isVideoIrrelevant =
    !title.includes("top 8") ||
    title.includes("ratio") ||
    title.includes("palette") ||
    title.includes("swap") ||
    title.includes("umvc3 #99");

  if (isVideoIrrelevant) return null;

  for (const game of games) {
    if (title.includes(game.name)) return game;
  }

  return null;
}

export function lastWord(inputString: string) {
  const words = inputString.trim().split(" ");

  const lastWord = words[words.length - 1];

  if (!lastWord) {
    throw new Error(`ERROR: No last word found for ${inputString}`);
  }

  return lastWord;
}

export function splitTeamCharacters(teamString: string) {
  let characters: string[];

  if (teamString.includes("/")) characters = teamString.split("/");
  else if (teamString.includes(",")) characters = teamString.split(",");
  else characters = teamString.split(" ");

  const filteredCharacters = characters.filter(
    (character, index) => character !== "" || index > 2
  );

  if (filteredCharacters.length < 3) {
    throw new Error(`Invalid team string: ${teamString}`);
  }

  // slice handles edge case where teamString is something like "Captain America, Doom, Rocket Raccoon, Wesker"
  // (seems to only happen once, so this satisfies that single case for now)
  const [character1, character2, character3] = filteredCharacters;

  if (!character1 || !character2 || !character3) {
    throw new Error(
      `Invalid team string: ${teamString}\nSplit string: ${filteredCharacters}\nCharacter 1: ${character1}\nCharacter 2: ${character2}\nCharacter 3: ${character3}`
    );
  }

  return {
    character1: character1.trim(),
    character2: character2.trim(),
    character3: character3.trim(),
  };
}

// export function countCharacterOccurrencesSolo(
//   characterName: string,
//   characterArray: PlayerCharacter[]
// ) {
//   return characterArray.reduce((count, character) => {
//     return count;
//   }, 0);
// }

export function countCharacterOccurrencesTeam(
  characterName: string,
  characterArray: PlayerCharacterTeam[]
) {
  let count = 0;
  for (const player of characterArray) {
    if (
      player.character1 === characterName ||
      player.character2 === characterName ||
      player.character3 === characterName
    ) {
      count++;
    }
  }
  return count;
}

export function translateCharNameToIDSolo(
  name: string,
  characters: GetCharactersResult
) {
  console.log(name);
  const character = characters.find((character) => {
    return (
      character.name.toLowerCase() === name.toLowerCase() ||
      character.altNames.some(
        (altName) => altName.name.toLowerCase() === name.toLowerCase()
      )
    );
  });

  if (!character) {
    throw new Error(`Could not find character with name ${name}`);
  }

  return character.id;
}
