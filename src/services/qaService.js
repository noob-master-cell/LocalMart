// This service module handles all interactions with Firebase Firestore
// related to the Questions & Answers (Q&A) feature for items.
// It encapsulates CRUD (Create, Read, Update, Delete) operations for questions and answers.

import {
  collection, // Firestore function to get a collection reference.
  query, // Firestore function to create a query.
  where, // Firestore function to specify query conditions.
  orderBy, // Firestore function to specify ordering.
  addDoc, // Firestore function to add a new document.
  getDocs, // Firestore function to fetch documents.
  doc, // Firestore function to get a document reference.
  updateDoc, // Firestore function to update a document.
  deleteDoc, // Firestore function to delete a document.
  Timestamp, // Firestore Timestamp object for date/time fields.
} from "firebase/firestore";
// Import Firebase database (db) and application ID (appId) from the main Firebase configuration.
import { db, appId } from "../firebase.jsx";

/**
 * Service class for managing Q&A functionalities.
 */
class QAService {
  constructor() {
    // Defines the Firestore collection path for item questions.
    // Uses `appId` to namespace data, common in multi-tenant or shared Firebase projects.
    this.questionsCollection = `artifacts/${appId}/public/data/item_questions`;
  }

  /**
   * Fetches all questions for a specific item, ordered by creation date (descending).
   *
   * @param {string} itemId - The ID of the item.
   * @param {string} itemType - The type of item ('sell' or 'lostfound').
   * @returns {Promise<Array>} A promise that resolves to an array of question objects,
   * each including its ID and data.
   * @throws {Error} If fetching questions fails.
   */
  async getQuestions(itemId, itemType) {
    try {
      // Construct a Firestore query to get questions for the given itemId and itemType,
      // ordered by their creation time in descending order (newest first).
      const q = query(
        collection(db, this.questionsCollection),
        where("itemId", "==", itemId),
        where("itemType", "==", itemType),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      // Map the document snapshots to an array of question objects.
      return querySnapshot.docs.map((doc) => ({
        id: doc.id, // Include the document ID.
        ...doc.data(), // Spread the document data.
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error; // Re-throw the error to be handled by the caller.
    }
  }

  /**
   * Adds a new question to an item.
   *
   * @param {Object} questionData - The data for the new question.
   * @param {string} questionData.itemId - ID of the item the question is for.
   * @param {string} questionData.itemType - Type of the item ('sell' or 'lostfound').
   * @param {string} questionData.questionText - The text of the question.
   * @param {string} questionData.userId - ID of the user asking the question.
   * @param {string} questionData.userName - Display name of the user asking.
   * @returns {Promise<Object>} A promise that resolves to the created question object,
   * including its ID and initial state.
   * @throws {Error} If adding the question fails.
   */
  async addQuestion(questionData) {
    try {
      // Add a new document to the questions collection with the provided data
      // and additional metadata like creation timestamp and initial answer state.
      const docRef = await addDoc(collection(db, this.questionsCollection), {
        ...questionData,
        createdAt: Timestamp.now(), // Set current server timestamp.
        answered: false, // Initially, questions are not answered.
        answerText: null,
        answeredAt: null,
        answerUserId: null,
        answerUserName: null,
      });

      // Return the newly created question object.
      return {
        id: docRef.id,
        ...questionData,
        createdAt: Timestamp.now(), // Reflect the timestamp for immediate use.
        answered: false,
      };
    } catch (error) {
      console.error("Error adding question:", error);
      throw error;
    }
  }

  /**
   * Adds an answer to an existing question.
   *
   * @param {string} questionId - The ID of the question to answer.
   * @param {Object} answerData - The data for the answer.
   * @param {string} answerData.answerText - The text of the answer.
   * @param {string} answerData.userId - ID of the user providing the answer.
   * @param {string} answerData.userName - Display name of the user answering.
   * @returns {Promise<void>} A promise that resolves when the answer is successfully added.
   * @throws {Error} If answering the question fails.
   */
  async answerQuestion(questionId, answerData) {
    try {
      // Get a reference to the specific question document.
      const questionRef = doc(db, this.questionsCollection, questionId);

      // Update the question document with answer details and mark as answered.
      await updateDoc(questionRef, {
        answerText: answerData.answerText,
        answerUserId: answerData.userId,
        answerUserName: answerData.userName,
        answeredAt: Timestamp.now(), // Set current server timestamp for when answered.
        answered: true,
      });
    } catch (error) {
      console.error("Error answering question:", error);
      throw error;
    }
  }

  /**
   * Deletes a question.
   *
   * @param {string} questionId - The ID of the question to delete.
   * @returns {Promise<void>} A promise that resolves when the question is successfully deleted.
   * @throws {Error} If deleting the question fails.
   */
  async deleteQuestion(questionId) {
    try {
      // Delete the specified question document.
      await deleteDoc(doc(db, this.questionsCollection, questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  }

  /**
   * Edits the text of an existing question.
   *
   * @param {string} questionId - The ID of the question to edit.
   * @param {string} newText - The updated question text.
   * @returns {Promise<void>} A promise that resolves when the question is successfully edited.
   * @throws {Error} If editing the question fails.
   */
  async editQuestion(questionId, newText) {
    try {
      const questionRef = doc(db, this.questionsCollection, questionId);
      // Update the question's text and set an 'updatedAt' timestamp.
      await updateDoc(questionRef, {
        questionText: newText,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error editing question:", error);
      throw error;
    }
  }

  /**
   * Edits the text of an existing answer.
   *
   * @param {string} questionId - The ID of the question whose answer is to be edited.
   * @param {string} newText - The updated answer text.
   * @returns {Promise<void>} A promise that resolves when the answer is successfully edited.
   * @throws {Error} If editing the answer fails.
   */
  async editAnswer(questionId, newText) {
    try {
      const questionRef = doc(db, this.questionsCollection, questionId);
      // Update the answer's text and set an 'answerUpdatedAt' timestamp.
      await updateDoc(questionRef, {
        answerText: newText,
        answerUpdatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error editing answer:", error);
      throw error;
    }
  }
}

// Export an instance of the QAService class, making it a singleton.
export default new QAService();
