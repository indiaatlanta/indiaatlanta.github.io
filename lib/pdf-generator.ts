import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface AssessmentData {
  title: string
  subtitle: string
  date: string
  jobRole: {
    name: string
    code: string
    level: string
    department: string
  }
  summary: {
    totalSkills: number
    ratedSkills: number
    completionPercentage: number
    overallScore: number
  }
  ratingDistribution: Record<string, number>
  skillsByCategory: Array<{
    category: string
    skills: Array<{
      name: string
      level: string
      description?: string
      rating: string
      ratingColor: string
      notes: string
    }>
  }>
}

export async function generatePDF(data: AssessmentData, filename = "assessment") {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 20

  // Header
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.text("Henry Schein One", 20, yPos)

  yPos += 10
  doc.setFontSize(16)
  doc.text(data.title, 20, yPos)

  yPos += 8
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(data.subtitle, 20, yPos)

  yPos += 6
  doc.text(`Generated: ${data.date}`, 20, yPos)

  // Job Role Information
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.text("Role Information", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.text(`Role: ${data.jobRole.name} (${data.jobRole.code})`, 20, yPos)

  yPos += 6
  doc.text(`Department: ${data.jobRole.department}`, 20, yPos)

  yPos += 6
  doc.text(`Level: ${data.jobRole.level}`, 20, yPos)

  // Summary Statistics
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.text("Assessment Summary", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")
  doc.text(`Total Skills: ${data.summary.totalSkills}`, 20, yPos)

  yPos += 6
  doc.text(`Skills Rated: ${data.summary.ratedSkills}`, 20, yPos)

  yPos += 6
  doc.text(`Completion: ${data.summary.completionPercentage}%`, 20, yPos)

  yPos += 6
  doc.text(`Overall Score: ${data.summary.overallScore.toFixed(1)}%`, 20, yPos)

  // Rating Distribution
  yPos += 15
  doc.setFont("helvetica", "bold")
  doc.text("Rating Distribution", 20, yPos)

  yPos += 8
  doc.setFont("helvetica", "normal")

  const ratingLabels: Record<string, string> = {
    "needs-development": "Needs Development",
    developing: "Developing",
    proficient: "Proficient / Fully Displayed",
    strength: "Strength / Role Model",
    "not-applicable": "Not Applicable",
  }

  Object.entries(data.ratingDistribution).forEach(([rating, count]) => {
    if (count > 0) {
      const label = ratingLabels[rating] || rating
      doc.text(`${label}: ${count}`, 25, yPos)
      yPos += 6
    }
  })

  // Skills by Category
  yPos += 10

  for (const categoryData of data.skillsByCategory) {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(categoryData.category, 20, yPos)
    yPos += 10

    // Create table data for this category
    const tableData = categoryData.skills.map((skill) => [skill.name, skill.level, skill.rating, skill.notes || ""])

    // Add table using autoTable
    autoTable(doc, {
      startY: yPos,
      head: [["Skill", "Required Level", "Self Rating", "Notes"]],
      body: tableData,
      theme: "grid",
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 60 },
      },
      margin: { left: 20, right: 20 },
      didDrawPage: (data) => {
        yPos = data.cursor?.y || yPos
      },
    })

    // Update yPos after table
    const finalY = (doc as any).lastAutoTable?.finalY || yPos
    yPos = finalY + 10
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10, { align: "right" })
  }

  // Save the PDF
  doc.save(`${filename}-${new Date().toISOString().split("T")[0]}.pdf`)
}
