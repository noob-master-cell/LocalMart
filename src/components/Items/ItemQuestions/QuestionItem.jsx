import React from "react";
import UserCircleIcon from "../../Icons/UserCircleIcon";
import { formatRelativeTime } from "../../../utils/helpers"; // Utility for time formatting

/**
 * @component QuestionItem
 * @description Renders a single question and its associated answer (if available).
 * Provides functionality for item owners to answer questions, and for question/answer owners to edit/delete their content.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.question - The question object, containing text, user info, answer, etc.
 * @param {object} props.currentUser - The currently authenticated user object.
 * @param {string} props.itemOwnerId - The ID of the user who owns the item.
 * @param {string} props.answerText - The current text in the answer input field for this question.
 * @param {Function} props.onAnswerTextChange - Callback to update answer text for this question.
 * @param {Function} props.onSubmitAnswer - Callback to submit an answer for this question.
 * @param {boolean} props.isSubmittingAnswer - Flag indicating if an answer is currently being submitted.
 * @param {string|null} props.editingQuestionId - The ID of the question currently being edited, if any.
 * @param {string|null} props.editingAnswerQuestionId - The ID of the question whose answer is being edited, if any.
 * @param {string} props.editText - The current text in the edit input field.
 * @param {Function} props.onEditTextChange - Callback to update the edit text.
 * @param {Function} props.onSaveEditQuestion - Callback to save an edited question.
 * @param {Function} props.onSaveEditAnswer - Callback to save an edited answer.
 * @param {Function} props.onCancelEdit - Callback to cancel the current edit operation.
 * @param {Function} props.onStartEditQuestion - Callback to initiate editing a question.
 * @param {Function} props.onStartEditAnswer - Callback to initiate editing an answer.
 * @param {Function} props.onDeleteQuestion - Callback to delete a question.
 * @returns {JSX.Element} A single question item with its answer and interaction controls.
 */
const QuestionItem = ({
  question,
  currentUser,
  itemOwnerId,
  // Answering props
  answerText,
  onAnswerTextChange,
  onSubmitAnswer,
  isSubmittingAnswer,
  // Editing props (for both question and answer)
  editingQuestionId,
  editingAnswerQuestionId,
  editText,
  onEditTextChange,
  onSaveEditQuestion,
  onSaveEditAnswer,
  onCancelEdit,
  onStartEditQuestion,
  onStartEditAnswer,
  // Deleting props
  onDeleteQuestion,
}) => {
  // Determine user roles for conditional rendering of controls
  const isCurrentUserQuestionOwner =
    currentUser && currentUser.uid === question.userId;
  const isCurrentUserItemOwner = currentUser && currentUser.uid === itemOwnerId;
  const isCurrentUserAnswerOwner =
    question.answered && currentUser && currentUser.uid === question.answerUserId;

  // Determine if the current view is for editing the question or its answer
  const isEditingQuestion = editingQuestionId === question.id;
  const isEditingAnswer = editingAnswerQuestionId === question.id;

  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
      {/* Question Header: User Info, Timestamp, Edit/Delete Buttons */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <UserCircleIcon className="w-4 h-4 mr-1 text-gray-500" />
          <span>{question.userName || "Anonymous User"}</span>
          <span className="text-gray-500 ml-2 text-xs font-normal">
            {formatRelativeTime(question.createdAt)}
            {/* Indicate if the question has been edited */}
            {question.updatedAt &&
              question.updatedAt.seconds !== question.createdAt.seconds && // Compare Firestore Timestamps correctly
              " (edited)"}
          </span>
        </div>
        {/* Edit/Delete buttons for the question owner, if not currently editing */}
        {isCurrentUserQuestionOwner && !isEditingQuestion && (
          <div className="flex space-x-2">
            <button
              onClick={() =>
                onStartEditQuestion(question.id, question.questionText)
              }
              className="text-xs text-blue-600 hover:text-blue-800"
              aria-label={`Edit question: ${question.questionText.substring(0,30)}...`}
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteQuestion(question.id)}
              className="text-xs text-red-600 hover:text-red-800"
              aria-label={`Delete question: ${question.questionText.substring(0,30)}...`}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Question Text or Edit Form */}
      {isEditingQuestion ? (
        // Edit form for the question
        <div className="mt-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
            rows="2"
            value={editText}
            onChange={onEditTextChange}
            aria-label="Edit question text"
          />
          <div className="flex space-x-2 mt-1">
            <button
              onClick={onSaveEditQuestion}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              className="px-2 py-1 bg-gray-300 text-gray-800 text-xs rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Display question text
        <p className="text-gray-800 text-sm mb-2 leading-relaxed whitespace-pre-wrap">
          {question.questionText}
        </p>
      )}

      {/* Answer Section */}
      {question.answered ? (
        // Display the existing answer
        <div className="mt-2 pt-2 border-t border-gray-200 flex items-start space-x-2">
          <div className="flex-shrink-0">
            <UserCircleIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-indigo-700 font-medium text-sm">
                {question.answerUserName ||
                  (question.answerUserId === itemOwnerId ? "Seller" : "User")}
                :
              </p>
              {/* Edit button for the answer owner, if not currently editing */}
              {isCurrentUserAnswerOwner && !isEditingAnswer && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        onStartEditAnswer(question.id, question.answerText)
                      }
                      className="text-xs text-blue-600 hover:text-blue-800"
                      aria-label={`Edit answer: ${question.answerText.substring(0,30)}...`}
                    >
                      Edit
                    </button>
                  </div>
                )}
            </div>
            {isEditingAnswer ? (
              // Edit form for the answer
              <div className="mt-1">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
                  rows="2"
                  value={editText}
                  onChange={onEditTextChange}
                  aria-label="Edit answer text"
                />
                <div className="flex space-x-2 mt-1">
                  <button
                    onClick={onSaveEditAnswer}
                    className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-2 py-1 bg-gray-300 text-gray-800 text-xs rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display answer text and timestamp
              <>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {question.answerText}
                </p>
                <span className="text-gray-500 text-xs font-normal">
                  {formatRelativeTime(question.answeredAt)}
                  {/* Indicate if the answer has been edited */}
                  {question.answerUpdatedAt &&
                    question.answerUpdatedAt.seconds !== question.answeredAt.seconds &&
                    " (edited)"}
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
        // Input field for the item owner to answer the question
        isCurrentUserItemOwner && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-700 mb-1">
              <UserCircleIcon className="w-4 h-4 text-indigo-600" />
              <span>Your response:</span>
            </div>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
              rows="2"
              placeholder="Answer this question..."
              value={answerText} // Controlled component specific to this question's answer
              onChange={(e) => onAnswerTextChange(question.id, e.target.value)}
              disabled={isSubmittingAnswer}
              aria-label={`Answer question: ${question.questionText.substring(0,30)}...`}
            />
            <button
              onClick={() => onSubmitAnswer(question.id)}
              disabled={isSubmittingAnswer || !answerText?.trim()}
              className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-1 px-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingAnswer ? "Posting..." : "Post Answer"}
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default React.memo(QuestionItem);