< -- These are for testing purposes mainly in the railway UI -->
SELECT
    cot."characterId",
    cot."characterUses",
    t.title,
    c.name
FROM
    "CharactersOnTournaments" as cot
    JOIN "Character" as c ON cot."characterId" = c.id
    JOIN "Tournament" as t ON cot."tournamentId" = t.id;