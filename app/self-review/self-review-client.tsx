"use client"

import type React from "react"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useEffect, useState } from "react"

interface SelfReviewData {
  employeeName: string
  reviewPeriod: string
  jobTitle: string
  department: string
  dateSubmitted: string
  keyAchievements: string
  areasForImprovement: string
  goalsForNextPeriod: string
  employeeComments: string
  overallPerformance: string
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
    doc.addImage(logoDataUrl, "PNG", 14, 14, 64, 10)

    // Add title
    doc.setFontSize(18)
    doc.text("Self-Review Form", 14, 35)

    // Add general information
    doc.setFontSize(12)
    doc.text(`Employee Name: ${data.employeeName}`, 14, 50)
    doc.text(`Review Period: ${data.reviewPeriod}`, 14, 58)
    doc.text(`Job Title: ${data.jobTitle}`, 14, 66)
    doc.text(`Department: ${data.department}`, 14, 74)
    doc.text(`Date Submitted: ${data.dateSubmitted}`, 14, 82)

    // Add sections
    autoTable(doc, {
      startY: 90,
      head: [["Key Achievements"]],
      body: [[data.keyAchievements]],
      theme: "grid",
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Areas for Improvement"]],
      body: [[data.areasForImprovement]],
      theme: "grid",
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Goals for Next Period"]],
      body: [[data.goalsForNextPeriod]],
      theme: "grid",
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Employee Comments"]],
      body: [[data.employeeComments]],
      theme: "grid",
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Overall Performance"]],
      body: [[data.overallPerformance]],
      theme: "grid",
    })

    // Save the PDF
    doc.save("self-review.pdf")
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
