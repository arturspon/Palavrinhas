import {
  isKeyCorrect,
  isKeyInWord,
} from '@/services/match'

export const getGameResultEmojis = (player, word, lineBreakCharacter) => {
  let emojis = ''

  for (let rowIndex = 0; rowIndex < player.grid.rows; rowIndex++) {
    for (let colIndex = 0; colIndex < player.grid.cols; colIndex++) {
      const key = player.guesses?.[rowIndex]?.[colIndex]
      emojis += !key
        ? '⬜'
        : isKeyCorrect(word, key, colIndex)
        ? '🟩'
        : isKeyInWord(word, key)
        ? '🟨'
        : '🟥'
    }
    emojis += lineBreakCharacter
  }

  return emojis
}

export const getUrlGameResultWhatsApp = (player, word, isWinner) => {
  const winLoseWord = isWinner ? 'Ganhei' : 'Perdi'

  let message =
    `${winLoseWord} no *Palavrinhas.com*\n` +
    `A palavra era *${word.toUpperCase()}*, se liga no resultado:\n\n`

  message += getGameResultEmojis(player, word, '\n')

  message += '\nJogue também em https://palavrinhas.com'
  return buildWhatsAppUrl(message)
}

export const buildWhatsAppUrl = text => {
  const encodedText = encodeURIComponent(text)
  return `https://api.whatsapp.com/send?text=${encodedText}`
}
