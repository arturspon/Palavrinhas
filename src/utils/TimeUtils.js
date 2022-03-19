export function secondsToReadableTime(timeInseconds) {
  const minutes = Math.floor(timeInseconds / 60)
  const seconds = timeInseconds % 60

  // const minutesWord = minutes == 1 ? 'minuto' : 'minutos'
  // const secondsWord = seconds == 1 ? 'segundo' : 'segundos'
  const minutesWord = 'min.'
  const secondsWord = 'seg.'

  return minutes > 0
    ? (seconds == 0 ? `${minutes} ${minutesWord}` : `${minutes} ${minutesWord} e ${seconds} ${secondsWord}`)
    : `${seconds} ${secondsWord}`
}
