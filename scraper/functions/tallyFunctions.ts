import { Character, Game, PrismaClient } from "@prisma/client";
import { CharactersUsed, TallyFunctions, TeamUsed } from "../types";

export const tallyFunctionMarvel = async (
    prisma: PrismaClient,
    game: Game,
    htmlElementArray: string[],
    characterFunction: (a: PrismaClient, b: number, c: string) => Promise<Character | null>,
    charNameCheck: typeof checkUniqueCharNamingMarvel
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

        const passesCheck = charNameCheck(word, wordArray[i + 1], wordArray[i - 1]);

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

export const checkUniqueCharNamingMarvel = (current: string, next: string, previous: string) => {
    switch (true) {
        case current === 'Ghost':
            return next === 'Rider';
        case current === 'Man':
            return previous === 'Iron';
        case current === 'Fist':
            return previous === 'Iron';
        default:
            return true;
    }
}


