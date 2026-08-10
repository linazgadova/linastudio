import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/lang'
import { OPERATOR, PRIVACY } from '../data/legal'
import { UI } from '../data/ui'
import { useAuroraSection } from '../aurora/target'
import { Reveal } from '../components/Reveal'

/**
 * ПОЛИТИКА ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ
 *
 * Страница, которую по закону надо держать открытой, и единственная
 * на сайте, куда человек приходит не за впечатлением, а за ответом
 * на конкретный вопрос. Поэтому здесь нет ни сбивки, ни контурных
 * слов, ни кадров: одна колонка, крупный текст, ровные отступы.
 *
 * Шар при этом остаётся — сайт не должен разваливаться на «красивую
 * часть» и «служебную». Но он мельче обычного и отведён к самому
 * краю: на этой странице читают.
 */
export function Privacy() {
  const ref = useRef<HTMLElement>(null)
  const { t, path } = useLang()

  useAuroraSection(ref, {
    /* За правым краем и вполсилы. На остальных страницах шар держит
       композицию, здесь он мешал бы: колонка идёт во всю ширину, и
       любое яркое пятно оказывается прямо под строкой */
    cx: 1.06,
    cy: 0.3,
    radius: 0.13,
    form: 0.5,
    intensity: 0.66,
    shift: 0.42,
    accent: '#4B2BF5',
    tint: 0.5,
  })

  return (
    <main id="main" ref={ref}>
      <header className="pagehead">
        <div className="shell pagehead__inner">
          <Link className="back" to={path('/')}>
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
            {t(UI.backHome)}
          </Link>

          <h1 className="pagehead__title pagehead__title--plain">{t(PRIVACY.title)}</h1>
          <p className="pagehead__tagline">{t(PRIVACY.lede)}</p>
        </div>
      </header>

      <section className="shell section" style={{ paddingTop: 0 }}>
        <div className="legal">
          {PRIVACY.blocks.map((block, i) => (
            <Reveal className="legal__block" key={block.title.ru} delay={i * 40}>
              <h2 className="legal__title">{t(block.title)}</h2>
              <ul className="legal__list">
                {block.items.map((item) => (
                  <li key={item.ru}>{t(item)}</li>
                ))}
              </ul>
            </Reveal>
          ))}

          <Reveal className="legal__block">
            <h2 className="legal__title">{t(PRIVACY.contactTitle)}</h2>
            <ul className="legal__list">
              <li>
                {t(OPERATOR.fullName)} — {t(OPERATOR.status)}
              </li>
              {OPERATOR.inn && (
                <li>
                  {t(PRIVACY.innLabel)}: {OPERATOR.inn}
                </li>
              )}
              <li>
                <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
              </li>
              <li className="legal__stamp">
                {t(PRIVACY.updatedLabel)} {t(OPERATOR.updated)}
              </li>
            </ul>
          </Reveal>
        </div>
      </section>
    </main>
  )
}
