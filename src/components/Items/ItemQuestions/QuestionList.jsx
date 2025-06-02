import React from "react";
import QuestionItem from "./QuestionItem";

/**
 * @component QuestionList
 * @description Renders a list of QuestionItem components.
 * It passes down necessary props for interaction with each question and answer.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object[]} props.questions - An array of question objects to display.
 * @param {object} props.currentUser - The currently authenticated user object.
 * @param {string} props.itemOwnerId - The ID of the user who owns the item.
 * @param {object} props.answerTextMap - A map of question IDs to their current answer input text.
 * @param {Function} props.onAnswerTextChange - Callback to update answer text for a specific question.
 * @param {Function} props.onSubmitAnswer - Callback to submit an answer for a specific question.
 * @param {boolean} props.isSubmittingAnswer - Flag indicating if an answer is currently being submitted.
 * @param {string|null} props.editingQuestionId - The ID of the question currently being edited.
 * @param {string|null} props.editingAnswerQuestionId - The ID of the question whose answer is being edited.
 * @param {string} props.editText - The current text in the edit input field.
 * @param {Function} props.onEditTextChange - Callback to update the edit text.
 * @param {Function} props.onSaveEditQuestion - Callback to save an edited question.
 * @param {Function} props.onSaveEditAnswer - Callback to save an edited answer.
 * @param {Function} props.onCancelEdit - Callback to cancel the current edit operation.
 * @param {Function} props.onStartEditQuestion - Callback to initiate editing a question.
 * @param {Function} props.onStartEditAnswer - Callback to initiate editing an answer.
 * @param {Function} props.onDeleteQuestion - Callback to delete a question.
 * @returns {JSX.Element} A list of questions or an empty state message.
 */
const QuestionList = ({
  questions,
  currentUser,
  itemOwnerId,
  // Answering props
  answerTextMap, // Map of questionId to answer text
  onAnswerTextChange,
  onSubmitAnswer,
  isSubmittingAnswer,
  // Editing props for both questions and answers
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
  // Display a message if there are no questions
  if (questions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No questions yet. Be the first to ask!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map through the questions and render a QuestionItem for each */}
      {questions.map((question) => (
        <QuestionItem
          key={question.id} // Unique key for each question
          question={question}
          currentUser={currentUser}
          itemOwnerId={itemOwnerId}
          // Pass down answering props
          answerText={answerTextMap[question.id] || ""} // Get specific answer text from map
          onAnswerTextChange={onAnswerTextChange}
          onSubmitAnswer={onSubmitAnswer}
          isSubmittingAnswer={isSubmittingAnswer}
          // Pass down editing props
          editingQuestionId={editingQuestionId}
          editingAnswerQuestionId={editingAnswerQuestionId}
          editText={editText}
          onEditTextChange={onEditTextChange}
          onSaveEditQuestion={onSaveEditQuestion}
          onSaveEditAnswer={onSaveEditAnswer}
          onCancelEdit={onCancelEdit}
          onStartEditQuestion={onStartEditQuestion}
          onStartEditAnswer={onStartEditAnswer}
          // Pass down deleting props
          onDeleteQuestion={onDeleteQuestion}
        />
      ))}
    </div>
  );
};

export default React.memo(QuestionList);
