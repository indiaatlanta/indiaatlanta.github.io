"use client"

import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import "jspdf-autotable"
import { useSearchParams } from "next/navigation"

interface ComparisonData {
  [key: string]: {
    [key: string]: string | number | boolean | null | undefined
  }
}

const CompareClient = () => {
  const searchParams = useSearchParams()
  const dataParam = searchParams.get("data")
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (dataParam) {
      try {
        const decodedData = JSON.parse(decodeURIComponent(dataParam))
        setComparisonData(decodedData)
        setLoading(false)
      } catch (error) {
        console.error("Error parsing comparison data:", error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [dataParam])

  const generatePDF = () => {
    if (!comparisonData) return

    const doc = new jsPDF()

    // Add logo
    const logoDataUrl = "/logo.png" // Replace with your actual logo path
    doc.addImage(logoDataUrl, "PNG", 20, 20, 64, 10)

    // Set document title
    doc.setFontSize(18)
    doc.text("Comparison Report", 20, 40)

    // Prepare table data
    const headers = Object.keys(comparisonData[Object.keys(comparisonData)[0]])
    const tableData = Object.keys(comparisonData).map((key) => {
      return headers.map((header) => comparisonData[key][header])
    })

    // Add table to PDF
    ;(doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 50,
    })

    // Save the PDF
    doc.save("comparison_report.pdf")
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!comparisonData) {
    return <div>No data to display.</div>
  }

  return (
    <div>
      <h1>Comparison Table</h1>
      <table>
        <thead>
          <tr>
            {Object.keys(comparisonData[Object.keys(comparisonData)[0]]).map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(comparisonData).map((key) => (
            <tr key={key}>
              {Object.values(comparisonData[key]).map((value, index) => (
                <td key={index}>{String(value)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  )
}

export default CompareClient
