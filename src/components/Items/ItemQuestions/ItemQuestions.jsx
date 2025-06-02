// project/src/components/Items/ItemQuestions/ItemQuestions.jsx
import React, { useState, useEffect, useCallback } from "react";
import QuestionList from "./QuestionList";
import qaService from "../../../services/qaService"; // Adjust path
// UserCircleIcon is now used within QuestionItem
// formatRelativeTime is now used within QuestionItem

const ItemQuestions = ({
  item,
  user: currentUser,
  showMessage,
  isLostAndFound = false,
}) => {
  const [questions, setQuestions] = useState([]);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [answerTextMap, setAnswerTextMap] = useState({}); // Changed from answerText to answerTextMap
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false); // Renamed for clarity
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Editing State
  const [editingQuestionId, setEditingQuestionId] = useState(null); // ID of question being edited
  const [editingAnswerQuestionId, setEditingAnswerQuestionId] = useState(null); // ID of question whose answer is being edited
  const [editText, setEditText] = useState(""); // Text for the item being edited

  const itemType = isLostAndFound ? "lostfound" : "sell";
  const itemOwnerId = item?.userId;

  useEffect(() => {
    const fetchQuestionsLocal = async () => {
      // Renamed to avoid conflict if qaService.fetchQuestions exists
      if (!item || !item.id) return;
      setIsLoading(true);
      try {
        const fetchedQuestions = await qaService.getQuestions(
          item.id,
          itemType
        );
        setQuestions(fetchedQuestions || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
        showMessage?.("Could not load questions. Please try again.", "error");
        setQuestions([]);
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
      setQuestions((prevQuestions) => [newQuestion, ...prevQuestions]);
      setNewQuestionText("");
      showMessage?.("Your question has been posted successfully.", "success");
    } catch (error) {
      console.error("Error posting question:", error);
      showMessage?.("Failed to post your question. Please try again.", "error");
    } finally {
      setIsSubmittingQuestion(false);
    }
  }, [currentUser, newQuestionText, item, itemType, showMessage]);

  const handleAnswerTextChange = useCallback((questionId, text) => {
    setAnswerTextMap((prev) => ({ ...prev, [questionId]: text }));
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
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  answerText: answerData.answerText,
                  answerUserId: answerData.userId,
                  answerUserName: answerData.userName,
                  answeredAt: new Date(),
                  answered: true,
                }
              : q
          )
        );
        setAnswerTextMap((prev) => ({ ...prev, [questionId]: "" }));
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
      if (
        !currentUser ||
        !window.confirm("Are you sure you want to delete this question?")
      )
        return;
      try {
        await qaService.deleteQuestion(questionId);
        setQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionId)
        );
        showMessage?.("Question deleted successfully.", "success");
      } catch (error) {
        console.error("Error deleting question:", error);
        showMessage?.("Failed to delete question. Please try again.", "error");
      }
    },
    [currentUser, showMessage]
  );

  // Editing Handlers
  const handleStartEditQuestion = useCallback((questionId, currentText) => {
    setEditingAnswerQuestionId(null); // Clear answer edit mode
    setEditingQuestionId(questionId);
    setEditText(currentText);
  }, []);

  const handleStartEditAnswer = useCallback((questionId, currentText) => {
    setEditingQuestionId(null); // Clear question edit mode
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
    // Consider adding a submitting state for edits if async operation is long
    try {
      await qaService.editQuestion(editingQuestionId, editText.trim());
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === editingQuestionId
            ? { ...q, questionText: editText.trim(), updatedAt: new Date() }
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
    // Consider adding a submitting state for edits
    try {
      await qaService.editAnswer(editingAnswerQuestionId, editText.trim());
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === editingAnswerQuestionId
            ? { ...q, answerText: editText.trim(), answerUpdatedAt: new Date() }
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

  if (isLoading) {
    return (
      <div className="py-2 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
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

      {currentUser ? (
        <div className="mb-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-y"
            rows="3"
            placeholder="Ask a question about this item..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            disabled={isSubmittingQuestion}
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
        <p className="text-sm text-gray-500 mb-4">
          <button // Changed from <a> to <button> for actions if not navigating
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

      <QuestionList
        questions={questions}
        currentUser={currentUser}
        itemOwnerId={itemOwnerId}
        answerTextMap={answerTextMap}
        onAnswerTextChange={handleAnswerTextChange}
        onSubmitAnswer={handleSubmitAnswer}
        isSubmittingAnswer={isSubmittingAnswer}
        editingQuestionId={editingQuestionId}
        editingAnswerQuestionId={editingAnswerQuestionId}
        editText={editText}
        onEditTextChange={handleEditTextChange}
        onSaveEditQuestion={handleSaveEditQuestion}
        onSaveEditAnswer={handleSaveEditAnswer}
        onCancelEdit={handleCancelEdit}
        onStartEditQuestion={handleStartEditQuestion}
        onStartEditAnswer={handleStartEditAnswer}
        onDeleteQuestion={handleDeleteQuestion}
      />
    </div>
  );
};

export default React.memo(ItemQuestions);
