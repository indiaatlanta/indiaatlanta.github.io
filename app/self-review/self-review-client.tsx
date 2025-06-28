"use client"

import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { useEffect, useState } from "react"

interface SelfReviewData {
  employeeName: string
  reviewDate: string
  overallRating: number
  strengths: string
  areasForImprovement: string
  goals: string
}

const SelfReviewClient = ({ data }: { data: SelfReviewData }) => {
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch("/logo.png")
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onloadend = () => {
          setLogoDataUrl(reader.result as string)
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error("Error fetching logo:", error)
      }
    }

    fetchLogo()
  }, [])

  const generatePDF = () => {
    const doc = new jsPDF()

    // Add logo
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", 20, 20, 64, 10)
    }

    // Add title
    doc.setFontSize(20)
    doc.text("Self Review", 20, 40)

    // Add employee name and review date
    doc.setFontSize(12)
    doc.text(`Employee Name: ${data.employeeName}`, 20, 50)
    doc.text(`Review Date: ${data.reviewDate}`, 20, 57)

    // Add overall rating
    doc.text(`Overall Rating: ${data.overallRating}`, 20, 64)

    // Add strengths, areas for improvement, and goals as tables
    autoTable(doc, {
      startY: 75,
      head: [["Strengths"]],
      body: [[data.strengths]],
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Areas for Improvement"]],
      body: [[data.areasForImprovement]],
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Goals"]],
      body: [[data.goals]],
    })

    // Save the PDF
    doc.save("self-review.pdf")
  }

  return (
    <button onClick={generatePDF} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Generate PDF
    </button>
  )
}

export default SelfReviewClient
