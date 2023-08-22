import { PrismaClient } from "@prisma/client";
import { characterLists } from "./characterLists";

(async () => {
  const prisma = new PrismaClient();

  // seed games
  // await prisma.game.createMany({
  //   data: Object.keys(characterLists).map((name) => {
  //     return {
  //       name: name,
  //       isTeamGame: name === "umvc3",
  //     };
  //   }),
  //   skipDuplicates: true,
  // });

  // // seed characters
  // for (const [name, arr] of Object.entries(characterLists)) {
  //   await prisma.game.update({
  //     where: {
  //       name: name,
  //     },
  //     data: {
  //       Characters: {
  //         createMany: {
  //           data: [
  //             // include an entry for each game to account for when a character isn't available for a certain player
  //             // in the description
  //             { name: "Character Not Available" },
  //             ...arr.map((name) => {
  //               return { name };
  //             })],
  //         },
  //       },
  //     },
  //   });
  // }


  // // seed alt character names

  // // character not available --> empty string
  // const characterNotAvailableIDs = await prisma.character.findMany({
  //   select: {
  //     id: true,
  //   },
  //   where: {
  //     name: "Character Not Available",
  //   },
  // });

  // if (characterNotAvailableIDs.length > 0) {
  //   for (const id of characterNotAvailableIDs) {
  //     await prisma.characterAltName.create({
  //       data: { name: "", characterId: id.id },
  //     });
  //   }
  // }

  // // marvel
  // const haggar = await prisma.character.findFirst({
  //   where: {
  //     name: "Haggar",
  //   },
  // });

  // if (haggar) {
  //   await prisma.characterAltName.create({
  //     data: {
  //       name: "Hagggar",
  //       characterId: haggar.id,
  //     },
  //   });
  // }

  // const magneto = await prisma.character.findFirst({
  //   where: {
  //     name: "Magneto",
  //   },
  // });

  // if (magneto) {
  //   await prisma.characterAltName.createMany({
  //     data: [
  //       // { name: "Mangeto", characterId: magneto.id },
  //       // { name: "Megneto", characterId: magneto.id },
  //       { name: "Magento", characterId: magneto.id },
  //     ],
  //   });
  // }

  // const shuma = await prisma.character.findFirst({
  //   where: {
  //     name: "Shuma",
  //   },
  // });

  // if (shuma) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Shuma-Gorath", characterId: shuma.id }],
  //   });
  // }

  // const vergil = await prisma.character.findFirst({
  //   where: {
  //     name: "Vergil",
  //   },
  // });

  // if (vergil) {
  //   await prisma.characterAltName.createMany({
  //     data: [
  //       { name: "Virgil", characterId: vergil.id },
  //       { name: "Veril", characterId: vergil.id },
  //     ],
  //   });
  // }

  // const dormammu = await prisma.character.findFirst({
  //   where: {
  //     name: "Dormammu",
  //   },
  // });

  // if (dormammu) {
  //   await prisma.characterAltName.createMany({
  //     data: [
  //       // { name: "Dormmamu", characterId: dormammu.id },
  //       { name: "Dormammy", characterId: dormammu.id }
  //     ],
  //   });
  // }

  // const ironFist = await prisma.character.findFirst({
  //   where: {
  //     name: "Iron Fist",
  //   },
  // });

  // if (ironFist) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Fist", characterId: ironFist.id }],
  //   });
  // }

  // const ironMan = await prisma.character.findFirst({
  //   where: {
  //     name: "Iron Man",
  //   },
  // });

  // if (ironMan) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Man", characterId: ironMan.id }],
  //   });
  // }

  // const captainAmerica = await prisma.character.findFirst({
  //   where: {
  //     name: "Captain America",
  //   },
  // });

  // if (captainAmerica) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Captain", characterId: captainAmerica.id }],
  //   });
  // }

  // const cViper = await prisma.character.findFirst({
  //   where: {
  //     name: "C.Viper",
  //   },
  // });

  // if (cViper) {
  //   await prisma.characterAltName.createMany({
  //     data: [
  //       { name: "Viper", characterId: cViper.id },
  //     ],
  //   });
  // }

  // // sf6
  // const deejay = await prisma.character.findFirst({
  //   where: {
  //     name: "Dee Jay",
  //   },
  // });

  // if (deejay) {
  //   await prisma.characterAltName.createMany({
  //     data: [
  //       { name: "Deejay", characterId: deejay.id },
  //       { name: "Deejjay", characterId: deejay.id },
  //     ],
  //   });
  // }

  // const guile = await prisma.character.findFirst({
  //   where: {
  //     name: "Guile",
  //   },
  // });

  // if (guile) {
  //   await prisma.characterAltName.createMany({
  //     data: [
  //       { name: "NuckleDu", characterId: guile.id }
  //     ],
  //   });
  // }

  // const cammy = await prisma.character.findFirst({
  //   where: {
  //     name: "Cammy",
  //   },
  // });

  // if (cammy) {
  //   await prisma.characterAltName.createMany({
  //     data: [
  //       { name: "Punk", characterId: cammy.id }
  //     ],
  //   });
  // }

  // // strive
  // const jackO = await prisma.character.findFirst({
  //   where: {
  //     name: "Jack-O'",
  //   },
  // });

  // if (jackO) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Jack-O", characterId: jackO.id }],
  //   });
  // }

  // const bedman = await prisma.character.findFirst({
  //   where: {
  //     name: "Bedman?",
  //   },
  // });

  // if (bedman) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Bedman", characterId: bedman.id }],
  //   });
  // }

  // const zato = await prisma.character.findFirst({
  //   where: {
  //     name: "Zato",
  //   },
  // });

  // if (zato) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Zato-1", characterId: zato.id }],
  //   });
  // }

  // const happyChaos = await prisma.character.findFirst({
  //   where: {
  //     name: "Happy Chaos",
  //   },
  // });

  // if (happyChaos) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Happy", characterId: happyChaos.id }],
  //   });
  // }

  // const bridget = await prisma.character.findFirst({
  //   where: {
  //     name: "Bridget",
  //   },
  // });

  // if (bridget) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Briget", characterId: bridget.id }],
  //   });
  // }

  // const ramlethal = await prisma.character.findFirst({
  //   where: {
  //     name: "Ramlethal",
  //   },
  // });

  // if (ramlethal) {
  //   await prisma.characterAltName.createMany({
  //     data: [{ name: "Ram", characterId: ramlethal.id }],
  //   });
  // }
})();