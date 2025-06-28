"use client"

import type React from "react"
import { useState } from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface Data {
  header: string[]
  rows: string[][]
}

interface CompareClientProps {
  data1: Data
  data2: Data
  title1: string
  title2: string
}

const CompareClient: React.FC<CompareClientProps> = ({ data1, data2, title1, title2 }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generatePDF = () => {
    setIsGeneratingPDF(true)

    const doc = new jsPDF()

    // Add HS1 Logo
    doc.addImage("/images/hs1-logo.png", "PNG", 10, 10, 32, 5)

    // Add Document Title
    doc.setFontSize(18)
    doc.text("Comparison Report", 105, 20, { align: "center" })

    // Add Titles
    doc.setFontSize(14)
    doc.text(title1, 10, 30)
    doc.text(title2, 105, 30)

    // Add Tables
    autoTable(doc, {
      head: [data1.header],
      body: data1.rows,
      startY: 35,
      margin: { horizontal: 10 },
      columnStyles: { 0: { cellWidth: 90 } },
      tableWidth: 90,
    })

    autoTable(doc, {
      head: [data2.header],
      body: data2.rows,
      startY: 35,
      margin: { horizontal: 105 },
      columnStyles: { 0: { cellWidth: 90 } },
      tableWidth: 90,
    })

    // Save the PDF
    doc.save("comparison_report.pdf")
    setIsGeneratingPDF(false)
  }

  return (
    <div>
      <button
        onClick={generatePDF}
        disabled={isGeneratingPDF}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {isGeneratingPDF ? "Generating PDF..." : "Generate PDF"}
      </button>
    </div>
  )
}

export default CompareClient
