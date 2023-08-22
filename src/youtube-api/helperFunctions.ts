import { Game } from "@prisma/client";
import {
  CharacterIdName,
  GetCharactersResult,
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
    title.includes("qualifiers"),
    title.includes("top 8 tns umvc3 tournament #70"),
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

export function translateTeamCharactersToIDs(teamString: string, allCharacters: GetCharactersResult) {

  const characters: CharacterIdName[] = [];

  const normalizedTeamString = teamString.trim().toLowerCase();

  for (const character of allCharacters) {
    const altNames = character.altNames.map((altName) => altName.name.toLowerCase());
    const normalizedName = character.name.toLowerCase();
    if (normalizedTeamString.includes(normalizedName) ||
      altNames.some((altName) => normalizedTeamString.includes(altName))) {
      characters.push({ name: character.name, id: character.id });
    }
  }

  const [character1, character2, character3] = characters;

  if (!character1 || !character2 || !character3) {
    throw new Error(`ERROR: Invalid team string: ${teamString}\ncharacter1: ${character1}\ncharacter2: ${character2}\ncharacter3: ${character3}`);
  }

  return { character1, character2, character3 };
}

export function translateCharNameToID(
  name: string,
  characters: GetCharactersResult
) {

  if (name === "") {
    return characters.find((character) => character.name === "Character Not Available")?.id ?? 0;
  }

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
