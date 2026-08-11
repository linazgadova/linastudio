import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { UI } from '../data/ui'

/**
 * КУРСОР И КАРАНДАШНЫЙ СЛЕД
 *
 * Точка вместо стрелки, стоящая точно под мышью, кадр в кадр:
 * указатель, догоняющий руку, читается подвисшим, а не мягким.
 *
 * За ней остаётся след — короткие штрихи того же цвета и того же
 * ритма, что пунктир, идущий через весь сайт (Threads.tsx). Штрих
 * ложится по направлению движения и гаснет за полторы секунды, так
 * что рука оставляет карандашную линию на бумаге и линия высыхает.
 *
 * У части предметов есть подпись: строка проекта выглядит заголовком,
 * а не ссылкой, и ссылка наружу с виду не отличается от внутренней.
 * Там, где по виду и так всё понятно, подписи нет — она бы стала
 * шумом, который едет за рукой по всему экрану.
 *
 * ЦЕНА. Постоянного цикла нет: движение мыши помечает кадр, и один
 * requestAnimationFrame пишет один transform. Штрихи — набор из
 * четырнадцати заранее созданных узлов, которые переставляются по
 * кругу; новых не появляется, старые не удаляются, гаснут они
 * переходом на стороне браузера. Всё мимо реакта, кроме подписи:
 * её текст меняется редко и стоит одного состояния.
 *
 * ГДЕ ЕГО НЕТ. На тачскрине узлы не создаются вовсе. При системной
 * просьбе убрать движение след не рисуется: это чистое украшение,
 * и оно первое, от чего надо отказаться. Родной курсор прячется
 * только после того, как этот появился: не выполнится скрипт —
 * человек останется со стрелкой, а не с пустым экраном. Над полем
 * ввода родная палка возвращается: точка не показывает, куда
 * встанет буква.
 */

/** Предметы, на которых точка вырастает. */
const GRAB = 'a[href], button, summary, [role="button"], label[for], input, textarea'

/** Сколько штрихов в обойме. Дальше они переставляются по кругу. */
const DASHES = 14

/** Через сколько пикселей пути ложится следующий штрих. */
const STEP = 26

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const trailRef = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const { t } = useLang()

  /*
   * Подписи собраны в объект и переданы в эффект одной ссылкой.
   * Читать их внутри обработчика напрямую нельзя: эффект заводится
   * один раз, и он бы навсегда запомнил язык, открытый первым.
   */
  const words = useRef({ view: '', open: '', copy: '' })
  words.current = {
    view: t(UI.cursorView),
    open: t(UI.cursorOpen),
    copy: t(UI.cursorCopy),
  }

  useEffect(() => {
    const dot = ref.current
    const trail = trailRef.current
    if (!dot || !trail) return

    // Тачскрин отсеивается здесь, а не только в стилях: без этого на
    // телефоне впустую висели бы узлы и обработчики
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.dataset.cursor = 'on'

    let x = 0
    let y = 0
    let pending = false

    /* Обойма штрихов. Создаётся один раз: узлы не появляются и не
       удаляются, а переставляются по кругу — сборщику мусора нечем
       заняться, и раскладка не трогается */
    const dashes: HTMLSpanElement[] = []
    if (!still) {
      for (let i = 0; i < DASHES; i++) {
        const s = document.createElement('span')
        s.className = 'trail__dash'
        trail.appendChild(s)
        dashes.push(s)
      }
    }
    let next = 0
    let lastX = 0
    let lastY = 0
    let started = false

    function draw() {
      pending = false
      dot!.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    function drop() {
      const dx = x - lastX
      const dy = y - lastY
      const dist = Math.hypot(dx, dy)
      if (dist < STEP) return

      lastX = x
      lastY = y

      const s = dashes[next]
      next = (next + 1) % DASHES
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI

      // Гашение сбрасывается перезапуском перехода: снимаем класс,
      // заставляем браузер применить это, и ставим обратно
      s.classList.remove('is-fading')
      s.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}deg)`
      void s.offsetWidth
      s.classList.add('is-fading')
    }

    function move(e: PointerEvent) {
      x = e.clientX
      y = e.clientY

      // До первого движения ни точки, ни следа нет: иначе они стоят
      // в левом верхнем углу, куда их поставил нулевой transform
      if (!started) {
        started = true
        lastX = x
        lastY = y
        dot!.dataset.live = 'on'
      }

      if (!pending) {
        pending = true
        requestAnimationFrame(draw)
      }
      if (!still) drop()
    }

    function over(e: PointerEvent) {
      const el = (e.target as Element | null)?.closest?.(GRAB) ?? null
      dot!.dataset.on = el ? 'grab' : ''

      if (!el) return setLabel('')

      /*
        Подпись берётся из атрибута, если он есть, иначе выводится
        по виду ссылки. Расставлять её вручную на каждую ссылку
        сайта значило бы держать список из полусотни мест и следить,
        чтобы он не разошёлся с разметкой.
      */
      const own = (el as HTMLElement).dataset.cursor
      if (own === 'view') return setLabel(words.current.view)
      if (own === 'copy') return setLabel(words.current.copy)
      if (own === 'none') return setLabel('')
      const external = el.tagName === 'A' && el.getAttribute('target') === '_blank'
      setLabel(external ? words.current.open : '')
    }

    const down = () => (dot!.dataset.press = 'on')
    const up = () => (dot!.dataset.press = '')
    // Курсор ушёл за окно — всё вместе с ним, иначе точка остаётся
    // висеть у края, будто мышь всё ещё там
    const out = () => (dot!.style.opacity = '0')
    const back = () => (dot!.style.opacity = '')

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.addEventListener('pointerleave', out)
    document.addEventListener('pointerenter', back)

    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', out)
      document.removeEventListener('pointerenter', back)
      dashes.forEach((s) => s.remove())
      delete document.documentElement.dataset.cursor
    }
  }, [])

  return (
    <>
      <div className="trail" ref={trailRef} aria-hidden="true" />
      <div className="cursor" ref={ref} data-label={label ? 'on' : undefined} aria-hidden="true">
        <span className="cursor__dot" />
        <span className="cursor__word">{label}</span>
      </div>
    </>
  )
}
