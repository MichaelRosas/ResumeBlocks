import type { ResumeBlock, ResumePreset, ResumeProfile } from '../types.js'
import { standardFormatting } from '../formatting.js'

export const samplePresetIds = ['sample-general', 'sample-frontend'] as const

// Loaded explicitly so new workspaces can still start empty.
export function createSampleData(): { blocks: ResumeBlock[]; profile: ResumeProfile; presets: ResumePreset[] } {
  const profile: ResumeProfile = {
    name: 'Alex Morgan', headline: 'Computer Science Student', email: 'alex.morgan@example.com',
    location: 'Chicago, IL', website: 'alexmorgan.example.com',
  }
  const blocks: ResumeBlock[] = [
    {
      id: 'sample-education', type: 'education', title: 'B.S. in Computer Science',
      subtitle: 'University of Illinois Chicago', date: 'Expected May 2027',
      bullets: ['Relevant coursework: Data Structures, Software Engineering, Human–Computer Interaction'],
    },
    {
      id: 'sample-internship', type: 'experience', title: 'Software Engineering Intern',
      subtitle: 'Northstar Studio · Chicago, IL', date: 'May – Aug 2026',
      bullets: [
        'Built reusable React components for an internal dashboard used by the operations team.',
        'Worked with designers and engineers to improve navigation and resolve interface bugs.',
        'Added automated tests for API endpoints and documented the team’s development workflow.',
      ],
    },
    {
      id: 'sample-campus', type: 'project', title: 'Campus Connect', subtitle: 'React · TypeScript · Node.js', date: '2026',
      bullets: [
        'Created a web app that helps students discover campus events and organize their favorites.',
        'Designed a responsive interface and refined the experience through usability testing.',
      ],
    },
    {
      id: 'sample-tasks', type: 'project', title: 'Task Tracker', subtitle: 'Python · Flask · SQLite', date: '2025',
      bullets: [
        'Developed a task management app with filtering, due dates, and persistent storage.',
        'Implemented REST endpoints to create, update, and organize tasks.',
      ],
    },
    {
      id: 'sample-pathfinder', type: 'project', title: 'Pathfinding Visualizer', subtitle: 'C++ · Algorithms', date: '2025',
      bullets: [
        'Built an interactive visualization of breadth-first search and Dijkstra’s algorithm.',
        'Compared routes across configurable grids with obstacles and weighted paths.',
      ],
    },
    {
      id: 'sample-skills', type: 'skills', title: 'Technical Skills', subtitle: 'Languages, frameworks & tools',
      bullets: [
        'Languages: JavaScript, TypeScript, Python, C++, HTML, CSS, SQL',
        'Frameworks & tools: React, Node.js, Flask, Git, Figma',
      ],
    },
  ]
  function select(ids: string[]): ResumeBlock[] {
    return ids.flatMap((id) => {
      const block = blocks.find((item) => item.id === id)
      return block ? [{ ...block, bullets: [...block.bullets] }] : []
    })
  }
  const presets: ResumePreset[] = [
    {
      id: samplePresetIds[0], name: 'Sample general resume', description: 'Fictional student resume',
      blocks: select(['sample-education', 'sample-internship', 'sample-campus', 'sample-tasks', 'sample-skills']),
      profile: { ...profile }, formatting: { ...standardFormatting },
    },
    {
      id: samplePresetIds[1], name: 'Sample front-end resume', description: 'Alternate content and formatting',
      blocks: select(['sample-education', 'sample-internship', 'sample-campus', 'sample-skills']),
      profile: { ...profile }, formatting: { ...standardFormatting, font: 'arial', fontSize: 10.5, pageMargin: 0.65, headerAlignment: 'left' },
    },
  ]
  return { blocks, profile, presets }
}
