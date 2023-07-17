import { Character, Game, PrismaClient } from "@prisma/client";
import { CharacterPartial, CharactersUsed, TeamUsed } from "./types";

export async function tallyCharactersUsed(htmlElementArray: string[], characters: CharacterPartial[], game: Game, prisma: PrismaClient): [CharactersUsed, Team[]] {

    const charactersInTop8: CharactersUsed = {};

    const teamsUsed: TeamUsed[] = [];

    if (game.name === 'marvel') {
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
            } else if (charactersInTop8.hasOwnProperty(word)) {
                charactersInTop8[word].numOfUses += 1;
                newTeam[`character${teamCounter}`] = maybeCharacter.id;
                teamCounter += 1;
            } else {
                charactersInTop8[word] = {
                    characterId: maybeCharacter.id,
                    numOfUses: 1
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

    } else if (game.name === 'sf6' || game.name === 'ssbu') {
        const filteredMatchups = htmlElementArray.filter((element, index) => {
            return element.includes('vs');
        });

        // RegEx string matching solution

        // Starting by slicing the first 4 elements so as not to include any other matchups
        // than winners and losers round 1 of top 8, then mashing it all into one big string (excluding any parentheses, commas, periods, etc)
        // to be searched
        const matchupsString = filteredMatchups.slice(0, 4).join("").replace(/(\(|\)|\,|\.|\-)/gm, '');

        for (const character of characters) {
            const numberOfUses = (matchupsString.match(new RegExp(`${character.name}`, 'g')) || []).length;
            if (numberOfUses > 0) {
                charactersInTop8[character.name] = {
                    characterId: character.id,
                    numOfUses: numberOfUses
                };
            }
        }

    }

    return [charactersInTop8, teamsUsed];

}
