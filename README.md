# Collecting Data about character pick variety in Fighting game tournaments

This is an analysis of the variety of characters that get picked in tournaments for given fighting games, and aims to compare games based on this variety.

For now, I will only be focusing on the variety of characters who place **TOP 8** at any given event. I am after a detailed look at character diversity across multiple big FGC (fighting game community) titles. I am also aiming to get a better understanding on how to compare
games like Street Fighter 6 and Ultimate Marvel vs Capcom 3. In Street Fighter, each player can only pick 1 character per match. In UMvC3, each player will be picking a team of 3 characters each match. This begs questions like:
- What games offer the most variety character-wise in the FGC?
- Is character variety an inherently good thing in fighting games?
- Is a VS. game (team games ala UMvC3) inherently more diverse than a game like Street Fighter?
- Is it more impactful to have more total characters represented, or a larger percentage of the overall cast be respresented?
- How do you compare games with different sized rosters, or with different amounts of characters being picked in a given match?
- If certain characters are picked more often in a top 8, even in a team game where each player is picking multiple characters at a time, what kind of impact does that have on a game's community?
- Are the characters getting picked the most considered powerful, or even the best character in their respective game?

## Tech stack

There are 2 different scraping scripts that are apart of this project, both built using [Puppeteer](https://www.npmjs.com/package/puppeteer). 
The first is a scraper I built to collect all Top 8 or relevant tournament video URLs from [Tampa Never Sleeps](https://www.youtube.com/@TampaNeverSleeps).
Since they are so kind to provide pretty much all of the characters and player matchups in the descriptions of all of their tournament videos,
I can then scrape character usage data from each individual Top 8 video description for each of my supported games from the URL list. 
Currently there is support for UMvC3, SF6, and SSBU. DBFZ, Strive are in the works (more games TBD).

Unfortunately, because I am relying on the descriptions of tournament VODs, I am only getting data from one Youtube channel. There are also some 
inconsistencies; misspellings, extra matches getting included in a Top 8 VOD that aren't actual Top 8 matches, etc... 
But I think the project still captures the bigger picture of diversity in character selection at the top level of fighting games. 

TODO: 
- refine character naming distinctions ("Goku" vs "Goku Black" etc.) as well as ability to scrape other non-Top 8 videos
- write URL and character usage data to database (likely PostgreSQL on [Railway](https://railway.app))
- create data visualization front end (t3 stack? next? react?)
- look at what it would take to scrape data from [start.gg](https://start.gg), other data sourcing options