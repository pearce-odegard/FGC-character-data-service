import { Character, Game, PrismaClient } from "@prisma/client";
import { CharacterPartial, CharactersUsed, TeamUsed } from "./types";

const tallyFunctionMarvel = async (prisma: PrismaClient, game: Game, htmlElementArray: string[]) => {

    const charactersUsed: CharactersUsed = {};

    const teamsUsed: TeamUsed[] = [];

    const filteredMatchups = htmlElementArray.filter((element, index) => {
        return element.includes('vs');
    });

    // RegEx string matching solution

    // Starting by slicing the first 4 elements so as not to include any matchups
    // besides winners and losers round 1 of top 8, then mashing it all into one big string, 
    // removing any parentheses, commas, periods, etc...
    // and splitting it back into an array of individual words
    const wordArray = filteredMatchups.slice(0, 4).join("").replace(/(\(|\)|\,|\.|\-)/gm, '').split(" ");

    let teamCounter = 1;
    let newTeam: TeamUsed = {};

    for (const word of wordArray) {

        const maybeCharacter = await prisma.character.findFirst({
            where: {
                gameId: game.id,
                name: word
            }
        });

        if (maybeCharacter === null) {
            continue;
        } else if (charactersUsed.hasOwnProperty(word)) {
            charactersUsed[word].characterUses += 1;
            newTeam[`character${teamCounter}`] = maybeCharacter.id;
            teamCounter += 1;
        } else {
            charactersUsed[word] = {
                characterId: maybeCharacter.id,
                characterUses: 1
            };
            newTeam[`character${teamCounter}`] = maybeCharacter.id;
            teamCounter += 1;
        }

        if (teamCounter > 3) {
            teamsUsed.push(newTeam);
            newTeam = {};
            teamCounter = 1;
        }

    }

    return { charactersUsed, teamsUsed };
}

const tallyFunctionSF6 = (htmlElementArray: string[], characters: Character[]) => {
    const filteredMatchups = htmlElementArray.filter((element, index) => {
        return element.includes('vs');
    });

    const charactersUsed: CharactersUsed = {};

    // RegEx string matching solution

    // Starting by slicing the first 4 elements so as not to include any other matchups
    // than winners and losers round 1 of top 8, then mashing it all into one big string (excluding any parentheses, commas, periods, etc)
    // to be searched
    const matchupsString = filteredMatchups.slice(0, 4).join("").replace(/(\(|\)|\,|\.|\-)/gm, '');

    for (const character of characters) {
        const numberOfUses = (matchupsString.match(new RegExp(`${character.name}`, 'g')) || []).length;
        if (numberOfUses > 0) {
            charactersUsed[character.name] = {
                characterId: character.id,
                characterUses: numberOfUses
            };
        }
    }

    return charactersUsed;
}

export const tallyFunctions = {
    marvel: tallyFunctionMarvel,
    sf6: tallyFunctionSF6
}