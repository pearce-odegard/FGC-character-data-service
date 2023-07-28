import { CharactersUsed, NextPrevious, TallyCharactersUsedParams, TeamUsed } from "./types";

export const tallyCharactersUsed = async ({
    prisma,
    game,
    htmlElementArray,
    getCharacterFunction
}: TallyCharactersUsedParams): Promise<[CharactersUsed, TeamUsed[]]> => {

    const charactersUsed: CharactersUsed = {};

    const teamsUsed: TeamUsed[] = [];

    const filteredMatchups = htmlElementArray.filter((elementText) => {
        return elementText.includes('vs') || elementText.includes('Losers') && elementText.includes('Quarter');
    });

    // RegEx string matching solution

    // Starting by slicing the first 4 elements so as not to include any matchups
    // besides winners and losers round 1 of top 8, then mashing it all into one big string, 
    // removing any parentheses, commas, periods, etc...
    // and splitting it back into an array of individual words
    const wordArray = filteredMatchups.slice(-6).join("").replace(/(\(|\)|\,|\.)/gm, '').split(" ");

    console.log(wordArray);

    let teamCounter = 1;
    let newTeam: TeamUsed = {};

    for (const [i, word] of wordArray.entries()) {
        const maybeCharacter = await getCharacterFunction(prisma, game.id, word);

        const nextPrevious = { next: wordArray[i + 1], previous: wordArray[i - 1] };

        const passesCheck = checkUniqueCharNaming(word, nextPrevious);

        if (maybeCharacter && passesCheck) {
            charactersUsed[word] = charactersUsed[word] || { characterId: maybeCharacter.id, characterUses: 0 };
            charactersUsed[word].characterUses += 1;
            newTeam[`character${teamCounter}`] = maybeCharacter.id;
            teamCounter += 1;
        }

        if (game.isTeamGame && teamCounter > 3) {
            teamsUsed.push(newTeam);
            newTeam = {};
            teamCounter = 1;
        }
    }

    return [charactersUsed, teamsUsed];
}

const checkUniqueCharNaming = (current: string, obj: NextPrevious) => {

    const names = ['Ghost', 'Man', 'Fist', 'Captain', 'Rocket', 'Happy'];
    const checks = ['Rider', 'Iron', 'Iron', 'America', 'Raccoon', 'Chaos'];
    const nextPreviousArr = ['next', 'previous', 'previous', 'next', 'previous', 'next'];

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
