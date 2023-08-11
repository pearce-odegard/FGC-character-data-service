import { Character, PrismaClient } from "@prisma/client";
import { getCharacterByGameIdAndNameOrNull } from "./prismaWrapperFunctions";

interface PlayerCharacter {
    [key: string]: string;
}

export function extractMatchData(prisma: PrismaClient, dataString: string, gameId: number) {

    const lines = dataString.split('\n');

    const playerCharacters: PlayerCharacter[] = [];

    for (const line of lines) {
        if (!line.includes('vs')) continue;

        // slicing out the first item in the string, AKA the timestamp
        const lineParts = line.split(' ').slice(1).join(' ').replace('.', '').split('vs');
        console.log(lineParts)

        const part1 = lineParts[0].split('(');

        const player1 = {
            player: part1[0].replace('-', '').trim(),
            character: part1[1].replace(')', '').trim()
        }

        console.log(player1)

        const part2 = lineParts[1].split('(');

        const player2 = {
            player: part2[0].replace('-', '').trim(),
            character: part2[1].replace(')', '').trim()
        }

        console.log(player2)

    }

    return playerCharacters;
}
