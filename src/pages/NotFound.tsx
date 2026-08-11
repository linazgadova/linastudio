import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Btn } from '../components/Btn'
import { useLang } from '../i18n/lang'
import { UI } from '../data/ui'
import { PROJECTS } from '../data/projects'
import { PROFILE } from '../data/profile'
import { useAuroraSection } from '../aurora/target'
import { Reveal } from '../components/Reveal'

/**
 * СТРАНИЦА, КОТОРОЙ НЕТ
 *
 * Обычная 404 сообщает о неудаче и оставляет человека решать, что
 * делать дальше. Эта показывает, что здесь есть: список всех проектов
 * ссылками. Человек, попавший сюда по битой ссылке, чаще всего искал
 * что-то конкретное — и с большой вероятностью оно в этом списке.
 *
 * Шар ведёт себя как на любой другой странице: та же цепочка, тот же
 * переезд. Ошибка не повод выпадать из общего движения сайта — иначе
 * страница выглядит чужой, будто её делал кто-то другой в спешке.
 *
 * Номер набран крупно и потому, что это единственное, что здесь можно
 * поставить крупно, и потому, что он честный: человек должен понять
 * с одного взгляда, что попал не туда, а не читать об этом абзац.
 */
export function NotFound() {
  const { t, path } = useLang()
  const headRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLElement>(null)

  useAuroraSection(headRef, {
    cx: 0.5,
    cy: 0.44,
    radius: 0.3,
    form: 0.7,
    intensity: 1.05,
    shift: 0.1,
    accent: '#FF2D6F',
    tint: 0.5,
  })
  useAuroraSection(listRef, {
    cx: 0.9,
    cy: 0.5,
    radius: 0.22,
    form: 0.55,
    intensity: 0.9,
    shift: 0.4,
    accent: '#5B3BE8',
    tint: 0.5,
  })

  return (
    <main id="main">
      <section className="shell lost" ref={headRef}>
        <Reveal>
          <p className="lost__code" aria-hidden="true">
            404
          </p>
          <h1 className="lost__title">{t(UI.lostTitle)}</h1>
          <p className="lost__lede">{t(UI.lostLede)}</p>
          <div className="lost__row">
            <Btn solid label={t(UI.backHome)} to={path('/')} />
            <Btn label={t(UI.writeTelegram)} href={`https://t.me/${PROFILE.telegram}`} />
          </div>
        </Reveal>
      </section>

      <section className="shell lost__work" ref={listRef}>
        <Reveal>
          <h2 className="lost__subtitle">{t(UI.lostWork)}</h2>
          <ul className="lost__list">
            {PROJECTS.map((p) => (
              <li key={p.id}>
                <Link to={path(`/work/${p.id}`)}>
                  <span className="lost__name">{t(p.name)}</span>
                  <span className="lost__tagline">{t(p.tagline)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>
    </main>
  )
}
