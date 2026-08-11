import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/lang'
import { HIRE } from '../data/hire'
import { PROJECTS } from '../data/projects'
import { LAYERS } from '../data/layers'
import { PROFILE, LIMITS } from '../data/profile'
import { UI } from '../data/ui'
import { useAuroraSection } from '../aurora/target'
import { Reveal } from '../components/Reveal'

/**
 * СТРАНИЦА ДЛЯ РАБОТОДАТЕЛЯ
 *
 * Читают её быстро и по диагонали, поэтому здесь нет ни одного
 * блока, который нужно вчитывать: должности списком, слои таблицей,
 * код ссылками. Впечатление производит главная, а эта страница
 * отвечает на вопросы.
 *
 * Таблица одна на всё: проект, роль, слои и стек в одной строке.
 * Разнести слои и стек по двум таблицам значило бы написать названия
 * проектов дважды и заставить сверять их глазами.
 *
 * Отбивки между блоками здесь свои и вдвое короче общих: страница
 * читается как один документ, а не как главная, где каждый раздел
 * выходит на пустой экран.
 */
export function Hire() {
  const headRef = useRef<HTMLElement>(null)
  const tableRef = useRef<HTMLElement>(null)
  const howRef = useRef<HTMLElement>(null)
  const endRef = useRef<HTMLElement>(null)
  const { t, path } = useLang()

  /*
   * ТРАЕКТОРИЯ ШАРА
   *
   * Одна точка на всю страницу оставила бы его неподвижным: сцена
   * держит единственную объявленную точку и никуда не едет. Отсюда
   * и четыре — по одной на смысловой блок.
   *
   * Путь нарочно другой, чем на главной. Там шар ходит через середину
   * экрана: из центра вправо, оттуда влево и обратно в центр. Здесь он
   * середины не пересекает ни разу — идёт по краям и по нижним углам,
   * справа вниз, оттуда налево и обратно направо.
   *
   * Так решается и главная беда этой страницы: текст на ней идёт во
   * всю ширину — таблица на девять колонок, две колонки метода, три
   * колонки кода. Пустует только низ экрана и поля по бокам, и весь
   * путь проложен по ним. cy отсчитывается от низа, поэтому у нижних
   * положений он маленький, а сам шар наполовину уходит за обрез.
   *
   * Там, где шар всё-таки достаёт до строк, под текстом лежит
   * размывка бумаги — hire__veil в стилях.
   */
  useAuroraSection(
    headRef,
    {
      cx: 0.76, cy: 0.66, radius: 0.32, form: 0.74, intensity: 1.05, shift: 0,
      accent: '#FF2D6F', tint: 0.5,
    },
    // Точка на полпути прижата к правому полю: напрямик от заголовка
    // к низу таблицы шар прошёл бы через её середину
    { cx: 1.0, cy: 0.4, radius: 0.24, form: 0.5, intensity: 0.9, shift: 0.18, accent: '#8B3BF0', tint: 0.55 },
  )
  useAuroraSection(tableRef, {
    cx: 0.92, cy: 0.08, radius: 0.34, form: 0.5, intensity: 0.9, shift: 0.34,
    accent: '#5B3BE8', tint: 0.55,
  })
  useAuroraSection(howRef, {
    cx: 0.06, cy: 0.14, radius: 0.32, form: 0.62, intensity: 0.9, shift: 0.62,
    accent: '#22C9E8', tint: 0.5,
  })
  // В контактах главной шар встаёт ровно по центру. Здесь он выходит
  // из правого угла — последний кадр страницы не должен повторять
  // последний кадр той, с которой на неё пришли
  useAuroraSection(endRef, {
    cx: 0.86, cy: 0.12, radius: 0.44, form: 0.45, intensity: 0.95, shift: 0.88,
    accent: '#FF2D6F', tint: 0.5,
  })

  return (
    <main id="main" className="hire">
      <header className="pagehead" ref={headRef}>
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

          <h1 className="pagehead__title pagehead__title--plain">{t(HIRE.title)}</h1>

          {/* Подводке подложка нужнее заголовка: на телефоне шар
              приходится ровно на неё, а заголовок крупный и тёмный —
              он краску переживает */}
          <p className="pagehead__tagline hire__veil">{t(HIRE.lede)}</p>

          <p className="hire__aka hire__veil">
            <span className="hire__aka-label">{t(HIRE.akaTitle)}:</span> {t(HIRE.aka)}
          </p>
        </div>
      </header>

      <section className="shell hire__band" ref={tableRef} aria-labelledby="hire-layers">
        <Reveal>
          <h2 className="hire__title" id="hire-layers">
            {t(HIRE.layersTitle)}
          </h2>
          <p className="hire__lede">{t(HIRE.layersLede)}</p>
        </Reveal>

        <Reveal className="hire__tablewrap hire__veil" delay={60}>
          <table className="hire__table">
            <thead>
              <tr>
                <th scope="col">{t(HIRE.colProject)}</th>
                <th scope="col">{t(HIRE.colRole)}</th>
                {LAYERS.map((l) => (
                  <th scope="col" className="hire__lcol" key={l.id} title={t(l.hint)}>
                    <span className="hire__lfull">{t(l.title)}</span>
                    <span className="hire__lshort" aria-hidden="true">
                      {t(l.short)}
                    </span>
                  </th>
                ))}
                <th scope="col">{t(HIRE.colStack)}</th>
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map((p) => (
                /* Строка с полным набором слоёв подсвечена: три проекта,
                   сделанных от макета до домена, — главное, что читатель
                   должен унести с этой таблицы, и в шести колонках точек
                   они иначе теряются среди частичных */
                <tr key={p.id} data-all={p.layers.length === LAYERS.length ? '1' : undefined}>
                  <th scope="row" className="hire__proj">
                    <Link to={path(`/work/${p.id}`)} style={{ ['--c' as string]: p.color }}>
                      {t(p.name)}
                    </Link>
                    <span className="hire__tag">
                      {t(p.tagline)}
                      {p.closed && ` — ${t(HIRE.closedNote)}`}
                    </span>
                  </th>
                  <td className="hire__role" data-label={t(HIRE.colRole)}>
                    {t(p.role)}
                  </td>
                  {LAYERS.map((l) => {
                    const mine = p.layers.includes(l.id)
                    return (
                      <td className="hire__cell" data-on={mine ? '1' : undefined} key={l.id}>
                        {/* Точка держит матрицу на широком экране, имя
                            слоя — на узком, где таблица разбирается на
                            блоки. Ответ для озвучки идёт словами: сама
                            точка ей ничего не говорит */}
                        <span className="hire__dot" aria-hidden="true" />
                        <span className="hire__lname" aria-hidden="true">
                          {t(l.short)}
                        </span>
                        <span className="sr-only">
                          {t(l.title)} — {mine ? t(HIRE.layerYes) : t(HIRE.layerNo)}
                        </span>
                      </td>
                    )
                  })}
                  <td className="hire__stack" data-label={t(HIRE.colStack)}>
                    {p.stack.join(' · ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      {/* Метод и формат стоят рядом, а не друг под другом: это два
          коротких блока, и вертикалью они растягивали бы страницу
          пустотой между собой */}
      <section className="shell hire__band hire__band--rule" ref={howRef} aria-labelledby="hire-how">
        <div className="hire__duo hire__veil">
          <Reveal className="hire__col">
            <h2 className="hire__title" id="hire-how">
              {t(HIRE.howTitle)}
            </h2>
            <p className="hire__how">{t(LIMITS)}</p>
          </Reveal>

          <Reveal className="hire__col hire__col--aside" delay={70}>
            <h2 className="hire__title">{t(HIRE.formatTitle)}</h2>
            <ul className="hire__format">
              {HIRE.format.map((f) => (
                <li key={f.ru}>{t(f)}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="shell hire__band hire__band--rule" aria-labelledby="hire-code">
        <Reveal>
          <h2 className="hire__title" id="hire-code">
            {t(HIRE.codeTitle)}
          </h2>
          <p className="hire__lede">{t(HIRE.codeLede)}</p>
        </Reveal>

        <ul className="hire__code">
          {HIRE.code.map((c, i) => (
            <Reveal as="li" className="hire__spot hire__veil" key={c.path} delay={i * 60}>
              <a
                className="hire__path"
                href={`https://github.com/${PROFILE.github}/linastudio/blob/main/${c.path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {c.path}
              </a>
              <p className="hire__what">{t(c.what)}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/*
        Конец страницы — то место, где нанимающий решает, писать или
        нет. Дорога назад стоит здесь же: до этой строки он пролистал
        таблицу на семь проектов, и возвращаться к шапке за ссылкой
        на главную ему пришлось бы через всю неё.
      */}
      <section className="shell pageend" ref={endRef}>
        <Reveal className="hire__veil">
          <h2 className="hire__title">{t(HIRE.ctaTitle)}</h2>
          <p className="pageend__lede hire__cta-lede">{t(HIRE.ctaLede)}</p>

          <div className="pageend__links">
            {PROFILE.telegram && (
              <a
                className="cta"
                href={`https://t.me/${PROFILE.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(UI.writeTelegram)}
              </a>
            )}
            <a className="btn" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>
            {PROFILE.github && (
              <a
                className="btn"
                href={`https://github.com/${PROFILE.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            )}
          </div>

          <nav className="pageend__nav" aria-label={t(UI.backHome)}>
            <Link className="btn" to={`${path('/')}#work`}>
              {t(UI.backToWork)}
            </Link>
            <Link className="pageend__home" to={path('/')}>
              {t(UI.backHome)}
            </Link>
          </nav>
        </Reveal>
      </section>
    </main>
  )
}
