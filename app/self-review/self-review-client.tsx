"use client"

import type React from "react"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { useEffect, useState } from "react"

interface SelfReviewData {
  employeeName: string
  reviewPeriod: string
  jobTitle: string
  department: string
  dateSubmitted: string
  overallRating: string
  strengths: string
  areasForImprovement: string
  goals: string
  employeeComments: string
  managerComments: string
}

interface SelfReviewClientProps {
  data: SelfReviewData
  logoDataUrl: string
}

const SelfReviewClient: React.FC<SelfReviewClientProps> = ({ data, logoDataUrl }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const generatePDF = () => {
    const doc = new jsPDF()

    // Add logo
    doc.addImage(logoDataUrl, "PNG", 20, 20, 64, 10)

    // Add title
    doc.setFontSize(20)
    doc.text("Self Review", 20, 40)

    // Add general information
    doc.setFontSize(12)
    doc.text(`Employee Name: ${data.employeeName}`, 20, 50)
    doc.text(`Review Period: ${data.reviewPeriod}`, 20, 58)
    doc.text(`Job Title: ${data.jobTitle}`, 20, 66)
    doc.text(`Department: ${data.department}`, 20, 74)
    doc.text(`Date Submitted: ${data.dateSubmitted}`, 20, 82)

    // Add review details
    autoTable(doc, {
      startY: 90,
      head: [["Category", "Details"]],
      body: [
        ["Overall Rating", data.overallRating],
        ["Strengths", data.strengths],
        ["Areas for Improvement", data.areasForImprovement],
        ["Goals", data.goals],
        ["Employee Comments", data.employeeComments],
        ["Manager Comments", data.managerComments],
      ],
    })

    // Save the PDF
    doc.save("self_review.pdf")
  }

  return (
    isClient && (
      <button onClick={generatePDF} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Generate PDF
      </button>
    )
  )
}

export default SelfReviewClient
