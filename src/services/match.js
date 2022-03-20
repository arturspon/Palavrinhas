import {
  collection,
  addDoc,
  setDoc,
  Timestamp,
  arrayUnion,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { getRandomWord } from '@/utils/words'

const uuidv4 = () => {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  )
}

const getPlayerLocalId = () => {
  let hostId = localStorage.getItem('hostId')

  if (!hostId) {
    hostId = uuidv4()
    localStorage.setItem('hostId', hostId)
  }

  return hostId
}

const getCleanMatchModel = () => {
  return {
    word: getRandomWord(),
    host: {
      id: null,
      guesses: [],
    },
    enemy: {
      id: null,
      guesses: [],
    },
    winner: null,
    started_at: null,
    ended_at: null,
    created_at: Timestamp.now(),
  }
}

export const createMatch = async (db, dataOverride) => {
  let gameData = getCleanMatchModel()
  gameData.host.id = getPlayerLocalId()

  if (dataOverride) {
    gameData = {
      ...gameData,
      ...dataOverride,
    }
  }

  const matchesCollection = collection(db, 'matches')
  const docRef = await addDoc(matchesCollection, gameData)

  return docRef
}

export const rematch = async (db, matchDocRef, matchData) => {
  const newMatchData = {
    host: {
      id: matchData.host.id,
      guesses: [],
    },
    enemy: {
      id: matchData.enemy.id,
      guesses: [],
    },
    parentMatchId: matchDocRef.id,
    isRematchAccepted: false,
  }

  const newMatchDocRef = await createMatch(db, newMatchData)

  await setDoc(
    matchDocRef,
    {
      rematchId: newMatchDocRef.id,
      playerIdRematchRequester: getPlayerLocalId(),
    },
    { merge: true }
  )

  return newMatchDocRef
}

export const isKeyCorrect = (matchWord, key, keyIndex) => {
  return matchWord.charAt(keyIndex) == key
}

export const isKeyInWord = (matchWord, key, keyIndex, attemptedWord) => {
  const isKeyPresentInWord = matchWord.indexOf(key) !== -1

  if (!keyIndex && !attemptedWord) return isKeyPresentInWord

  const matchWordCharacters = matchWord.split('')

  const correctKeyCountInUserAttempt = attemptedWord
    .reduce((carry, char, charIndex) => {
      // console.log(`key correct`, {matchWord, char, charIndex})
      return isKeyCorrect(matchWord, char, charIndex) ? ++carry : carry
    }, 0)
  // if (key == 'b')
  console.log({key,correctKeyCountInUserAttempt})
  const keyLetterCountInWord = matchWordCharacters.filter(
    (char) => char == key
  ).length

  const equalLettersToThisKeyIndex = matchWordCharacters.reduce(
    (carry, char, charIndex) => {
      // if (key == 'b') {
      //   console.log({key, char, charIndex, keyIndex})
      // }
      if (charIndex <= keyIndex && char == key) carry += 1
      return carry
    },
    0
  )

  if (key == 'b') {
    console.log({ keyIndex, keyLetterCountInWord, equalLettersToThisKeyIndex })
  }

  const canHighlightKeyIndex =
    equalLettersToThisKeyIndex <= keyLetterCountInWord &&
    correctKeyCountInUserAttempt < keyLetterCountInWord

  return canHighlightKeyIndex && isKeyPresentInWord
}

export const saveInvalidWordToDb = async (db, word) => {
  const invalidWordsDocRef = doc(db, 'stats', 'invalidWords-pt_BR')
  await updateDoc(invalidWordsDocRef, {
    data: arrayUnion(word),
  })
}
