import { useEffect, useRef, useState } from 'react'
import { Btn } from './Btn'
import { useLang } from '../i18n/lang'
import { UI } from '../data/ui'
import { CONSENT_KEY, METRIKA_ID } from '../data/analytics'
import { rememberConsent, startMetrika } from '../analytics/metrika'

/**
 * СОГЛАСИЕ НА АНАЛИТИКУ
 *
 * Окно поверх сайта, с ответом на выбор: принять или отклонить.
 * Пока человек не ответил, страница за окном не прокручивается.
 *
 * Такое окно — сильный ход, и оно оправдано ровно одним: до ответа
 * не отправляется ничего. Уведомление, которое можно пролистать мимо,
 * работает наоборот: счётчик уже собрал данные, а плашка просто
 * сообщает об этом задним числом.
 *
 * Отказ здесь настоящий и стоит того же одного нажатия, что согласие.
 * Обе кнопки одного размера и стоят рядом: окно, где «принять» —
 * крупная кнопка, а «отклонить» — серая ссылка под ней, спрашивает
 * не согласия, а разрешения не спрашивать.
 *
 * Клавиатура из окна не выходит, и Escape его не закрывает: закрыть
 * без ответа — третий вариант, которого у окна нет.
 */
export function Cookies() {
  const { t, path } = useLang()
  const privacyHref = path('/privacy')
  const [show, setShow] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const first = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Счётчика нет — и спрашивать не о чем. Окно «мы используем куки»
    // на сайте, который их не ставит, это ложь ради приличия
    if (!METRIKA_ID) return

    let answer: string | null = null
    try {
      answer = localStorage.getItem(CONSENT_KEY)
    } catch {
      // Хранилище недоступно — спросим, но запомнить не сможем
    }

    if (answer === 'yes') startMetrika()
    else if (answer !== 'no') setShow(true)
  }, [])

  /*
    Пока окно открыто, страница под ним не едет.

    Прокрутка запирается шириной полосы прокрутки: без этой поправки
    страница в момент запирания дёргается вправо на её ширину, потому
    что полоса исчезает вместе с прокруткой.
  */
  useEffect(() => {
    if (!show) return

    const gap = window.innerWidth - document.documentElement.clientWidth
    const { overflow, paddingRight } = document.body.style
    document.body.style.overflow = 'hidden'
    if (gap > 0) document.body.style.paddingRight = `${gap}px`

    first.current?.focus()

    // Табуляция ходит по кругу внутри окна: увести фокус на ссылки
    // за ним значит дать способ пользоваться сайтом, не отвечая
    function keys(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !box.current) return
      // Ссылка на политику тоже стоп: она внутри окна, и обойти её
      // табуляцией значило бы выпустить фокус наружу через неё
      const stops = box.current.querySelectorAll<HTMLElement>('button, a[href]')
      if (stops.length === 0) return
      const edge = e.shiftKey ? stops[0] : stops[stops.length - 1]
      if (document.activeElement === edge) {
        e.preventDefault()
        ;(e.shiftKey ? stops[stops.length - 1] : stops[0]).focus()
      }
    }

    document.addEventListener('keydown', keys)
    return () => {
      document.removeEventListener('keydown', keys)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [show])

  function answer(agreed: boolean) {
    rememberConsent(agreed)
    if (agreed) startMetrika()
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="consent" role="presentation">
      <div
        className="consent__box"
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        aria-describedby="consent-text"
      >
        <p className="consent__eyebrow" id="consent-title">
          {t(UI.cookiesTitle)}
        </p>
        <p className="consent__text" id="consent-text">
          {t(UI.cookiesText)}
        </p>
        <p className="consent__note">
          {t(UI.cookiesNote)}{' '}
          {/*
            Обычная ссылка, а не переход маршрутизатором: окно
            блокирует страницу, и перейти на политику, не ответив,
            иначе нельзя. Открытие в новой вкладке решает это без
            исключений в самом окне — человек читает документ и
            возвращается к вопросу, на который ещё не ответил.
          */}
          <a className="consent__link" href={privacyHref} target="_blank" rel="noopener">
            {t(UI.privacyLink)}
          </a>
        </p>

        <div className="consent__row">
          {/* Фокус при открытии окна уходит на первую кнопку, поэтому
              ссылка на узел прокидывается насквозь через компонент */}
          <Btn solid label={t(UI.cookiesYes)} onClick={() => answer(true)} innerRef={first} />
          <Btn label={t(UI.cookiesNo)} onClick={() => answer(false)} />
        </div>
      </div>
    </div>
  )
}
