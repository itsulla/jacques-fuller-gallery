import { useEffect, useMemo, useRef, useState } from 'react'
import artworks from './data/artworks.json'
import artist from './data/artist.json'
import homepageMosaic from './data/homepageMosaic.json'
import './App.css'
import './archive.css'

const worksById = new Map(artworks.map((work) => [work.id, work]))
const homepageTiles = homepageMosaic.map((item) => {
  const work = item.workId ? worksById.get(item.workId) : null
  return {
    ...item,
    work,
    image: item.image || work?.images[item.imageIndex || 0],
  }
})
const worksGatewayItems = artworks.slice(-4)

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

function formatNumber(value) {
  return String(value).padStart(2, '0')
}

function ImageWithState({ src, alt, className = '', loadingLabel = 'Image loading', recoverable = false, ...props }) {
  const [state, setState] = useState('loading')
  const [retry, setRetry] = useState(0)
  const imageSrc = retry ? `${src}${src.includes('?') ? '&' : '?'}retry=${retry}` : src

  const retryImage = () => {
    setState('loading')
    setRetry((value) => value + 1)
  }

  return (
    <span className={`image-shell image-shell--${state} ${className}`.trim()}>
      {state === 'loading' && <span className="image-message">{loadingLabel}</span>}
      {state === 'error' && (
        <span className="image-message">
          <span>Image unavailable</span>
          {recoverable && <button type="button" onClick={retryImage}>Retry image</button>}
        </span>
      )}
      <img
        src={imageSrc}
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

function ArtworkButton({ work = null, image: suppliedImage = null, onOpen, onActivate = null, className = '', thumb = false, eager = false, label = null, caption = '' }) {
  const image = suppliedImage || work.images[0]
  const activate = onActivate || (() => onOpen(work.id))
  return (
    <button
      type="button"
      className={`artwork-button ${className}`.trim()}
      onClick={activate}
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

function SiteNav({ className = '', current = 'home', onOpenArchive }) {
  return (
    <header className={`direction-nav ${className}`.trim()}>
      <a className="direction-nav__mark" href="/">Jacques Fuller</a>
      <nav aria-label="Primary navigation">
        <button type="button" onClick={onOpenArchive}>Works</button>
        <a href="/?page=process" aria-current={current === 'process' ? 'page' : undefined}>Process</a>
        <a href="/#about">About</a>
      </nav>
    </header>
  )
}

function AboutCopy({ className = '' }) {
  return (
    <section className={`about-copy ${className}`.trim()} id="about" aria-labelledby="about-title">
      <header>
        <p>Biography</p>
        <h2 id="about-title">About Jacques</h2>
      </header>
      <div className="about-copy__body">
        <div className="about-copy__prose">
          {artist.biography.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <ol className="about-copy__timeline">
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
    </section>
  )
}

function QuoteSource() {
  return <cite>Jacques Fuller</cite>
}

function ProcessVoice({ quote, variant }) {
  return (
    <blockquote className={`r5-process__voice r5-process__voice--${variant}`}>
      <p>{quote.text}</p>
      <footer><QuoteSource /></footer>
    </blockquote>
  )
}

function MaterialHistory() {
  return (
    <section className="r5-process__material-history" aria-labelledby="material-history-title">
      <header>
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
    </section>
  )
}

function DirectionFooter({ label = 'Sculpture', onOpenArchive }) {
  return (
    <footer className="direction-footer">
      <div>
        <p>{label}</p>
        <p>Jacques Fuller</p>
      </div>
      {onOpenArchive && <button type="button" onClick={onOpenArchive}>View all works</button>}
      <p>Bloemfontein, South Africa</p>
    </footer>
  )
}

function ArchiveGateway({ onOpen, onOpenArchive }) {
  return (
    <section className="r5-archive-gateway" id="works" aria-labelledby="works-title">
      <header>
        <div>
          <h2 id="works-title">Works</h2>
        </div>
        <div>
          <button type="button" onClick={onOpenArchive}>View all {artworks.length} works</button>
        </div>
      </header>
      <div className="r5-archive-gateway__works">
        {worksGatewayItems.map((work) => (
          <article key={work.id}>
            <ArtworkButton work={work} onOpen={onOpen} thumb />
            <h3>{work.title}</h3>
          </article>
        ))}
      </div>
    </section>
  )
}

function ArchiveIndex({ works, onClose, onOpen, returnFocusRef }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const previousFocus = returnFocusRef.current || document.activeElement
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = [...(dialogRef.current?.querySelectorAll('button:not([disabled])') || [])]
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
  }, [onClose, returnFocusRef])

  return (
    <div ref={dialogRef} className="archive-index" role="dialog" aria-modal="true" aria-labelledby="archive-index-title">
      <header className="archive-index__bar">
        <div>
          <p>{works.length} works</p>
          <h2 id="archive-index-title">Works</h2>
        </div>
        <button ref={closeRef} type="button" onClick={onClose}>Close</button>
      </header>
      <ol className="archive-index__gallery">
        {works.map((work) => (
          <li key={work.id}>
            <button className="archive-index__artwork" type="button" onClick={() => onOpen(work.id)}>
              <span className="archive-index__image" aria-hidden="true">
                <img
                  src={work.images[0].src}
                  alt=""
                  width={work.images[0].width}
                  height={work.images[0].height}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <strong>{work.title}</strong>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ImmersiveIndex({ onOpen, onOpenArchive }) {
  return (
    <article className="direction direction--immersive" id="top">
      <SiteNav onOpenArchive={onOpenArchive} />
      <main>
        <section className="r5-mosaic" aria-labelledby="r5-title">
          {homepageTiles.map((tile, index) => (
            <ArtworkButton
              key={tile.id}
              work={tile.work}
              image={tile.image}
              onOpen={onOpen}
              onActivate={tile.opensArchive ? onOpenArchive : null}
              label={tile.opensArchive ? 'View all works' : null}
              className={`r5-mosaic__tile r5-mosaic__tile--${index + 1}`}
              eager={index < 3}
            />
          ))}
          <div className="r5-mosaic__identity">
            <p>Sculpture · Brass, steel, copper and found material</p>
            <h1 id="r5-title">Jacques<br />Fuller</h1>
            <button type="button" onClick={onOpenArchive}>View works</button>
          </div>
        </section>

        <section className="r5-intro" aria-label="Introduction">
          <p>Metal, machinery and found material shaped into figures, animals and narrative constructions.</p>
        </section>

        <ArchiveGateway onOpen={onOpen} onOpenArchive={onOpenArchive} />
        <AboutCopy className="r5-about" />
      </main>
      <DirectionFooter onOpenArchive={onOpenArchive} />
    </article>
  )
}

function ImmersiveProcess({ onOpen, onOpenArchive }) {
  const finishedImage = processWork.images[0]

  return (
    <article className="direction direction--immersive direction--process" id="top">
      <SiteNav current="process" onOpenArchive={onOpenArchive} />
      <main className="r5-process">
        <header className="r5-process__heading">
          <h1>Process</h1>
          <p>Mermaid · One sculpture, step by step</p>
        </header>

        <section className="r5-process__intro" aria-labelledby="r5-process-title">
          <h2 id="r5-process-title">Making Mermaid</h2>
          <p>
            These workshop photographs follow one sculpture from drawing to finished work. Jacques shapes and
            assembles each part directly in metal.
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
                      loadingLabel={`Photograph ${photo.number} loading`}
                      recoverable
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
      <DirectionFooter label="Process" onOpenArchive={onOpenArchive} />
    </article>
  )
}

function WorkViewer({ work, onClose, onMoveWork, returnFocusRef }) {
  const [current, setCurrent] = useState(0)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const activeImage = work.images[current]
  const recordFacts = [
    ...(work.date ? [['Date', work.date]] : []),
    ...(work.material ? [['Material', work.material]] : []),
    ...(work.dimensions ? [['Dimensions', work.dimensions]] : []),
    ...(work.photoCredit ? [['Photo credit', work.photoCredit]] : []),
    [work.imageLabel === 'image' ? 'Photographic images' : 'Photographic views', `${work.images.length}`],
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
            recoverable
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
            <h2 id="viewer-record-title">{work.recordType === 'collection' ? 'Collection' : 'Details'}</h2>
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
  const archiveTriggerRef = useRef(null)
  const initialWork = useMemo(() => {
    const match = window.location.hash.match(/^#work\/(.+)$/)
    return match && artworks.some((work) => work.id === match[1]) ? match[1] : null
  }, [])
  const [selectedId, setSelectedId] = useState(initialWork)
  const [archiveOpen, setArchiveOpen] = useState(window.location.hash === '#catalogue')
  const selectedWork = artworks.find((work) => work.id === selectedId)

  useEffect(() => {
    document.title = page === 'process' ? 'Jacques Fuller · Process' : 'Jacques Fuller · Sculpture'
  }, [page])

  useEffect(() => {
    const syncWorkFromUrl = () => {
      const match = window.location.hash.match(/^#work\/(.+)$/)
      const id = match?.[1]
      setSelectedId(id && artworks.some((work) => work.id === id) ? id : null)
      setArchiveOpen(window.location.hash === '#catalogue')
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
    setArchiveOpen(false)
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

  const openArchive = () => {
    const trigger = document.activeElement
    if (trigger instanceof HTMLElement && !trigger.closest('.archive-index')) archiveTriggerRef.current = trigger
    setSelectedId(null)
    setArchiveOpen(true)
    window.history.pushState(
      { galleryCatalogue: true },
      '',
      `${window.location.pathname}${window.location.search}#catalogue`,
    )
  }

  const closeArchive = () => {
    if (window.history.state?.galleryCatalogue) {
      window.history.back()
      return
    }
    setArchiveOpen(false)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
  }

  const moveWork = (direction) => {
    const currentIndex = artworks.findIndex((work) => work.id === selectedId)
    const nextIndex = (currentIndex + direction + artworks.length) % artworks.length
    openWork(artworks[nextIndex].id)
  }

  return (
    <>
      <div className="app-surface" inert={selectedWork || archiveOpen ? true : undefined} aria-hidden={selectedWork || archiveOpen ? 'true' : undefined}>
        <div className="preview-viewport preview-viewport--clean">
          {page === 'process'
            ? <ImmersiveProcess onOpen={openWork} onOpenArchive={openArchive} />
            : <ImmersiveIndex onOpen={openWork} onOpenArchive={openArchive} />}
        </div>
      </div>
      {archiveOpen && (
        <ArchiveIndex
          works={artworks}
          onClose={closeArchive}
          onOpen={openWork}
          returnFocusRef={archiveTriggerRef}
        />
      )}
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
