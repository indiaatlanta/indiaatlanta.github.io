import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface SkillRating {
  skillId: number
  skillName: string
  category: string
  level: string
  rating: string
  ratingValue: number
}

interface AssessmentData {
  assessmentName: string
  jobRoleName: string
  departmentName: string
  skillsData: Array<{
    skillId: number
    skillName: string
    category: string
    level: string
    rating: string
    ratingValue: number
  }>
  overallScore: number
  completionPercentage: number
  totalSkills: number
  completedSkills: number
  createdAt?: string
}

export function generateAssessmentPDF(data: AssessmentData): void {
  const doc = new jsPDF()

  // Add logo and header
  doc.setFontSize(20)
  doc.text("Henry Schein One", 20, 20)
  doc.setFontSize(16)
  doc.text("Skills Assessment Report", 20, 35)

  // Assessment information
  doc.setFontSize(12)
  doc.text(`Assessment: ${data.assessmentName}`, 20, 50)
  doc.text(`Role: ${data.jobRoleName}`, 20, 60)
  doc.text(`Department: ${data.departmentName}`, 20, 70)
  doc.text(
    `Date: ${data.createdAt ? new Date(data.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}`,
    20,
    80,
  )

  // Summary section
  doc.setFontSize(14)
  doc.text("Assessment Summary", 20, 100)
  doc.setFontSize(12)
  doc.text(`Overall Score: ${data.overallScore.toFixed(1)}%`, 20, 115)
  doc.text(`Completion: ${data.completionPercentage}%`, 20, 125)
  doc.text(`Skills Assessed: ${data.completedSkills} of ${data.totalSkills}`, 20, 135)

  // Group skills by category
  const skillsByCategory: Record<string, typeof data.skillsData> = {}
  data.skillsData.forEach((skill) => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = []
    }
    skillsByCategory[skill.category].push(skill)
  })

  let yPosition = 150

  // Generate table for each category
  Object.entries(skillsByCategory).forEach(([category, skills]) => {
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.text(category, 20, yPosition)
    yPosition += 10

    const tableData = skills.map((skill) => [skill.skillName, skill.level, skill.rating])

    autoTable(doc, {
      head: [["Skill", "Level", "Rating"]],
      body: tableData,
      startY: yPosition,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 20, right: 20 },
    })

    yPosition = (doc as any).lastAutoTable.finalY + 15
  })

  // Save the PDF
  const fileName = `${data.assessmentName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_assessment.pdf`
  doc.save(fileName)
}
