import { Character, PrismaClient } from "@prisma/client";
import { getCharacterByGameIdAndNameOrNull } from "./prismaWrapperFunctions";

interface PlayerCharacter {
    [key: string]: string;
}


export async function extractMatchData(prisma: PrismaClient, dataString: string, gameId: number) {

    if (gameId === 0) {
        return [];
    }

    const lines = dataString.split('\n');

    for (const line of lines) {
        if (!line.includes('vs')) continue;

        const lineParts = line.split(' ');
        // shift to eliminate timestamps
        lineParts.shift();

        const playerCharacters: PlayerCharacter[] = [];

        for (const part of lineParts) {
            const playerCharacter: PlayerCharacter = { player: "" };

            if (part.startsWith('(') && part.endsWith(')')) {
                playerCharacter.character = part.slice(1, -1);
            } else if (!(part === 'vs' || part === 'vs.')) {
                playerCharacter.player += part;
            }
        }
    }

    return lines;
}
