// project/src/components/Items/ItemQuestions/QuestionItem.jsx
import React from "react";
import UserCircleIcon from "../../Icons/UserCircleIcon"; // Adjust path
import { formatRelativeTime } from "../../../utils/helpers"; // Adjust path

const QuestionItem = ({
  question,
  currentUser, // Renamed from 'user' for clarity if 'user' means question author elsewhere
  itemOwnerId,
  // Answering
  answerText, // Specific to this question's answer input
  onAnswerTextChange,
  onSubmitAnswer,
  isSubmittingAnswer,
  // Editing (for both question and answer)
  editingQuestionId,
  editingAnswerQuestionId,
  editText,
  onEditTextChange,
  onSaveEditQuestion,
  onSaveEditAnswer,
  onCancelEdit,
  onStartEditQuestion,
  onStartEditAnswer,
  // Deleting
  onDeleteQuestion,
}) => {
  const isCurrentUserQuestionOwner =
    currentUser && currentUser.uid === question.userId;
  const isCurrentUserItemOwner = currentUser && currentUser.uid === itemOwnerId;
  const isCurrentUserAnswerOwner =
    currentUser && currentUser.uid === question.answerUserId;

  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
      {/* Question Header & Text */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <UserCircleIcon className="w-4 h-4 mr-1 text-gray-500" />
          <span>{question.userName || "Anonymous User"}</span>
          <span className="text-gray-500 ml-2 text-xs font-normal">
            {formatRelativeTime(question.createdAt)}
            {question.updatedAt &&
              question.updatedAt !== question.createdAt &&
              " (edited)"}
          </span>
        </div>
        {isCurrentUserQuestionOwner && editingQuestionId !== question.id && (
          <div className="flex space-x-2">
            <button
              onClick={() =>
                onStartEditQuestion(question.id, question.questionText)
              }
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteQuestion(question.id)}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {editingQuestionId === question.id ? (
        <div className="mt-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
            rows="2"
            value={editText}
            onChange={onEditTextChange}
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
        <p className="text-gray-800 text-sm mb-2 leading-relaxed whitespace-pre-wrap">
          {question.questionText}
        </p>
      )}

      {/* Answer Section */}
      {question.answered ? (
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
              {isCurrentUserAnswerOwner &&
                editingAnswerQuestionId !== question.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        onStartEditAnswer(question.id, question.answerText)
                      }
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  </div>
                )}
            </div>
            {editingAnswerQuestionId === question.id ? (
              <div className="mt-1">
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 resize-y text-sm"
                  rows="2"
                  value={editText}
                  onChange={onEditTextChange}
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
              <>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {question.answerText}
                </p>
                <span className="text-gray-500 text-xs font-normal">
                  {formatRelativeTime(question.answeredAt)}
                  {question.answerUpdatedAt &&
                    question.answerUpdatedAt !== question.answeredAt &&
                    " (edited)"}
                </span>
              </>
            )}
          </div>
        </div>
      ) : (
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
              value={answerText}
              onChange={(e) => onAnswerTextChange(question.id, e.target.value)}
              disabled={isSubmittingAnswer}
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
