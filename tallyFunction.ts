import { CharactersUsed, Team } from "./types";

export function tallyCharactersUsed(htmlElementArray: string[], characters: string[], game: string): [CharactersUsed, Team[]] {

    const charactersInTop8: CharactersUsed = {};

    const teamsUsed: Team[] = [];

    if (game === 'marvel') {
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
        let newTeam: Team = {};

        for (const word of wordArray) {

            console.log(teamCounter)

            if (characters.includes(word) && charactersInTop8.hasOwnProperty(word)) {
                charactersInTop8[word] += 1;
                newTeam[`character${teamCounter}`] = word;
                teamCounter += 1;
            } else if (characters.includes(word)) {
                charactersInTop8[word] = 1;
                newTeam[`character${teamCounter}`] = word;
                teamCounter += 1;
            }

            if (teamCounter > 3) {
                teamsUsed.push(newTeam);
                newTeam = {};
                teamCounter = 1;
            }

        }

    } else if (game === 'sf6' || game === 'ssbu') {
        const filteredMatchups = htmlElementArray.filter((element, index) => {
            return element.includes('vs');
        });

        // RegEx string matching solution

        // Starting by slicing the first 4 elements so as not to include any other matchups
        // than winners and losers round 1 of top 8, then mashing it all into one big string (excluding any parentheses, commas, periods, etc)
        // to be searched
        const matchupsString = filteredMatchups.slice(0, 4).join("").replace(/(\(|\)|\,|\.|\-)/gm, '');

        for (const character of characters) {
            const numberOfUses = (matchupsString.match(new RegExp(`${character}`, 'g')) || []).length;
            if (numberOfUses > 0) {
                charactersInTop8[character] = numberOfUses;
            }
        }

    }

    return [charactersInTop8, teamsUsed];

}
