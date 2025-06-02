// src/services/qaService.js
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db, appId } from "../firebase.jsx";

/**
 * Service to handle Questions & Answers functionality
 */
class QAService {
  constructor() {
    this.questionsCollection = `artifacts/${appId}/public/data/item_questions`;
  }

  /**
   * Get all questions for a specific item
   * @param {string} itemId - The ID of the item
   * @param {string} itemType - The type of item ('sell' or 'lostfound')
   * @returns {Promise<Array>} - Array of questions with their answers
   */
  async getQuestions(itemId, itemType) {
    try {
      const q = query(
        collection(db, this.questionsCollection),
        where("itemId", "==", itemId),
        where("itemType", "==", itemType),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  }

  /**
   * Add a new question to an item
   * @param {Object} questionData - The question data
   * @param {string} questionData.itemId - ID of the item
   * @param {string} questionData.itemType - Type of item ('sell' or 'lostfound')
   * @param {string} questionData.questionText - The question text
   * @param {string} questionData.userId - ID of the user asking the question
   * @param {string} questionData.userName - Display name of the user asking
   * @returns {Promise<Object>} - The created question with ID
   */
  async addQuestion(questionData) {
    try {
      const docRef = await addDoc(collection(db, this.questionsCollection), {
        ...questionData,
        createdAt: Timestamp.now(),
        answered: false,
        answerText: null,
        answeredAt: null,
        answerUserId: null,
        answerUserName: null,
      });

      return {
        id: docRef.id,
        ...questionData,
        createdAt: Timestamp.now(),
        answered: false,
      };
    } catch (error) {
      console.error("Error adding question:", error);
      throw error;
    }
  }

  /**
   * Add an answer to an existing question
   * @param {string} questionId - ID of the question
   * @param {Object} answerData - The answer data
   * @param {string} answerData.answerText - The answer text
   * @param {string} answerData.userId - ID of the user answering
   * @param {string} answerData.userName - Display name of the user answering
   * @returns {Promise<void>}
   */
  async answerQuestion(questionId, answerData) {
    try {
      const questionRef = doc(db, this.questionsCollection, questionId);

      await updateDoc(questionRef, {
        answerText: answerData.answerText,
        answerUserId: answerData.userId,
        answerUserName: answerData.userName,
        answeredAt: Timestamp.now(),
        answered: true,
      });
    } catch (error) {
      console.error("Error answering question:", error);
      throw error;
    }
  }

  /**
   * Delete a question
   * @param {string} questionId - ID of the question to delete
   * @returns {Promise<void>}
   */
  async deleteQuestion(questionId) {
    try {
      await deleteDoc(doc(db, this.questionsCollection, questionId));
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  }

  /**
   * Edit a question
   * @param {string} questionId - ID of the question
   * @param {string} newText - Updated question text
   * @returns {Promise<void>}
   */
  async editQuestion(questionId, newText) {
    try {
      const questionRef = doc(db, this.questionsCollection, questionId);

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
   * Edit an answer
   * @param {string} questionId - ID of the question
   * @param {string} newText - Updated answer text
   * @returns {Promise<void>}
   */
  async editAnswer(questionId, newText) {
    try {
      const questionRef = doc(db, this.questionsCollection, questionId);

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

export default new QAService();
