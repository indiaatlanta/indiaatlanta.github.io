"use client"

import type React from "react"
import { useState } from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface SelfReviewData {
  employeeName: string
  reviewDate: string
  reviewerName: string
  questions: {
    question: string
    answer: string
  }[]
}

const SelfReviewClient: React.FC = () => {
  const [reviewData, setReviewData] = useState<SelfReviewData>({
    employeeName: "John Doe",
    reviewDate: "2024-01-01",
    reviewerName: "Jane Smith",
    questions: [
      { question: "What are your key accomplishments?", answer: "Completed project X and Y." },
      { question: "What are your areas for improvement?", answer: "Public speaking." },
    ],
  })

  const generatePDF = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.text("Self Review", 14, 22)

    // Logo
    doc.addImage("/images/hs1-logo.png", "PNG", 170, 8, 30, 10)

    // Employee Information
    doc.setFontSize(12)
    doc.text(`Employee Name: ${reviewData.employeeName}`, 14, 35)
    doc.text(`Review Date: ${reviewData.reviewDate}`, 14, 42)
    doc.text(`Reviewer Name: ${reviewData.reviewerName}`, 14, 49)

    // Table Data
    const tableData = reviewData.questions.map((q) => [q.question, q.answer])

    // Table
    autoTable(doc, {
      head: [["Question", "Answer"]],
      body: tableData,
      startY: 60,
    })

    // Save the PDF
    doc.save("self-review.pdf")
  }

  return (
    <div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  )
}

export default SelfReviewClient
