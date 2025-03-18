"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Award,
  BarChart2,
  AlertTriangle,
  Timer,
  RefreshCw,
} from "lucide-react"

import { FC } from "react";

interface MCQQuizProps {
  timeLimit?: number;
  title?: string;
  onComplete?: (results: unknown) => void;
    params: { roundId: string };
  }

const MCQQuiz: FC<MCQQuizProps> = (props) => {
  const {
    timeLimit = 30,
    title = "B 'N' B Quiz",
    onComplete,
    params, // Ensure params is passed as a prop
  } = props;
  interface Question {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [remainingTime, setRemainingTime] = useState(timeLimit * 60) // in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)
  interface QuizResults {
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
    score: number;
    timeTaken: number;
    questionResults: {
      questionId: number;
      wasCorrect: boolean;
      userAnswer: number | null;
    }[];
  }
  
  const [results, setResults] = useState<QuizResults | null>(null)
  const [reviewMode, setReviewMode] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const { roundId } = params || {} // Safely destructure roundId from params

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
    } else {
      setMessage("Access denied: No token detected")
    }
  }, [])

  // Fetch quiz data from API
  useEffect(() => {
    if (!roundId) {
      setMessage("No round ID provided")
      return
    }

    const fetchQuizData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        const response = await axios.get(`${apiUrl}/api/quiz/getQuiz/${roundId}`)
        const quizData = response.data.quizzes[0]?.questions || []
        interface QuizQuestion {
          questionText: string;
          options: string[];
          correctOption: number;
        }

        const formattedQuestions = quizData.map((q: QuizQuestion, index: number) => ({
          id: index + 1,
          question: q.questionText,
          options: q.options,
          correctAnswer: q.correctOption,
        }))
        setQuestions(formattedQuestions)
        setSelectedAnswers(Array(formattedQuestions.length).fill(null))
      } catch (error) {
        console.error("Error fetching quiz data:", error)
        setMessage("Failed to load quiz questions. Please try again.")
      }
    }

    fetchQuizData()
  }, [roundId]) // Add roundId as a dependency to refetch data if it changes

  const calculateResults = useCallback(() => {
    let correct = 0
    let wrong = 0
    let unanswered = 0

    const questionResults = questions.map((q, index) => {
      const userAnswer = selectedAnswers[index]
      const isCorrect = userAnswer === q.correctAnswer

      if (userAnswer === null) {
        unanswered++
      } else if (isCorrect) {
        correct++
      } else {
        wrong++
      }

      return {
        questionId: q.id,
        wasCorrect: isCorrect,
        userAnswer,
      }
    })

    const timeTaken = timeLimit * 60 - remainingTime
    const score = Math.round((correct / questions.length) * 100)

    return {
      totalQuestions: questions.length,
      correctAnswers: correct,
      wrongAnswers: wrong,
      unanswered,
      score,
      timeTaken,
      questionResults,
    }
  }, [questions, selectedAnswers, timeLimit, remainingTime])

  const finishQuiz = useCallback(async () => {
    setIsTimerRunning(false)
    setQuizCompleted(true)

    const quizResults = calculateResults()
    setResults(quizResults)

    // Submit quiz results to the server
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      await axios.post(
        `${apiUrl}/api/quiz/submit`,
        {
          roundId,
          answers: selectedAnswers,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      )
      console.log("Quiz submitted successfully")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Error submitting quiz:", error.response?.data?.message || error.message)
      } else {
        if (error instanceof Error) {
          console.log("Error submitting quiz:", error.message)
        } else {
          console.log("Error submitting quiz:", error)
        }
      }
      setMessage("Failed to submit quiz results. Your progress has been saved locally.")
    }

    if (onComplete) {
      onComplete(quizResults)
    }
  }, [calculateResults, onComplete, roundId, selectedAnswers, token])

  // Timer functionality
  useEffect(() => {
    if (!quizStarted || !isTimerRunning) return

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          finishQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [quizStarted, isTimerRunning, finishQuiz])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100

  const handleAnswerSelect = (optionIndex: number) => {
    if (quizCompleted || reviewMode) return

    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = optionIndex
    setSelectedAnswers(newAnswers)
  }

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else if (!quizCompleted) {
      finishQuiz()
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }



  const startQuiz = () => {
    setQuizStarted(true)
  }

  const restartQuiz = () => {
    setSelectedAnswers(Array(questions.length).fill(null))
    setCurrentQuestionIndex(0)
    setQuizCompleted(false)
    setShowResults(false)
    setRemainingTime(timeLimit * 60)
    setIsTimerRunning(true)
    setReviewMode(false)
    setResults(null)
  }

  const enterReviewMode = () => {
    setReviewMode(true)
    setCurrentQuestionIndex(0)
    setShowResults(false)
  }

  // Get current question answer status
  const getCurrentQuestionStatus = () => {
    if (!quizCompleted && !reviewMode) return null

    const currentQuestion = questions[currentQuestionIndex]
    const userAnswer = selectedAnswers[currentQuestionIndex]

    if (userAnswer === null) return "unanswered"
    return userAnswer === currentQuestion.correctAnswer ? "correct" : "incorrect"
  }

  const questionStatus = getCurrentQuestionStatus()

  if (message) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-700 shadow-lg text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Attention Required</h2>
          <p className="text-gray-300">{message}</p>
        </div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center pt-11 justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full border border-gray-700 shadow-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-red-500 mb-3">{title}</h1>
            <p className="text-gray-300 text-lg">Test your knowledge with this interactive quiz</p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold">Challenge Yourself</h3>
                <p className="text-gray-400 text-sm">Complete {questions.length} questions to test your knowledge</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Time Limit</h3>
                <p className="text-gray-400 text-sm">{timeLimit} minutes to answer all questions</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                <BarChart2 className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Instant Results</h3>
                <p className="text-gray-400 text-sm">Get detailed feedback on your performance</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2 text-center">Quiz Details</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-sm">Questions</p>
                <p className="text-2xl font-bold text-white">{questions.length}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Time</p>
                <p className="text-2xl font-bold text-white">{timeLimit} min</p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={startQuiz}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold text-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
          >
            Start Quiz
          </motion.button>
        </motion.div>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full border border-gray-700 shadow-lg"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
            <div className="inline-block bg-gray-700 px-4 py-2 rounded-full">
              <p className="text-gray-300">
                Time taken:{" "}
                <span className="font-bold text-white">
                  {Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s
                </span>
              </p>
            </div>
          </div>

          {/* Score display */}
          <div className="mb-8">
            <div className="relative h-48 w-48 mx-auto mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="block text-5xl font-bold text-red-500">{results.score}%</span>
                  <span className="text-gray-300 text-sm">Score</span>
                </div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#374151" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={results.score >= 80 ? "#10B981" : results.score >= 60 ? "#F59E0B" : "#EF4444"}
                  strokeWidth="8"
                  strokeDasharray={`${results.score * 2.83} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
          </div>

          {/* Results breakdown */}
          <div className="bg-gray-900 rounded-xl p-5 mb-8">
            <h3 className="font-semibold mb-4 text-lg">Quiz Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-900/30 p-3 rounded-lg">
                <div className="flex justify-center mb-1">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-500">{results.correctAnswers}</p>
                <p className="text-xs text-gray-400">Correct</p>
              </div>

              <div className="bg-red-900/30 p-3 rounded-lg">
                <div className="flex justify-center mb-1">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div><p className="text-2xl font-bold text-red-500">{results.wrongAnswers}</p>
                <p className="text-xs text-gray-400">Wrong</p>
              </div>

              <div className="bg-yellow-900/30 p-3 rounded-lg">
                <div className="flex justify-center mb-1">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-500">{results.unanswered}</p>
                <p className="text-xs text-gray-400">Skipped</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={enterReviewMode}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <BarChart2 className="h-5 w-5" />
              <span>Review Answers</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={restartQuiz}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Retry Quiz</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-h-fit bg-gray-900 text-white py-10 mt-16">
      <div className="max-w-3xl mx-auto">
        {/* Header with timer and progress */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold mb-1">{title}</h1>
            <p className="text-gray-400 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              remainingTime < 60 ? "bg-red-900/40 text-red-400" : "bg-gray-800"
            }`}
          >
            <Timer className={`h-5 w-5 ${remainingTime < 60 ? "text-red-400" : "text-gray-300"}`} />
            <span className="font-mono text-lg font-semibold">{formatTime(remainingTime)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-black rounded-full mb-8">
          <motion.div
            className="h-full bg-red-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question card */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-xl border border-black shadow-lg mb-6 overflow-hidden"
        >
          {/* Question header */}
          <div className="p-6 border-b border-black">
            <h2 className="text-xl font-medium">
              {questions[currentQuestionIndex]?.question || "Loading question..."}
            </h2>
          </div>

          {/* Options */}
          <div className="p-6">
            <div className="space-y-3">
              {questions[currentQuestionIndex]?.options.map((option, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleAnswerSelect(idx)}
                  className={`p-4 rounded-lg cursor-pointer border transition-all ${
                    selectedAnswers[currentQuestionIndex] === idx
                      ? reviewMode
                        ? idx === questions[currentQuestionIndex].correctAnswer
                          ? "bg-green-900/30 border-green-500"
                          : "bg-red-900/30 border-red-500"
                        : "bg-red-900/20 border-red-600"
                      : reviewMode && idx === questions[currentQuestionIndex].correctAnswer
                        ? "bg-green-900/30 border-green-500"
                        : "bg-gray-700 border-gray-600 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 h-6 w-6 rounded-full mr-3 flex items-center justify-center ${
                        selectedAnswers[currentQuestionIndex] === idx
                          ? reviewMode
                            ? idx === questions[currentQuestionIndex].correctAnswer
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                            : "bg-red-600 text-white"
                          : reviewMode && idx === questions[currentQuestionIndex].correctAnswer
                            ? "bg-green-500 text-white"
                            : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-white">{option}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Explanation (shown in review mode) */}
          {reviewMode && questionStatus && (
            <div
              className={`p-5 ${
                questionStatus === "correct"
                  ? "bg-green-900/20 border-t border-green-800"
                  : questionStatus === "incorrect"
                    ? "bg-red-900/20 border-t border-red-800"
                    : "bg-yellow-900/20 border-t border-yellow-800"
              }`}
            >
              <div className="flex items-start space-x-3">
                {questionStatus === "correct" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : questionStatus === "incorrect" ? (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                )}
                <div>
                  <h4
                    className={`font-medium mb-1 ${
                      questionStatus === "correct"
                        ? "text-green-400"
                        : questionStatus === "incorrect"
                          ? "text-red-400"
                          : "text-yellow-400"
                    }`}
                  >
                    {questionStatus === "correct"
                      ? "Correct Answer!"
                      : questionStatus === "incorrect"
                        ? "Incorrect Answer"
                        : "Question Skipped"}
                  </h4>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentQuestionIndex === 0
                ? "bg-black text-gray-600 cursor-not-allowed"
                : "bg-black hover:bg-gray-700 text-white"
            }`}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Previous</span>
          </motion.button>

          {quizCompleted || reviewMode ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowResults(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <span>{currentQuestionIndex === questions.length - 1 ? "Show Results" : "Next"}</span>
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={currentQuestionIndex === questions.length - 1 ? finishQuiz : goToNextQuestion}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <span>{currentQuestionIndex === questions.length - 1 ? "Finish Quiz" : "Next"}</span>
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MCQQuiz;