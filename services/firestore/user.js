const { userRef } = require('../../config/firebaseConfig')
const admin = require('firebase-admin'); 

const addNewUser = async (userId, userData) => {
    try {
        await userRef.doc(userId).set(userData)
        console.log(`New user added with ID: ${userId}`);
    } catch (error) {
        console.error("error adding new user:", error)
    }
}

const updateUser = async (userId, updates) => {
    try {
        await userRef.doc(userId).update(updates);
        console.log(`User ${userId} updated successfully.`);
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

const addChatSessionToUser = async (userId, chatSessionId) => {
    try {
        const querySnapshot = await userRef.where("uid", "==", userId).get();

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].ref
            
            await userDoc.update({
                sessions: admin.firestore.FieldValue.arrayUnion(chatSessionId)
            })
            console.log(`Chat session ${chatSessionId} added to user ${userId}.`);
        } else {
            console.log(`User with UID ${userId} not found.`);
        }
    } catch (error) {
        console.error(`Error adding chat session to user ${userId}:`, error);
    }
}

const userHasChatSession = async (userId, chatSessionId) => {
    const userDocRef = userRef.doc(userId);
    const doc = await userDocRef.get();
    if (!doc.exists) {
        console.log('No such user found!');
        return false;
    }
    const userData = doc.data();
    return userData.sessions && userData.sessions.includes(chatSessionId);
};

const deleteSessionFromUser = async (chatSessionId, userId) => {
    try {
        const querySnapshot = await userRef.where("uid", "==", userId).get();

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0]
            const userData = userDoc.data()

            const { sessions } = userData;

            const updatedSessions = sessions.filter(sessionId => sessionId !== chatSessionId)

            await userRef.doc(userDoc.id).update({ sessions: updatedSessions });

            console.log('Session ID deleted from user document.');
        } else {
            console.log('User document not found.');
        }

    } catch (error) {
        console.error('Error deleting session from user:', error);
    }
}

module.exports = {
    addNewUser, updateUser, addChatSessionToUser, userHasChatSession, deleteSessionFromUser
}