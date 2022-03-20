import {
  collection,
  addDoc,
  setDoc,
  Timestamp,
  arrayUnion,
  updateDoc,
  doc,
  runTransaction,
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
  try {
    console.log('pedindo rematch')
    const newMatchDocRef = await runTransaction(db, async (transaction) => {
      const currentMatchDoc = await transaction.get(matchDocRef)
      const currentMatchData = currentMatchDoc.data()

      if (currentMatchData.rematchId) {
        const rematchDocRef = doc(db, 'matches', currentMatchData.rematchId)
        return {
          isCurrentPlayerOwnerOfRematch: false,
          rematchDocRef,
        }
      }

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

      transaction.set(
        matchDocRef,
        {
          rematchId: newMatchDocRef.id,
          playerIdRematchRequester: getPlayerLocalId(),
        },
        { merge: true }
      )

      return {
        isCurrentPlayerOwnerOfRematch: true,
        rematchDocRef: newMatchDocRef,
      }
    });

    if (!newMatchDocRef.isCurrentPlayerOwnerOfRematch) {
      await updateDoc(
        newMatchDocRef.rematchDocRef,
        { isRematchAccepted: true },
        { merge: true }
      )
    }

    console.log("Transaction successfully committed!");
    return newMatchDocRef.rematchDocRef
  } catch (e) {
    console.log("Transaction failed: ", e);
    return null
  }
}

export const isKeyCorrect = (matchWord, key, keyIndex) => {
  return matchWord.charAt(keyIndex) == key
}

export const isKeyInWord = (matchWord, key) => {
  return matchWord.indexOf(key) !== -1
}

export const saveInvalidWordToDb = async (db, word) => {
  const invalidWordsDocRef = doc(db, 'stats', 'invalidWords-pt_BR')
  await updateDoc(invalidWordsDocRef, {
    data: arrayUnion(word),
  })
}
