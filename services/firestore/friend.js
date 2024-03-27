const { userRef } = require('../../config/firebaseConfig')
const admin = require('firebase-admin'); 

const searchFriend = async (friendId) => {
    try {
        if (!friendId) {
            console.error("Friend ID is undefined or null.");
            return null;
        }

        const querySnapshot = await userRef
            .where(
                admin.firestore.Filter.or(
                admin.firestore.Filter.where("uid", "==", friendId),
                admin.firestore.Filter.where("phoneNumber", "==", friendId),
                admin.firestore.Filter.where("email", "==", friendId)
                )
            )
            .get()

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data()
            console.log('friend found!')
            return userDoc
        } else {
            console.log('friend not found!')
            return null
        }
    } catch (error) {
        console.error("Error finding user with this id/email/number", error)
    }
}

const addFriend = async (userId, friend) => {
    try {
        console.log("add friend:", friend)
        const { uid, displayName, email, phoneNumber } = friend;

        const userSnapshot = await userRef.where("uid", "==", userId).get()
        if (userSnapshot.empty) {
            console.log("user not found")
            return false
        }

        const userDoc = userSnapshot.docs[0];
        const sentFriendRequests = userDoc.exists ? userDoc.data().sentFriendRequests || [] : [];
        sentFriendRequests.push({ uid: uid, displayName: displayName || null, email: email || null, phoneNumber: phoneNumber || null });
        await userRef.doc(userDoc.id).update({ sentFriendRequests });

        const friendSnapshot = await userRef.where("uid", "==", friend.uid).get()
        if (friendSnapshot.empty) {
            console.log("Friend not found");
            return false;
        }

        const friendDoc = friendSnapshot.docs[0];
        const friendRequests = friendDoc.data().friendRequests || [];
        const userData = {
            uid: userId,
            displayName: userDoc.data().displayName || null,
            email: userDoc.data().email || null,
            phoneNumber: userDoc.data().phoneNumber || null
        };
        friendRequests.push(userData);
        await userRef.doc(friendDoc.id).update({ friendRequests });
        console.log("Friend request sent successfully to the friend");

        return true;
    } catch (error) {
        console.error("error adding new user:", error)
        return false;
    }
}

const isFriendRequestSent = async (userId, friendId) => {
    try {
        const userDoc = await userRef.doc(userId).get();
        if (userDoc.exists) {
            const sentFriendRequests = userDoc.data().sentFriendRequests || [];
            return sentFriendRequests.some(request => request.uid === friendId);
        } else {
            console.log("Sender user not found");
            return false;
        }
    } catch (error) {
        console.error("Error checking if friend request is sent:", error);
        return false;
    }
}

const isFriendRequestReceived = async (userId, friendId) => {
    try {
        const friendDoc = await userRef.doc(friendId).get();
        if (friendDoc.exists) {
            const friendRequests = friendDoc.data().friendRequests || [];
            return friendRequests.some(request => request.uid === userId);
        } else {
            console.log("Receiver user not found");
            return false;
        }
    } catch (error) {
        console.error("Error checking if friend request is received:", error);
        return false;
    }
}

const acceptRequest = async (userId, friendId) => {
    console.log('user id:', userId)
    console.log('friend id:', friendId)
    try {
        const userQuerySnapshot = await userRef.where("uid", "==", userId).limit(1).get();
        const friendQuerySnapshot = await userRef.where("uid", "==", friendId).limit(1).get();

        if (userQuerySnapshot.empty || friendQuerySnapshot.empty) {
            console.error("User or friend not found.");
            return { success: false, error: "User or friend not found" };
        }

        const userDoc = userQuerySnapshot.docs[0];
        const friendDoc = friendQuerySnapshot.docs[0];
        const userData = userDoc.data();
        const friendData = friendDoc.data();

        console.log('Original friendRequests:', userData.friendRequests);
        console.log('Original sentFriendRequests:', friendData.sentFriendRequests);

        const updatedUserFriendRequests = userData.friendRequests.filter(uid => uid.uid !== friendId);
        const friendToAddToUser = {
            uid: friendData.uid,
            displayName: friendData.displayName || null,
            phoneNumber: friendData.phoneNumber || null,
            email: friendData.email || null,
        };

        await userDoc.ref.update({
            friendRequests: updatedUserFriendRequests,
            friends: admin.firestore.FieldValue.arrayUnion(friendToAddToUser),
        });

        const updatedFriendSentRequests = friendData.sentFriendRequests.filter(uid => uid.uid !== userId);
        const userToAddToFriend = {
            uid: userData.uid,
            displayName: userData.displayName || null,
            phoneNumber: userData.phoneNumber || null,
            email: userData.email || null,
        };

        await friendDoc.ref.update({
            sentFriendRequests: updatedFriendSentRequests,
            friends: admin.firestore.FieldValue.arrayUnion(userToAddToFriend),
        });

        console.log("Successfully accepted friend request!")

        return { success: true };
    } catch (error) {
        console.error('Error accepting friend request:', error);
        return { success: false, error: error.message };
    }
}

const declineRequest = async (userId, friendId) => {
    try {
        // console.log("User id in friend service:", userId)
        // console.log("Friend id in friend service:", friendId)
        const userQuerySnapshot = await userRef.where("uid", "==", userId).limit(1).get();
        const friendQuerySnapshot = await userRef.where("uid", "==", friendId).limit(1).get();

        if (userQuerySnapshot.empty || friendQuerySnapshot.empty) {
            console.error("User or friend not found.");
            return { success: false, error: "User or friend not found" };
        }
        
        const userDoc = userQuerySnapshot.docs[0];
        const userFriendRequests = userDoc.data().friendRequests.filter(request => request.uid !== friendId);
        await userDoc.ref.update({
            friendRequests: userFriendRequests,
        });

        const friendDoc = friendQuerySnapshot.docs[0];
        const friendSentRequests = friendDoc.data().sentFriendRequests.filter(request => request.uid !== userId);
        await friendDoc.ref.update({
            sentFriendRequests: friendSentRequests,
        });

        console.log("Successfully declined friend request!")
        return { success: true };
    } catch (error) {
        console.error('Error declining frined request', error)
    }
}

const cancelRequest = async (userId, friendId) => {
    try {
        // console.log("User id in friend service:", userId)
        // console.log("Friend id in friend service:", friendId)
        const userQuerySnapshot = await userRef.where("uid", "==", userId).limit(1).get();
        const friendQuerySnapshot = await userRef.where("uid", "==", friendId).limit(1).get();

        if (userQuerySnapshot.empty || friendQuerySnapshot.empty) {
            console.error("User or friend not found.");
            return { success: false, error: "User or friend not found" };
        }
        
        const userDoc = userQuerySnapshot.docs[0];
        const userFriendRequests = userDoc.data().sentFriendRequests.filter(request => request.uid !== friendId);
        await userDoc.ref.update({
            sentFriendRequests: userFriendRequests,
        });

        const friendDoc = friendQuerySnapshot.docs[0];
        const friendSentRequests = friendDoc.data().friendRequests.filter(request => request.uid !== userId);
        await friendDoc.ref.update({
            friendRequests: friendSentRequests,
        });

        console.log("Successfully cancelled friend request!")
        return { success: true };
    } catch (error) {
        console.error('Error declining frined request', error)
    }
}

const deleteFriend = async (userId, friendId) => {
    try {
        // console.log("User id in friend service:", userId)
        // console.log("Friend id in friend service:", friendId)
        const userQuerySnapshot = await userRef.where("uid", "==", userId).limit(1).get();
        const friendQuerySnapshot = await userRef.where("uid", "==", friendId).limit(1).get();

        if (userQuerySnapshot.empty || friendQuerySnapshot.empty) {
            console.error("User or friend not found.");
            return { success: false, error: "User or friend not found" };
        }
        
        const userDoc = userQuerySnapshot.docs[0];
        const userFriends = userDoc.data().friends.filter(friendUid => friendUid !== friendId);
        await userDoc.ref.update({
            friends: userFriends,
        });

        const friendDoc = friendQuerySnapshot.docs[0];
        const friendsFriends = friendDoc.data().friends.filter(userId => userId !== userId);
        await friendDoc.ref.update({
            friends: friendsFriends,
        });

        console.log("Successfully cancelled friend request!")
        return { success: true };
    } catch (error) {
        console.error('Error declining frined request', error)
    }
}

module.exports = {
    searchFriend, 
    addFriend,
    isFriendRequestSent,
    isFriendRequestReceived,
    acceptRequest,
    declineRequest,
    cancelRequest,
    deleteFriend
}