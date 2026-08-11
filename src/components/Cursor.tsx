import { useEffect, useRef } from 'react'

/**
 * КУРСОР
 *
 * Точка вместо стрелки. Стоит она точно под мышью, кадр в кадр:
 * указатель, догоняющий руку, читается подвисшим, а не мягким.
 *
 * На ссылке и кнопке точка вырастает. Больше ничего не происходит —
 * ни обводок, ни рамок вокруг предметов: указатель показывает, где
 * рука, а что под ней нажимается, страница говорит сама.
 *
 * Режим наложения difference: точка выворачивает то, что под ней.
 * Поэтому она одинаково видна и на светлой бумаге, и на чернильном
 * подвале, и поверх шара — одного цвета, который работал бы везде,
 * на этом сайте нет.
 *
 * ЦЕНА. Ни одного постоянного цикла: движение мыши помечает кадр,
 * и один requestAnimationFrame пишет одну строку transform. Всё
 * мимо реакта — перерисовывать дерево на каждый пиксель мыши нельзя,
 * и ни одного useState здесь нет.
 *
 * ГДЕ ЕГО НЕТ. На тачскрине узлы даже не создаются. Родной курсор
 * прячется только после того, как этот появился: не выполнится
 * скрипт — человек останется со стрелкой, а не с пустым экраном.
 * Над полем ввода родная палка возвращается: точка не показывает,
 * куда встанет буква.
 */

/** Предметы, на которых точка вырастает. */
const GRAB = 'a[href], button, summary, [role="button"], label[for], input, textarea'

export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = ref.current
    if (!dot) return

    // Тачскрин отсеивается здесь, а не только в стилях: без этого на
    // телефоне впустую висели бы узлы и обработчики
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    document.documentElement.dataset.cursor = 'on'

    let x = 0
    let y = 0
    let pending = false

    function draw() {
      pending = false
      dot!.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }

    function move(e: PointerEvent) {
      x = e.clientX
      y = e.clientY
      // До первого движения точки нет вовсе. Иначе она стоит в левом
      // верхнем углу — там, куда её поставил нулевой transform, —
      // и первое, что человек видит на странице, это кружок в углу
      if (!dot!.dataset.live) dot!.dataset.live = 'on'
      if (pending) return
      pending = true
      requestAnimationFrame(draw)
    }

    function over(e: PointerEvent) {
      const on = Boolean((e.target as Element | null)?.closest?.(GRAB))
      dot!.dataset.on = on ? 'grab' : ''
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

  return <div className="cursor" ref={ref} aria-hidden="true" />
}
