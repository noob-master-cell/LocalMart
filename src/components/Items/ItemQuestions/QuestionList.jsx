// project/src/components/Items/ItemQuestions/QuestionList.jsx
import React from "react";
import QuestionItem from "./QuestionItem";

const QuestionList = ({
  questions,
  currentUser,
  itemOwnerId,
  // Answering
  answerTextMap, // Pass the whole map
  onAnswerTextChange,
  onSubmitAnswer,
  isSubmittingAnswer,
  // Editing
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
  if (questions.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No questions yet. Be the first to ask!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionItem
          key={question.id}
          question={question}
          currentUser={currentUser}
          itemOwnerId={itemOwnerId}
          // Answering
          answerText={answerTextMap[question.id] || ""} // Get specific answer text
          onAnswerTextChange={onAnswerTextChange}
          onSubmitAnswer={onSubmitAnswer}
          isSubmittingAnswer={isSubmittingAnswer}
          // Editing
          editingQuestionId={editingQuestionId}
          editingAnswerQuestionId={editingAnswerQuestionId}
          editText={editText}
          onEditTextChange={onEditTextChange}
          onSaveEditQuestion={onSaveEditQuestion}
          onSaveEditAnswer={onSaveEditAnswer}
          onCancelEdit={onCancelEdit}
          onStartEditQuestion={onStartEditQuestion}
          onStartEditAnswer={onStartEditAnswer}
          // Deleting
          onDeleteQuestion={onDeleteQuestion}
        />
      ))}
    </div>
  );
};

export default React.memo(QuestionList);
