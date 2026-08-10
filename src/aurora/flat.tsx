import { useEffect, useRef, useState } from 'react'
import { AURORA_DEFAULT, sampleInto, type AuroraState } from './target'

/**
 * ШАР БЕЗ WEBGL
 *
 * Раньше на машине без WebGL2 и при отключённой анимации на месте шара
 * оставалось бледное пятно: прибитое к экрану, одного размера на всю
 * страницу, в стороне от того места, где шар должен стоять. Человек
 * такое за шар не считает — он считает, что шара нет. Так и вышло.
 *
 * Здесь шар настоящий по устройству, просто нарисованный не лучом,
 * а слоями краски: круг с мягкой кромкой, который берёт своё место,
 * размер и цвет из той же таблицы секций, что и сцена. Переливов
 * плёнки внутри нет и быть не может — это единственное, чего эта
 * версия не умеет. Всё остальное совпадает: секции перекрашивают его
 * и переставляют ровно так же.
 *
 * Файл нарочно не тянет Three. Он лежит в основном куске, и машина,
 * которая шар всё равно не покажет, не скачивает мегабайт сцены —
 * решение об отказе принимается до её загрузки.
 */

/**
 * Показывать ли шар лучом.
 *
 * null — проверка ещё не закончилась. Ответ приходит после первого
 * кадра: matchMedia и создание холста на сервере не работают, а до
 * ответа лучше показать заглушку, чем мигнуть сценой и убрать её.
 */
export function useOrbSupport(): { webgl: boolean; still: boolean } | null {
  const [state, setState] = useState<{ webgl: boolean; still: boolean } | null>(null)

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let webgl = false
    try {
      webgl = Boolean(document.createElement('canvas').getContext('webgl2'))
    } catch {
      webgl = false
    }
    setState({ webgl, still })
  }, [])

  return state
}

/**
 * @param still — человек просил меньше движения. Шар остаётся, но
 *   перестаёт переезжать за прокруткой: стоит там, где его поставила
 *   первая секция, и больше не двигается вовсе.
 */
export function AuroraFlat({ still = false }: { still?: boolean }) {
  const ball = useRef<HTMLDivElement>(null)

  useEffect(() => {
    /* Своё состояние, а не общее auroraState: сцены нет, но пунктирный
       след и прочие читатели общего объекта остаются, и писать в него
       из двух мест — вернуть ту самую гонку, ради ухода от которой
       выборка сделана чистой функцией */
    const state: AuroraState = { ...AURORA_DEFAULT, accent: [...AURORA_DEFAULT.accent] }
    let raf = 0
    let queued = false

    function apply() {
      queued = false
      const el = ball.current
      if (!el) return

      const vh = window.innerHeight
      const vw = window.innerWidth
      // При отказе от движения спрашиваем положение для самого верха
      // страницы: шар встаёт так, как его видит первый экран
      sampleInto(state, still ? 0 : window.scrollY, vh)

      const d = state.radius * 2 * vh
      const x = state.cx * vw - d / 2
      // Доли считаются от левого нижнего угла, у страницы отсчёт сверху
      const y = (1 - state.cy) * vh - d / 2

      el.style.width = `${d.toFixed(1)}px`
      el.style.height = `${d.toFixed(1)}px`
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.opacity = (0.92 * state.intensity).toFixed(3)

      const c = state.accent
      el.style.setProperty(
        '--a',
        `${Math.round(c[0] * 255)} ${Math.round(c[1] * 255)} ${Math.round(c[2] * 255)}`,
      )
      // Сила акцента — прозрачностью его слоя. Ноль означает «секция
      // про цвет не сказала», и тогда слоя просто не видно
      el.style.setProperty('--ta', `${Math.round(state.tint * 62)}%`)
    }

    function tick() {
      if (queued) return
      queued = true
      raf = requestAnimationFrame(apply)
    }

    apply()
    // Первый обмер секций идёт лениво и до раскладки может вернуть
    // пустоту — переспрашиваем, когда страница встала окончательно
    const settle = window.setTimeout(apply, 300)
    window.addEventListener('resize', tick, { passive: true })
    if (!still) window.addEventListener('scroll', tick, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(settle)
      window.removeEventListener('resize', tick)
      window.removeEventListener('scroll', tick)
    }
  }, [still])

  return (
    <div className="aurora-stage" aria-hidden="true">
      <div className="orbflat" ref={ball} />
    </div>
  )
}
