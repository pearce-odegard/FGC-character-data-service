import { VideoObj } from "./fetchAllVideoData";

interface PlayerCharacter {
    player: string;
    character: string;
    videoId: string;
}

export function extractMatchDataSolo(video: VideoObj) {

    const lines = video.snippet.description.split('\n');

    const playerCharacters: PlayerCharacter[] = [];

    for (const line of lines) {
        if (!line.includes(' vs') || !line.includes('(')) continue;

        // removing the first part of the line, AKA the timestamp
        const restOfLine = line.split(' ').slice(1).join(' ');

        // remove any periods, mainly to normalize cases where the line contains 'vs.' instead of 'vs'
        // also, removes the closing parentheses surrounding the characters, so it doesn't have to be done later
        const [part1, part2] = restOfLine.replace(/[.)]/g, '').split('vs');

        const [player1, character1] = part1.split('(');

        const playerCharacter1 = {
            player: player1.replace('-', '').trim(),
            character: character1.trim(),
            videoId: video.id
        }

        playerCharacters.push(playerCharacter1);

        const [player2, character2] = part2.split('(');

        const playerCharacter2 = {
            player: player2.replace('-', '').trim(),
            character: character2.trim(),
            videoId: video.id
        }

        playerCharacters.push(playerCharacter2);
    }

    return playerCharacters;
}
