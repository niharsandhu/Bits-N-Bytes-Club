"use client"

import { useParams } from "next/navigation"
import MCQQuiz from "@/app/components/mcq-quiz" // Adjust the import path as needed

export default function MCQQuizPage() {
  const params = useParams()

  return (
    <MCQQuiz
      params={params}
      timeLimit={30}
      title="B 'N' B Quiz"
      onComplete={(results) => {
        console.log("Quiz completed with results:", results)
        // Handle completion logic here
      }}
    />
  )
}

