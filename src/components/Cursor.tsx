import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { UI } from '../data/ui'

/**
 * КУРСОР
 *
 * Точка вместо стрелки, стоящая точно под мышью, кадр в кадр:
 * указатель, догоняющий руку, читается подвисшим, а не мягким.
 * На ссылке и кнопке она вырастает и краснеет.
 *
 * У части предметов рядом с точкой встаёт подпись. Ставится она не
 * на всё подряд, а туда, где по виду непонятно, что произойдёт:
 * ссылка наружу с виду не отличается от внутренней. Там, где и так
 * всё ясно, подписи нет — она стала бы шумом, едущим за рукой
 * по всему экрану.
 *
 * ЦЕНА. Постоянного цикла нет: движение мыши помечает кадр, и один
 * requestAnimationFrame пишет один transform. Всё мимо реакта,
 * кроме подписи: её текст меняется редко и стоит одного состояния.
 *
 * ГДЕ ЕГО НЕТ. На тачскрине узел не создаётся вовсе. Родной курсор
 * прячется только после того, как этот появился: не выполнится
 * скрипт — человек останется со стрелкой, а не с пустым экраном.
 * Над полем ввода родная палка возвращается: точка не показывает,
 * куда встанет буква.
 */

/** Предметы, на которых точка вырастает. */
const GRAB = 'a[href], button, summary, [role="button"], label[for], input, textarea'

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState('')
  const { t } = useLang()

  /*
   * Подписи держатся в ссылке, а не читаются внутри обработчика:
   * эффект заводится один раз и иначе навсегда запомнил бы язык,
   * открытый первым.
   */
  const words = useRef({ view: '', open: '', copy: '' })
  words.current = {
    view: t(UI.cursorView),
    open: t(UI.cursorOpen),
    copy: t(UI.cursorCopy),
  }

  useEffect(() => {
    const dot = ref.current
    if (!dot) return

    // Тачскрин отсеивается здесь, а не только в стилях: без этого на
    // телефоне впустую висел бы узел и четыре обработчика
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    document.documentElement.dataset.cursor = 'on'

    let x = 0
    let y = 0
    let pending = false

    function draw() {
      pending = false
      dot!.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    function move(e: PointerEvent) {
      x = e.clientX
      y = e.clientY
      // До первого движения точки нет: иначе она стоит в левом
      // верхнем углу, куда её поставил нулевой transform
      if (!dot!.dataset.live) dot!.dataset.live = 'on'
      if (pending) return
      pending = true
      requestAnimationFrame(draw)
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
    // Курсор ушёл за окно — точка вместе с ним, иначе она остаётся
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
      delete document.documentElement.dataset.cursor
    }
  }, [])

  return (
    <div className="cursor" ref={ref} data-label={label ? 'on' : undefined} aria-hidden="true">
      <span className="cursor__dot" />
      <span className="cursor__word">{label}</span>
    </div>
  )
}
