import { determineGameInVideo, prismaWrapperFunctions, waitThenClick } from "."

export type PrismaWrapperFunctions = typeof prismaWrapperFunctions;

export type DetermineGameTitleFunction = typeof determineGameInVideo;

export type WaitThenClick = typeof waitThenClick;

export type NextPrevious = {
    [key: string]: string
}