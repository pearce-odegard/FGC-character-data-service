import { Character, Game, PrismaClient } from "@prisma/client";
import { CharactersUsed, TeamUsed } from "../types";
import { CheckUniqueCharNamingMarvel, NextPrevious, PrismaWrapperFunctions } from "./types";

export const tallyFunctionMarvel = async (
    prisma: PrismaClient,
    game: Game,
    htmlElementArray: string[],
    characterFunction: PrismaWrapperFunctions['getCharacterByGameIdAndNameOrNull'],
    charNameCheck: CheckUniqueCharNamingMarvel
): Promise<[CharactersUsed, TeamUsed[]]> => {

    const charactersUsed: CharactersUsed = {};

    const teamsUsed: TeamUsed[] = [];

    const filteredMatchups = htmlElementArray.filter((element) => {
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

    for (const [i, word] of wordArray.entries()) {
        const maybeCharacter = await characterFunction(prisma, game.id, word);

        const nextPrevious = { next: wordArray[i + 1], previous: wordArray[i - 1] };

        const passesCheck = charNameCheck(word, nextPrevious);

        if (maybeCharacter && passesCheck) {
            charactersUsed[word] = charactersUsed[word] || { characterId: maybeCharacter.id, characterUses: 0 };
            charactersUsed[word].characterUses += 1;
            newTeam[`character${teamCounter}`] = maybeCharacter.id;
            teamCounter += 1;
        }

        if (teamCounter > 3) {
            teamsUsed.push(newTeam);
            newTeam = {};
            teamCounter = 1;
        }
    }

    return [charactersUsed, teamsUsed];
}

export const tallyFunctionSF6 = async (prisma: PrismaClient, htmlElementArray: string[], characters: Character[]) => {
    const filteredMatchups = htmlElementArray.filter((element) => {
        return element.includes('vs');
    });

    const charactersUsed: CharactersUsed = {};

    // RegEx string matching solution

    // Starting by slicing the first 4 elements so as not to include any other matchups
    // than winners and losers round 1 of top 8, then mashing it all into one big string (excluding any parentheses, commas, periods, etc)
    // to be searched
    const matchupsString = filteredMatchups.slice(0, 4).join("").replace(/(\(|\)|\,|\.|\-)/gm, '');

    for (const character of characters) {
        const charAltNames = await prisma.characterAltName.findMany({
            where: {
                characterId: character.id
            }
        });

        let regExString = character.name;

        if (charAltNames.length > 0) charAltNames.forEach(obj => regExString += `|${obj.name}`);

        const numberOfUses = (matchupsString.match(new RegExp(regExString, 'g')) || []).length;

        if (numberOfUses > 0) {
            charactersUsed[character.name] = {
                characterId: character.id,
                characterUses: numberOfUses
            };
        }
    }

    return charactersUsed;
}

export const checkUniqueCharNamingMarvel = (current: string, obj: NextPrevious) => {

    const names = ['Ghost', 'Man', 'Fist', 'Captain', 'Rocket'];
    const checks = ['Rider', 'Iron', 'Iron', 'America', 'Raccoon'];
    const nextPreviousArr = ['next', 'previous', 'previous', 'next', 'previous'];

    if (!names.includes(current)) {
        return true;
    }

    for (let i = 0; i < names.length; i++) {
        if (current === names[i]) {
            return obj[nextPreviousArr[i]] === checks[i];
        }
    }

    return true;
}
