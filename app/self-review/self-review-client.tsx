"use client"

import type React from "react"
import { useState } from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface ReviewData {
  strengths: string
  weaknesses: string
  opportunities: string
  threats: string
  actionItems: string
}

const SelfReviewClient: React.FC = () => {
  const [reviewData, setReviewData] = useState<ReviewData>({
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
    actionItems: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setReviewData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const generatePDF = () => {
    const doc = new jsPDF()

    // Add HS1 Logo
    doc.addImage("/images/hs1-logo.png", "PNG", 10, 10, 20, 3)

    // Add Title
    doc.setFontSize(18)
    doc.text("Self Review", 105, 20, { align: "center" })

    // Define table data
    const tableData = [
      ["Strengths", reviewData.strengths],
      ["Weaknesses", reviewData.weaknesses],
      ["Opportunities", reviewData.opportunities],
      ["Threats", reviewData.threats],
      ["Action Items", reviewData.actionItems],
    ]

    // Configure autoTable
    autoTable(doc, {
      body: tableData,
      startY: 30,
    })

    // Save the PDF
    doc.save("self_review.pdf")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Self Review</h1>

      <div className="mb-4">
        <label htmlFor="strengths" className="block text-gray-700 text-sm font-bold mb-2">
          Strengths:
        </label>
        <textarea
          id="strengths"
          name="strengths"
          value={reviewData.strengths}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="weaknesses" className="block text-gray-700 text-sm font-bold mb-2">
          Weaknesses:
        </label>
        <textarea
          id="weaknesses"
          name="weaknesses"
          value={reviewData.weaknesses}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="opportunities" className="block text-gray-700 text-sm font-bold mb-2">
          Opportunities:
        </label>
        <textarea
          id="opportunities"
          name="opportunities"
          value={reviewData.opportunities}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="threats" className="block text-gray-700 text-sm font-bold mb-2">
          Threats:
        </label>
        <textarea
          id="threats"
          name="threats"
          value={reviewData.threats}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="actionItems" className="block text-gray-700 text-sm font-bold mb-2">
          Action Items:
        </label>
        <textarea
          id="actionItems"
          name="actionItems"
          value={reviewData.actionItems}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        type="button"
        onClick={generatePDF}
      >
        Generate PDF
      </button>
    </div>
  )
}

export default SelfReviewClient
