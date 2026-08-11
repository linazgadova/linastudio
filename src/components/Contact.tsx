import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../i18n/lang'
import { CONTACT, PROFILE } from '../data/profile'
import { FAQ, SERVICES, SITE_URL } from '../data/seo'
import { SHOW_IKS, iksImage, iksLink } from '../data/analytics'
import { CONSENT_EVENT, hasConsent } from '../analytics/metrika'
import { UI } from '../data/ui'
import { useAuroraSection } from '../aurora/target'
import { Reveal } from './Reveal'

export function Contact() {
  const { t, path } = useLang()
  const ref = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  // Финал: шар выкатывается в центр, опускается под адрес и
  // разрастается — это последнее, что человек видит на странице
  useAuroraSection(ref, {
    cx: 0.5,
    cy: 0.1,
    radius: 0.42,
    form: 0.4,
    intensity: 0.9,
    // Кольцо почти замкнулось: в финале снова фиолет, но с голубым,
    // и страница возвращается туда, откуда начиналась
    shift: 0.86,
    // Малиновый, тот же, что на первом экране. Возврат к начальному
    // цвету на последнем блоке закрывает страницу как круг: человек
    // приходит туда же, откуда пришёл, и это последнее, что он видит
    accent: '#FF2D6F',
    tint: 0.5,
  })

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(PROFILE.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // Буфер обмена недоступен — ссылка mailto рядом всё равно работает
    }
  }

  return (
    <section className="contact" id="contact" ref={ref} aria-labelledby="contact-title">

      <div className="shell contact__inner">
        <Reveal>
          <h2 className="section__title" id="contact-title">
            {t(CONTACT.title)}
          </h2>
          <p className="section__lede contact__lede">{t(CONTACT.lede)}</p>
        </Reveal>

        {/*
          Список того, что можно заказать. Он здесь не для поисковика,
          а для человека, который дочитал до контактов и прикидывает,
          его ли это случай. То, что теми же словами задают запрос
          в поиске, — следствие, а не причина: подписывать умения,
          за которыми нет работы, значит менять доверие на позицию.
        */}
        <Reveal delay={60}>
          <ul className="services">
            {SERVICES.map((s) => (
              <li className="services__item" key={s.term}>
                {t(s.label)}
              </li>
            ))}
          </ul>
          {/* Строчка ведёт на страницу, где у каждой из этих шести
              есть состав работы и пример. Без неё список остаётся
              перечислением слов, а страница услуг — сиротой, на
              которую внутри сайта не ссылается никто */}
          <p className="services__more">
            <Link to={path('/uslugi')}>{t(UI.servicesMore)}</Link>
          </p>
        </Reveal>

        {/* Телеграм первым: туда она отвечает быстрее, и человеку
            проще написать в мессенджер, чем составлять письмо */}
        <Reveal delay={90}>
          {/* Подписи обязательны: «@iteachzg» само по себе не говорит,
              куда писать, а адрес почты узнаётся по виду */}
          {PROFILE.telegram && (
            <>
              <span className="contact__label">Telegram</span>
              <a
                className="contact__mail"
                href={`https://t.me/${PROFILE.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                @{PROFILE.telegram}
              </a>
            </>
          )}

          <span className="contact__label contact__label--second">{t(UI.emailLabel)}</span>
          <a className="contact__second" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>

          <div className="contact__links">
            {/* Значок меняется вместе с подписью: галочка — то, что
                видно раньше слова, а слово подтверждает, что именно
                скопировалось */}
            <button type="button" className="btn" onClick={copyEmail} data-done={copied ? '' : undefined}>
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                {copied ? (
                  <path
                    d="M3.5 8.5 6.5 11.5 12.5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M5.5 5.5V3.2h7.3v7.3h-2.3M3.2 5.5h7.3v7.3H3.2z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
              {copied ? t(UI.copied) : t(UI.copyEmail)}
            </button>

            {PROFILE.github && (
              <a
                className="btn"
                href={`https://github.com/${PROFILE.github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
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
          </div>
        </Reveal>

        {/*
          Частые вопросы. Свёрнуты сознательно: человеку, который
          уже решил написать, они не нужны и только отодвигали бы
          контакты вниз. Тому, кто ещё выбирает, они под рукой.
          Поисковики и языковые модели читают содержимое details
          независимо от того, раскрыт он или нет.
        */}
        <Reveal delay={120}>
          <div className="faq">
            {FAQ.map((item) => (
              <details className="faq__item" key={item.q.ru}>
                <summary className="faq__q">{t(item.q)}</summary>
                <p className="faq__a">{t(item.a)}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/**
 * Согласие на аналитику — в виде состояния.
 *
 * Ответ лежит в хранилище браузера, а хранилище о своих изменениях
 * не сообщает. Поэтому подписываемся на собственное событие, которое
 * шлёт окно с вопросом: без него значок появлялся бы только после
 * перезагрузки страницы.
 */
function useConsent(): boolean {
  const [ok, setOk] = useState(hasConsent)

  useEffect(() => {
    function heard(e: Event) {
      setOk((e as CustomEvent<boolean>).detail === true)
    }
    window.addEventListener(CONSENT_EVENT, heard)
    return () => window.removeEventListener(CONSENT_EVENT, heard)
  }, [])

  return ok
}

/**
 * ПОДВАЛ
 *
 * Заканчивает страницу, а не подписывает её. Внизу человек либо
 * уходит, либо ищет дорогу дальше, и здесь лежит и то и другое:
 * адреса, разделы, обязательная политика.
 *
 * Держится всё на имени студии во всю ширину экрана, подрезанном
 * снизу. Это самый крупный набор на сайте — крупнее первого экрана,
 * — и единственный, который выходит за поля.
 */
export function Footer() {
  const { lang, t, path } = useLang()
  const surname = t(PROFILE.surname)
  const consented = useConsent()

  const pages = [
    { to: `${path('/')}#work`, label: t(UI.navWork) },
    { to: path('/uslugi'), label: t(UI.navServices) },
    { to: path('/rabota'), label: t(UI.hireName) },
  ]

  return (
    <footer className="footer">
      <div className="shell footer__top">
        <div className="footer__act">
          {PROFILE.telegram && (
            <a
              className="fbtn fbtn--solid"
              href={`https://t.me/${PROFILE.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t(UI.writeTelegram)}
              <svg viewBox="0 0 14 14" width="12" height="12" aria-hidden="true">
                <path
                  d="M2.5 7h9M8 3.5 11.5 7 8 10.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          )}
          <a className="fbtn" href={`mailto:${PROFILE.email}`}>
            {PROFILE.email}
          </a>
        </div>

        <nav className="footer__nav" aria-label={t(UI.footerNav)}>
          {pages.map((p) => (
            <Link className="footer__link" to={p.to} key={p.to}>
              {p.label}
            </Link>
          ))}
          {PROFILE.github && (
            <a
              className="footer__link"
              href={`https://github.com/${PROFILE.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
        </nav>
      </div>

      {/*
        Подпись во всю ширину, подрезанная снизу.

        Здесь имя студии, а не имя человека: адрес сайта — linastudio,
        и подпись под ним должна совпадать с тем, что человек набрал
        в строке браузера. Фамилия стоит ниже, в копирайте.

        Единственное место на сайте, где буквы выходят за поля и за
        край экрана. Кегль считается в долях ширины окна, поэтому
        строка садится по краям одинаково и на телефоне, и на
        мониторе, а нижнюю четверть срезает край подвала.

        Буквы разложены по отдельности ради наведения: каждая
        отзывается сама, и рука ведёт по слову, как по клавишам.
        Уменьшение делается transform — раскладка от него не
        меняется, и соседние буквы стоят на месте.

        aria-hidden: адрес сайта озвучке ни к чему, а по буквам она
        прочитала бы его как «эль-и-эн-а».
      */}
      <p className="footer__sign" aria-hidden="true">
        {[...'LINA STUDIO'].map((ch, i) =>
          ch === ' ' ? (
            <span className="footer__sign-gap" key={i} />
          ) : (
            <span className="footer__sign-ch" key={i}>
              {ch}
            </span>
          ),
        )}
      </p>

      <div className="shell footer__meta">
        <p className="footer__mnote">
          © {new Date().getFullYear()} · {t(PROFILE.name)}
          {surname ? ` ${surname}` : ''} · {t(PROFILE.location)}
        </p>

        {/* Политика обработки данных живёт в подвале, а не в меню:
            её ищут именно здесь, и по закону она должна быть
            доступна с любой страницы сайта */}
        <Link className="footer__link footer__mnote" to={path('/privacy')}>
          {t(UI.privacyLink)}
        </Link>

        {/*
          Значок качества сайта от Яндекса.

          Он появляется только после согласия на аналитику, и это не
          перестраховка: значок — картинка с сервера Яндекса, такое же
          обращение к третьей стороне, как и счётчик. Грузить её до
          ответа значило бы обойти собственное окно с вопросом,
          а заодно разойтись с политикой, где написано обратное.

          Размеры проставлены числами: картинка приезжает с чужого
          сервера, и без них подвал подпрыгивает в момент её появления.
        */}
        {SHOW_IKS && consented && (
          <a className="iks" href={iksLink(SITE_URL)} target="_blank" rel="noopener noreferrer">
            <img
              src={iksImage(SITE_URL, lang)}
              width={88}
              height={31}
              loading="lazy"
              alt={t(UI.iksAlt)}
            />
          </a>
        )}
      </div>
    </footer>
  )
}
