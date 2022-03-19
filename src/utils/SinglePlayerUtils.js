export const LOCAL_STORAGE_GAME_DATA_KEY = 'spGameData'
export const LOCAL_STORAGE_GAME_STOPWATCH_KEY = 'spGameStopwatch'

export const saveGameData = (data) => {
  const jsonData = JSON.stringify(data)
  localStorage.setItem(LOCAL_STORAGE_GAME_DATA_KEY, jsonData)
}

export const getSavedGameData = () => {
  const savedGameRawData = localStorage.getItem(LOCAL_STORAGE_GAME_DATA_KEY)
  return savedGameRawData ? JSON.parse(savedGameRawData) : null
}

export const resetGameData = async () => {
  return new Promise((resolve, reject) => {
    localStorage.removeItem(LOCAL_STORAGE_GAME_DATA_KEY)
    localStorage.removeItem(LOCAL_STORAGE_GAME_STOPWATCH_KEY)

    setTimeout(() => {
      resolve()
    }, 100)
  })
}

export const saveStopwatchData = (secondsElapsed) => {
  localStorage.setItem(
    LOCAL_STORAGE_GAME_STOPWATCH_KEY,
    secondsElapsed.toString()
  )
}

export const getStopwatchData = () => {
  return localStorage.getItem(LOCAL_STORAGE_GAME_STOPWATCH_KEY)
}
