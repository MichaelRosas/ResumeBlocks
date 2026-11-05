import type { ResumeBlock, ResumeProfile } from '../types'
import { blockLabels } from '../types'
import { Icon } from './Icon'

interface ResumePreviewProps {
  profile: ResumeProfile
  blocks: ResumeBlock[]
  compact: boolean
  onRemoveBlock: (id: string) => void
}

export function ResumePreview({ profile, blocks, compact, onRemoveBlock }: ResumePreviewProps) {
  return (
    <article className={`resume-page ${compact ? 'is-compact' : ''}`} aria-label="Resume preview">
      <header className="resume-header">
        <h2>{profile.name}</h2>
        {profile.headline && <p className="resume-headline">{profile.headline}</p>}
        {[profile.email, profile.location, profile.website].some(Boolean) && (
          <p className="resume-contact">
            {[profile.email, profile.location, profile.website].filter(Boolean).map((contact, index) => <span key={index}>{contact}</span>)}
          </p>
        )}
      </header>
      {(['education', 'experience', 'project', 'skills'] as const).map((type) => {
        const sectionBlocks = blocks.filter((block) => block.type === type)
        if (sectionBlocks.length === 0) return null
        return (
          <section className="resume-section" key={type} aria-label={blockLabels[type]}>
            <h3>{blockLabels[type]}</h3>
            {sectionBlocks.map((block) => (
              <div className="resume-block" key={block.id}>
                <button className="remove-block" type="button" onClick={() => onRemoveBlock(block.id)} aria-label={`Remove ${block.title} from resume`} title="Remove from resume; keep in library"><Icon name="close" size={13} /></button>
                <div className="resume-block-heading"><h4>{block.title}</h4>{block.date && <span>{block.date}</span>}</div>
                {type !== 'skills' && block.subtitle && <p className="resume-subtitle">{block.subtitle}</p>}
                {type === 'skills'
                  ? <div className="resume-skills">{block.bullets.map((bullet, index) => <p key={index}>{bullet}</p>)}</div>
                  : block.bullets.length > 0 && <ul>{block.bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}</ul>}
              </div>
            ))}
          </section>
        )
      })}
      {blocks.length === 0 && <div className="empty-resume"><Icon name="blocks" size={32} /><h3>Start with a building block.</h3><p>Choose an experience, project, or skill from your library to add it here.</p></div>}
    </article>
  )
}
