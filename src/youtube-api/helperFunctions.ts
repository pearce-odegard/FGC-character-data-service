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

  const conditions = [
    !title.includes("top 8"),
    title.includes("ratio"),
    title.includes("palette"),
    title.includes("swap"),
    title.includes("umvc3 #99"),
    title.includes("qualifiers")
  ];

  if (conditions.includes(true)) return null;

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

export function splitTeamCharactersToIDs(teamString: string, allCharacters: GetCharactersResult) {
  let characters: string[];

  // if (teamString.includes("Strange") || teamString.includes("Doom")) teamString = teamString.replace("Doctor", "");
  // if (teamString.includes("Redfield")) teamString = teamString.replace("Redfield", "");
  // if (teamString.includes("Iron")) teamString = teamString.replace("Iron", "");

  if (teamString.includes("/")) characters = teamString.split("/");
  else if (teamString.includes(",")) characters = teamString.split(",");
  else characters = teamString.split(" ");

  // const filteredCharacters = characters.filter(
  //   (character, index) => character !== "" || index > 2
  // );

  if (characters.length < 3) {
    throw new Error(`Invalid team string: ${teamString}`);
  }

  const characterIDs = characters.map((character) => {
    try {
      return translateCharNameToID(character, allCharacters);
    } catch (error) {
      // swallow error for now? Anti-pattern! Look into refactoring the functions to return errors!!!
    }
  });

  // need to figure out how to account for the issue in video aec5l6e9izY
  // as well as covering all other known edge cases without code from lines 46-48
  const [character1, character2, character3] = characterIDs.filter(id => id !== undefined);

  if (!character1 || !character2 || !character3) {
    throw new Error(
      `Invalid team string: ${teamString}\nSplit string: ${characters}\nCharacter 1: ${character1}\nCharacter 2: ${character2}\nCharacter 3: ${character3}`
    );
  }

  return { character1, character2, character3 };
}

// export function countCharacterOccurrencesSolo(
//   characterName: string,
//   characterArray: PlayerCharacter[]
// ) {
//   return characterArray.reduce((count, character) => {
//     return count;
//   }, 0);
// }

// export function countCharacterOccurrencesTeam(
//   characterName: string,
//   characterArray: PlayerCharacterTeam[]
// ) {
//   let count = 0;
//   for (const player of characterArray) {
//     if (
//       player.character1 === characterName ||
//       player.character2 === characterName ||
//       player.character3 === characterName
//     ) {
//       count++;
//     }
//   }
//   return count;
// }

export function translateCharNameToID(
  name: string,
  characters: GetCharactersResult
) {
  const normalizedName = name.trim().toLowerCase();
  const character = characters.find((character) => {
    return (
      normalizedName.includes(character.name.toLowerCase()) ||
      character.altNames.some(
        (altName) => normalizedName.includes(altName.name.toLowerCase())
      )
    );
  });

  if (!character) {
    throw new Error(`Could not find character with name ${name}`);
  }

  return character.id;
}
