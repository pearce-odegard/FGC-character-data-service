import fetch from 'node-fetch';

// lists of characters in each game
const sf6 = [
    'Luke', 'Blanka', 'Rashid', 'Cammy',
    'Lily', 'Zangief', 'JP', 'Marisa',
    'Manon', 'Dee Jay', 'Deejay', 'Deejjay',
    'Honda', 'Dhalsim', 'Ken', 'Juri',
    'Kimberly', 'Guile', 'Chun-Li', 'Jamie',
    'Ryu'
];


const marvel = [
    "Akuma", "Amaterasu", "Arthur", "C.Viper", "Chris", "Chun-Li",
    "Dante", "Felicia", "Firebrand", "Frank", "Haggar", "Hagggar",
    "Hsien-Ko", "Jill", "Morrigan", "Nemesis", "Wright", "Ryu",
    "Spencer", "Strider", "Trish", "Tron", "Vergil", "Viewtiful", "Wesker", "Zero",
    "Captain", "Deadpool", "Doom", "Strange", "Dormammu",
    "Ghost", "Hawkeye", "Hulk", "Fist", "Man",
    "Magneto", "MODOK", "Nova", "Phoenix", "Rocket",
    "Sentinel", "She-Hulk", "Shuma",
    "Spider", "Storm", "Skrull",
    "Taskmaster", "Thor", "Wolverine", "X-23"
]

const strive = [
    'Sol', 'Ky', 'May', 'Axl',
    'Chipp', 'Potemkin', 'Faust', 'Millia',
    'Zato', 'Ramlethal', 'Leo', 'Nagoriyuki',
    'Giovanna', 'Anji', 'I-no', 'Goldlewis',
    "Jack-O'", 'Happy Chaos', 'Baiken', 'Testament',
    'Bridget', 'Sin', 'Bedman?', 'Asuka'
]

const dbfz = [
    'Andriod 16', 'Android 17', 'Android 18', 'Android 21', 'Android 21 (Lab Coat)', 'Bardock',
    'Beerus', 'Broly', 'Broly (DBS)', 'Captain Ginyu', 'Cell', 'Cooler',
    'Frieza', 'Gogeta SS4', 'Gogeta (SSGSS)', 'Gohan (Adult)',
    'Gohan (Teen)', 'Goku', 'Goku (GT)', 'Goku (SSGSS)', 'Goku (Super Saiyan)',
    'Goku (Ultra Instinct)', 'Goku Black', 'Gotenks', 'Hit',
    'Janemba', 'Jiren', 'Kefla', 'Kid Buu', 'Krillin', 'Majin Buu',
    'Master Roshi', 'Nappa', 'Piccolo', 'Super Baby 2', 'Tien', 'Trunks', 'Vegeta',
    'Vegeta (SSGSS)', 'Vegeta (Super Saiyan)', 'Vegita (SSGSS)', 'Videl',
    'Yamcha', 'Zamasu (Fused)'
]

const ssbu = [
    'Mario', 'Donkey Kong', 'Link', 'Samus',
    'Dark Samus', 'Yoshi', 'Kirby', 'Fox',
    'Pikachu', 'Luigi', 'Ness', 'Captain Falcon',
    'Jigglypuff', 'Peach', 'Daisy', 'Bowser',
    'Ice Climbers', 'Sheik', 'Zelda', 'Dr. Mario',
    'Pichu', 'Falco', 'Marth', 'Lucina',
    'Young Link', 'Ganondorf', 'Mewtwo', 'Roy',
    'Chrom', 'Mr. Game & Watch', 'Meta Knight', 'Pit',
    'Dark Pit', 'Zero Suit Samus', 'Wario', 'Snake',
    'Ike', 'Pokémon Trainer', 'Diddy Kong', 'Lucas',
    'Sonic', 'King Dedede', 'Olimar', 'Lucario',
    'R.O.B.', 'Toon Link', 'Wolf', 'Villager',
    'Mega Man', 'Wii Fit Trainer', 'Rosalina & Luma', 'Little Mac',
    'Greninja', 'Mii Brawler', 'Mii Swordfighter', 'Mii Gunner',
    'Palutena', 'Pac-Man', 'Robin', 'Shulk',
    'Bowser Jr.', 'Duck Hunt', 'Ryu', 'Ken',
    'Cloud', 'Bayonetta', 'Ridley', 'Simon',
    'Richter', 'King K. Rool', 'Isabelle', 'Incineroar',
    'Piranha Plant', 'Joker', 'Hero', 'Banjo & Kazooie',
    'Terry', 'Byleth', 'Min Min'
]

export const characterLists = {
    sf6,
    marvel,
    strive,
    dbfz,
    ssbu
}