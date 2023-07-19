import { determineGameInVideo, prismaWrapperFunctions, executeTallyFunction, tallyFunctions, waitThenClick } from "."
import { checkUniqueCharNamingMarvel } from "./tallyFunctions";

export type TallyFunctions = typeof tallyFunctions;

export type PrismaWrapperFunctions = typeof prismaWrapperFunctions;

export type ExecuteTallyFunction = typeof executeTallyFunction;

export type DetermineGameTitleFunction = typeof determineGameInVideo;

export type CheckUniqueCharNamingMarvel = typeof checkUniqueCharNamingMarvel;

export type WaitThenClick = typeof waitThenClick;