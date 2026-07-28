import { useEffect, useMemo, useRef, useState } from 'react'
import artworks from './data/artworks.json'
import './App.css'

const selectedWorks = artworks
  .filter((work) => work.featured)
  .sort((a, b) => a.featuredRank - b.featuredRank)

function formatNumber(value) {
  return String(value).padStart(2, '0')
}

function ImageWithState({ src, alt, className = '', ...props }) {
  const [state, setState] = useState('loading')

  return (
    <span className={`image-shell image-shell--${state} ${className}`.trim()}>
      {state === 'loading' && <span className="image-message">Loading image</span>}
      {state === 'error' && <span className="image-message">Image unavailable</span>}
      <img
        src={src}
        alt={alt}
        onLoad={() => setState('ready')}
        onError={() => setState('error')}
        {...props}
      />
    </span>
  )
}

function CatalogueLine({ work }) {
  const facts = [work.archiveNumber, work.material, work.dimensions].filter(Boolean)

  return (
    <span className="catalogue-line">
      {facts.map((fact) => <span key={fact}>{fact}</span>)}
    </span>
  )
}

function FeaturedWork({ work, index, onOpen }) {
  const rank = index + 1
  const composition = ['platform', 'offset', 'study'][index % 3]
  const landscapeDetail = work.images.find((image, imageIndex) => (
    imageIndex > 0 && image.width / image.height > 1.15
  ))
  const fallbackDetailIndex = index === 0
    ? Math.min(10, work.images.length - 1)
    : Math.min(2, work.images.length - 1)
  const detailImage = landscapeDetail || work.images[fallbackDetailIndex]

  return (
    <article className={`feature-work feature-work--${rank} feature-work--${composition}`}>
      <button
        type="button"
        className="feature-work__image-button"
        onClick={() => onOpen(work.id)}
        aria-label={`Open ${work.title}`}
      >
        <ImageWithState
          className="feature-work__image"
          src={work.images[0].src}
          alt={work.images[0].alt}
          width={work.images[0].width}
          height={work.images[0].height}
          loading="lazy"
        />
        <span className="feature-work__open">{work.imageCount} photographs</span>
      </button>
      <div className="feature-work__record">
        <p className="feature-work__sequence">Selected {formatNumber(rank)}</p>
        <h3>{work.title}</h3>
        <CatalogueLine work={work} />
        <p className="feature-work__observation">{work.prototypeText}</p>
        <button type="button" className="text-link" onClick={() => onOpen(work.id)}>
          Open record
        </button>
      </div>
      {detailImage && (
        <figure className="feature-work__detail">
          <ImageWithState
            src={detailImage.src}
            alt={detailImage.alt}
            width={detailImage.width}
            height={detailImage.height}
            loading="lazy"
          />
          <figcaption>Detail from the supplied photographic record</figcaption>
        </figure>
      )}
    </article>
  )
}

function ArchiveCard({ work, index, onOpen }) {
  return (
    <article className="archive-card">
      <button type="button" onClick={() => onOpen(work.id)} aria-label={`Open ${work.title}`}>
        <ImageWithState
          className="archive-card__image"
          src={work.images[0].thumb}
          alt={work.images[0].alt}
          width={work.images[0].width}
          height={work.images[0].height}
          loading={index < 8 ? 'eager' : 'lazy'}
        />
        <span className="archive-card__caption">
          <span className="archive-card__number">{work.archiveNumber}</span>
          <span className="archive-card__title">{work.title}</span>
          <span className="archive-card__views">{work.imageCount} views</span>
        </span>
      </button>
    </article>
  )
}

function WorkViewer({ work, onClose, onMoveWork }) {
  const [current, setCurrent] = useState(0)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const activeImage = work.images[current]

  useEffect(() => {
    setCurrent(0)
    dialogRef.current?.scrollTo({ top: 0 })
  }, [work.id])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') {
        setCurrent((value) => (value + 1) % work.images.length)
      }
      if (event.key === 'ArrowLeft') {
        setCurrent((value) => (value - 1 + work.images.length) % work.images.length)
      }
      if (event.key === 'Tab') {
        const focusable = [
          ...dialogRef.current.querySelectorAll('button:not([disabled]), a[href]'),
        ]
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [onClose, work.images.length])

  const nextImage = () => setCurrent((value) => (value + 1) % work.images.length)
  const previousImage = () =>
    setCurrent((value) => (value - 1 + work.images.length) % work.images.length)

  return (
    <div
      ref={dialogRef}
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewer-title"
    >
      <header className="viewer__bar">
        <button ref={closeRef} type="button" className="viewer__close" onClick={onClose}>
          Close record
        </button>
        <p>Jacques Fuller</p>
        <p>{work.archiveNumber}</p>
      </header>

      <main className="viewer__page">
        <section className="viewer__opening">
          <aside className="viewer__identity">
            <p className="eyebrow">Catalogue record</p>
            <h2 id="viewer-title">{work.title}</h2>
            <p className="viewer__position" aria-live="polite" aria-atomic="true">
              Photograph {formatNumber(current + 1)} / {formatNumber(work.imageCount)}
            </p>
            <dl className="viewer__facts">
              <div>
                <dt>Material</dt>
                <dd>{work.material || 'Not recorded'}</dd>
              </div>
              <div>
                <dt>Dimensions</dt>
                <dd>{work.dimensions || 'Not recorded'}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{work.date || 'Not recorded'}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{work.availability || 'Not recorded'}</dd>
              </div>
            </dl>
          </aside>

          <div className="viewer__stage" aria-label={`Photographs of ${work.title}`}>
            <ImageWithState
              key={activeImage.src}
              className="viewer__active-image"
              src={activeImage.src}
              alt={activeImage.alt}
              width={activeImage.width}
              height={activeImage.height}
            />
            {work.images.length > 1 && (
              <div className="viewer__image-controls">
                <button type="button" onClick={previousImage} aria-label="Show previous photograph">
                  Previous photograph
                </button>
                <button type="button" onClick={nextImage} aria-label="Show next photograph">
                  Next photograph
                </button>
              </div>
            )}
          </div>
        </section>

        <nav className="viewer__thumbs" aria-label="Choose a photograph">
          {work.images.map((image, imageIndex) => (
            <button
              type="button"
              key={image.src}
              className={imageIndex === current ? 'is-active' : ''}
              onClick={() => setCurrent(imageIndex)}
              aria-label={`Show photograph ${imageIndex + 1} of ${work.title}`}
              aria-current={imageIndex === current ? 'true' : undefined}
            >
              <img src={image.thumb} alt="" loading="lazy" />
              <span>{formatNumber(imageIndex + 1)}</span>
            </button>
          ))}
        </nav>

        <section className="viewer__record">
          <div>
            <p className="eyebrow">Visual catalogue note</p>
            <p className="viewer__lead">
              {work.prototypeText ||
                `This preliminary record preserves ${work.imageCount} photographed views. A description in Jacques's own words will be added after review.`}
            </p>
          </div>
          <div className="viewer__story">
            <h3>In Jacques’s words</h3>
            <p>
              {work.story ||
                'The story, making process, date, and meaning behind this work are intentionally left open until Jacques or his family supplies the record.'}
            </p>
            {work.catalogueNote && <p className="viewer__note">Archive note: {work.catalogueNote}</p>}
          </div>
        </section>

        {work.images.length > 2 && (
          <section className="viewer__sequence" aria-labelledby="sequence-title">
            <header>
              <p className="eyebrow">Photographic sequence</p>
              <h3 id="sequence-title">Details and alternate views</h3>
            </header>
            <div className="viewer__sequence-grid">
              {work.images.slice(1, 5).map((image, index) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => {
                    setCurrent(index + 1)
                    dialogRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  aria-label={`View photograph ${index + 2} of ${work.title} at full size`}
                >
                  <ImageWithState
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        <nav className="viewer__work-navigation" aria-label="Browse catalogue records">
          <button type="button" onClick={() => onMoveWork(-1)}>Previous work</button>
          <button type="button" onClick={() => onMoveWork(1)}>Next work</button>
        </nav>
      </main>
    </div>
  )
}

function App() {
  const initialWork = useMemo(() => {
    const match = window.location.hash.match(/^#work\/(.+)$/)
    return match && artworks.some((work) => work.id === match[1]) ? match[1] : null
  }, [])
  const [selectedId, setSelectedId] = useState(initialWork)
  const selectedWork = artworks.find((work) => work.id === selectedId)
  const leadWork = selectedWorks[0]
  const detailStudies = [
    selectedWorks[0].images[Math.min(2, selectedWorks[0].images.length - 1)],
    selectedWorks[2].images[Math.min(2, selectedWorks[2].images.length - 1)],
    selectedWorks[1].images[Math.min(2, selectedWorks[1].images.length - 1)],
  ]

  useEffect(() => {
    const onHashChange = () => {
      const match = window.location.hash.match(/^#work\/(.+)$/)
      setSelectedId(match?.[1] || null)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const openWork = (id) => {
    setSelectedId(id)
    window.history.replaceState(null, '', `#work/${id}`)
  }

  const closeWork = () => {
    setSelectedId(null)
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  }

  const moveWork = (direction) => {
    const currentIndex = artworks.findIndex((work) => work.id === selectedId)
    const nextIndex = (currentIndex + direction + artworks.length) % artworks.length
    openWork(artworks[nextIndex].id)
  }

  return (
    <>
      <a className="skip-link" href="#selected-works">Skip to selected works</a>
      <div
        className="site-shell"
        inert={selectedWork ? true : undefined}
        aria-hidden={selectedWork ? 'true' : undefined}
      >
        <header className="site-rail">
          <a className="site-rail__mark" href="#top" aria-label="Jacques Fuller home">JF</a>
          <nav aria-label="Primary navigation">
            <a href="#selected-works">Selected</a>
            <a href="#archive">Archive</a>
            <a href="#artist">Artist</a>
          </nav>
          <div className="site-rail__index" aria-label="Archive summary">
            <span><strong>{formatNumber(selectedWorks.length)}</strong> selected works</span>
            <span><strong>{formatNumber(artworks.length)}</strong> catalogue records</span>
            <span><strong>{artworks.reduce((total, work) => total + work.imageCount, 0)}</strong> photographs</span>
          </div>
          <p className="site-rail__descriptor">Sculpture archive<br />Bloemfontein</p>
        </header>

        <main id="top">
        <section className="monograph-hero" aria-labelledby="hero-title">
          <div className="monograph-hero__title">
            <p className="eyebrow">Sculpture archive</p>
            <h1 id="hero-title"><span>Jacques</span> Fuller</h1>
            <p className="monograph-hero__summary">
              Figurative and narrative sculpture assembled through welded brass, mild steel, found objects, and industrial remnants.
            </p>
            <a className="text-link monograph-hero__browse" href="#archive">Browse all works</a>
          </div>

          <div className="monograph-hero__artwork">
            <ImageWithState
              src={leadWork.images[0].src}
              alt={leadWork.images[0].alt}
              width={leadWork.images[0].width}
              height={leadWork.images[0].height}
              fetchPriority="high"
              loading="eager"
              decoding="sync"
            />
          </div>

          <aside className="monograph-hero__record" aria-label={`Featured record: ${leadWork.title}`}>
            <p>{leadWork.archiveNumber}</p>
            <h2>{leadWork.title}</h2>
            <span>{leadWork.imageCount} photographs</span>
            <button type="button" className="primary-action" onClick={() => openWork(leadWork.id)}>
              Open record
            </button>
          </aside>

          <div className="monograph-hero__index" aria-label="Archive summary">
            <span><strong>{formatNumber(selectedWorks.length)}</strong> selected works</span>
            <span><strong>{formatNumber(artworks.length)}</strong> catalogue records</span>
            <span><strong>{artworks.reduce((total, work) => total + work.imageCount, 0)}</strong> photographs</span>
          </div>
        </section>

        <section className="curatorial-note">
          <p className="curatorial-note__label">A temporary selection, not a ranking.</p>
          <p>
            Six works suggest the breadth of Fuller’s sculptural language. The selection can change as the family archive develops.
          </p>
        </section>

        <section className="selected-works" id="selected-works" aria-labelledby="selected-title">
          <header className="section-heading">
            <h2 id="selected-title">Figures, creatures, and improbable machines</h2>
          </header>
          <div className="selected-works__list">
            {selectedWorks.map((work, index) => (
              <FeaturedWork key={work.id} work={work} index={index} onOpen={openWork} />
            ))}
          </div>
        </section>

        <section className="living-archive" aria-labelledby="living-title">
          <header className="living-archive__heading">
            <p className="eyebrow">The living archive</p>
            <h2 id="living-title">A record that can grow around the work</h2>
            <p>
              The sculpture catalogue is only the first layer. Workshop photographs, recollections, exhibition records, and Jacques’s own explanations can be added whenever they become available.
            </p>
          </header>

          <div className="living-archive__paths">
            <article>
              <span>01</span>
              <h3>Voice</h3>
              <p>A short typed note or transcribed voice message can become the story attached to each sculpture.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Studio</h3>
              <p>A portrait is optional. Hands, tools, work surfaces, raw material, and the workshop itself can tell the story without staging a formal photograph.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Record</h3>
              <p>Dates, exhibitions, collectors, commissions, press clippings, and old snapshots can be added gradually rather than delaying the launch.</p>
            </article>
          </div>

          <div className="detail-studies" aria-label="Details from the current photographic archive">
            {detailStudies.map((image) => (
              <figure key={image.src}>
                <ImageWithState
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                />
                <figcaption>Existing photographic detail</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="artist" id="artist" aria-labelledby="artist-title">
          <header className="artist__heading">
            <p className="eyebrow">The artist</p>
            <h2 id="artist-title">A medium mastered through making</h2>
          </header>
          <div className="artist__body">
            <p className="artist__lead">
              Jacques Fuller has been active as a sculptor in Bloemfontein since 1989, exploring mild steel, red copper, and brass separately and in combination.
            </p>
            <div className="artist__columns">
              <p>
                His materials include sheets of brass, found objects, tooled elements, and cast brass parts from discarded industrial machinery. Components are cut, formed, joined, ground, patinated, and polished by hand.
              </p>
              <p>
                The sculptures range from delicately forged animals to figures and densely populated narrative constructions. Their enigmatic titles invite interpretation while leaving the final reading open to the spectator.
              </p>
            </div>
          </div>
          <div className="artist__timeline" aria-label="Working timeline">
            <span>1989</span>
            <span>Bloemfontein</span>
            <span>Brass / steel / copper</span>
            <span>Archive in progress</span>
          </div>
        </section>

        <section className="archive" id="archive" aria-labelledby="archive-title">
          <header className="section-heading section-heading--archive">
            <div>
              <p className="archive__label">Complete working archive</p>
              <h2 id="archive-title">All {artworks.length} records</h2>
            </div>
            <p>
              Titles and known measurements follow the supplied album names. Missing facts remain visibly unconfirmed rather than being inferred from the photographs.
            </p>
          </header>
          <div className="archive-grid">
            {artworks.map((work, index) => (
              <ArchiveCard key={work.id} work={work} index={index} onOpen={openWork} />
            ))}
          </div>
        </section>
        </main>

        <footer className="site-footer">
          <div>
            <p>Jacques Fuller</p>
            <p>Bloemfontein, South Africa</p>
          </div>
          <p>Catalogue details remain under family review. This preview is not indexed by search engines.</p>
        </footer>
      </div>

      {selectedWork && (
        <WorkViewer
          work={selectedWork}
          onClose={closeWork}
          onMoveWork={moveWork}
        />
      )}
    </>
  )
}

export default App
