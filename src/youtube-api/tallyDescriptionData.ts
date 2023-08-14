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

        // slicing out the first item in the string, AKA the timestamp
        const lineParts = line.split(' ').slice(1).join(' ').replace(/\./g, '').split('vs');

        const part1 = lineParts[0].split('(');

        const player1 = {
            player: part1[0].replace('-', '').trim(),
            character: part1[1].replace(')', '').trim(),
            videoId: video.id
        }

        playerCharacters.push(player1);

        const part2 = lineParts[1].split('(');

        const player2 = {
            player: part2[0].replace('-', '').trim(),
            character: part2[1].replace(')', '').trim(),
            videoId: video.id
        }

        playerCharacters.push(player2);

    }

    return playerCharacters;
}
