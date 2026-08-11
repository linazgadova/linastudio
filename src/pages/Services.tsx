import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Btn } from '../components/Btn'
import { useLang } from '../i18n/lang'
import { SERVICES, SERVICES_PAGE } from '../data/services'
import { PROJECTS } from '../data/projects'
import { PROFILE } from '../data/profile'
import { UI } from '../data/ui'
import { useAuroraSection } from '../aurora/target'
import { Reveal } from '../components/Reveal'

/**
 * УСЛУГИ
 *
 * Страница, на которую человек приходит с вопросом «а это вы делаете
 * и сколько это стоит», а не за впечатлением. Поэтому здесь ровный
 * список без сбивки: шесть блоков одинакового устройства, чтобы можно
 * было сравнить их глазами, не вчитываясь.
 *
 * Пример под каждой услугой — ссылка в портфолио, а не картинка.
 * Утверждение «делаю интернет-магазины» без работающего магазина
 * рядом ничего не стоит, и это правило всего сайта.
 */
export function Services() {
  const ref = useRef<HTMLElement>(null)
  const { t, path } = useLang()

  // Шар отведён вправо и вполсилы: страница читается сверху вниз
  // длинным списком, и яркое пятно под строками тут только мешает
  useAuroraSection(
    ref,
    {
      cx: 1.02, cy: 0.24, radius: 0.2, form: 0.55, intensity: 0.7, shift: 0.4,
      accent: '#4B2BF5', tint: 0.5,
    },
    {
      cx: 0.96, cy: 0.72, radius: 0.26, form: 0.6, intensity: 0.8, shift: 0.6,
      accent: '#22C9E8', tint: 0.5,
    },
  )

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

          <h1 className="pagehead__title pagehead__title--plain">{t(SERVICES_PAGE.title)}</h1>
          <p className="pagehead__tagline">{t(SERVICES_PAGE.lede)}</p>
        </div>
      </header>

      <section className="shell section" style={{ paddingTop: 0 }} aria-label={t(SERVICES_PAGE.title)}>
        <div className="uslugi">
          {SERVICES.map((s, i) => {
            const shown = s.examples
              .map((id) => PROJECTS.find((p) => p.id === id))
              .filter((p): p is (typeof PROJECTS)[number] => Boolean(p))

            return (
              <Reveal className="usluga" key={s.id} delay={i * 40}>
                <h2 className="usluga__title">{t(s.label)}</h2>
                <p className="usluga__lede">{t(s.lede)}</p>

                <h3 className="usluga__label">{t(SERVICES_PAGE.includesLabel)}</h3>
                <ul className="usluga__list">
                  {s.includes.map((item) => (
                    <li key={item.ru}>{t(item)}</li>
                  ))}
                </ul>

                {shown.length > 0 && (
                  <>
                    <h3 className="usluga__label">{t(SERVICES_PAGE.exampleLabel)}</h3>
                    <ul className="usluga__cases">
                      {shown.map((p) => (
                        <li key={p.id}>
                          <Link
                            className="usluga__case"
                            to={path(`/work/${p.id}`)}
                            style={{ ['--c' as string]: p.color, ['--i' as string]: p.ink }}
                          >
                            <span className="usluga__case-name">{t(p.name)}</span>
                            <span className="usluga__case-tag">{t(p.tagline)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Оговорка стоит после примеров, а не вместо них: она
                    уточняет, чего в портфолио нет, и это признание,
                    а не заголовок раздела */}
                {s.gap && <p className="usluga__gap">{t(s.gap)}</p>}
              </Reveal>
            )
          })}
        </div>

        <div className="uslugi__aside">
          <Reveal className="pricebox">
            <h2 className="pricebox__title">{t(SERVICES_PAGE.priceTitle)}</h2>
            <p className="pricebox__lede">{t(SERVICES_PAGE.priceLede)}</p>
            <ul className="pricebox__list">
              {SERVICES_PAGE.factors.map((f) => (
                <li key={f.ru}>{t(f)}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="pricebox" delay={80}>
            <h2 className="pricebox__title">{t(SERVICES_PAGE.askTitle)}</h2>
            <ol className="pricebox__list pricebox__list--num">
              {SERVICES_PAGE.ask.map((q) => (
                <li key={q.ru}>{t(q)}</li>
              ))}
            </ol>
            <p className="pricebox__note">{t(SERVICES_PAGE.askClosing)}</p>
          </Reveal>
        </div>

        <Reveal className="uslugi__cta">
          <h2 className="uslugi__cta-title">{t(SERVICES_PAGE.ctaTitle)}</h2>
          <p className="uslugi__cta-lede">{t(SERVICES_PAGE.ctaLede)}</p>
          <p className="uslugi__cta-row">
            {PROFILE.telegram && (
              <Btn solid label={`@${PROFILE.telegram}`} href={`https://t.me/${PROFILE.telegram}`} />
            )}
            <Btn label={PROFILE.email} href={`mailto:${PROFILE.email}`} />
          </p>
        </Reveal>
      </section>
    </main>
  )
}
