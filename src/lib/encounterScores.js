export function aggregateEncounterScores(rows) {
  const totalsByEncounter = new Map()

  for (const row of rows) {
    const current = totalsByEncounter.get(row.encounterName) ?? {
      id: `global-${row.encounterName}`,
      encounterName: row.encounterName,
      creatureWins: 0,
      playerWins: 0,
      groupId: null,
    }

    current.creatureWins += Number(row.creatureWins ?? 0)
    current.playerWins += Number(row.playerWins ?? 0)

    totalsByEncounter.set(row.encounterName, current)
  }

  return Array.from(totalsByEncounter.values()).sort((left, right) =>
    left.encounterName.localeCompare(right.encounterName),
  )
}
