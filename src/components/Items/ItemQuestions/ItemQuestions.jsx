import React, { useState, useEffect, useCallback } from "react";
import QuestionList from "./QuestionList";
import qaService from "../../../services/qaService";

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

  const handleAnswerTextChange = useCallback((questionId, text) => {
    setAnswerTextMap((prevMap) => ({ ...prevMap, [questionId]: text }));
  }, []);

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
        setQuestions(
          (prevQuestions) => prevQuestions.filter((q) => q.id !== questionId) // Remove question from local state
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

  const handleStartEditQuestion = useCallback((questionId, currentText) => {
    setEditingAnswerQuestionId(null); // Ensure not in answer edit mode
    setEditingQuestionId(questionId);
    setEditText(currentText);
  }, []);

  const handleStartEditAnswer = useCallback((questionId, currentText) => {
    setEditingQuestionId(null); // Ensure not in question edit mode
    setEditingAnswerQuestionId(questionId);
    setEditText(currentText);
  }, []);

  const handleEditTextChange = useCallback((e) => {
    setEditText(e.target.value);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingQuestionId(null);
    setEditingAnswerQuestionId(null);
    setEditText("");
  }, []);

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
      <div className="py-4 animate-pulse" aria-live="polite" aria-busy="true">
        {/* Skeleton for section title */}
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        {/* Skeleton for question input area */}
        <div className="h-24 bg-gray-100 rounded-lg mb-6"></div>
        {/* Skeleton for a couple of Q&A items */}
        <div className="space-y-4">
          <div className="h-20 bg-gray-100 rounded-lg p-3">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-20 bg-gray-100 rounded-lg p-3">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {" "}
      {/* Increased overall spacing */}
      <h4 className="text-xl font-semibold text-gray-800">
        {" "}
        {/* Slightly larger title */}
        Do you have any questions?
      </h4>
      {/* Input area for posting a new question (visible if user is logged in) */}
      {currentUser ? (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          {" "}
          {/* Card-like container */}
          <label
            htmlFor="new-question"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Have a question?
          </label>
          <textarea
            id="new-question"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-sm transition-colors"
            rows="3"
            placeholder="Type your question here..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            disabled={isSubmittingQuestion}
            aria-label="Ask a question"
          />
          <div className="mt-2.5 text-right">
            {" "}
            {/* Align button to the right */}
            <button
              onClick={handlePostQuestion}
              disabled={isSubmittingQuestion || !newQuestionText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-md text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow"
            >
              {isSubmittingQuestion ? "Posting..." : "Post Question"}
            </button>
          </div>
        </div>
      ) : (
        // Prompt to log in if user is not authenticated
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
          <p className="text-sm text-gray-700">
            Want to ask a question?{" "}
            <button
              onClick={
                () => showMessage?.("Please log in to ask questions.", "info") // Or navigate to login
              }
              className="text-indigo-600 hover:underline font-semibold"
            >
              Log in
            </button>{" "}
            to join the conversation.
          </p>
        </div>
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