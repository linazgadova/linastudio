import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Btn } from '../components/Btn'
import { useLang } from '../i18n/lang'
import { PROJECTS } from '../data/projects'
import { LAYERS } from '../data/layers'
import { UI } from '../data/ui'
import { CLIPS, PREVIEWS, SHOTS } from '../assets/previews'
import { useAuroraSection } from '../aurora/target'
import { Reveal } from '../components/Reveal'
import { Clip } from '../components/Clip'
import { Shot } from '../components/Shot'
import { NotFound } from './NotFound'

export function ProjectPage() {
  const { id } = useParams()
  const { t, path } = useLang()
  const project = PROJECTS.find((p) => p.id === id)

  const headRef = useRef<HTMLElement>(null)
  const detailRef = useRef<HTMLElement>(null)
  const framesRef = useRef<HTMLElement>(null)
  const insideRef = useRef<HTMLElement>(null)
  const endRef = useRef<HTMLElement>(null)

  /*
    Шар едет и здесь. Раньше он стоял приколотым в одной точке, и
    страница проекта выпадала из общего движения сайта: снаружи он
    перекатывается, а внутри висит.

    Держится он у краёв и мельче, чем на главной: тут читают текст,
    и крупное пятно посреди колонки мешало бы. Цвет продолжает то же
    кольцо, что и на главной, — переход со списка на проект не сбивает
    ощущение одного места.

    Часть блоков на некоторых проектах не отрисовывается (кадров может
    не быть). Хуки при этом вызываются всегда: ссылка остаётся пустой,
    и точка просто не встаёт в цепочку.
  */
  /*
    Цвет шара на странице проекта — фирменный цвет самого проекта.

    Он и так уже задан в данных: им подписаны плашки и заливки в
    карточке. Отдать его шару стоит ровно ничего, а работает это как
    смена обстановки: человек, перешедший с общего списка на Пифику,
    попадает в фиолетовую страницу с фиолетовым шаром, а на Громстрое
    та же страница становится золотой. Одно и то же движение читается
    разным местом.

    Сила меньше, чем на главной. Там шар — единственный цветной
    предмет на экране, здесь рядом с ним лежат кадры самого продукта,
    и полностью перекрашенный шар начал бы с ними спорить.
  */
  const tone = { accent: project?.color ?? '#5B3BE8', tint: 0.46 }

  useAuroraSection(
    headRef,
    /*
      Верхний правый угол, рядом с названием проекта: это первый кадр
      страницы, и держится он до первого движения колеса.

      Выше не поднимается: шапка набрана поверх содержимого режимом
      наложения, и на ярком пятне её строка выбивает белый
      прямоугольник во всю свою высоту.
    */
    { cx: 0.94, cy: 0.62, radius: 0.24, form: 0.6, intensity: 0.95, shift: 0.12, ...tone },
    // Пересекая колонку, шар сжимается почти в точку. Крупное пятно,
    // проезжающее сквозь абзац, читать мешает, а маленькое проходит
    // между строк и работает как отбивка
    { cx: 0.5, cy: 0.58, radius: 0.08, form: 0.4, intensity: 0.9, shift: 0.2, ...tone, tint: 0.6 },
  )
  useAuroraSection(detailRef, {
    cx: 0.04,
    cy: 0.55,
    radius: 0.18,
    form: 0.5,
    intensity: 0.9,
    shift: 0.32,
    ...tone,
  })
  useAuroraSection(
    framesRef,
    { cx: 0.06, cy: 0.5, radius: 0.24, form: 0.7, intensity: 0.9, shift: 0.48, ...tone },
    { cx: 0.5, cy: 0.5, radius: 0.08, form: 0.4, intensity: 0.9, shift: 0.58, ...tone, tint: 0.6 },
  )
  useAuroraSection(insideRef, {
    cx: 0.96,
    cy: 0.5,
    radius: 0.22,
    form: 0.6,
    intensity: 0.88,
    shift: 0.68,
    ...tone,
  })
  useAuroraSection(endRef, {
    cx: 0.5,
    cy: 0.14,
    radius: 0.36,
    form: 0.45,
    intensity: 0.9,
    shift: 0.9,
    ...tone,
  })

  // Несуществующий проект — та же страница, что и любой другой
  // неизвестный адрес. Отдельная короткая заглушка на этом месте
  // выглядела бы недоделанным куском сайта, а человеку в обоих
  // случаях нужно одно: список того, что здесь есть
  if (!project) return <NotFound />

  const owned = LAYERS.filter((l) => project.layers.includes(l.id)).map((l) => t(l.title))
  const shots = SHOTS[project.id] ?? []
  const cover = PREVIEWS[project.id]?.[0]
  const clip = CLIPS[project.id]

  // Следующий по списку, а на последнем — первый: цепочка замкнута,
  // и человек не упирается в тупик на последнем проекте
  const at = PROJECTS.indexOf(project)
  const next = PROJECTS[(at + 1) % PROJECTS.length]

  return (
    <main id="main" style={{ ['--c' as string]: project.color }}>
      <header className="pagehead" ref={headRef}>
        <div className="shell pagehead__inner">
          <Link className="back" to={`${path('/')}#work`}>
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path
                d="M13 8H3M7 4 3 8l4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t(UI.backToWork)}
          </Link>

          <h1 className="pagehead__title">{t(project.name)}</h1>
          <p className="pagehead__tagline">{t(project.tagline)}</p>
        </div>
      </header>

      <section className="shell" ref={detailRef} style={{ paddingBottom: 'clamp(3rem, 7vw, 6rem)' }}>
        <div className="detail">
          <Reveal>
            <p className="detail__summary">{t(project.summary)}</p>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {project.closed ? (
                <span className="closed">
                  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                    <path
                      d="M4.5 7V5a3.5 3.5 0 1 1 7 0v2M3.5 7h9v6h-9z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t(UI.closedNote)}
                </span>
              ) : (
                <a className="cta" href={project.url} target="_blank" rel="noopener noreferrer">
                  {t(UI.openSite)}
                  <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
                    <path
                      d="M4 10 10 4M10 4H5.2M10 4v4.8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              )}

              {project.extraLink && (
                <Btn label={t(project.extraLink.label)} href={project.extraLink.url} />
              )}
            </div>

            {project.notMine && (
              <p className="ask__note" style={{ marginTop: '1rem' }}>
                {t(project.notMine)}
              </p>
            )}
          </Reveal>

          <Reveal className="facts" delay={100}>
            <div>
              <span className="fact__label">{t(UI.roleLabel)}</span>
              <span className="fact__value">{t(project.role)}</span>
            </div>
            <div>
              <span className="fact__label">{t(UI.layersLabel)}</span>
              <span className="fact__value">{owned.join(' · ')}</span>
            </div>
            <div>
              <span className="fact__label">{t(UI.stackLabel)}</span>
              <span className="chips">
                {project.stack.map((s) => (
                  <span className="chip" key={s}>
                    {s}
                  </span>
                ))}
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {(shots.length > 0 || cover || clip) && (
        <section
          className="shell"
          ref={framesRef}
          style={{ paddingBottom: 'clamp(3rem, 7vw, 6rem)' }}
        >
          {clip && (
            <Reveal>
              <Clip src={clip} poster={cover} caption={t(UI.clipCaption)} />
            </Reveal>
          )}

          <Reveal className="frames">
            {shots.length > 0 ? (
              shots.map((shot, i) => (
                /*
                  Первый кадр идёт во всю ширину, остальные встают
                  парами. Ровная сетка из одинаковых плиток читается
                  списком файлов; здесь же первый кадр — это главный
                  экран продукта, и он должен открывать блок, а не
                  стоять в очереди наравне с деталями.
                */
                <figure
                  key={shot.src}
                  className={
                    `frames__item frames__item--${shot.kind}` +
                    (i === 0 && shot.kind === 'desktop' ? ' frames__item--lead' : '')
                  }
                >
                  {shot.kind === 'phone' ? (
                    <div className="frame-phone">
                      <div className="frame-phone__screen">
                        <span className="frame-phone__notch" aria-hidden="true" />
                        <img src={shot.src} alt={t(shot.caption)} loading="lazy" />
                      </div>
                    </div>
                  ) : (
                    <Shot src={shot.src} alt={t(shot.caption)} />
                  )}
                  <figcaption className="frame-caption">{t(shot.caption)}</figcaption>
                </figure>
              ))
            ) : (
              <Shot src={cover} alt={t(project.name)} />
            )}
          </Reveal>
        </section>
      )}

      <section className="shell section" ref={insideRef} style={{ paddingTop: 0 }}>
        <Reveal className="section__head">
          <h2 className="section__title">{t(UI.inside)}</h2>
        </Reveal>

        {/*
          Разборы пронумерованы. Номер тут не украшение: он говорит,
          сколько всего частей и на какой из них человек сейчас,
          а в длинном тексте это единственный способ не потеряться.
        */}
        <div className="deep">
          {project.inside.map((item, i) => (
            <Reveal className="deep__item" key={item.title.ru} delay={i * 55}>
              <span className="deep__num">
                {String(i + 1).padStart(2, '0')}
                <span className="deep__of">/{String(project.inside.length).padStart(2, '0')}</span>
              </span>
              <h3 className="deep__title">{t(item.title)}</h3>
              <p className="deep__text">{t(item.detail)}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Переход к соседнему проекту: дочитавшему логичнее пойти
          дальше по работам, чем возвращаться к списку и искать место,
          на котором он остановился */}
      {next && (
        <section className="shell">
          <Reveal>
            <Link className="nextwork" to={path(`/work/${next.id}`)} style={{ ['--c' as string]: next.color }}>
              <span className="nextwork__label">{t(UI.nextProject)}</span>
              <span className="nextwork__name">{t(next.name)}</span>
              <span className="nextwork__tagline">{t(next.tagline)}</span>
            </Link>
          </Reveal>
        </section>
      )}

      {/*
        Конец разбора. Здесь только дорога дальше: адреса стоят
        в подвале сразу под этим блоком, и повторять их значило бы
        дать человеку две одинаковые кнопки подряд.
      */}
      <section className="shell pageend" ref={endRef}>
        <Reveal>
          {/*
            «Все проекты» — кнопкой, а не строчкой.

            Дочитавший разбор стоит внизу длинной страницы, и дорога
            назад к списку у него была одна: листать вверх до шапки.
            Ссылка тут и раньше стояла, но серой строкой в один ряд
            с «на главную» — на неё не смотрели, потому что она не
            выглядела дорогой.

            «На главную» остаётся строчкой намеренно: два одинаковых
            выделения рядом снова не дают выбрать, а из списка проектов
            на главную и так попадаешь одним движением.
          */}
          <nav className="pageend__nav" aria-label={t(UI.backToWork)}>
            <Btn label={t(UI.backToWork)} to={`${path('/')}#work`} />
            <Link className="pageend__home" to={path('/')}>
              {t(UI.backHome)}
            </Link>
          </nav>
        </Reveal>
      </section>
    </main>
  )
}

