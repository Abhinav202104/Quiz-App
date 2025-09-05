import React, { useState, useEffect } from 'react';

// Utility function to shuffle an array
const shuffleArray = (array) => {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

const App = () => {
  // State to hold the fetched questions
  const [questions, setQuestions] = useState([]);
  // State for the current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // State to track the user's score
  const [score, setScore] = useState(0);
  // State to show the results page
  const [showResults, setShowResults] = useState(false);
  // State to store the user's answers and correctness
  const [userAnswers, setUserAnswers] = useState([]);
  // State to manage loading state during API fetch
  const [loading, setLoading] = useState(true);
  // State to manage potential API errors
  const [error, setError] = useState(null);
  // State for the countdown timer
  const [timeLeft, setTimeLeft] = useState(30);
  // State to store shuffled options for the current question
  const [shuffledOptions, setShuffledOptions] = useState([]);
  // State to control whether the quiz has started
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  // Fetch questions from the Open Trivia DB API
  useEffect(() => {
    if (!isQuizStarted) return;
    
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch 10 questions with multiple-choice format
        const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
        if (!response.ok) {
          throw new Error('Failed to fetch questions. Please check your network connection.');
        }
        const data = await response.json();
        
        // Normalize the API data into a format that the UI can use
        const normalizedQuestions = data.results.map((q) => {
          const allOptions = [
            ...q.incorrect_answers.map(text => ({ answerText: text, isCorrect: false })),
            { answerText: q.correct_answer, isCorrect: true },
          ];
          return {
            questionText: q.question,
            answerOptions: allOptions,
          };
        });
        setQuestions(normalizedQuestions);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [isQuizStarted]);

  // Use useEffect to shuffle options and reset timer whenever the question changes
  useEffect(() => {
    if (questions.length > 0 && !showResults) {
      setShuffledOptions(shuffleArray(questions[currentQuestionIndex].answerOptions));
      setTimeLeft(30);
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            // Auto-advance the quiz when the timer runs out
            handleNextQuestion();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Cleanup the interval on component unmount or state change
      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, questions.length, showResults]);

  // Handle the user's answer selection
  const handleAnswerClick = (isCorrect, answerText) => {
    // Check if an answer has already been selected or time is up
    if (userAnswers[currentQuestionIndex]) {
      return;
    }

    // Add the user's answer to the list
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentQuestionIndex] = {
      isCorrect,
      selectedAnswer: answerText,
      correctAnswer: questions[currentQuestionIndex].answerOptions.find(opt => opt.isCorrect).answerText
    };
    setUserAnswers(newUserAnswers);

    // Update the score if the answer is correct
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  // Handle navigating to the next question
  const handleNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setShowResults(true);
    }
  };

  // Handle navigating to the previous question
  const handlePreviousQuestion = () => {
    const prevQuestionIndex = currentQuestionIndex - 1;
    if (prevQuestionIndex >= 0) {
      setCurrentQuestionIndex(prevQuestionIndex);
    }
  };

  // Handle restarting the quiz
  const handleRestartQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setUserAnswers([]);
    setLoading(true);
    setIsQuizStarted(false);
  };
  
  // Handle starting the quiz
  const handleStartQuiz = () => {
    setIsQuizStarted(true);
  };

  // Function to determine button color based on selection
  const getButtonColor = (answerText, isCorrect) => {
    const userAnswer = userAnswers[currentQuestionIndex];
    if (!userAnswer) {
      return 'bg-blue-500 hover:bg-blue-600';
    }
    const isSelected = userAnswer.selectedAnswer === answerText;
    if (isSelected && userAnswer.isCorrect) {
      return 'bg-green-500';
    }
    if (isSelected && !userAnswer.isCorrect) {
      return 'bg-red-500';
    }
    if (isCorrect) {
      return 'bg-green-500';
    }
    return 'bg-gray-400 opacity-50 cursor-not-allowed';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-inter">
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" />

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl text-center flex flex-col">
        {!isQuizStarted ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Welcome to the Quiz App!</h1>
            <p className="text-lg text-gray-600 mb-8">Test your knowledge with 10 random questions.</p>
            <button
              onClick={handleStartQuiz}
              className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300 transform hover:scale-105 active:scale-95"
            >
              Start Quiz
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <svg className="animate-spin h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-red-500">
            <p className="text-xl">Error: {error}</p>
            <button
              onClick={handleRestartQuiz}
              className="mt-6 px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 transition duration-300"
            >
              Retry
            </button>
          </div>
        ) : showResults ? (
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Quiz Complete!</h2>
            <p className="text-xl text-gray-700 mb-6">You scored {score} out of {questions.length}</p>
            <div className="w-full text-left space-y-4 max-h-96 overflow-y-auto">
              {questions.map((q, index) => (
                <div key={index} className="p-4 rounded-lg border border-gray-200">
                  <p className="text-lg font-semibold mb-2" dangerouslySetInnerHTML={{ __html: q.questionText }}></p>
                  <p className="text-sm">
                    Your answer: <span className={userAnswers[index]?.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {userAnswers[index]?.selectedAnswer || 'Not answered'}
                    </span>
                  </p>
                  <p className="text-sm">
                    Correct answer: <span className="text-green-600" dangerouslySetInnerHTML={{ __html: userAnswers[index]?.correctAnswer }}></span>
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={handleRestartQuiz}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-grow">
            {/* Progress and Score */}
            <div className="flex justify-between items-center text-gray-600 mb-6">
              <span className="text-sm md:text-base">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm md:text-base">Score: {score}</span>
              <span className="text-sm md:text-base">Time: {timeLeft}s</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
            </div>

            {/* Question Section */}
            <div className="flex-grow flex items-center justify-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight" dangerouslySetInnerHTML={{ __html: questions[currentQuestionIndex].questionText }}></h1>
            </div>

            {/* Answer Options Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shuffledOptions.map((answerOption, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(answerOption.isCorrect, answerOption.answerText)}
                  disabled={!!userAnswers[currentQuestionIndex] || timeLeft <= 0}
                  className={`
                    flex items-center justify-center p-4 text-lg font-medium text-white rounded-lg shadow-md
                    transform transition duration-300 ease-in-out
                    ${getButtonColor(answerOption.answerText, answerOption.isCorrect)}
                    ${userAnswers[currentQuestionIndex] ? '' : 'hover:scale-105 active:scale-95'}
                  `}
                  dangerouslySetInnerHTML={{ __html: answerOption.answerText }}
                ></button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-full shadow-md hover:bg-gray-400 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {userAnswers[currentQuestionIndex] ? (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-md hover:bg-indigo-700 transition duration-300"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
