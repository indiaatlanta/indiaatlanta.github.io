"use client"

import type React from "react"
import { useState } from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface DataItem {
  name: string
  value1: string
  value2: string
}

interface CompareClientProps {
  data1: DataItem[]
  data2: DataItem[]
  title1: string
  title2: string
}

const CompareClient: React.FC<CompareClientProps> = ({ data1, data2, title1, title2 }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generatePDF = () => {
    setIsGeneratingPDF(true)

    const doc = new jsPDF()

    // Add HS1 Logo
    doc.addImage("/images/hs1-logo.png", "PNG", 10, 10, 20, 6)

    // Add Title
    doc.setFontSize(18)
    doc.text("Comparison Report", 105, 20, { align: "center" })

    // Add Titles for Data Sets
    doc.setFontSize(14)
    doc.text(title1, 30, 35)
    doc.text(title2, 130, 35)

    // Prepare data for autoTable
    const tableData = data1.map((item, index) => {
      const correspondingItem2 = data2[index] || { name: "", value1: "" }
      return [item.name, item.value1, correspondingItem2.value1]
    })

    // Define columns
    const columns = ["Metric", title1, title2]

    // Add autoTable
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 40,
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
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {isGeneratingPDF ? "Generating PDF..." : "Generate PDF"}
      </button>
      {/* You can add a table or other display components here if needed */}
    </div>
  )
}

export default CompareClient
