import React from "react";
import UserCircleIcon from "../../Icons/UserCircleIcon";
import { formatRelativeTime } from "../../../utils/helpers";
// Consider adding icons for edit/delete if desired
// import EditIcon from '../../Icons/EditIcon';
// import DeleteIcon from '../../Icons/DeleteIcon';

const QuestionItem = ({
  question,
  currentUser,
  itemOwnerId,
  answerText,
  onAnswerTextChange,
  onSubmitAnswer,
  isSubmittingAnswer,
  editingQuestionId,
  editingAnswerQuestionId,
  editText,
  onEditTextChange,
  onSaveEditQuestion,
  onSaveEditAnswer,
  onCancelEdit,
  onStartEditQuestion,
  onStartEditAnswer,
  onDeleteQuestion,
}) => {
  const isCurrentUserQuestionOwner =
    currentUser && currentUser.uid === question.userId;
  const isCurrentUserItemOwner = currentUser && currentUser.uid === itemOwnerId;
  const isCurrentUserAnswerOwner =
    question.answered &&
    currentUser &&
    currentUser.uid === question.answerUserId;

  const isEditingQuestion = editingQuestionId === question.id;
  const isEditingAnswer = editingAnswerQuestionId === question.id;

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 my-3 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Question Section */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center text-sm">
            <UserCircleIcon className="w-5 h-5 mr-2 text-gray-500" />
            <span className="font-semibold text-gray-800">
              {question.userName || "Anonymous User"}
            </span>
            <span className="text-gray-400 ml-2 text-xs">
              asked {formatRelativeTime(question.createdAt)}
              {question.updatedAt &&
                question.updatedAt.seconds !== question.createdAt.seconds && (
                  <span className="italic text-gray-400"> (edited)</span>
                )}
            </span>
          </div>
          {isCurrentUserQuestionOwner && !isEditingQuestion && (
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  onStartEditQuestion(question.id, question.questionText)
                }
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                aria-label={`Edit question: ${question.questionText.substring(
                  0,
                  30
                )}...`}
              >
                Edit
              </button>
              <button
                onClick={() => onDeleteQuestion(question.id)}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                aria-label={`Delete question: ${question.questionText.substring(
                  0,
                  30
                )}...`}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {isEditingQuestion ? (
          <div className="mt-2 space-y-2">
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-sm transition-colors"
              rows="3"
              value={editText}
              onChange={onEditTextChange}
              aria-label="Edit question text"
            />
            <div className="flex space-x-2">
              <button
                onClick={onSaveEditQuestion}
                className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save Changes
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {question.questionText}
          </p>
        )}
      </div>

      {/* Answer Section */}
      {question.answered ? (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center text-sm">
              <UserCircleIcon className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="font-semibold text-indigo-700">
                {question.answerUserName ||
                  (question.answerUserId === itemOwnerId ? "Seller" : "User")}
              </span>
              <span className="text-gray-400 ml-2 text-xs">
                answered {formatRelativeTime(question.answeredAt)}
                {question.answerUpdatedAt &&
                  question.answerUpdatedAt.seconds !==
                    question.answeredAt.seconds && (
                    <span className="italic text-gray-400"> (edited)</span>
                  )}
              </span>
            </div>
            {isCurrentUserAnswerOwner && !isEditingAnswer && (
              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    onStartEditAnswer(question.id, question.answerText)
                  }
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  aria-label={`Edit answer: ${question.answerText.substring(
                    0,
                    30
                  )}...`}
                >
                  Edit
                </button>
                {/* Delete answer functionality could be added here if needed */}
              </div>
            )}
          </div>
          {isEditingAnswer ? (
            <div className="mt-2 space-y-2">
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-sm transition-colors"
                rows="3"
                value={editText}
                onChange={onEditTextChange}
                aria-label="Edit answer text"
              />
              <div className="flex space-x-2">
                <button
                  onClick={onSaveEditAnswer}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={onCancelEdit}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap pl-7">
              {" "}
              {/* Indent answer text slightly */}
              {question.answerText}
            </p>
          )}
        </div>
      ) : (
        isCurrentUserItemOwner &&
        !isEditingQuestion && ( // Don't show answer input if editing the question itself
          <div className="mt-4 pt-3 border-t border-dashed border-gray-300">
            <p className="text-xs text-gray-600 mb-1.5 font-medium">
              Your response:
            </p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-sm transition-colors"
              rows="2"
              placeholder="Write an answer..."
              value={answerText}
              onChange={(e) => onAnswerTextChange(question.id, e.target.value)}
              disabled={isSubmittingAnswer}
              aria-label={`Answer question: ${question.questionText.substring(
                0,
                30
              )}...`}
            />
            <button
              onClick={() => onSubmitAnswer(question.id)}
              disabled={isSubmittingAnswer || !answerText?.trim()}
              className="mt-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-1.5 px-3 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
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