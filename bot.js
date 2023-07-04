import { scrapeCharactersUsed } from "./functions.js";

const videoList = [
    'https://youtu.be/TQ6di9HVKHY',
    'https://youtu.be/BmPpMd-9bEQ',
    'https://youtu.be/Y3A7b3UDM0o',
    'https://youtu.be/GUSnaxN1Qns',
    'https://youtu.be/flafKUmcYbo',
    'https://youtu.be/he1Pk77G1C0',
    'https://youtu.be/DhTk9BLgDPQ',
    'https://youtu.be/fIu2ZYEuAts',
    'https://youtu.be/5FpaXA3M4K4',
    'https://youtu.be/c9TM_AkchVo',
    'https://youtu.be/OY-SS6mixLo'
];

for (const video of videoList) {
    const currentTourneyData = await scrapeCharactersUsed(video);
    console.log(currentTourneyData);
}