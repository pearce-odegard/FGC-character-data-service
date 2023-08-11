# Collecting Data about players and their character picks in Fighting game tournaments

## Tech Stack: TypeScript, Puppeteer, Prisma, PostgresQL

This repo is a service that will be running in the cloud to provide data for the eventual web app I'll be building using said data. The data is collected in a few steps using Typescript, [Puppeteer](https://pptr.dev/), and the [YouTube Data API](https://developers.google.com/youtube/v3/docs/search/list).

Firstly, there is the **url-scraper** uses Puppeteer to acquire URLs for all videos from the [Tampa Never Sleeps](https://www.youtube.com/@TampaNeverSleeps) YouTube channel and stores them in a Postgres DB (hosted on [Railway](railway.app)) using Prisma. I am getting URLs from specifically this channel because they provide player and character data nicely formatted in the description of each video (most of the time).

Next, I use these URLs to fetch metadata about relevant videos from the YouTube data API. I am focusing on videos that feature a small set of games for now (UMvC3, Street Fighter 6, GG Strive, more tbd).

Said metadata most importantly includes the description of each video, which I then parse to determine what players were featured in the given video and what character(s) they used (also stored in the Railway-hosted Postgres DB).

# Change Log

- Updated to use the YouTube data API instead of a second Puppeteer scraper to collect video metadata

# Roadmap

- Move from Prisma to DrizzleORM
- Implement functionality for all games on the TNS channel
- Implement functionality for other games on other channels (namely super smash bros.)
