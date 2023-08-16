import { Game } from "@prisma/client";
import { VideoObj } from "./fetchAllVideoData";
import { lastWord, splitTeamCharacters } from "./helperFunctions";

interface MatchData {
    videoId: string;
    gameId: number;
    playerCharacters: PlayerCharacter[] | PlayerCharacterTeam[];
}

interface PlayerCharacter {
    player: string;
    character: string;
}

export function extractMatchDataSolo(video: VideoObj, game: Game): MatchData {

    const lines = video.snippet.description.split('\n');

    const playerCharacters: PlayerCharacter[] = [];

    for (const line of lines) {

        const lineConditions = [
            !line.includes(' vs'),
            !line.includes('(')
        ];

        if (lineConditions.includes(true)) continue;

        // removing the first part of the line, AKA the timestamp
        const restOfLine = line.split(' ').slice(1).join(' ');

        // remove any periods, mainly to normalize cases where the line contains 'vs.' instead of 'vs'
        // also, removes the closing parentheses surrounding the characters, so it doesn't have to be done later
        const [part1, part2] = restOfLine.replace(/[.)]/g, '').split('vs');

        if (!part1 || !part2) throw new Error(`Invalid line in description for ${video.id}\nLine: ${line}\nPart 1: ${part1}\nPart 2: ${part2}`);

        if (!part1.includes('(') || !part2.includes('(')) continue;

        const [player1, character1] = part1.split('(');

        if (!player1 || !character1) throw new Error(`Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part1}\nPlayer 1: ${player1}\nCharacter 1: ${character1}`);

        const player1EdgeCases = [
            player1.includes('Losers Round 1 A'),
            player1.includes('Losers Round 1 B')
        ];

        const playerCharacter1 = {
            player: (player1EdgeCases.includes(true) ? lastWord(player1) : player1).replace('-', '').trim(),
            character: character1.trim(),
        };

        playerCharacters.push(playerCharacter1);

        const [player2, character2] = part2.split('(');

        if (!player2 || !character2 && character2 !== "") throw new Error(`Invalid part2 in line for ${video.id}\nLine: ${line}\nPart 2: ${part2}\nPlayer 2: ${player2}\nCharacter 2: ${character2}`);

        const playerCharacter2 = {
            player: player2.replace('-', '').trim(),
            character: character2.trim(),
            videoId: video.id
        };

        playerCharacters.push(playerCharacter2);
    }

    return { videoId: video.id, gameId: game.id, playerCharacters };
}

interface PlayerCharacterTeam {
    player: string;
    character1: string;
    character2: string;
    character3: string;
}

export function extractMatchDataTeam(video: VideoObj, game: Game): MatchData {

    const lines = video.snippet.description.split('\n');

    const playerCharacters: PlayerCharacterTeam[] = [];

    for (const line of lines) {

        const lineConditions = [
            !line.includes(' vs'),
            !line.includes('(')
        ];

        if (lineConditions.includes(true)) continue;

        // removing the first part of the line, AKA the timestamp
        const restOfLine = line.split(' ').slice(1).join(' ');

        // remove any periods, mainly to normalize cases where the line contains 'vs.' instead of 'vs'
        // also, removes the closing parentheses surrounding the characters, so it doesn't have to be done later
        const [part1, part2] = restOfLine.replace(/[.)]/g, '').split('vs');

        if (!part1 || !part2) throw new Error(`Invalid line in description for ${video.id}\nLine: ${line}\nPart 1: ${part1}\nPart 2: ${part2}`);

        if (!part1.includes('(') || !part2.includes('(')) continue;

        const [player1, characterTeam1] = part1.split('(');

        if (!player1 || !characterTeam1) throw new Error(`Invalid part1 in line for ${video.id}\nLine: ${line}\nPart 1: ${part1}\nPlayer 1: ${player1}\nCharacter 1: ${characterTeam1}`);

        const player1EdgeCases = [
            player1.includes('Losers Round 1 A'),
            player1.includes('Losers Round 1 B')
        ];

        const characterObj1 = splitTeamCharacters(characterTeam1);

        const playerCharacterTeam1 = {
            player: (player1EdgeCases.includes(true) ? lastWord(player1) : player1).replace('-', '').trim(),
            ...characterObj1
        };

        playerCharacters.push(playerCharacterTeam1);

        const [player2, characterTeam2] = part2.split('(');

        if (!player2 || !characterTeam2) throw new Error(`Invalid part2 in line for ${video.id}\nLine: ${line}\nPart 2: ${part2}\nPlayer 2: ${player2}\nCharacter 2: ${characterTeam2}`);

        const characterObj2 = splitTeamCharacters(characterTeam2);

        const playerCharacterTeam2 = {
            player: player2.replace('-', '').trim(),
            ...characterObj2,
            videoId: video.id
        };

        playerCharacters.push(playerCharacterTeam2);
    }

    return { videoId: video.id, gameId: game.id, playerCharacters };
}

