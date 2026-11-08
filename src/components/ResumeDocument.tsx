import type { Ref } from 'react'
import type { ResumeBlock, ResumeProfile } from '../types'
import { blockLabels } from '../types'

export function ResumeHeader({ profile }: { profile: ResumeProfile }) {
  const contacts = [profile.email, profile.location, profile.website].filter(Boolean)
  return (
    <header className="resume-header">
      <h2>{profile.name}</h2>
      {profile.headline && <p className="resume-headline">{profile.headline}</p>}
      {contacts.length > 0 && <p className="resume-contact">{contacts.map((contact, index) => <span key={index}>{contact}</span>)}</p>}
    </header>
  )
}

export function ResumeBlockContent({ block }: { block: ResumeBlock }) {
  return (
    <>
      <div className="resume-block-heading"><h4>{block.title}</h4>{block.date && <span>{block.date}</span>}</div>
      {block.type !== 'skills' && block.subtitle && <p className="resume-subtitle">{block.subtitle}</p>}
      {block.type === 'skills'
        ? <div className="resume-skills">{block.bullets.map((bullet, index) => <p key={index}>{bullet}</p>)}</div>
        : block.bullets.length > 0 && <ul>{block.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}
    </>
  )
}

export function ResumeDocument({ profile, blocks, compact, elementRef }: {
  profile: ResumeProfile
  blocks: ResumeBlock[]
  compact: boolean
  elementRef?: Ref<HTMLElement>
}) {
  return (
    <article ref={elementRef} className={`resume-document ${compact ? 'is-compact' : ''}`} aria-label="Printable resume">
      <ResumeHeader profile={profile} />
      {(['education', 'experience', 'project', 'skills'] as const).map((type) => {
        const sectionBlocks = blocks.filter((block) => block.type === type)
        if (!sectionBlocks.length) return null
        return <section key={type} className="resume-section">
          <h3>{blockLabels[type]}</h3>
          {sectionBlocks.map((block) => <div className="resume-block" key={block.id}><ResumeBlockContent block={block} /></div>)}
        </section>
      })}
    </article>
  )
}
