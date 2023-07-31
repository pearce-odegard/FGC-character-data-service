interface MatchData {
    time: string;
    player1: string;
    player2: string;
}

function extractMatchData(dataString: string): MatchData[] {
    const matches: MatchData[] = [];
    const lines = dataString.split('\n');
    console.log(dataString)

    for (const line of lines) {
        const matchData = line.match(/(\d+:\d+)?\s*([\w|]+\s*\([\w/]+\))\s+vs\s+([\w|]+\s*\([\w/]+\))/);

        if (matchData) {
            const time = matchData[1] ? matchData[1].trim() : '';
            const player1Team = matchData[2].trim();
            const player2Team = matchData[3].trim();

            matches.push({
                time,
                player1: player1Team,
                player2: player2Team,
            });
        }
    }

    return matches;
}

const dataString = `0:00 Intro
1:47 Romora (Zero/Doom/Vergil) vs RayRay (Magneto/Doom/Sentinel)
13:05 Rok (Morrigan/Doom/Amaterasu) vs Escalante (Magneto/Morrigan/Doom)
25:00 Kobun (Magneto/Tron/Wesker) vs Marvelo (Nova/Doom/Strider)
33:46 Rambam (Zero/Doom/Dante) vs Drewtorious (Zero/Doom/Vergil)
41:29 Proton|Coach Steve (Nova/Spencer/Doom) vs Jasonkido (Haggar/Dormammu/Magneto)
50:20 TheQuack (MODOK/Sentinel/Doom) vs RayRay (Magneto/Doom/Sentinel)
1:11:17 Marvelo (Nova/Doom/Strider) vs Flocker (Zero/Vergil/Hawkeye)
1:20:17 Proton|Coach Steve (Nova/Spencer/Doom) vs DEAD X PRIDE (Vergil/Doom/Strider)
1:29:57 Rambam (Zero/Doom/Dante) vs Fightwheel|Rok (Morrigan/Doom/Amaterasu)`;

const matches = extractMatchData(dataString);
console.log(matches);
