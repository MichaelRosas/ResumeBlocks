import type { ResumeBlock, ResumePreset, ResumeProfile } from '../types'

// Fictional content for the initial builder preview.
export const sampleProfile: ResumeProfile = {
  name: 'Alex Morgan',
  headline: 'Computer Science Student',
  email: 'alex.morgan@example.com',
  location: 'Chicago, IL',
  website: 'github.com/alexmorgan-demo',
}

export const sampleBlocks: ResumeBlock[] = [
  {
    id: 'education-uic',
    type: 'education',
    title: 'B.S. in Computer Science',
    subtitle: 'University of Illinois Chicago',
    date: 'Expected May 2027',
    bullets: ['Relevant coursework: Data Structures, Software Engineering, Human–Computer Interaction'],
  },
  {
    id: 'experience-internship',
    type: 'experience',
    title: 'Software Engineering Intern',
    subtitle: 'Northstar Studio · Chicago, IL',
    date: 'May – Aug 2026',
    bullets: [
      'Built reusable React components for an internal dashboard used by the operations team.',
      'Worked with designers and engineers to improve navigation and resolve interface bugs.',
      'Added automated tests for API endpoints and documented the team’s development workflow.',
    ],
  },
  {
    id: 'project-campus',
    type: 'project',
    title: 'Campus Connect',
    subtitle: 'React · TypeScript · Node.js',
    date: '2026',
    bullets: [
      'Created a web app that helps students discover campus events and organize their favorites.',
      'Designed a responsive interface and refined the experience through usability testing.',
    ],
  },
  {
    id: 'project-tasks',
    type: 'project',
    title: 'Task Tracker',
    subtitle: 'Python · Flask · SQLite',
    date: '2025',
    bullets: [
      'Developed a task management app with filtering, due dates, and persistent storage.',
      'Implemented REST endpoints to create, update, and organize tasks.',
    ],
  },
  {
    id: 'project-pathfinder',
    type: 'project',
    title: 'Pathfinding Visualizer',
    subtitle: 'C++ · Algorithms',
    date: '2025',
    bullets: [
      'Built an interactive visualization of breadth-first search and Dijkstra’s algorithm.',
      'Compared routes across configurable grids with obstacles and weighted paths.',
    ],
  },
  {
    id: 'skills-technical',
    type: 'skills',
    title: 'Technical Skills',
    subtitle: 'Languages, frameworks & tools',
    bullets: [
      'Languages: JavaScript, TypeScript, Python, C++, HTML, CSS, SQL',
      'Frameworks & tools: React, Node.js, Flask, Git, Figma',
    ],
  },
]

export const samplePresets: ResumePreset[] = [
  {
    id: 'general',
    name: 'General resume',
    description: 'A little of everything',
    blockIds: ['education-uic', 'experience-internship', 'project-campus', 'project-tasks', 'skills-technical'],
  },
  {
    id: 'frontend',
    name: 'Front-end internship',
    description: 'React & interface design',
    blockIds: ['education-uic', 'experience-internship', 'project-campus', 'skills-technical'],
  },
].map(({ blockIds, ...preset }) => ({
  ...preset,
  blocks: blockIds.flatMap((id) => {
    const block = sampleBlocks.find((item) => item.id === id)
    return block ? [{ ...block, bullets: [...block.bullets] }] : []
  }),
  profile: { ...sampleProfile },
  compact: false,
}))
