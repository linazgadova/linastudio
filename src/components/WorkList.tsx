import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/lang'
import { PROJECTS } from '../data/projects'
import { UI } from '../data/ui'
import { PREVIEWS } from '../assets/previews'
import { useAuroraSection } from '../aurora/target'
import { Words } from './Words'
import { Reveal } from './Reveal'

/**
 * Проекты — крупными строками, а не сеткой одинаковых карточек.
 * Превью не занимает место постоянно, а всплывает у курсора:
 * список остаётся читаемым, а картинка появляется тогда,
 * когда человек уже выбрал, на что смотреть.
 */
export function WorkList() {
  const { t, path } = useLang()
  const [peek, setPeek] = useState<string | null>(null)
  const peekRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const raf = useRef(0)

  // Список прижат влево, шар откатывается к правому краю и вырастает.
  // По дороге к следующей секции он проходит через маленькую точку
  // в центре экрана: два больших положения подряд без провала между
  // ними читались бы как один переезд, а не как два состояния
  useAuroraSection(
    sectionRef,
    // Электрический фиолет: цвет работы. Он же держит провал между
    // проектами и «Как это устроено» — на маленьком шаре краска
    // должна быть самой густой, иначе он теряется на бумаге
    {
      cx: 0.93, cy: 0.5, radius: 0.4, form: 0.85, intensity: 1, shift: 0.26,
      accent: '#5B3BE8', tint: 0.56,
    },
    {
      cx: 0.5, cy: 0.52, radius: 0.13, form: 0.45, intensity: 1, shift: 0.44,
      accent: '#7A3BE8', tint: 0.62,
    },
  )

  function move(e: React.MouseEvent) {
    const x = e.clientX
    const y = e.clientY
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      if (peekRef.current) {
        peekRef.current.style.left = `${x + 190}px`
        peekRef.current.style.top = `${y}px`
      }
    })
  }

  const peeked = PROJECTS.find((p) => p.id === peek)

  return (
    <section
      className="shell section side side--left"
      id="work"
      ref={sectionRef}
      aria-labelledby="work-title"
    >

      <Reveal className="section__head">
        <Words as="h2" className="section__title" id="work-title">
          {t(UI.workTitle)}
        </Words>
        <p className="section__lede">{t(UI.workLede)}</p>
      </Reveal>

      <div className="worklist" onMouseLeave={() => setPeek(null)}>
        {PROJECTS.map((p, i) => (
          <Reveal key={p.id} delay={i * 45}>
            <Link
              className="workrow"
              to={path(`/work/${p.id}`)}
              /* --c фирменный, --i его затемнённый вариант. Второй нужен
                 на телефоне: там название красится в цвет проекта, чтобы
                 было видно, что на него нажимают, а яркий на светлой
                 бумаге для текста не годится */
              style={{ ['--c' as string]: p.color, ['--i' as string]: p.ink }}
              onMouseEnter={() => setPeek(p.id)}
              onMouseMove={move}
            >
              <span className="workrow__name">{t(p.name)}</span>
              <span className="workrow__tagline">{t(p.tagline)}</span>
              <span className="workrow__go" aria-hidden="true">
                <svg viewBox="0 0 16 16" width="15" height="15">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>

      {/* Страница для работодателя — сразу под работами. Человек тут
          уже посмотрел, что сделано, и следующий его вопрос — что из
          этого делала она сама. Строкой в блоке контактов эта ссылка
          стояла в конце страницы, и до неё не долистывали */}
      <Reveal>
        <Link className="nextwork nextwork--hire" to={path('/rabota')}>
          <span className="nextwork__label">{t(UI.hireLabel)}</span>
          <span className="nextwork__name">{t(UI.hireName)}</span>
          <span className="nextwork__tagline">{t(UI.hirePage)}</span>
        </Link>
      </Reveal>

      <div ref={peekRef} className={`workpeek${peeked ? ' is-on' : ''}`} aria-hidden="true">
        {peeked && <img src={PREVIEWS[peeked.id]?.[0]} alt="" />}
      </div>
    </section>
  )
}
