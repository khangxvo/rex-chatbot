const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const { Timestamp } = require("firebase-admin/firestore");
const { logger } = functions;

exports.addMessage = functions.https.onCall(async (data, context) => {
    try {
        logger.log("Received message request data:", data);

        // Validate required fields
        if (!data.text || !data.userId) {
            logger.log("Required fields (text or userId) are missing");
            throw new functions.https.HttpsError(
                "invalid-argument",
                "Required fields (text or userId) are missing"
            );
        }

        const { text, userId } = data;

        // Construct message data
        const messageData = {
            text,
            userId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        }

        // Add message to the user's message subcollection in Firestore
        const messageRef = await admin
            .firestore()
            .collection("chats")
            .doc(userId)
            .collection("message")
            .add(messageData)

        logger.log("Message added successfully, message ID:", messageRef.id)

        // Return success status and message ID
        return { status: "success", messageId: messageRef.id };

    } catch (error) {
        logger.error("Error adding message:", error);
        // Throw a structured error for the client
        throw new functions.https.HttpsError(
            "unknown",
            "An error occured while adding the message",
            error.message
        )
    }
})