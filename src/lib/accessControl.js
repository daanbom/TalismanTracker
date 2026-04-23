function isGroupAdmin(activeGroup, currentPlayer) {
  return Boolean(
    activeGroup?.admin_user_id &&
      currentPlayer?.user_id &&
      activeGroup.admin_user_id === currentPlayer.user_id,
  )
}

function isGameParticipant(game, currentPlayer) {
  if (!currentPlayer?.id) return false
  return Boolean(game?.players?.some((gp) => gp.player?.id === currentPlayer.id))
}

export function canEditGame({ activeGroup, currentPlayer, game }) {
  return isGroupAdmin(activeGroup, currentPlayer) || isGameParticipant(game, currentPlayer)
}

export function canDeleteGame({ activeGroup, currentPlayer }) {
  return isGroupAdmin(activeGroup, currentPlayer)
}

export function canEditTierlist({ currentPlayer, playerId }) {
  return Boolean(currentPlayer?.id && playerId && currentPlayer.id === playerId)
}

