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
  data1Name: string
  data2Name: string
  data: DataItem[]
}

const CompareClient: React.FC<CompareClientProps> = ({ data1Name, data2Name, data }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generatePDF = () => {
    setIsGeneratingPDF(true)

    const doc = new jsPDF()

    // Header
    doc.addImage("/images/background-header.png", "PNG", 0, 0, 210, 30)
    doc.addImage("/images/logo-white.png", "PNG", 15, 3, 20, 7)
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text("Comparison Report", 195, 20, { align: "right" })

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.addImage("/images/background-footer.png", "PNG", 0, 267, 210, 30)
      doc.setFontSize(9)
      doc.setTextColor(255, 255, 255)
      doc.text("Henry Schein One © 2024", 15, 283)
      doc.setFontSize(8)
      doc.text("This document is confidential and intended solely for authorized recipients.", 15, 287)
      doc.setFontSize(9)
      doc.text(`Page ${i} of ${pageCount}`, 195, 283, { align: "right" })
    }

    // Title
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Comparison Report", 15, 50)

    // Subtitle
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text(`Comparing ${data1Name} and ${data2Name}`, 15, 57)

    // Table data
    const tableData = data.map((item) => [item.name, item.value1, item.value2])

    // Table
    autoTable(doc, {
      head: [["Feature", data1Name, data2Name]],
      body: tableData,
      startY: 65,
      margin: { horizontal: 15 },
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: "#2296F2",
        textColor: "#FFFFFF",
        fontStyle: "bold",
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          data.cell.styles.textColor = "#555555"
        }
      },
    })

    // HS1 Logo and disclaimer
    const finalY = doc.lastAutoTable.finalY || 0
    doc.addImage("/images/background-disclaimer.png", "PNG", 15, finalY + 20, 180, 25)
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    doc.text("Disclaimer:", 18, finalY + 25)
    doc.setFontSize(8)
    doc.text(
      "The information provided in this report is for informational purposes only and does not constitute professional advice. Henry Schein One is not responsible for any decisions made based on this report.",
      18,
      finalY + 30,
      { maxWidth: 174 },
    )
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text("Powered by:", 173, finalY + 42, { align: "right" })
    doc.addImage("/images/hs1-logo-small.png", "PNG", 175, finalY + 37, 15, 5)
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text("Generated on:", 15, finalY + 42)
    doc.text(new Date().toLocaleDateString(), 35, finalY + 42)

    // Example of adding an image
    doc.addPage()
    doc.setFontSize(16)
    doc.setTextColor(40, 40, 40)
    doc.text("Additional Information", 15, 20)
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text("Here is some additional information with a logo:", 15, 27)
    doc.addImage("/images/background-disclaimer.png", "PNG", 15, 30, 180, 25)
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 40)
    doc.text("Disclaimer:", 18, 35)
    doc.setFontSize(8)
    doc.text(
      "The information provided in this report is for informational purposes only and does not constitute professional advice. Henry Schein One is not responsible for any decisions made based on this report.",
      18,
      40,
      { maxWidth: 174 },
    )
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text("Powered by:", 173, 52, { align: "right" })
    ;<img src="/images/hs1-logo.png" alt="Henry Schein One" style={{ width: "64px", height: "10px" }} />
    doc.setFontSize(7)
    doc.setTextColor(100, 100, 100)
    doc.text("Generated on:", 15, 52)
    doc.text(new Date().toLocaleDateString(), 35, 52)

    // Save the PDF
    doc.save("comparison-report.pdf")
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
    </div>
  )
}

export default CompareClient
