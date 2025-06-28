"use client"

import type React from "react"
import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import "jspdf-autotable"

interface CarData {
  [key: string]: string | number | boolean | null
}

interface CompareClientProps {
  car1: CarData
  car2: CarData
}

const CompareClient: React.FC<CompareClientProps> = ({ car1, car2 }) => {
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
    if (!logoDataUrl) {
      console.error("Logo not loaded yet.")
      return
    }

    const doc = new jsPDF()

    // Add logo
    doc.addImage(logoDataUrl, "PNG", 20, 20, 64, 10)

    // Add title
    doc.setFontSize(20)
    doc.text("Car Comparison", 20, 40)

    // Prepare data for the table
    const tableData = []
    const headers = ["Feature", "Car 1", "Car 2"]

    for (const key in car1) {
      if (car1.hasOwnProperty(key) && car2.hasOwnProperty(key)) {
        tableData.push([
          key,
          car1[key] !== null ? car1[key].toString() : "N/A",
          car2[key] !== null ? car2[key].toString() : "N/A",
        ])
      }
    }
    // Add table to the PDF
    ;(doc as any).autoTable({
      head: [headers],
      body: tableData,
      startY: 50,
    })

    // Save the PDF
    doc.save("car_comparison.pdf")
  }

  return (
    <div>
      <button onClick={generatePDF}>Generate PDF</button>
    </div>
  )
}

export default CompareClient
