import { Game } from "@prisma/client";
import {
  CharacterIdName,
  CharacterMap,
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

export function translateTeamCharactersToIDs(
  teamString: string,
  allCharacters: CharacterMap<{ id: number; gameId: number }>
) {
  const characters: CharacterIdName[] = [];

  const normalizedTeamString = teamString.trim().toLowerCase();

  for (const characterName of Object.keys(allCharacters)) {
    if (normalizedTeamString.includes(characterName.toLowerCase())) {
      characters.push({
        name: characterName,
        id: allCharacters[characterName]!.id,
      });
    }
  }

  const [character1, character2, character3] = characters;

  if (!character1 || !character2 || !character3) {
    throw new Error(
      `ERROR: Invalid team string: ${teamString}\ncharacter1: ${character1?.name}\ncharacter2: ${character2?.name}\ncharacter3: ${character3?.name}`
    );
  }

  return { character1, character2, character3 };
}

export function translateCharNameToID(
  name: string,
  characters: GetCharactersResult
) {
  if (name === "") {
    return (
      characters.find(
        (character) => character.name === "Character Not Available"
      )?.id ?? 0
    );
  }

  const normalizedName = name.trim().toLowerCase();
  const character = characters.find((character) => {
    return (
      normalizedName.includes(character.name.toLowerCase()) ||
      character.altNames.some((altName) =>
        normalizedName.includes(altName.name.toLowerCase())
      )
    );
  });

  if (!character) {
    throw new Error(`Could not find character with name ${name}`);
  }

  return character.id;
}

export function checkPlayerFormat(player: string) {
  if (player === "") {
    return "Player Not Available";
  }

  const playerEdgeCases = [
    player.includes("Losers Round 1 A"),
    player.includes("Losers Round 1 B"),
  ];

  const checkedPlayer = (
    playerEdgeCases.includes(true) ? lastWord(player) : player
  )
    .replace("-", "")
    .trim();

  return checkedPlayer;
}

// an attempt at isolating top 8 matches in descriptions with pools and top 48 as well
export function findRelevantMatchupParagraph(video: VideoObj) {
  const paragraphs = video.snippet.description.split("\n\n");

  // Keywords to search for
  const searchKeywords = [
    "Winners Final",
    "Losers Semifinal",
    "Losers Final",
    "Grand Final",
  ];

  const index = paragraphs.findIndex((paragraph) =>
    searchKeywords.some((keyword) => paragraph.includes(keyword))
  );

  // Return the index of the paragraph before the one with the keyword
  const relevantParagraph = paragraphs[index - 1]
    ? paragraphs[index - 1]
    : paragraphs[index];

  if (!relevantParagraph) {
    return "";
  }

  return relevantParagraph;
}

export function createGameCharactersMap(
  characters: GetCharactersResult,
  gameId: number
) {
  const characterMap = characters.reduce((map, character) => {
    // Add character name to the map
    map[character.name] = { id: character.id, gameId: character.gameId };

    // Add altNames to the map
    character.altNames.forEach((altName) => {
      map[altName.name] = { id: character.id, gameId: character.gameId };
    });

    return map;
  }, {} as CharacterMap<{ id: number; gameId: number }>);

  return characterMap;
}
