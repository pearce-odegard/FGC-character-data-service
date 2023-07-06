import { getVideoURLs, scrapeCharactersUsed, tallyCharactersUsedMarvel } from "./functions.js";

// the slice removes the first and last items, which for some reason are showing up as empty strings
const videoList = await getVideoURLs().slice(1, -1);

console.log(videoList);

// const characterData = await scrapeCharactersUsed(videoList, tallyCharactersUsedMarvel);
// console.log(characterData);