"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Rocket, MoreHorizontal, ExternalLink, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// Sample role data for each department
const departmentRoles = {
  "analytics-engineers": {
    name: "Analytics Engineer",
    totalPositions: 5,
    roles: [
      { id: "AE1", name: "AE1", skills: 12 },
      { id: "AE2", name: "AE2", skills: 12 },
      { id: "AE3", name: "AE3", skills: 12 },
      { id: "AE4", name: "AE4", skills: 12 },
      { id: "AE5", name: "AE5", skills: 11 },
    ],
  },
  "customer-success": {
    name: "Customer Success",
    totalPositions: 5,
    roles: [
      { id: "CS1", name: "CS1", skills: 8 },
      { id: "CS2", name: "CS2", skills: 10 },
      { id: "CS3", name: "CS3", skills: 9 },
      { id: "CS4", name: "CS4", skills: 11 },
      { id: "CS5", name: "CS5", skills: 7 },
    ],
  },
  data: {
    name: "Data",
    totalPositions: 5,
    roles: [
      { id: "DA1", name: "DA1", skills: 15 },
      { id: "DA2", name: "DA2", skills: 14 },
      { id: "DA3", name: "DA3", skills: 13 },
      { id: "DA4", name: "DA4", skills: 16 },
      { id: "DA5", name: "DA5", skills: 12 },
    ],
  },
  design: {
    name: "Design",
    totalPositions: 24,
    roles: [
      { id: "D1", name: "Junior Designer", skills: 8 },
      { id: "D2", name: "Product Designer", skills: 12 },
      { id: "D3", name: "Senior Designer", skills: 15 },
      { id: "D4", name: "Lead Designer", skills: 18 },
      { id: "D5", name: "Design Director", skills: 20 },
    ],
  },
  engineering: {
    name: "Engineering",
    totalPositions: 9,
    roles: [
      { id: "E1", name: "Junior Engineer", skills: 10 },
      { id: "E2", name: "Software Engineer", skills: 15 },
      { id: "E3", name: "Senior Engineer", skills: 20 },
      { id: "E4", name: "Lead Engineer", skills: 25 },
      { id: "E5", name: "Principal Engineer", skills: 30 },
    ],
  },
  finance: {
    name: "Finance",
    totalPositions: 5,
    roles: [
      { id: "F1", name: "F1", skills: 6 },
      { id: "F2", name: "F2", skills: 8 },
      { id: "F3", name: "F3", skills: 10 },
      { id: "F4", name: "F4", skills: 12 },
      { id: "F5", name: "F5", skills: 9 },
    ],
  },
  "marketing-growth": {
    name: "Marketing/Growth",
    totalPositions: 35,
    roles: [
      { id: "MG1", name: "Growth Analyst", skills: 12 },
      { id: "MG2", name: "Marketing Manager", skills: 15 },
      { id: "MG3", name: "Senior Growth Manager", skills: 18 },
      { id: "MG4", name: "Growth Director", skills: 22 },
      { id: "MG5", name: "VP Marketing", skills: 25 },
    ],
  },
  operations: {
    name: "Operations",
    totalPositions: 10,
    roles: [
      { id: "O1", name: "O1", skills: 8 },
      { id: "O2", name: "O2", skills: 10 },
      { id: "O3", name: "O3", skills: 12 },
      { id: "O4", name: "O4", skills: 15 },
      { id: "O5", name: "O5", skills: 11 },
    ],
  },
  people: {
    name: "People",
    totalPositions: 15,
    roles: [
      { id: "P1", name: "HR Coordinator", skills: 8 },
      { id: "P2", name: "People Partner", skills: 12 },
      { id: "P3", name: "Senior People Partner", skills: 15 },
      { id: "P4", name: "People Manager", skills: 18 },
      { id: "P5", name: "Head of People", skills: 22 },
    ],
  },
  product: {
    name: "Product",
    totalPositions: 0,
    roles: [],
  },
  "product-analytics": {
    name: "Product Analytics",
    totalPositions: 0,
    roles: [],
  },
  "strategic-finance": {
    name: "Strategic Finance",
    totalPositions: 0,
    roles: [],
  },
}

const skillsFramework = {
  "analytics-engineers": {
    categories: [
      {
        name: "Delivery",
        skills: [
          {
            name: "Ownership",
            levels: [
              "Ownership is typically limited to the specific project/epic assigned. Requires some guidance on forming solutions.",
              "Takes ownership of data products/services in the product area on which they are working.",
              "Takes ownership of data products/services in the entire product domain under the responsibility of their squad (including those not actively...",
              "Takes ownership of data products/service at the pillar level or more complex areas, co-ordinating work amongst other AE to deliver against a...",
              "Takes ownership of data products/services at the company level. Leads major strategic data projects and initiatives,...",
            ],
          },
          {
            name: "Impact",
            levels: [
              "Impact on single tables in the data model.",
              "Impact on data models in a squad domain. Minor impact on AE general ROI (data coverage at Cleo; efficiency gains for Cleo's dat...",
              "Impact on data models in a pillar domain. Measurable impact on AE general ROI (data coverage at Cleo; efficiency gains for Cle...",
              "Identifies and plans initiatives with strong impact on AE general ROI (data coverage at Cleo; efficiency gains for Cleo's data platform; reliability and...",
              "Interfaces with Senior leadership to design, plan, implement strategic data projects. Calculates and tracks the...",
            ],
          },
        ],
      },
      {
        name: "Programming",
        skills: [
          {
            name: "SQL",
            levels: [
              "Writes moderate to complex SQL queries using the appropriate syntax and functions.",
              "Writes SQL queries using the most appropriate syntax and functions for the task at hand.",
              "Monitors the query execution plan and makes adjustments to improve performance.",
              "Writes SQL using advanced syntax and functions, including complex window functions and CTEs.",
              "Defines and implements SQL standards and best practices for the team.",
            ],
          },
        ],
      },
    ],
  },
}

// Detailed role information
const roleDetails: Record<string, any> = {
  AE1: {
    title: "AE1",
    level: "AE1",
    salary: ["£37,561 - £53,158 (GBP) - UK, Hybrid", "£36,170 - £51,189 (GBP) - UK, Remote"],
    skills: [
      {
        name: "Ownership",
        level: "L1",
        description:
          "Ownership is typically limited to the specific project/epic assigned. Requires some guidance on forming solutions.",
      },
      {
        name: "Impact",
        level: "L1",
        description: "Impact on single tables in the data model.",
      },
      {
        name: "SQL Proficiency",
        level: "L2",
        description: "Can write complex queries with joins, subqueries, and window functions.",
      },
      {
        name: "Data Modeling",
        level: "L1",
        description: "Understanding of basic data modeling concepts and dimensional modeling.",
      },
    ],
  },
  AE2: {
    title: "AE2",
    level: "AE2",
    salary: ["£42,000 - £58,000 (GBP) - UK, Hybrid", "£40,000 - £55,000 (GBP) - UK, Remote"],
    skills: [
      {
        name: "Ownership",
        level: "L2",
        description: "Can own medium-sized projects with minimal guidance. Takes initiative in problem-solving.",
      },
      {
        name: "Impact",
        level: "L2",
        description: "Impact across multiple related tables and data marts.",
      },
      {
        name: "SQL Proficiency",
        level: "L3",
        description: "Expert in SQL with ability to optimize complex queries and understand execution plans.",
      },
      {
        name: "Data Modeling",
        level: "L2",
        description: "Can design and implement dimensional models for specific business domains.",
      },
    ],
  },
  CS1: {
    title: "CS1",
    level: "CS1",
    salary: ["£28,000 - £35,000 (GBP) - UK, Hybrid", "£26,000 - £33,000 (GBP) - UK, Remote"],
    skills: [
      {
        name: "Customer Communication",
        level: "L1",
        description: "Can handle basic customer inquiries with supervision and established processes.",
      },
      {
        name: "Problem Resolution",
        level: "L1",
        description: "Resolves straightforward customer issues using documented procedures.",
      },
    ],
  },
  E1: {
    title: "Junior Engineer",
    level: "E1",
    salary: ["£00,000 - £00,000 (GBP) - UK, Hybrid", "£00,000 - £00,000 (GBP) - UK, Remote"],
    skills: [
      // Technical Skills
      {
        name: "Security",
        level: "L1",
        description: "Understands the importance of security.",
      },
      {
        name: "Debugging",
        level: "L1",
        description: "Understands the basics of debugging and the tools used for it.",
      },
      {
        name: "Observability",
        level: "N/A",
        description: "n/a (not applicable at this level)",
      },
      {
        name: "Resolving",
        level: "L1",
        description:
          "Is able to design and implement resolutions for production bugs with the help from more senior engineers",
      },
      {
        name: "Writing Code",
        level: "L1",
        description: "Writes code with testability, readability, edge cases, and errors in mind.",
      },
      {
        name: "Language and Technologies Familiarity",
        level: "L1",
        description:
          "Is able to create coded solutions using the primary languages and technologies used by their team, with the support of their team and online resources",
      },
      {
        name: "Testing",
        level: "L1",
        description:
          "Knows the testing pyramid. Writes unit/integration tests and E2E tests, sometimes with help from more senior engineers.",
      },
      {
        name: "Reviewing Code",
        level: "L1",
        description:
          "Knows the basics of code review processes and tools, sometimes participates in code reviews by providing comments, sometimes needing guidance to identify issues. Focuses on learning from feedback provided during reviews to improve their own code quality.",
      },
      {
        name: "Software Architecture",
        level: "L1",
        description:
          "Is aware of overall container architecture. Designs code with an awareness of overall container architecture, avoiding duplication across codebases and interface-breaking changes.",
      },
      {
        name: "Understanding Code (Understanding System Context)",
        level: "L1",
        description:
          "Is able to gain understanding of the system context of current work with help from more senior engineers.",
      },
      // Delivery Skills
      {
        name: "Work Breakdown",
        level: "L1",
        description:
          "Understands value of rightsizing pieces of work to enable continuous deployment and incremental delivery. Understands the value of small work items.",
      },
      {
        name: "Prioritisation and RAID",
        level: "L1",
        description:
          "Acts according to work item prioritisation. Is aware of current risks, assumptions, issues and dependencies affecting their team's current work. Raises risks, assumptions, issues and dependencies to their team as soon as they are identified.",
      },
      {
        name: "Dealing with Ambiguity",
        level: "N/A",
        description: "n/a (not applicable at this level)",
      },
      {
        name: "Reliability, delivery accountability",
        level: "L1",
        description:
          "Has daily conversations with the team about the progress of their work. Delivers on commitments with a sense of urgency.",
      },
      {
        name: "Personal Organisation",
        level: "L1",
        description:
          "Understand the important of personal organisation and often ensures their availability is communicated across the team. Very often responds to requests for their time (e.g. meeting requests) in a timely manner.",
      },
      {
        name: "Business value understanding",
        level: "L1",
        description:
          "Understands the importance of weighing cost and value in decision making. Asks more senior engineers for help in applying this type of thinking to their work.",
      },
      // Feedback, Communication & Collaboration
      {
        name: "Delivering Feedback",
        level: "L1",
        description:
          "Understands how to deliver praise and constructive feedback in a useful manner. Seeks support in order to provide feedback when required.",
      },
      {
        name: "Seeking/Receiving Feedback",
        level: "L1",
        description:
          "Actively seeks out feedback from their teammates and manager, and works to use feedback that they receive as a tool for growth.",
      },
      {
        name: "Effective communication",
        level: "L1",
        description:
          "Very often communicates effectively, clearly, concisely and in an audience-oriented way, in written and verbal form. Often demonstrates the behaviours defined in the collaboration principles guidelines. Actively listens to others and ensures they are understood. Pays attention to non-verbal communication.",
      },
      {
        name: "Knowledge Sharing",
        level: "L1",
        description:
          "Understands their area of work and shares their knowledge frequently with their teammates. Proactively seeks knowledge from others.",
      },
      {
        name: "Teamwork",
        level: "L1",
        description: "Helps their teammates when requested. Often gives or shares credit where due.",
      },
      {
        name: "Handling Disagreement",
        level: "L1",
        description:
          "Openly shares their opinions and contributes to discussions in a respectful manner. Works with teammates to resolve disagreement in a healthy manner. Is open to changing their perspective and plans based on others' input.",
      },
      {
        name: "Relationship Building",
        level: "L1",
        description:
          "Works to build strong relationships with their teammates and manager. Understands the impact of biases on decision making. Understands accountability.",
      },
      {
        name: "Decision making",
        level: "L1",
        description:
          "Contributes to conversations based on organisational strategy and principles with their teammates when appropriate. Strongly oriented towards goals and works towards their team's goals. Understands their team's practices and processes, ensuring best efforts are made to adhere to them.",
      },
      {
        name: "Driving Alignment",
        level: "N/A",
        description: "n/a (not applicable at this level)",
      },
      {
        name: "Mentoring",
        level: "L1",
        description: "Seeks out mentorship to grow their own experience and expertise.",
      },
      // Strategic Impact
      {
        name: "Business Mission & Vision",
        level: "L1",
        description: "Has a basic understanding of the business mission and vision.",
      },
      {
        name: "Department Mission & Vision",
        level: "L1",
        description: "Has a basic understanding of the department mission and vision.",
      },
      {
        name: "Innovation",
        level: "L1",
        description:
          "Knows the basics of emerging technologies, and their potential applications and focuses on learning about innovation methodologies and how new technologies can solve engineering challenges. Experiments with small, low-risk projects to build understanding and confidence in innovative practices.",
      },
      {
        name: "Business Acumen",
        level: "L1",
        description: "Has a basic understanding of their team's objectives and competitive marketplace.",
      },
      {
        name: "Strategic Work",
        level: "N/A",
        description: "n/a (not applicable at this level)",
      },
      {
        name: "Product Thinking",
        level: "L1",
        description: "Understands basic utility of the business products and platforms.",
      },
    ],
  },
  E2: {
    title: "Software Engineer",
    level: "E2",
    salary: ["£45,000 - £60,000 (GBP) - UK, Hybrid", "£42,000 - £57,000 (GBP) - UK, Remote"],
    skills: [
      // Technical Skills - Security
      {
        name: "Security",
        level: "L2",
        description:
          "Understands the importance of security. Utilises this knowledge to ask more senior engineers for help on making decisions that may have security implications. With the support of more senior engineers can implement security patches.",
      },
      {
        name: "Debugging",
        level: "L2",
        description:
          "Uses a systematic approach to debug issues located within a single component. Proficient at using systematic debugging to diagnose all issues located a component or container. Uses systematic debugging to diagnose multi-container issues, sometimes with help from more senior engineers.",
      },
      {
        name: "Observability",
        level: "L2",
        description:
          "Is aware of the organisation's observability philosophy. Is able to observe operational data during the deployment of changes to the platform.",
      },
      {
        name: "Resolving",
        level: "L2",
        description:
          "Is able to design and implement resolutions for production bugs often without help from others. Helps more junior engineers in designing and implementing resolutions for production bugs.",
      },
      {
        name: "Writing Code",
        level: "L2",
        description:
          "Very often writes code that is easily testable, easily understood by other engineers, and accounts for edge cases and errors whilst following best practices. Understands when it is appropriate to leave comments, but biases towards self-documenting code.",
      },
      {
        name: "Language and Technologies Familiarity",
        level: "L2",
        description:
          "Is able to create coded solutions using the default languages and technologies and can read and understand code in any of them. Very often is able to create coded solutions using their primary languages and technologies independently.",
      },
      {
        name: "Testing",
        level: "L2",
        description:
          "Understands the testing pyramid, writes unit, integration and end-to-end tests in accordance with it. Always tests for expected edge cases and errors as well as the happy path.",
      },
      {
        name: "Reviewing Code",
        level: "L2",
        description:
          "Understands the principles of effective code reviews, including consistency, readability, and maintainability, actively participating in reviews by identifying potential defects and opportunities for improvement. Reviews code with an eye toward reducing technical debt and ensuring adherence to best practices.",
      },
      {
        name: "Software Architecture",
        level: "L2",
        description:
          "Very often designs code that is aligned with the overall container architecture, and follows defined architecture patterns and best practices. With the support of more senior engineers, can design a component's architecture.",
      },
      {
        name: "Understanding Code (Understanding System Context)",
        level: "L2",
        description:
          "Understands a portion of the system context of current work. Can gain sufficient context to work productively on work items and can support more junior engineers in understanding the system context.",
      },
      // Delivery Skills
      {
        name: "Work Breakdown",
        level: "L2",
        description:
          "Before beginning work, ensures that BLIs are appropriately sized for continuous deployment and incremental delivery, with help from teammates and more senior engineers. Understands how to break pieces of work down. Understands the practice of continuous deployment.",
      },
      {
        name: "Prioritisation and RAID",
        level: "L2",
        description:
          "Often helps to set determine the priority of work items. Very often takes responsibility for ensuring that work items are prioritised correctly that priority is understood. Proactively seeks to remove risks, assumptions, issues and dependencies.",
      },
      {
        name: "Dealing with Ambiguity",
        level: "L2",
        description:
          "Very often handles risk, change, and uncertainty within their personal scope of work effectively. Very often decides and acts responsibly without having the complete picture during routine business, and when in high pressure situations.",
      },
      {
        name: "Reliability, delivery accountability",
        level: "L2",
        description:
          "Commits to a realistic amount of work, and works with their teammates, both to ensure they understand priority and urgency, and to deliver upon them accordingly. Escalates any blockers, delays, and effort ballooning/estimate inaccuracy to their team immediately. Clarifies expectations with their teammates.",
      },
      {
        name: "Personal Organisation",
        level: "L2",
        description:
          "Always ensures their availability is communicated across the team. Always responds to requests for their time (e.g. meeting requests) in a timely manner. Very often ensures that their personal workload is realistic and well prioritised. Proactively seeks support from their team and manager when needed.",
      },
      {
        name: "Business value understanding",
        level: "L2",
        description:
          "When taking action, very often weighs cost against business value in order to take the most economic action with help from more senior engineers. Often uses this type of thinking to make suggestions to their team.",
      },
      // Communication & Collaboration
      {
        name: "Delivering Feedback",
        level: "L2",
        description:
          "Often delivers praise and constructive feedback to their team, teammates, and manager in a useful manner.",
      },
      {
        name: "Seeking/Receiving Feedback",
        level: "L2",
        description:
          "Actively seeks out feedback from their teammates and manager, and works to use feedback that they receive as a tool for growth.",
      },
      {
        name: "Effective communication",
        level: "L2",
        description:
          "Very often communicates effectively, clearly, concisely and in an audience-oriented way. Very often communicates in written and verbal form of both technical and non-technical subjects, to their teammates. Very often demonstrates the behaviours defined in the communication principles guidelines.",
      },
      {
        name: "Knowledge Sharing",
        level: "L2",
        description:
          "Often shares their knowledge with their teammates and contributes to their team's documentation. Often seeks opportunities to share knowledge.",
      },
      {
        name: "Teamwork",
        level: "L2",
        description:
          "When requested, helps their teammates overcome obstacles, resolve blockers, and complete work tasks.",
      },
      {
        name: "Handling Disagreement",
        level: "L2",
        description:
          "Approaches disagreement with teammates, stakeholders, and peers non-defensively with inquisitiveness. Uses contradictory opinions as a basis for constructive, productive conversations.",
      },
      {
        name: "Relationship Building",
        level: "L2",
        description: "Works to build strong relationships with their teammates, manager, and key stakeholders.",
      },
      {
        name: "Decision making",
        level: "L2",
        description:
          "Strives to be objective and reflects on their own biases when making decisions. Holds themselves accountable for decisions and outcomes.",
      },
      // Strategic Impact
      {
        name: "Business Mission & Vision",
        level: "L2",
        description: "Understands the business mission and vision.",
      },
      {
        name: "Department Mission & Vision",
        level: "L2",
        description:
          "Understands the department mission and vision. Can identify challenges within the team in achieving the department mission and vision.",
      },
      {
        name: "Innovation",
        level: "L2",
        description:
          "Understands the principles of innovation and its alignment with business goals and customer impact, actively exploring and evaluating new technologies, to identify potential use cases.",
      },
      {
        name: "Business Acumen",
        level: "L2",
        description:
          "Has a basic understanding of their team's objectives, and how it contributes to overall business strategy.",
      },
      {
        name: "Strategic Work",
        level: "L2",
        description:
          "Understands the organisation's product and technology vision and strategy, as well as the departments ways of working vision.",
      },
      {
        name: "Product Thinking",
        level: "L2",
        description:
          "Understands products and platforms within the context of their team's objectives, how it fits into the overall business, and often makes improvement suggestions for it.",
      },
    ],
  },
  E3: {
    title: "Senior Engineer",
    level: "E3",
    salary: ["£60,000 - £80,000 (GBP) - UK, Hybrid", "£57,000 - £75,000 (GBP) - UK, Remote"],
    skills: [
      // Technical Skills
      {
        name: "Security",
        level: "L3",
        description:
          "Approaches all engineering work, including design and implementation, with a security lens. Proactively looks for security vulnerabilities both in the code and when providing peer reviews. Design and implement security patches.",
      },
      {
        name: "Debugging",
        level: "L3",
        description:
          "Expert at using systematic debugging to diagnose all issues located within a single component or container. Proficient at systematic debugging to diagnose multi-container issues. Very often supports other engineers with debugging.",
      },
      {
        name: "Observability",
        level: "L3",
        description:
          "Is aware of the organisation's observability philosophy. Helps tune and implement monitoring during development. Is proficient in observing operational data during the deployment of changes to the platform, and uses it as a basis for suggesting stability and performance improvements.",
      },
      {
        name: "Resolving",
        level: "L3",
        description:
          "Is able to design and implement resolutions for production bugs very often without help from others. Often ensures that fixes are aligned with technology vision.",
      },
      {
        name: "Writing Code",
        level: "L3",
        description:
          "Very often writes production-ready code that is easily testable, easily understood by other engineers, and accounts for edge cases and errors. Follows and contributes towards the improvement of best practices.",
      },
      {
        name: "Language and Technologies Familiarity",
        level: "L3",
        description:
          "Is able to read and experiment with unfamiliar languages and technologies. Very often confidently share a deep understanding of their primary languages and technologies with others.",
      },
      {
        name: "Testing",
        level: "L3",
        description:
          "Has a complete understanding of the testing pyramid, and writes unit/integration tests as well as end-to-end tests in accordance with it. Always writes tests to handle expected edge cases and errors gracefully, as well as happy paths.",
      },
      {
        name: "Reviewing Code",
        level: "L3",
        description:
          "Has a complete understanding of effective code review techniques and their impact on overall code quality, consistently providing detailed, actionable, and empathetic feedback that balances technical rigor with team collaboration. Identifies systemic issues in the codebase and raises them during reviews.",
      },
      {
        name: "Software Architecture",
        level: "L3",
        description:
          "Always designs code that is aligned with the overall container architecture, contributing to the improvement of defined architecture patterns and best practices. Can design a component's architecture without senior support, supporting the creation of a timely iterative delivery plan that enables incremental business value.",
      },
      {
        name: "Understanding Code (Understanding System Context)",
        level: "L3",
        description:
          "Understands the parts of the technology estate relevant to their team's objectives at a high level. Maintains a good understanding to work productively within the system context of current problem. Proactively coaches and teaches the system context to more junior engineers.",
      },
      // Delivery Skills
      {
        name: "Work Breakdown",
        level: "L3",
        description:
          "Reviews BLIs critically and ensures they're appropriately sised for continuous deployment and incremental delivery. Guides more junior engineers in the creation of small independent work items which promote collaborative work.",
      },
      {
        name: "Prioritisation and RAID",
        level: "L3",
        description:
          "Always takes responsibility for ensuring work items are prioritised correctly and that priority is understood. Coaches and teaches teams in work items prioritisation. Always takes responsibility for ensuring that risks, assumptions, issues and dependencies are captured.",
      },
      {
        name: "Dealing with Ambiguity",
        level: "L3",
        description:
          "Always handles risk, change, and uncertainty within their personal scope of work effectively. Always decides and acts responsibly without having the complete picture during routine business, and when in high pressure situations. Often Supports others in handing ambiguity and risk.",
      },
      {
        name: "Reliability, delivery accountability",
        level: "L3",
        description:
          "Ensures their commitments are realistic, understands their priority and urgency, and delivers upon them accordingly. Anticipates and communicates blockers, delays, and cost ballooning for their current work before they require escalation. Ensures expectations within their team are clarified between all parties involved.",
      },
      {
        name: "Personal Organisation",
        level: "L3",
        description:
          "Always ensures that their personal workload is realistic and well prioritised. Proactively supports their teammates in improving their personal organisation and workload.",
      },
      {
        name: "Business value understanding",
        level: "L3",
        description:
          "When taking action, always weighs cost and value in order to take the most economic action. Always uses this thinking in their own work, and to make suggestions to their team.",
      },
      // Communication & Collaboration
      {
        name: "Delivering Feedback",
        level: "L3",
        description:
          "Very Often delivers praise and constructive feedback to their team, teammates, and manager in a useful manner. Delivers feedback to their team's business stakeholders when opportunities arise.",
      },
      {
        name: "Seeking/Receiving Feedback",
        level: "L3",
        description:
          "Works within their team and with its business stakeholders to foster a culture of seeking out feedback and using it as a tool for growth. Proactively demonstrates these behaviours.",
      },
      {
        name: "Effective communication",
        level: "L3",
        description:
          "Always communicates effectively, clearly, concisely and in an audience-oriented way. Always communicates in written and verbal form of both technical and non-technical subjects, to their teammates. Always demonstrates the behaviours defined in the department's communication principles & guidelines.",
      },
      {
        name: "Knowledge Sharing",
        level: "L3",
        description:
          "Very often proactively shares their knowledge with their teammates and contributes to their team's documentation. Very often seeks opportunities to share knowledge, and helps teammates find opportunities to do the same.",
      },
      {
        name: "Teamwork",
        level: "L3",
        description:
          "Very often proactively helps their teammates overcome obstacles, resolve blockers, and complete work tasks. Very often gives or shares credit where due.",
      },
      {
        name: "Handling Disagreement",
        level: "L3",
        description:
          "Encourages their teammates to openly share their opinions and contribute to discussions in a respectful manner.",
      },
      {
        name: "Relationship Building",
        level: "L3",
        description: "Works to build strong relationships with their teammates, manager, as well as key stakeholders.",
      },
      {
        name: "Decision making",
        level: "L3",
        description:
          "Takes ownership of decisions made in their team by helping their teammates make clear decisions in alignment with organisational and departmental goals, backing decisions made, and taking responsibility for their success. Raises awareness for how biases impact decisions and ensures accountability is practiced within their team.",
      },
      // Strategic Impact
      {
        name: "Business Mission & Vision",
        level: "L3",
        description: "Understands the business mission and vision, and is able to link them departmental goals",
      },
      {
        name: "Department Mission & Vision",
        level: "L3",
        description:
          "Often contributes to improvements that enable the team to achieve the department mission and vision.",
      },
      {
        name: "Innovation",
        level: "L3",
        description:
          "Applies creative problem-solving to enhance systems and processes, prioritising measurable outcomes, collaborating with team members to experiment and prototype solutions, learning from results to refine ideas.",
      },
      {
        name: "Business Acumen",
        level: "L3",
        description:
          "Has a thorough understanding of their team's objectives, and how it contributes to overall business strategy.",
      },
      {
        name: "Strategic Work",
        level: "L3",
        description:
          "Understands the organisation's product and technology vision and strategy, as well as the departments ways of working vision.",
      },
      {
        name: "Product Thinking",
        level: "L3",
        description:
          "Thoroughly understands the business model in relation to their team's objectives. Often participates in roadmap feedback with the product team. Looks for opportunities to simplify product & technical design.",
      },
    ],
  },
  E4: {
    title: "Lead Engineer",
    level: "E4",
    salary: ["£80,000 - £110,000 (GBP) - UK, Hybrid", "£75,000 - £105,000 (GBP) - UK, Remote"],
    skills: [
      // Technical Skills
      {
        name: "Security",
        level: "L4",
        description:
          "Proactively works with key security stakeholders, as well as their own team, to refine their team's approach to security based on the organisation's security strategy. Fosters a security-first mindset within their own team, and leads by example.",
      },
      {
        name: "Debugging",
        level: "L4",
        description:
          "Expert at using systematic debugging to diagnose all issues located within the entire system context. Expert at systematic debugging to diagnose cross-component issues, sometimes with help from more senior engineers. Always supports other engineers with debugging.",
      },
      {
        name: "Observability",
        level: "L4",
        description:
          "Promotes and coaches of the organisation's observability philosophy. Helps tune and implement monitoring during development. Expert in observing operational data during the deployment of changes to the platform, and uses it as a basis for suggesting stability and performance improvements.",
      },
      {
        name: "Resolving",
        level: "L4",
        description:
          "Is able to design and implement resolutions for production bugs always without help from others. Very often ensures that fixes are aligned with technology vision.",
      },
      {
        name: "Writing Code",
        level: "L4",
        description:
          "Always writes production-ready code that is easily testable, easily understood by other engineers, and accounts for edge cases and errors. Very often drives the improvement of best practices.",
      },
      {
        name: "Language and Technologies Familiarity",
        level: "L4",
        description:
          "Strategically selects the best technology for any specific solution. Very often confidently share a deep understanding of their primary languages and technologies with others.",
      },
      {
        name: "Testing",
        level: "L4",
        description:
          "Fosters a culture of test first, ensure team understanding of testing approach, and uses quality metrics to identify gaps. Works with their team to recommend solutions that are in accordance with accepted testing frameworks and the testing pyramid.",
      },
      {
        name: "Reviewing Code",
        level: "L4",
        description:
          "Coaches and mentors others on improving their code review skills and approaches. Fosters a culture of thorough and constructive code reviews within the team.",
      },
      {
        name: "Software Architecture",
        level: "L4",
        description:
          "Always designs code that is aligned with the overall system context, contain architecture and technology vision, driving the improvement of defined architecture patterns and best practices. Can lead the collaborative design of a component's architecture, while enabling autonomy and empowering team's to design their own solutions, and producing a timely iterative delivery plan that enables incremental business value.",
      },
      {
        name: "Understanding Code (Understanding System Context)",
        level: "L4",
        description:
          "Has expertise in a one or more container. Understands the parts of the technology estate relevant to their team's objectives at a high level. Maintains a good understanding to work productively within the system context of current problem. Proactively coaches and teaches the system context to other engineers.",
      },
      // Delivery Skills
      {
        name: "Work Breakdown",
        level: "L4",
        description:
          "Always ensures work items are appropriately sized for continuous deployment and incremental delivery within the team. Very often coaches team members on breaking down tasks into smaller, manageable components for efficient, iterative delivery.",
      },
      {
        name: "Prioritisation and RAID",
        level: "L4",
        description:
          "Always takes responsibility for ensuring work items are prioritised correctly and worked on in the correct order. Using their expert domain knowledge helps teams understand risk, assumption, issues and dependence's.",
      },
      {
        name: "Dealing with Ambiguity",
        level: "L4",
        description:
          "Always handles risk, change, and uncertainty within the department. Always supports others in handing ambiguity and risk.",
      },
      {
        name: "Reliability, delivery accountability",
        level: "L4",
        description:
          "Anticipates and communicates blockers, delays, and cost ballooning for their team's current and planned future work, before they require escalation. Ensures expectations with their team and external stakeholders are clarified between all parties involved. Proactively performs root cause analysis on the cause of problems, and fosters a blameless culture that enables honesty and openness about the origin of issues, and enables their team to learn from past mistakes.",
      },
      {
        name: "Personal Organisation",
        level: "L4",
        description:
          "Always ensure their availability is communicated across the department. Always ensures that their teams availability is communicate across the team.",
      },
      {
        name: "Business value understanding",
        level: "L4",
        description:
          "When taking action, always weighs cost and value in order to make the most economic action. Uses this thinking in their own work, and to foster a culture within their team where people apply economic thinking to make timely decisions.",
      },
      // Communication & Collaboration
      {
        name: "Delivering Feedback",
        level: "L4",
        description:
          "Fosters a culture of delivering praise and constructive feedback within their team and team's respective business stakeholders. Proactively demonstrates these behaviours.",
      },
      {
        name: "Seeking/Receiving Feedback",
        level: "L4",
        description:
          "Works within their team and with its business stakeholders to foster a culture of seeking out feedback and using it as a tool for growth. Proactively demonstrates these behaviours.",
      },
      {
        name: "Effective communication",
        level: "L4",
        description:
          "Always communicates effectively, clearly, concisely and in an audience-oriented way with a diverse team and stakeholders. Fosters a culture of clear, concise, effective, audience-oriented communication on their team, ensuring teammates actively listen to others and are understood. Proactively demonstrates these behaviours. Pays attention to nonverbal communication.",
      },
      {
        name: "Knowledge Sharing",
        level: "L4",
        description:
          "Fosters a culture of documentation and knowledge sharing within their team and with their team's business stakeholders.",
      },
      {
        name: "Teamwork",
        level: "L4",
        description:
          "Fosters a culture of proactively helping team members to overcome obstacles, resolve blockers, and complete work tasks, as well as giving credit where due. Proactively demonstrates these behaviours. Coaches teammates in recognising and communicating blockers and impediments rapidly. Develops a trusting relationship with team members, encouraging them to request support.",
      },
      {
        name: "Handling Disagreement",
        level: "L4",
        description:
          "Fosters a culture within the department where people are encouraged to share their opinions and contribute to discussions in a respectful manner, approach disagreement non-defensively with inquisitiveness, and use contradictory opinions as a basis for constructive, productive conversations. Works through surface-level disagreements to expose the concerns of disagreeing voices and integrates these concerns into their perspective and plans.",
      },
      {
        name: "Relationship Building",
        level: "L4",
        description:
          "Works to build and improve strong relationships within the department, their manager, their teams' relevant business stakeholders, and staff across the organisation. Leverages relationships to enable effective design and planning within their team.",
      },
      {
        name: "Decision making",
        level: "L4",
        description:
          "Takes ownership of decisions made throughout the department by helping them make clear decisions in alignment with organisational goals, backing decisions made, and taking responsibility for their success. Raises awareness for how biases impact decisions and ensures accountability is practiced throughout the department. Demonstrates these behaviours themselves.",
      },
      // Strategic Impact
      {
        name: "Business Mission & Vision",
        level: "L4",
        description:
          "Understands the business mission and vision, is able to link them to departmental goals can understand how they effect the department strategy. Can make strategic decisions that enable progress towards the business mission and vision. Communicates and evangelises the business mission and vision.",
      },
      {
        name: "Department Mission & Vision",
        level: "L4",
        description:
          "Understands the department mission and vision, is able to link them to team goals and strategy. Can make strategic decisions that enable progress towards the department mission and vision. Communicates and evangelises the department mission and vision.",
      },
      {
        name: "Innovation",
        level: "L4",
        description:
          "Has a complete understanding of innovation processes and emerging technology trends, aligning innovative ideas with strategic objectives, ensuring practical application and measurable benefits. Proactively identifies opportunities to integrate new technologies into products or processes to enhance value, leveraging experimentation and iteration to drive impactful, future-ready solutions.",
      },
      {
        name: "Business Acumen",
        level: "L4",
        description: "Has a thorough understanding of the business domains, and the overall business strategy.",
      },
      {
        name: "Strategic Work",
        level: "L4",
        description:
          "Collaborates and decides on their team's engineering work based on organisation's engineering strategy, together with their teammates and peers. Often involved in work on organisational engineering strategy.",
      },
      {
        name: "Product Thinking",
        level: "L4",
        description:
          "Recognises product opportunities and differentiators in relation to the competition. Often helps refine roadmaps across teams based on technical strategy & constraints.",
      },
    ],
  },
  E5: {
    title: "Principal Engineer",
    level: "E5",
    salary: ["£110,000 - £150,000 (GBP) - UK, Hybrid", "£105,000 - £140,000 (GBP) - UK, Remote"],
    skills: [
      // Technical Skills
      {
        name: "Security",
        level: "L5",
        description:
          "Proactively works with key security stakeholders, as well as across all teams, to apply the organisation's security strategy. Fosters a security-first mindset across the whole department, leading by example. Proactively coaches and teaches best practice, ensuring that the department's understanding of security vulnerabilities and mitigations is always improving.",
      },
      {
        name: "Debugging",
        level: "L5",
        description:
          "Always defines and champions the organisation-wide security strategy with stakeholders. Always establishes security as a key pillar of engineering excellence in processes and workflows. Usually provides strategic direction for improving security posture, prioritising initiatives. Very often ensures cross-departmental alignment on security goals and fosters collaboration. Always leads by example in fostering a security-first mindset. Always equips engineering leaders to drive security initiatives, track progress, and address challenges. Assesses and drives improvements in the organisation's security readiness (very often).",
      },
      {
        name: "Observability",
        level: "L5",
        description:
          "Always defines and champions the organisation-wide observability strategy, aligning it with business goals and engineering principles. Usually collaborates with leadership to invest in observability tools, processes, and training. Very often promotes a culture of observability-first thinking by embedding it in engineering workflows and decision-making. Usually drives initiatives to improve observability, ensuring systems provide actionable insights into performance and reliability. Very often monitors and evaluates effectiveness of observability practices, using metrics and feedback for improvement. Always ensures observability is integral to engineering's contribution to business success, fostering alignment across teams.",
      },
      {
        name: "Resolving",
        level: "L5",
        description:
          "Always defines and promotes standards for resolving production bugs and technical challenges. Very often champions proactive problem-solving, encouraging systematic and efficient issue resolution. Usually monitors issue resolution metrics and drives initiatives to improve performance. Always aligns resolution efforts with the technology vision and long-term goals for stability and scalability. Very often acts as strategic escalation point for critical challenges, ensuring effective resource allocation. Usually drives continuous improvement by identifying patterns and fostering collaboration to address root causes.",
      },
      {
        name: "Writing Code",
        level: "L5",
        description:
          "Always defines and communicates expectations for coding standards and best practices across teams. Always champions a culture of technical excellence, encouraging efficient and maintainable code aligned with goals. Usually invests in tools, processes, and training to enhance high-quality code at scale. Very often monitors and evaluates coding practices, addressing systemic issues and driving improvements. Always provides strategic leadership in aligning coding practices with the organisation's technical vision. Advocates for balancing speed and quality, ensuring business needs are met without compromising standards (very often).",
      },
      {
        name: "Language and Technologies Familiarity",
        level: "L5",
        description:
          "Always defines and drives strategy for adopting and standardising programming languages and technologies across the organisation. Very often promotes a culture of adaptability, encouraging exploration of emerging technologies. Usually oversees evaluation and adoption of new languages and technologies, ensuring alignment with long-term goals. Usually facilitates knowledge sharing and skill-building initiatives for primary and emerging technologies. Very often balances cutting-edge technology adoption with maintainability, stability, and business alignment. Always acts as decision-maker for high-stakes technology choices impacting technical direction and scalability.",
      },
      {
        name: "Testing",
        level: "L5",
        description:
          "Always defines and drives testing strategy, aligning with business goals and engineering best practices. Very often establishes and monitors quality metrics, using them to guide decision-making and initiatives. Alwsays promotes a culture of testing excellence, ensuring testing is vital to engineering success. Usually facilitates collaboration across teams to share best practices, tools, and insights. Usually evaluates and adopts new testing frameworks to improve efficiency, coverage, and reliability. Always ensures testing strategies support scalability, performance, and resilience in large-scale systems.",
      },
      {
        name: "Reviewing Code",
        level: "L5",
        description:
          "Always defines and drives the organisational approach to code reviews, aligning them with engineering and business objectives always ensuring code review strategies support scalability, maintainability, and long-term reliability of systems. Very often establishes and monitors metrics to evaluate the effectiveness of code review practices and identify areas for improvement. Always promotes a culture of excellence in code quality, ensuring code reviews are integral to the engineering workflow. Usually facilitates collaboration across teams to share best practices and improve consistency in code review standards. Usually evaluates and adopts new tools, techniques, and frameworks to enhance code review efficiency and effectiveness.",
      },
      {
        name: "Software Architecture",
        level: "L5",
        description:
          "Always defines and communicates architectural vision aligned with strategic goals. Always oversees evolution of architecture patterns and best practices across teams. Very often ensures cross-departmental collaboration for scalable, maintainable, and performant solutions. Usually promotes architectural excellence and fosters innovation. Always balances technical needs and business priorities for incremental value delivery. Very often liaises with stakeholders to ensure architectural decisions are understood.",
      },
      {
        name: "Understanding Code (Understanding System Context)",
        level: "L5",
        description:
          "Maintains a deep understanding of the entire technology estate and system context, ensuring alignment with the organisation's mission, vision, and long-term goals Very often drives the development of processes, documentation, and best practices to ensure system context is consistently understood across the engineering organisation. Often promotes a culture of continuous learning and knowledge-sharing, encouraging team members to enhance their understanding of system context. Usually collaborates with leadership to identify strategic opportunities for system improvements and optimisations, ensuring decisions are made with a comprehensive understanding of the technology estate. Vey often provides ongoing guidance to ensure teams' work aligns with the broader system context, enabling scalable, reliable solutions that support business objectives.",
      },
      // Delivery Skills
      {
        name: "Work Breakdown",
        level: "L5",
        description:
          "Always sets the vision and standards for task decomposition, aligning teams with company goals and breaking down large projects. Very often drives the adoption of continuous deployment and incremental delivery, ensuring complex projects are effectively decomposed. Very often mentors senior leaders on best practices for work breakdown, ensuring alignment with business objectives. Always ensures cross-team work breakdowns align, reducing interdependencies and ensuring a common goal. Always refines task decomposition strategies at the strategic level, optimizing efficiency and collaboration.",
      },
      {
        name: "Prioritisation and RAID",
        level: "L5",
        description:
          "Always leads prioritisation of work, ensuring alignment with strategic goals, resource allocation, and business needs. Always makes final decisions on project prioritisation, ensuring engineering work aligns with company goals. Very often fosters a proactive RAID management culture, tracking and addressing risks, assumptions, issues, and dependencies. Always provides guidance to senior leaders on balancing innovation, delivery, and long-term business goals. Very often coaches teams on managing RAID elements to support strategic objectives and remove delivery obstacles.",
      },
      {
        name: "Dealing with Ambiguity",
        level: "L5",
        description:
          "Always leads the engineering organisation in managing ambiguity, ensuring both strategic direction and tactical actions adapt to shifting business needs and incomplete information. Always supports leadership and the department in navigating ambiguity, mitigating risks, and providing clarity on decisions impacting organisational goals. Very often fosters a culture of adaptability, empowering engineers at all levels to make decisions and handle uncertainty. Always promotes resilience in decision-making, helping teams achieve results despite significant ambiguity or pressure.",
      },
      {
        name: "Reliability, delivery accountability",
        level: "L5",
        description:
          "Always ensures high-quality work delivery across the engineering department, aligning commitments with organizational goals. Always anticipates blockers and resource needs at the department level, proactively addressing issues and communicating them to leadership. Always collaborates with business stakeholders to clarify expectations and align engineering efforts with business priorities. Always fosters a culture of delivery accountability, ensuring both managers and team members take ownership and learn from past challenges. Very often drives continuous improvement by conducting root cause analysis of delivery challenges and improving delivery processes.",
      },
      {
        name: "Personal Organisation",
        level: "L5",
        description:
          "Leads with strong personal organisation, ensuring clear communication of availability and priorities across the department. Champions organisational excellence, aligning departmental goals with business priorities. Collaborates with senior leaders to balance workloads and prioritise projects. Ensures teams have the resources needed to meet deadlines and overcome challenges. Promotes time and resource management practices to align productivity with long-term goals.",
      },
      {
        name: "Business value understanding",
        level: "L5",
        description:
          "Leads the engineering department by aligning all decisions with business value, ensuring contributions directly support company goals. Drives strategic alignment between engineering efforts and organizational priorities, optimizing resources for business impact. Defines and communicates the business value of engineering initiatives to maintain alignment with stakeholders and the department. Champions a culture where engineers understand their impact on company goals and make business-driven decisions. Collaborates with department heads to ensure engineering decisions balance innovation, cost, and value, supporting the company's long-term vision.",
      },
      // Communication & Collaboration
      {
        name: "Delivering Feedback",
        level: "L5",
        description:
          "Leads the department in delivering consistent, actionable feedback aligned with business goals, fostering growth. Champions feedback integration into team and organizational processes, driving continuous improvement. Uses feedback for coaching and development, helping teams understand alignment with strategic goals and areas for improvement. Supports managers and leaders in delivering effective feedback by providing tools and frameworks. Promotes a culture of openness by ensuring feedback is collected, acted upon, and shared across all levels.",
      },
      {
        name: "Seeking/Receiving Feedback",
        level: "L5",
        description:
          "Always seeks feedback from senior leadership, peers, and teams to improve leadership strategies and departmental goals. Very often champions a culture of feedback across the department, ensuring it is integral to improving performance. Always leads by example in seeking constructive feedback and working on areas for improvement. Very often establishes clear processes for gathering feedback at all levels to improve technical and leadership performance. Always fosters open communication across the engineering function, ensuring feedback drives continuous development.",
      },
      {
        name: "Effective communication",
        level: "L5",
        description:
          "Always champions effective communication, ensuring both technical and non-technical communication is clear and audience-appropriate. Very often drives development and enforcement of communication best practices, ensuring consistency in messaging and decision-making. Very often proactively addresses communication challenges, ensuring alignment with organizational goals and efficient communication across teams. Always engages with executives, departments, and stakeholders, ensuring strategic information aligns with business objectives. Always promotes a culture of transparency, active listening, and open dialogue between teams and leadership.",
      },
      {
        name: "Knowledge Sharing",
        level: "L5",
        description:
          "Always champions knowledge sharing across the department and ensures no silos of expertise. Very often implements best practices for documenting technical and business knowledge. Very often drives knowledge-sharing initiatives within engineering and across departments. Always oversees and evolves technical and business documentation. Very often facilitates inter-team knowledge sharing through events and discussions.",
      },
      {
        name: "Teamwork",
        level: "L5",
        description:
          "Always champions collaboration across the engineering department, breaking down silos to foster cross-team alignment. Very often promotes a supportive culture by addressing obstacles and ensuring resources are effectively allocated for project success. Always takes responsibility for recognising and celebrating department-wide achievements, ensuring contributions are acknowledged across teams. Very often mentors senior leaders on fostering teamwork, proactively removing obstacles, and facilitating communication across teams. Always works to establish high trust and transparency, creating an environment where team members feel supported and can collaborate on shared goals.",
      },
      {
        name: "Handling Disagreement",
        level: "L5",
        description:
          "Always promotes a culture of respectful disagreement, viewing differing opinions as valuable contributions. Very often leads in addressing conflicts at all levels, ensuring resolution aligns with organisational goals and values. Very often facilitates difficult conversations, resolving underlying issues constructively. Always encourages transparency and open dialogue to address concerns early. Very often balances differing perspectives to maintain team alignment while enabling diverse viewpoints in decision-making.",
      },
      {
        name: "Relationship Building",
        level: "L5",
        description:
          "Always cultivates strong, strategic relationships across all organisational levels and stakeholders. Very often uses relationships to drive alignment between engineering and other departments. Very often leverages their network to influence business decisions and align engineering initiatives with the overall strategy. Often encourages open and transparent communication to foster collaboration and trust. Often maintains positive, productive relationships to facilitate execution of strategic initiatives.",
      },
      {
        name: "Decision making",
        level: "L5",
        description:
          "Always leads decision-making across the entire engineering organisation, ensuring that decisions made at all levels align with the company's long-term goals, vision, and strategy. Very often demonstrates ownership and accountability in major departmental decisions, ensuring the entire engineering department is working towards shared outcomes. Very often promotes a culture of sound decision-making throughout the department by setting clear expectations, providing guidance, and encouraging engineers at all levels to make well-informed, data-driven choices. Often actively works to identify and address decision-making biases across the department, ensuring that all team leaders and engineers understand their impact and adopt practices that minimise bias. Always holds the department accountable for the outcomes of decisions, fostering transparency and learning from both successes and mistakes to continuously improve decision-making practices.",
      },
      {
        name: "Driving Alignment",
        level: "L5",
        description:
          "Always champions alignment across all engineering teams and departments, ensuring that each team's goals contribute to the broader organisational strategy and objectives. Always leads the alignment process at the highest level, ensuring that the engineering department is aligned with the business's long-term vision, strategy, and priorities. Very often engages with senior leadership to align engineering efforts with other departments (e.g., product, marketing, sales) to ensure cross-functional collaboration and resource allocation. Very often ensures that strategic goals are communicated clearly to the engineering teams and fosters a culture of alignment across the entire department.",
      },
      {
        name: "Process thinking",
        level: "L5",
        description:
          "Always takes a strategic view of engineering processes across the entire department, ensuring that workflows align with the organisation's long-term objectives. Very often drives initiatives to standardise processes across teams, identifying areas for optimisation that contribute to scalability, consistency, and quality. Very often leads efforts to refine and improve engineering practices at the departmental level, ensuring that processes are continuously evaluated and optimised. Very often collaborates with senior leadership to ensure that process improvements align with business goals, and champions a culture of efficiency and continuous improvement throughout the organisation.",
      },
      {
        name: "Facilitation",
        level: "L5",
        description:
          "Very often facilitates leadership-level meetings, ensuring alignment between engineering teams and organisational strategy while driving forward company decisions. Often fosters an environment where diverse perspectives are valued, ensuring all key stakeholders are included in discussions. Very often guides executive and strategic conversations, ensuring long-term goals are clearly communicated and understood. Always leads high-stakes decision-making sessions, ensuring clear action plans are developed with full buy-in from involved parties.",
      },
      {
        name: "Mentoring",
        level: "L5",
        description:
          "Always actively mentors engineering leaders, offering high-level career guidance, leadership development, and strategic insights to align with departmental and organisational goals. Always champions the role of mentoring across the engineering organisation, establishing a culture where mentoring is integral to career progression and leadership development. Very often proactively works with senior leaders to ensure that mentoring opportunities align with long-term departmental and organisational objectives, including succession planning and redundancy. Always encourages mentoring relationships that foster innovation, team collaboration, and skill development, enhancing the entire engineering department.",
      },
      // Strategic Impact
      {
        name: "Business Mission & Vision",
        level: "L5",
        description:
          "Demonstrates deep understanding of the business mission and vision, linking them to the department's strategy and ensuring engineering initiatives align with company goals. Always leads the development of engineering strategies that contribute directly to the organisation's business objectives. Very often drives communication of the business mission and vision across engineering teams, fostering a shared sense of purpose and ensuring alignment with long-term success. Always makes high-level strategic decisions, balancing short-term execution with long-term innovation, while keeping the business mission and vision central to decision-making.",
      },
      {
        name: "Department Mission & Vision",
        level: "L5",
        description:
          "Deeply understands business strategy and the role of engineering in achieving company goals. Always partners with executive leadership to align engineering with the company's long-term vision. Always balances technical feasibility with business objectives, ensuring engineering efforts drive measurable value. Very often drives engineering initiatives that contribute to financial success, customer satisfaction, and competitive advantage. Often monitors market trends and adapts engineering efforts to seize new opportunities.",
      },
      {
        name: "Innovation",
        level: "L5",
        description:
          "Always defines and drives the organisational approach to innovation, ensuring it aligns with business objectives and engineering best practices, ensuring innovation strategies support scalability, resilience, and long-term business and customer impact. Very often establishes and monitors metrics to evaluate the impact of innovation initiatives, guiding decision-making and prioritisation. Always promotes a culture of innovation excellence, ensuring creativity and experimentation are integral to engineering success. Usually facilitates collaboration across teams and disciplines to share insights, best practices, and resources for innovation. Usually evaluates and adopts new frameworks, methodologies, and tools to enhance innovation efficiency and effectiveness.",
      },
      {
        name: "Business Acumen",
        level: "L5",
        description:
          "Has a deep understanding of business domains and how engineering supports strategic objectives. Very often partners with executive leadership to ensure engineering aligns with the company's long-term vision. Always guides decisions that balance technical feasibility with business objectives for measurable value. Very often drives engineering initiatives that contribute to financial success, customer satisfaction, and market positioning. Always monitors business trends and ensures engineering adapts to new strategic opportunities.",
      },
      {
        name: "Strategic Work",
        level: "L5",
        description:
          "Always defines and drives engineering strategy, aligning with long-term vision and business goals to support growth and innovation. Very often collaborates with executive leadership to ensure engineering efforts align with company strategy. Always oversees development of technical and organisational strategies, optimising resources to support company objectives. Very often identifies emerging trends and technologies, positioning the team to leverage them for competitive advantage. Always proactively addresses gaps in capabilities, ensuring the team is prepared for future growth.",
      },
      {
        name: "Product Thinking",
        level: "L5",
        description:
          "Always drives alignment between engineering and product vision to enhance competitive position. Very often collaborates with executive stakeholders, product leadership, and other departments to identify opportunities for differentiation and growth. Alays champions a product-thinking mindset across engineering, ensuring understanding of user, business, and market context. Very often provides strategic guidance to ensure roadmaps are balanced, feasible, and aligned with product and business goals. Usually evaluates emerging technologies to drive innovation and competitive advantages.",
      },
    ],
  },
}

interface PageProps {
  params: {
    slug: string
  }
}

export default function DepartmentPage({ params }: PageProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"positions" | "framework" | "skills">("positions")
  const [isAdmin, setIsAdmin] = useState(false)

  // Check admin status on client side
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // In demo mode, show admin button
        if (process.env.NODE_ENV === "development") {
          setIsAdmin(true)
        } else {
          // Try to check session via API call
          const response = await fetch("/api/auth/session")
          if (response.ok) {
            const data = await response.json()
            setIsAdmin(data.user?.role === "admin")
          }
        }
      } catch (error) {
        // Silently fail - user is not admin
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [])

  const department = departmentRoles[params.slug as keyof typeof departmentRoles]

  const handleRoleClick = (roleId: string) => {
    setSelectedRole(roleId)
    setIsModalOpen(true)
  }

  if (!department) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Department not found</h1>
          <Link href="/" className="text-amber-700 hover:text-amber-800">
            ← Back to departments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-amber-900 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-amber-900 font-bold text-xs">HS1</span>
              </div>
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-white text-sm">/ {department.name}</span>
            </div>
            {/* Admin Button - only show for admin users */}
            {isAdmin && (
              <Link
                href="/admin"
                className="ml-auto bg-amber-100 text-amber-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-amber-200 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-6 py-3">
            <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <div className="flex gap-6">
              <div className="text-white text-xs opacity-75">{"Career Progression"}</div>
              <div className="flex gap-6">
                <button
                  className={`px-3 py-2 text-sm font-medium ${activeTab === "positions" ? "text-amber-700 border-b-2 border-amber-700" : "text-gray-600 hover:text-gray-800"}`}
                  onClick={() => setActiveTab("positions")}
                >
                  📋 Positions
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium ${activeTab === "framework" ? "text-amber-700 border-b-2 border-amber-700" : "text-gray-600 hover:text-gray-800"}`}
                  onClick={() => setActiveTab("framework")}
                >
                  🏗️ Framework
                </button>
                <button
                  className={`px-3 py-2 text-sm font-medium ${activeTab === "skills" ? "text-amber-700 border-b-2 border-amber-700" : "text-gray-600 hover:text-gray-800"}`}
                  onClick={() => setActiveTab("skills")}
                >
                  🛠️ Skills
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "positions" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {department.name} <span className="text-gray-500">{department.totalPositions}</span>
              </h1>
            </div>

            {department.roles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {department.roles.map((role) => (
                  <div
                    key={role.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleRoleClick(role.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          {role.id} • {role.skills} skills
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{role.name}</h3>
                    <div className="h-32 bg-gray-50 rounded border-2 border-dashed border-gray-200"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No positions available</div>
                <div className="text-gray-500 text-sm">This department currently has no open positions.</div>
              </div>
            )}
          </>
        )}

        {activeTab === "framework" && (
          <div className="space-y-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {department.name} ({department.totalPositions})
              </h1>
            </div>

            {/* Role Headers */}
            <div className="grid grid-cols-6 gap-4 mb-8">
              <div></div> {/* Empty cell for skill names column */}
              {department.roles.map((role) => (
                <div key={role.id} className="text-center">
                  <div className="text-sm text-gray-500 mb-1">{role.id}</div>
                  <div className="font-semibold text-lg mb-3">{role.name}</div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full border-4 border-amber-200 mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Skills Framework Table */}
            {skillsFramework[params.slug as keyof typeof skillsFramework] && (
              <div className="space-y-8">
                {skillsFramework[params.slug as keyof typeof skillsFramework].categories.map(
                  (category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">{category.name}</h3>

                      {category.skills.map((skill, skillIndex) => (
                        <div
                          key={skillIndex}
                          className="grid grid-cols-6 gap-4 mb-8 bg-white rounded-lg border border-gray-200"
                        >
                          {/* Skill Name */}
                          <div className="bg-gray-50 p-4 font-medium text-gray-900 flex items-start">{skill.name}</div>

                          {/* Skill Levels */}
                          {skill.levels.map((level, levelIndex) => (
                            <div key={levelIndex} className="p-4 border-l border-gray-200">
                              {/* Proficiency Dots */}
                              <div className="flex gap-1 mb-3">
                                {Array.from({ length: 5 }, (_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${i <= levelIndex ? "bg-red-500" : "bg-gray-200"}`}
                                  />
                                ))}
                              </div>

                              {/* Description */}
                              <p className="text-sm text-gray-600 leading-relaxed">{level}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "skills" && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Skills View</div>
            <div className="text-gray-500 text-sm">Skills management interface coming soon.</div>
          </div>
        )}
      </div>

      {/* Role Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>
                {"HS1 🚀 "}
                {department.name}
                {": "}
                {selectedRole}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedRole && roleDetails[selectedRole] && (
            <div className="space-y-6">
              {/* Role Header */}
              <div>
                <Badge variant="outline" className="mb-2">
                  {selectedRole}
                </Badge>
                <h2 className="text-2xl font-bold">{roleDetails[selectedRole].title}</h2>
              </div>

              {/* Salary Section */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Salary</h3>
                <div className="space-y-2">
                  {roleDetails[selectedRole].salary.map((salary: string, index: number) => (
                    <div key={index} className="text-gray-700">
                      {salary}
                    </div>
                  ))}
                </div>
                <button className="text-amber-700 hover:text-amber-800 text-sm mt-2 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Open as page
                </button>
              </div>

              {/* Skills Grouped by Categories */}
              <div className="space-y-6">
                {/* Technical Skills */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-700 border-b border-blue-200 pb-2">
                    Technical Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleDetails[selectedRole].skills
                      .filter((skill: any) =>
                        [
                          "Security",
                          "Debugging",
                          "Observability",
                          "Resolving",
                          "Writing Code",
                          "Language and Technologies Familiarity",
                          "Testing",
                          "Reviewing Code",
                          "Software Architecture",
                          "Understanding Code (Understanding System Context)",
                        ].includes(skill.name),
                      )
                      .map((skill: any, index: number) => (
                        <div key={index} className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-blue-900">{skill.name}</span>
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700">
                              {skill.level}
                            </Badge>
                            {skill.level !== "N/A" && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          </div>
                          <p className="text-blue-800 text-sm">{skill.description}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-green-700 border-b border-green-200 pb-2">Delivery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleDetails[selectedRole].skills
                      .filter((skill: any) =>
                        [
                          "Work Breakdown",
                          "Prioritisation and RAID",
                          "Dealing with Ambiguity",
                          "Reliability, delivery accountability",
                          "Personal Organisation",
                          "Business value understanding",
                        ].includes(skill.name),
                      )
                      .map((skill: any, index: number) => (
                        <div key={index} className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-green-900">{skill.name}</span>
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                              {skill.level}
                            </Badge>
                            {skill.level !== "N/A" && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                          </div>
                          <p className="text-green-800 text-sm">{skill.description}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Feedback, Communication & Collaboration */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-purple-700 border-b border-purple-200 pb-2">
                    Feedback, Communication & Collaboration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleDetails[selectedRole].skills
                      .filter((skill: any) =>
                        [
                          "Delivering Feedback",
                          "Seeking/Receiving Feedback",
                          "Effective communication",
                          "Knowledge Sharing",
                          "Teamwork",
                          "Handling Disagreement",
                          "Relationship Building",
                          "Decision making",
                        ].includes(skill.name),
                      )
                      .map((skill: any, index: number) => (
                        <div key={index} className="bg-purple-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-purple-900">{skill.name}</span>
                            <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                              {skill.level}
                            </Badge>
                            {skill.level !== "N/A" && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                          </div>
                          <p className="text-purple-800 text-sm">{skill.description}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Leadership */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-indigo-700 border-b border-indigo-200 pb-2">
                    Leadership
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleDetails[selectedRole].skills
                      .filter((skill: any) =>
                        ["Driving Alignment", "Process thinking", "Facilitation", "Mentoring"].includes(skill.name),
                      )
                      .map((skill: any, index: number) => (
                        <div key={index} className="bg-indigo-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-indigo-900">{skill.name}</span>
                            <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700">
                              {skill.level}
                            </Badge>
                            {skill.level !== "N/A" && <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>}
                          </div>
                          <p className="text-indigo-800 text-sm">{skill.description}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Strategic Impact */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-orange-700 border-b border-orange-200 pb-2">
                    Strategic Impact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleDetails[selectedRole].skills
                      .filter((skill: any) =>
                        [
                          "Business Mission & Vision",
                          "Department Mission & Vision",
                          "Innovation",
                          "Business Acumen",
                          "Strategic Work",
                          "Product Thinking",
                        ].includes(skill.name),
                      )
                      .map((skill: any, index: number) => (
                        <div key={index} className="bg-orange-50 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-orange-900">{skill.name}</span>
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
                              {skill.level}
                            </Badge>
                            {skill.level !== "N/A" && <div className="w-2 h-2 bg-orange-500 rounded-full"></div>}
                          </div>
                          <p className="text-orange-800 text-sm">{skill.description}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
