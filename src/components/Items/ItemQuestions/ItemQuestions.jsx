import React, { useState, useEffect, useCallback } from "react";
import QuestionList from "./QuestionList";
import qaService from "../../../services/qaService"; // Service for Q&A backend operations

/**
 * @component ItemQuestions
 * @description Manages the display and interaction for item-specific questions and answers.
 * It handles fetching questions, posting new questions, and submitting answers.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.item - The item object for which questions are being displayed. Must have `id` and `userId`.
 * @param {object} props.user - The currently authenticated user object (referred to as `currentUser` internally).
 * @param {Function} [props.showMessage] - Callback function to display messages (e.g., success, error).
 * @param {boolean} [props.isLostAndFound=false] - Flag indicating if the item is from the Lost & Found section.
 * @returns {JSX.Element} The questions and answers section for an item.
 */
const ItemQuestions = ({
  item,
  user: currentUser, // Renaming for clarity within the component
  showMessage,
  isLostAndFound = false,
}) => {
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [answerTextMap, setAnswerTextMap] = useState({}); // Maps questionId to answer text
  const [isLoading, setIsLoading] = useState(true); // For fetching questions
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // State for managing editing of questions and answers
  const [editingQuestionId, setEditingQuestionId] = useState(null); // ID of question being edited
  const [editingAnswerQuestionId, setEditingAnswerQuestionId] = useState(null); // ID of question whose answer is being edited
  const [editText, setEditText] = useState(""); // Text for the question or answer being edited

  const itemType = isLostAndFound ? "lostfound" : "sell"; // Determine item type for service calls
  const itemOwnerId = item?.userId; // ID of the user who posted the item

  // Effect to fetch questions when the item or itemType changes
  useEffect(() => {
    /**
     * Fetches questions for the current item.
     */
    const fetchQuestionsLocal = async () => {
      if (!item || !item.id) return; // Ensure item and item.id are available
      setIsLoading(true);
      try {
        const fetchedQuestions = await qaService.getQuestions(
          item.id,
          itemType
        );
        setQuestions(fetchedQuestions || []); // Ensure questions is an array
      } catch (error) {
        console.error("Error fetching questions:", error);
        showMessage?.("Could not load questions. Please try again.", "error");
        setQuestions([]); // Reset to empty on error
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestionsLocal();
  }, [item, itemType, showMessage]);

  /**
   * Handles posting a new question.
   * @type {Function}
   */
  const handlePostQuestion = useCallback(async () => {
    if (!currentUser) {
      showMessage?.("Please log in to ask questions.", "info");
      return;
    }
    if (!newQuestionText.trim()) {
      showMessage?.("Please enter a question.", "warning");
      return;
    }
    setIsSubmittingQuestion(true);
    try {
      const questionData = {
        itemId: item.id,
        itemType,
        questionText: newQuestionText.trim(),
        userId: currentUser.uid,
        userName:
          currentUser.displayName || currentUser.email || "Anonymous User",
      };
      const newQuestion = await qaService.addQuestion(questionData);
      setQuestions((prevQuestions) => [newQuestion, ...prevQuestions]); // Add new question to the top
      setNewQuestionText(""); // Clear input field
      showMessage?.("Your question has been posted successfully.", "success");
    } catch (error) {
      console.error("Error posting question:", error);
      showMessage?.("Failed to post your question. Please try again.", "error");
    } finally {
      setIsSubmittingQuestion(false);
    }
  }, [currentUser, newQuestionText, item, itemType, showMessage]);

  /**
   * Updates the answer text for a specific question in the local state.
   * @param {string} questionId - The ID of the question.
   * @param {string} text - The new answer text.
   * @type {Function}
   */
  const handleAnswerTextChange = useCallback((questionId, text) => {
    setAnswerTextMap((prevMap) => ({ ...prevMap, [questionId]: text }));
  }, []);

  /**
   * Handles submitting an answer for a specific question.
   * @param {string} questionId - The ID of the question to answer.
   * @type {Function}
   */
  const handleSubmitAnswer = useCallback(
    async (questionId) => {
      if (!currentUser) {
        showMessage?.("Please log in to answer questions.", "info");
        return;
      }
      const currentAnswerText = answerTextMap[questionId]?.trim();
      if (!currentAnswerText) {
        showMessage?.("Please enter an answer.", "warning");
        return;
      }
      setIsSubmittingAnswer(true);
      try {
        const answerData = {
          answerText: currentAnswerText,
          userId: currentUser.uid,
          userName:
            currentUser.displayName || currentUser.email || "Anonymous User",
        };
        await qaService.answerQuestion(questionId, answerData);
        // Update the local state to reflect the new answer
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answerText: answerData.answerText,
                  answerUserId: answerData.userId,
                  answerUserName: answerData.userName,
                  answeredAt: new Date(), // Timestamp for when answered
                  answered: true,
                }
              : q
          )
        );
        setAnswerTextMap((prevMap) => ({ ...prevMap, [questionId]: "" })); // Clear answer input
        showMessage?.("Your answer has been posted successfully.", "success");
      } catch (error) {
        console.error("Error posting answer:", error);
        showMessage?.("Failed to post your answer. Please try again.", "error");
      } finally {
        setIsSubmittingAnswer(false);
      }
    },
    [currentUser, answerTextMap, showMessage]
  );

  /**
   * Handles deleting a question.
   * @param {string} questionId - The ID of the question to delete.
   * @type {Function}
   */
  const handleDeleteQuestion = useCallback(
    async (questionId) => {
      // Basic confirmation before deleting
      if (
        !currentUser ||
        !window.confirm("Are you sure you want to delete this question?")
      )
        return;
      try {
        await qaService.deleteQuestion(questionId);
        setQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionId) // Remove question from local state
        );
        showMessage?.("Question deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting question:", error);
        showMessage?.("Failed to delete question. Please try again.", "error");
      }
    },
    [currentUser, showMessage]
  );

  // --- Edit Handlers ---

  /**
   * Initiates editing mode for a question.
   * @param {string} questionId - The ID of the question to edit.
   * @param {string} currentText - The current text of the question.
   * @type {Function}
   */
  const handleStartEditQuestion = useCallback((questionId, currentText) => {
    setEditingAnswerQuestionId(null); // Ensure not in answer edit mode
    setEditingQuestionId(questionId);
    setEditText(currentText);
  }, []);

  /**
   * Initiates editing mode for an answer.
   * @param {string} questionId - The ID of the question whose answer is to be edited.
   * @param {string} currentText - The current text of the answer.
   * @type {Function}
   */
  const handleStartEditAnswer = useCallback((questionId, currentText) => {
    setEditingQuestionId(null); // Ensure not in question edit mode
    setEditingAnswerQuestionId(questionId);
    setEditText(currentText);
  }, []);

  /**
   * Updates the text being edited.
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The change event from the textarea.
   * @type {Function}
   */
  const handleEditTextChange = useCallback((e) => {
    setEditText(e.target.value);
  }, []);

  /**
   * Cancels the current editing mode (for question or answer).
   * @type {Function}
   */
  const handleCancelEdit = useCallback(() => {
    setEditingQuestionId(null);
    setEditingAnswerQuestionId(null);
    setEditText("");
  }, []);

  /**
   * Saves the edited question.
   * @type {Function}
   */
  const handleSaveEditQuestion = useCallback(async () => {
    if (!editingQuestionId || !editText.trim()) return;
    // Consider adding a submitting state specifically for edits if operations are long
    try {
      await qaService.editQuestion(editingQuestionId, editText.trim());
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === editingQuestionId
            ? { ...q, questionText: editText.trim(), updatedAt: new Date() } // Update local state
            : q
        )
      );
      handleCancelEdit(); // Reset editing state
      showMessage?.("Question updated successfully.", "success");
    } catch (error) {
      console.error("Error updating question:", error);
      showMessage?.("Failed to update question. Please try again.", "error");
    }
  }, [editingQuestionId, editText, showMessage, handleCancelEdit]);

  /**
   * Saves the edited answer.
   * @type {Function}
   */
  const handleSaveEditAnswer = useCallback(async () => {
    if (!editingAnswerQuestionId || !editText.trim()) return;
    try {
      await qaService.editAnswer(editingAnswerQuestionId, editText.trim());
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === editingAnswerQuestionId
            ? { ...q, answerText: editText.trim(), answerUpdatedAt: new Date() } // Update local state
            : q
        )
      );
      handleCancelEdit(); // Reset editing state
      showMessage?.("Answer updated successfully.", "success");
    } catch (error) {
      console.error("Error updating answer:", error);
      showMessage?.("Failed to update answer. Please try again.", "error");
    }
  }, [editingAnswerQuestionId, editText, showMessage, handleCancelEdit]);

  // Display loading skeleton if questions are being fetched
  if (isLoading) {
    return (
      <div className="py-2 animate-pulse" aria-live="polite" aria-busy="true">
        {/* Skeleton for section title */}
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        {/* Skeleton for question input area */}
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
        {/* Skeleton for a question item */}
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-16 bg-gray-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-700 mb-3">
        Questions & Answers
      </h4>

      {/* Input area for posting a new question (visible if user is logged in) */}
      {currentUser ? (
        <div className="mb-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-y"
            rows="3"
            placeholder="Ask a question about this item..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            disabled={isSubmittingQuestion}
            aria-label="Ask a question"
          />
          <button
            onClick={handlePostQuestion}
            disabled={isSubmittingQuestion || !newQuestionText.trim()}
            className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingQuestion ? "Posting..." : "Post Question"}
          </button>
        </div>
      ) : (
        // Prompt to log in if user is not authenticated
        <p className="text-sm text-gray-500 mb-4">
          <button
            onClick={() =>
              showMessage?.("Please log in to ask questions.", "info")
            }
            className="text-indigo-600 hover:underline font-medium"
          >
            Log in
          </button>{" "}
          to ask a question.
        </p>
      )}

      {/* List of questions and answers */}
      <QuestionList
        questions={questions}
        currentUser={currentUser}
        itemOwnerId={itemOwnerId}
        answerTextMap={answerTextMap}
        onAnswerTextChange={handleAnswerTextChange}
        onSubmitAnswer={handleSubmitAnswer}
        isSubmittingAnswer={isSubmittingAnswer}
        // Props for editing questions and answers
        editingQuestionId={editingQuestionId}
        editingAnswerQuestionId={editingAnswerQuestionId}
        editText={editText}
        onEditTextChange={handleEditTextChange}
        onSaveEditQuestion={handleSaveEditQuestion}
        onSaveEditAnswer={handleSaveEditAnswer}
        onCancelEdit={handleCancelEdit}
        onStartEditQuestion={handleStartEditQuestion}
        onStartEditAnswer={handleStartEditAnswer}
        // Prop for deleting questions
        onDeleteQuestion={handleDeleteQuestion}
      />
    </div>
  );
};

export default React.memo(ItemQuestions);