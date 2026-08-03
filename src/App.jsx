import { useEffect, useMemo, useRef, useState } from 'react'
import artworks from './data/artworks.json'
import artist from './data/artist.json'
import historicalCatalogue from './data/historicalCatalogue.json'
import './App.css'
import './archive.css'

const selectedWorks = artworks
  .filter((work) => work.featured)
  .sort((a, b) => a.featuredRank - b.featuredRank)

const processWork = artworks.find((work) => work.id === 'mermaid')
const processPhotos = [
  { number: '01', src: '/process/mermaid/01-drawing.jpg', alt: 'Working drawing for Mermaid on a workshop table', width: 900, height: 602, caption: 'The working drawing' },
  { number: '02', src: '/process/mermaid/02-materials.jpg', alt: 'Cut metal pieces laid out on the workshop floor', width: 900, height: 602, caption: 'Cut sheet and offcuts' },
  { number: '03', src: '/process/mermaid/03-forming-body.jpg', alt: 'Curved metal body of Mermaid taking shape', width: 960, height: 642, caption: 'The lower body takes shape' },
  { number: '04', src: '/process/mermaid/04-joining-body.jpg', alt: 'Interior view of the joined metal structure', width: 900, height: 602, caption: 'Joining the structure' },
  { number: '05', src: '/process/mermaid/05-figure-block-in.jpg', alt: 'Metal torso components being assembled for Mermaid', width: 900, height: 602, caption: 'Building the figure' },
  { number: '06', src: '/process/mermaid/06-shaping-head.jpg', alt: 'Jacques shaping the metal head by hand with a hammer', width: 900, height: 602, caption: 'Shaping the head by hand' },
  { number: '07', src: '/process/mermaid/07-formed-face.jpg', alt: 'Formed metal face mounted in the workshop', width: 900, height: 602, caption: 'The formed face' },
  { number: '08', src: '/process/mermaid/08-assembling-figure.jpg', alt: 'Separate head components during assembly', width: 900, height: 602, caption: 'Parts during assembly' },
  { number: '09', src: '/process/mermaid/09-mermaid-body.jpg', alt: 'Mermaid torso and fish body during fitting', width: 900, height: 602, caption: 'Fitting figure and fish body' },
  { number: '10', src: '/process/mermaid/10-crown-and-figure.jpg', alt: 'Mermaid figure beside crown components', width: 900, height: 602, caption: 'Preparing the crown' },
  { number: '11', src: '/process/mermaid/11-repeated-elements.jpg', alt: 'Repeated metal rods arranged for assembly', width: 606, height: 900, caption: 'Repeated elements' },
  { number: '12', src: '/process/mermaid/12-collar-detail.jpg', alt: 'Collar elements fitted around the Mermaid figure', width: 900, height: 602, caption: 'The final fitting' },
]

const processStages = [
  {
    number: '01',
    key: 'drawing',
    title: 'From drawing',
    copy: 'A working drawing sets out the balance between the figure, fish and base before the first piece of metal is formed.',
    photos: processPhotos.slice(0, 1),
  },
  {
    number: '02',
    key: 'body',
    title: 'Forming the body',
    copy: 'Flat sheet is cut, curved and joined to make the lower body and its internal structure.',
    photos: processPhotos.slice(1, 4),
  },
  {
    number: '03',
    key: 'figure',
    title: 'Building the figure',
    copy: 'The figure is made in parts. The head is shaped by hand before the face, torso and fish body are fitted together.',
    photos: processPhotos.slice(4, 9),
  },
  {
    number: '04',
    key: 'details',
    title: 'Details and assembly',
    copy: 'Crown, collar and repeated elements are prepared as small assemblies, then brought into the whole.',
    photos: processPhotos.slice(9),
  },
]

const quoteById = Object.fromEntries(artist.quotes.map((quote) => [quote.id, quote]))
const historicalByNumber = Object.fromEntries(
  historicalCatalogue.records.map((record) => [record.catalogueNumber, record]),
)
const hoeRyWork = artworks.find((work) => work.id === 'hoe-ry-die-boere')
const bwanaWork = artworks.find((work) => work.id === 'bwana')
const archiveThemes = [
  ['Animals and fables', 'Pangolin · Warthog · Chameleon · Grasshopper'],
  ['Authority and absurdity', 'Public Protector · Domminee · Bwana · Chauvinist'],
  ['Bodies and performance', 'Drag Queen · Tutu · Dress · Dyke Bike'],
  ['Machines and public work', 'Rocking Horse · Phakisa · African Carousel'],
]

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

function WorkFacts({ work, className = '' }) {
  const facts = [work.material, work.dimensions, work.date].filter(Boolean)
  if (!facts.length) return null

  return (
    <p className={`work-facts ${className}`.trim()}>
      {facts.map((fact, index) => <span key={`${fact}-${index}`}>{fact}</span>)}
    </p>
  )
}

function ArtworkButton({ work, onOpen, className = '', thumb = false, eager = false, label = null, caption = '' }) {
  const image = work.images[0]
  return (
    <button
      type="button"
      className={`artwork-button ${className}`.trim()}
      onClick={() => onOpen(work.id)}
      aria-label={label || `View ${work.title}`}
    >
      <ImageWithState
        src={thumb ? image.thumb : image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
      />
      {caption && <span className="artwork-button__archive-label">{caption}</span>}
    </button>
  )
}

function SiteNav({ className = '' }) {
  return (
    <header className={`direction-nav ${className}`.trim()}>
      <a className="direction-nav__mark" href="/">Jacques Fuller</a>
      <nav aria-label="Primary navigation">
        <a href="/#work">Work</a>
        <a href="/#archive">Archive</a>
        <a href="/?page=process">Process</a>
        <a href="/#about">About</a>
      </nav>
    </header>
  )
}

function AboutCopy({ className = '' }) {
  return (
    <section className={`about-copy ${className}`.trim()} id="about" aria-labelledby="about-title">
      <header>
        <p>Biography · historical record, updated 2026</p>
        <h2 id="about-title">About Jacques</h2>
      </header>
      <div className="about-copy__body">
        <div className="about-copy__prose">
          {artist.biography.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <ol className="about-copy__timeline" aria-label="Career timeline">
          {artist.timeline.map((event) => (
            <li key={event.date}>
              <p>{event.date}</p>
              <div>
                <h3>{event.title}</h3>
                <p>{event.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <footer>
        <p>Source: <cite>{artist.source.title}</cite>, {artist.source.publisher}, 2001.</p>
        <p>{artist.biography.source.note}</p>
      </footer>
    </section>
  )
}

function QuoteSource({ quote }) {
  return <cite>Interview with {quote.source.interviewer} · {quote.source.date}</cite>
}

function Archive2001({ onOpen }) {
  const lookTwice = quoteById['look-twice']
  const hoeRyRecord = historicalByNumber[10]
  const bwanaRecord = historicalByNumber[58]

  return (
    <section className="r5-archive" id="archive" aria-labelledby="archive-title">
      <div className="r5-archive__statement">
        <header>
          <p>Historical exhibition catalogue</p>
          <h2 id="archive-title">Archive 2001</h2>
          <p>
            <strong>{historicalCatalogue.records.length} catalogue records</strong> preserve a snapshot of Jacques&apos;s
            working world at the turn of the century. Dates, dimensions and collection locations below are
            historical statements from that publication—not current claims.
          </p>
        </header>
        <blockquote>
          <p>{lookTwice.text}</p>
          <footer><QuoteSource quote={lookTwice} /></footer>
        </blockquote>
      </div>

      <div className="r5-archive__themes" aria-labelledby="archive-themes-title">
        <header>
          <p>Across the catalogue</p>
          <h3 id="archive-themes-title">Recurring forms</h3>
        </header>
        <ul>
          {archiveThemes.map(([theme, examples]) => (
            <li key={theme}><span>{theme}</span><span>{examples}</span></li>
          ))}
        </ul>
        <p>Editorial groupings observed in the 2001 catalogue; they are not categories assigned by Jacques.</p>
      </div>

      <div className="r5-archive__relationships" aria-label="Relationships between the 2001 and current archives">
        <article className="r5-archive__relationship r5-archive__relationship--same">
          <ArtworkButton
            work={hoeRyWork}
            onOpen={onOpen}
            label="View current Hoe Ry Die Boere"
            caption="Current archive · JF-030"
          />
          <div>
            <p>Catalogue no. 10 · same physical work</p>
            <h3>Hoe Ry Die Boere</h3>
            <dl>
              <div><dt>Date</dt><dd>{hoeRyRecord.date}</dd></div>
              <div><dt>Material</dt><dd>{hoeRyRecord.material}</dd></div>
              <div><dt>Dimensions</dt><dd>{hoeRyRecord.dimensions}</dd></div>
            </dl>
            <p>The vehicle, figures, bird, base and mechanical details identify the current record as the sculpture catalogued in 2001.</p>
            <button type="button" onClick={() => onOpen(hoeRyWork.id)}>Open current record</button>
          </div>
        </article>

        <article className="r5-archive__relationship r5-archive__relationship--reused">
          <ArtworkButton
            work={bwanaWork}
            onOpen={onOpen}
            label="View current Bwana"
            caption="Current archive · JF-022 · different sculpture"
          />
          <div>
            <p>Catalogue no. 58 · different work, same title</p>
            <h3>Bwana</h3>
            <dl>
              <div><dt>Date</dt><dd>{bwanaRecord.date}</dd></div>
              <div><dt>Material</dt><dd>{bwanaRecord.material}</dd></div>
              <div><dt>Dimensions</dt><dd>{bwanaRecord.dimensions}</dd></div>
            </dl>
            <p>The 2001 catalogue records a different sculpture. Jacques returned to the title without repeating the physical object.</p>
            <button type="button" onClick={() => onOpen(bwanaWork.id)}>Open current record</button>
          </div>
        </article>
      </div>

      <footer className="r5-archive__source">
        <p>Source: <cite>{historicalCatalogue.source.title}</cite>, {historicalCatalogue.source.publisher}, {historicalCatalogue.source.year}, catalogue pp. 24–27.</p>
        <p>No catalogue photography is reproduced here pending rights clearance.</p>
      </footer>
    </section>
  )
}

function ProcessVoice({ quote, variant }) {
  return (
    <blockquote className={`r5-process__voice r5-process__voice--${variant}`}>
      <p>{quote.text}</p>
      <footer><QuoteSource quote={quote} /></footer>
    </blockquote>
  )
}

function MaterialHistory() {
  return (
    <section className="r5-process__material-history" aria-labelledby="material-history-title">
      <header>
        <p>Material history · described in 2001</p>
        <h2 id="material-history-title">A material vocabulary</h2>
        <p>Not a straight progression, but a series of technical problems, discoveries and returns.</p>
      </header>
      <ol>
        {artist.materialHistory.map((period) => (
          <li key={period.period}>
            <p>{period.period}</p>
            <h3>{period.material}</h3>
            <p>{period.detail}</p>
          </li>
        ))}
      </ol>
      <footer>Source: Jacques Fuller in conversation with Sharon Crampton, August 2001.</footer>
    </section>
  )
}

function DirectionFooter() {
  return (
    <footer className="direction-footer">
      <p>Jacques Fuller</p>
      <p>Bloemfontein, South Africa</p>
    </footer>
  )
}

function ImmersiveWorkIndex({ works, onOpen }) {
  const [activeId, setActiveId] = useState(works[0].id)
  const activeWork = works.find((work) => work.id === activeId) || works[0]

  return (
    <div className="r5-browser">
      <div className="r5-browser__preview">
        <ArtworkButton key={activeWork.id} work={activeWork} onOpen={onOpen} />
        <div aria-live="polite">
          <div>
            <p>{activeWork.title}</p>
            <WorkFacts work={activeWork} />
          </div>
          <button type="button" onClick={() => onOpen(activeWork.id)}>Open work</button>
        </div>
      </div>
      <ol className="r5-browser__list">
        {works.map((work) => (
          <li key={work.id} className={work.id === activeId ? 'is-active' : ''}>
            <button
              type="button"
              onMouseEnter={() => setActiveId(work.id)}
              onFocus={() => setActiveId(work.id)}
              onClick={() => onOpen(work.id)}
            >
              <span className="r5-browser__mobile-thumb" aria-hidden="true">
                <img src={work.images[0].thumb} alt="" loading="lazy" />
              </span>
              <span>{work.title}</span>
              <span>View</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function RailArtwork({ work, onOpen, duplicate = false }) {
  const image = work.images[0]
  const ratio = image.width / image.height
  const shape = ratio > 1.18 ? 'wide' : ratio < 0.78 ? 'tall' : 'standard'
  const content = (
    <>
      <span className="r5-rail__image">
        <img src={image.thumb} alt={duplicate ? '' : image.alt} loading="lazy" width={image.width} height={image.height} />
      </span>
      <span>{work.title}</span>
    </>
  )

  if (duplicate) {
    return <article className={`r5-rail__item is-${shape}`}>{content}</article>
  }

  return (
    <button
      type="button"
      className={`r5-rail__item is-${shape}`}
      onClick={() => onOpen(work.id)}
      aria-label={`View ${work.title}`}
    >
      {content}
    </button>
  )
}

function MovingWorkRail({ works, onOpen }) {
  const [inView, setInView] = useState(false)
  const railRef = useRef(null)
  const duration = Math.max(72, works.length * 4.5)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '240px 0px' },
    )
    observer.observe(rail)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={railRef}
      className={`r5-rail ${!inView ? 'is-paused' : ''}`}
      aria-label="Browse all works"
    >
      <div className="r5-rail__viewport">
        <div className="r5-rail__track" style={{ '--r5-rail-duration': `${duration}s` }}>
          <div className="r5-rail__group">
            {works.map((work) => <RailArtwork key={work.id} work={work} onOpen={onOpen} />)}
          </div>
          <div className="r5-rail__group" aria-hidden="true">
            {works.map((work) => <RailArtwork key={`duplicate-${work.id}`} work={work} duplicate />)}
          </div>
        </div>
      </div>
    </section>
  )
}

function ImmersiveIndex({ onOpen }) {
  return (
    <article className="direction direction--immersive" id="top">
      <SiteNav />
      <main>
        <section className="r5-mosaic" aria-labelledby="r5-title">
          {selectedWorks.map((work, index) => (
            <ArtworkButton
              key={work.id}
              work={work}
              onOpen={onOpen}
              className={`r5-mosaic__tile r5-mosaic__tile--${index + 1}`}
              eager={index < 3}
            />
          ))}
          <div className="r5-mosaic__identity">
            <p>Sculpture · Brass, steel, copper and found material</p>
            <h1 id="r5-title">Jacques<br />Fuller</h1>
            <a href="#work">Enter the work</a>
          </div>
        </section>

        <section className="r5-intro" aria-label="Introduction">
          <p>Metal, machinery and found material shaped into figures, animals and narrative constructions.</p>
          <a href="#work">Browse all works</a>
        </section>

        <MovingWorkRail works={artworks} onOpen={onOpen} />

        <Archive2001 onOpen={onOpen} />
        <AboutCopy className="r5-about" />

        <section className="r5-index" id="work" aria-labelledby="r5-index-title">
          <header>
            <p>Works</p>
            <h2 id="r5-index-title">Browse by title</h2>
          </header>
          <ImmersiveWorkIndex works={artworks} onOpen={onOpen} />
        </section>
      </main>
      <DirectionFooter />
    </article>
  )
}

function ImmersiveProcess({ onOpen }) {
  const finishedImage = processWork.images[0]

  return (
    <article className="direction direction--immersive direction--process" id="top">
      <SiteNav />
      <main className="r5-process">
        <header className="r5-process__heading">
          <h1>Process</h1>
          <p>Mermaid · One sculpture, step by step</p>
        </header>

        <section className="r5-process__intro" aria-labelledby="r5-process-title">
          <p>Case study 01</p>
          <h2 id="r5-process-title">Making Mermaid</h2>
          <p>
            These contemporary workshop photographs follow one sculpture from drawing to finished work. Jacques&apos;s
            historical account below describes the direct relationship with metal that shaped his practice in 2001.
          </p>
        </section>

        <ProcessVoice quote={quoteById['direct-metal']} variant="lead" />
        <MaterialHistory />
        <ProcessVoice quote={quoteById['working-drawings']} variant="working" />

        <div className="r5-process__stages">
          {processStages.map((stage, stageIndex) => (
            <section
              key={stage.key}
              className={`r5-process__stage r5-process__stage--${stage.key}`}
              aria-labelledby={`r5-process-${stage.key}`}
            >
              <header>
                <p>{stage.number} / 04</p>
                <h2 id={`r5-process-${stage.key}`}>{stage.title}</h2>
                <p>{stage.copy}</p>
              </header>
              <div className="r5-process__media">
                {stage.photos.map((photo, photoIndex) => (
                  <figure key={photo.src}>
                    <ImageWithState
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      loading={stageIndex === 0 && photoIndex === 0 ? 'eager' : 'lazy'}
                      fetchPriority={stageIndex === 0 && photoIndex === 0 ? 'high' : undefined}
                    />
                    <figcaption><span>{photo.number}.</span><span>{photo.caption}</span></figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="r5-process__finished" aria-labelledby="r5-process-finished">
          <header>
            <p>05 / Finished work</p>
            <h2 id="r5-process-finished">Mermaid</h2>
          </header>
          <button type="button" onClick={() => onOpen(processWork.id)} aria-label="View finished Mermaid">
            <ImageWithState
              src={finishedImage.src}
              alt={finishedImage.alt}
              width={finishedImage.width}
              height={finishedImage.height}
              loading="lazy"
            />
          </button>
          <footer>
            <WorkFacts work={processWork} />
            <span>Select image to view the finished sculpture</span>
          </footer>
        </section>
      </main>
      <DirectionFooter />
    </article>
  )
}

function WorkViewer({ work, onClose, onMoveWork, returnFocusRef }) {
  const [current, setCurrent] = useState(0)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const activeImage = work.images[current]
  const recordFacts = [
    ['Archive number', work.archiveNumber || 'Not recorded'],
    ['Date', work.date || 'Not recorded'],
    ['Material', work.material || 'Not recorded'],
    ['Dimensions', work.dimensions || 'Not recorded'],
    ['Availability', work.availability || 'Not recorded'],
    ['Photographic views', `${work.images.length}`],
  ]

  useEffect(() => {
    setCurrent(0)
    dialogRef.current?.scrollTo({ top: 0 })
  }, [work.id])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = returnFocusRef.current || document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') setCurrent((value) => (value + 1) % work.images.length)
      if (event.key === 'ArrowLeft') setCurrent((value) => (value - 1 + work.images.length) % work.images.length)
      if (event.key === 'Tab') {
        const focusable = [...(dialogRef.current?.querySelectorAll('button:not([disabled]), a[href]') || [])]
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
  }, [onClose, returnFocusRef, work.images.length])

  return (
    <div ref={dialogRef} className="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title">
      <header className="viewer__bar">
        <button ref={closeRef} type="button" onClick={onClose}>Close</button>
        <h2 id="viewer-title">{work.title}</h2>
        <p aria-live="polite">{formatNumber(current + 1)} / {formatNumber(work.images.length)}</p>
      </header>
      <main>
        <section className="viewer__stage" aria-label={`Images of ${work.title}`}>
          <ImageWithState
            key={activeImage.src}
            src={activeImage.src}
            alt={activeImage.alt}
            width={activeImage.width}
            height={activeImage.height}
          />
          {work.images.length > 1 && (
            <div className="viewer__image-controls">
              <button type="button" onClick={() => setCurrent((value) => (value - 1 + work.images.length) % work.images.length)}>Previous image</button>
              <button type="button" onClick={() => setCurrent((value) => (value + 1) % work.images.length)}>Next image</button>
            </div>
          )}
        </section>
        {work.images.length > 1 && (
          <nav className="viewer__thumbs" aria-label="Choose an image">
            {work.images.map((image, index) => (
              <button
                type="button"
                key={image.src}
                className={index === current ? 'is-active' : ''}
                onClick={() => setCurrent(index)}
                aria-label={`Show image ${index + 1} of ${work.title}`}
                aria-current={index === current ? 'true' : undefined}
              >
                <img src={image.thumb} alt="" loading="lazy" />
              </button>
            ))}
          </nav>
        )}
        <section className="viewer__record" aria-labelledby="viewer-record-title">
          <header className="viewer__record-heading">
            <div>
              <h2 id="viewer-record-title">Work record</h2>
              <p>{work.archiveNumber}</p>
            </div>
            <p>{work.title}</p>
          </header>

          <dl className="viewer__record-facts">
            {recordFacts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="viewer__record-notes">
            <section>
              <h3>Working description</h3>
              <p>{work.prototypeText || 'Pending description.'}</p>
            </section>
            <section>
              <h3>Catalogue note</h3>
              <p>{work.catalogueNote || 'Pending catalogue research.'}</p>
            </section>
            <section>
              <h3>Artist&apos;s account</h3>
              <p>{work.story || 'Not recorded'}</p>
            </section>
            <section>
              <h3>Exhibition history</h3>
              <p>{work.exhibitionHistory || 'Not recorded'}</p>
            </section>
            <section>
              <h3>Provenance</h3>
              <p>{work.provenance || 'Not recorded'}</p>
            </section>
          </div>

          {work.historicalRecord && (
            <section className="viewer__historical" aria-labelledby="viewer-historical-title">
              <header>
                <h3 id="viewer-historical-title">Historical catalogue record</h3>
                <p>{work.historicalRecord.id}</p>
              </header>
              <dl>
                <div><dt>Relationship</dt><dd>Same physical work</dd></div>
                <div><dt>Catalogue number</dt><dd>{work.historicalRecord.catalogueNumber}</dd></div>
                <div><dt>Inscription</dt><dd>{work.historicalRecord.inscription}</dd></div>
                <div><dt>Collection recorded in 2001</dt><dd>{work.historicalRecord.collectionAsOf2001}</dd></div>
              </dl>
              <p>Source: <cite>{historicalCatalogue.source.title}</cite>, {historicalCatalogue.source.year}, catalogue p. {work.historicalRecord.sourcePage}. Collection information is historical, not a current ownership statement.</p>
            </section>
          )}

          {work.relatedHistoricalRecords?.map((relation) => {
            const historicalWork = historicalByNumber[relation.catalogueNumber]
            return (
              <section className="viewer__historical viewer__historical--related" key={relation.id}>
                <header>
                  <h3>Related historical title</h3>
                  <p>{relation.id}</p>
                </header>
                <p>
                  Catalogue no. {relation.catalogueNumber}, <cite>{historicalWork.title}</cite>, is a different physical work.
                  The shared title does not transfer its date, dimensions, material, or collection record to this sculpture.
                </p>
                <p>Source: <cite>{historicalCatalogue.source.title}</cite>, {historicalCatalogue.source.year}, catalogue p. {relation.sourcePage}.</p>
              </section>
            )
          })}
        </section>
        <nav className="viewer__work-navigation" aria-label="Browse works">
          <button type="button" onClick={() => onMoveWork(-1)}>Previous work</button>
          <button type="button" onClick={() => onMoveWork(1)}>Next work</button>
        </nav>
      </main>
    </div>
  )
}

function App() {
  const page = new URLSearchParams(window.location.search).get('page') === 'process' ? 'process' : 'home'
  const workTriggerRef = useRef(null)
  const initialWork = useMemo(() => {
    const match = window.location.hash.match(/^#work\/(.+)$/)
    return match && artworks.some((work) => work.id === match[1]) ? match[1] : null
  }, [])
  const [selectedId, setSelectedId] = useState(initialWork)
  const selectedWork = artworks.find((work) => work.id === selectedId)

  useEffect(() => {
    document.title = page === 'process' ? 'Jacques Fuller · Process' : 'Jacques Fuller · Sculpture'
  }, [page])

  useEffect(() => {
    const syncWorkFromUrl = () => {
      const match = window.location.hash.match(/^#work\/(.+)$/)
      const id = match?.[1]
      setSelectedId(id && artworks.some((work) => work.id === id) ? id : null)
    }
    window.addEventListener('hashchange', syncWorkFromUrl)
    window.addEventListener('popstate', syncWorkFromUrl)
    return () => {
      window.removeEventListener('hashchange', syncWorkFromUrl)
      window.removeEventListener('popstate', syncWorkFromUrl)
    }
  }, [])

  const openWork = (id) => {
    const trigger = document.activeElement
    if (trigger instanceof HTMLElement && !trigger.closest('.viewer')) workTriggerRef.current = trigger
    setSelectedId(id)
    const url = `${window.location.pathname}${window.location.search}#work/${id}`
    if (selectedId) {
      window.history.replaceState(window.history.state, '', url)
    } else {
      window.history.pushState({ galleryViewer: true }, '', url)
    }
  }

  const closeWork = () => {
    if (window.history.state?.galleryViewer) {
      window.history.back()
      return
    }
    setSelectedId(null)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
  }

  const moveWork = (direction) => {
    const currentIndex = artworks.findIndex((work) => work.id === selectedId)
    const nextIndex = (currentIndex + direction + artworks.length) % artworks.length
    openWork(artworks[nextIndex].id)
  }

  return (
    <>
      <div className="app-surface" inert={selectedWork ? true : undefined} aria-hidden={selectedWork ? 'true' : undefined}>
        <div className="preview-viewport preview-viewport--clean">
          {page === 'process'
            ? <ImmersiveProcess onOpen={openWork} />
            : <ImmersiveIndex onOpen={openWork} />}
        </div>
      </div>
      {selectedWork && (
        <WorkViewer
          work={selectedWork}
          onClose={closeWork}
          onMoveWork={moveWork}
          returnFocusRef={workTriggerRef}
        />
      )}
    </>
  )
}

export default App
