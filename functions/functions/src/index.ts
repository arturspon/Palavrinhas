const functions = require("firebase-functions");
const firebase = require("firebase-admin");

firebase.initializeApp();

exports.updateOldUserStats = functions.firestore
  .document("/users/{userId}")
  .onCreate(async (snap: any, context: any) => {
    const db = firebase.firestore();

    const userData = snap.data();

    if (!userData.oldHostId) {
      return 0;
    }

    const matches = await firebase.firestore().collection("matches").get();

    const victoryMatches = [];
    const lostMatches = [];

    matches.forEach((match: any) => {
      const data = match.data();
      if (
        data.winner &&
        (data.host.id == userData.oldHostId ||
          data.enemy.id == userData.oldHostId)
      ) {
        if (data.winner == userData.oldHostId) {
          victoryMatches.push(data);
        } else {
          lostMatches.push(data);
        }
      }
    });

    try {
      const generalStatsRef = db.collection("stats").doc("general");
      await db.runTransaction(async (t: any) => {
        const doc = await t.get(generalStatsRef);
        const newUsersCount = doc.data().usersCount + 1;
        t.update(generalStatsRef, { usersCount: newUsersCount });
      });
      console.log("Transaction success!");
    } catch (e) {
      console.log("Transaction failure:", e);
    }

    const stats = {
      winsCount: victoryMatches.length,
      lossesCount: lostMatches.length,
      matchesCount: victoryMatches.length + lostMatches.length,
    };

    return snap.ref.set({ stats }, { merge: true });
  });
