import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * ПУНКТИРНЫЙ ФОН
 *
 * Один слой на всю страницу, а не набор фигур по секциям. Раньше
 * каждая секция рисовала свои линии, и на стыках было видно, где
 * один набор кончился и начался следующий. Здесь линии идут через
 * весь документ и уходят за оба края экрана, поэтому у них нет
 * ни начала, ни конца.
 *
 * Слой лежит ниже всего, под шаром, и не ловит курсор.
 *
 * Система координат подбирается под реальные пропорции документа.
 * Раньше высота была жёсткой, а svg растягивался по месту, и на
 * длинной странице все изгибы вытягивались по вертикали в несколько
 * раз: круги превращались в овалы, а плавные дуги в узкие зигзаги.
 * Теперь высота считается из измеренных пропорций, растяжения нет,
 * и число линий растёт вместе с длиной страницы — плотность держится
 * одинаковой и на коротком экране, и на длинном.
 */

/** Линейный конгруэнтный генератор: одно зерно — одна и та же картинка. */
function makeRandom(seed: number) {
  let s = (seed * 2654435761) >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Кривая Катмулла–Рома, переведённая в кубические кривые Безье. */
function through(points: [number, number][]) {
  if (points.length < 2) return ''
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2

    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6

    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }

  return d
}

type Line = {
  d: string
  speed: number
  back: boolean
  dash: string
  width: number
  fade: number
  warm: boolean
}

/** Ширина системы координат. Высота считается из пропорций слоя. */
const W = 1000

/**
 * Сколько линий приходится на один экран.
 *
 * Раньше здесь стояло число в единицах системы координат — двести
 * тридцать на линию. Оно казалось безобидным и было главной ошибкой
 * этого файла.
 *
 * Система координат нормирована по ширине: тысяча единиц это всегда
 * ширина экрана, какой бы она ни была. Значит один экран по высоте
 * занимает столько единиц, каково отношение высоты к ширине. На
 * мониторе 1440×900 это 625 единиц, то есть неполных три линии на
 * экран. На телефоне 390×844 — уже 2164 единицы, то есть девять
 * линий на тот же экран. Плотность выходила втрое выше именно там,
 * где места втрое меньше.
 *
 * Теперь считается то, что и должно было считаться с самого начала:
 * сколько линий видно за раз. Число одно на все экраны, а шаг между
 * линиями из него выводится.
 */
const PER_SCREEN = 2.7

/**
 * Повадки линий. Без них все линии выходят одной пологой волной
 * с разной амплитудой, и рядом это читается как расчерченная
 * бумага. Разные повадки дают рисунок, в котором глаз не находит
 * повторения.
 */
const KINDS = ['calm', 'nervous', 'loop', 'break', 'braid', 'fork', 'long'] as const

/**
 * На узком экране — только спокойные повадки.
 *
 * Полосы одинаковы по высоте, а вширь на телефоне втрое теснее. Размах
 * считается от высоты полосы, и та же самая дуга, которая на мониторе
 * плавно уходит вбок, на телефоне пересекает экран поперёк и читается
 * росчерком поверх текста, а не фоном под ним. Излом и завиток там же
 * превращаются в петлю размером с абзац.
 *
 * Остаются те три, что идут вдоль страницы: ровная, длинная диагональ
 * и коса. Размах и дрожь при этом ещё и ужимаются вдвое — см. narrow
 * ниже. Рисунок остаётся тот же по смыслу, но перестаёт спорить
 * с содержимым.
 */
const CALM_KINDS = ['calm', 'long', 'braid'] as const

function build(seed: number, height: number, screen: number, narrow: boolean): Line[] {
  const rnd = makeRandom(seed)
  const count = Math.max(4, Math.round((height / screen) * PER_SCREEN))
  const kinds = narrow ? CALM_KINDS : KINDS
  /* Во сколько раз тише ведут себя линии на телефоне */
  const calm = narrow ? 0.45 : 1
  const out: Line[] = []

  const push = (pts: [number, number][], over: Partial<Line> = {}) => {
    out.push({
      d: through(pts),
      speed: 10 + rnd() * 16,
      back: rnd() > 0.5,
      dash: '3 5',
      width: 0.8 + rnd() * 0.5,
      /* На телефоне линии заметно бледнее: там они проходят прямо
         по строкам текста, а не по полям вокруг него */
      fade: (0.55 + rnd() * 0.45) * (narrow ? 0.6 : 1),
      warm: rnd() > 0.72,
      ...over,
    })
  }

  for (let i = 0; i < count; i++) {
    const kind = kinds[Math.floor(rnd() * kinds.length)]
    const band = height / count
    const base = i * band + band * (0.2 + rnd() * 0.6)

    // Длинная линия пересекает несколько полос по диагонали:
    // без таких страница расслаивается на ровные горизонтали
    const swing = (kind === 'long' ? (rnd() - 0.5) * band * 6 : (rnd() - 0.5) * band * 1.8) * calm

    const knots = kind === 'nervous' ? 11 + Math.floor(rnd() * 5) : 5 + Math.floor(rnd() * 3)
    const jitter =
      (kind === 'nervous' ? band * 0.5 : kind === 'calm' || kind === 'long' ? band * 0.2 : band * 0.9) *
      calm

    // Начало и конец вынесены далеко за рамку: где линия появилась
    // и где кончилась, видно быть не должно
    const pts: [number, number][] = []
    for (let k = 0; k < knots; k++) {
      const t = k / (knots - 1)
      let y = base + swing * t + (rnd() - 0.5) * jitter
      // Излом: одна точка резко уходит в сторону, и линия делает
      // угол вместо ровной дуги
      if (kind === 'break' && k === Math.floor(knots / 2)) y += (rnd() - 0.5) * band * 2.6
      pts.push([-200 + t * W * 1.4, y])
    }

    // Завиток: в случайном месте линия закручивается петлёй и
    // выходит из неё дальше по своему пути
    if (kind === 'loop') {
      const at = 1 + Math.floor(rnd() * (pts.length - 2))
      const [lx, ly] = pts[at]
      const rad = band * (0.22 + rnd() * 0.18)
      const dir = rnd() > 0.5 ? 1 : -1
      const curl: [number, number][] = []
      for (let a = 0; a <= 11; a++) {
        const ang = (a / 11) * Math.PI * 2 * dir - Math.PI / 2
        curl.push([lx + Math.cos(ang) * rad * 1.6, ly + rad + Math.sin(ang) * rad])
      }
      pts.splice(at + 1, 0, ...curl)
    }

    push(pts, {
      dash: kind === 'nervous' ? '2 4' : kind === 'calm' || kind === 'long' ? '4 7' : '3 5',
      width: kind === 'long' ? 0.8 : 0.9 + rnd() * 0.5,
    })

    // Ответвление: короткая ветка отходит от линии в сторону
    // и обрывается, не доходя до края
    if (kind === 'fork') {
      const at = 1 + Math.floor(rnd() * (pts.length - 2))
      const [fx, fy] = pts[at]
      const dir = rnd() > 0.5 ? 1 : -1
      const len = W * (0.12 + rnd() * 0.16)
      const branch: [number, number][] = [[fx, fy]]
      for (let b = 1; b <= 3; b++) {
        const t = b / 3
        branch.push([fx + len * t, fy + dir * band * 0.55 * t + (rnd() - 0.5) * band * 0.18])
      }
      push(branch, { dash: '2 5', width: 0.75, fade: 0.45 })
    }

    // Спутница: вторая линия идёт рядом и пересекает первую,
    // как две нитки в косе
    if (kind === 'braid') {
      const twin = pts.map(
        ([x, y], k) => [x, y + Math.sin(k * 1.7) * band * 0.28 + band * 0.1] as [number, number],
      )
      push(twin, { dash: '2 5', width: 0.75, fade: 0.5 })
    }
  }

  return out
}

export function Threads({ seed = 7 }: { seed?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ height: 2400, screen: 900, narrow: false })

  useEffect(() => {
    const el = box.current
    if (!el) return

    function measure() {
      const r = el!.getBoundingClientRect()
      if (r.width < 1) return
      // Высота системы координат в пропорции к ширине: так рисунок
      // не растягивается по вертикали на длинной странице
      const next = Math.round((W * r.height) / r.width)
      // Тем же пересчётом — высота одного экрана. Из неё берётся шаг
      // между линиями, поэтому на телефоне их столько же на виду,
      // сколько на мониторе, а не втрое больше
      const screen = Math.max(200, Math.round((W * window.innerHeight) / r.width))
      // Округление до сотни, чтобы генератор не перезапускался
      // на каждый пиксель при плавном изменении высоты
      setSize({
        height: Math.max(800, Math.round(next / 100) * 100),
        screen,
        // Тот же порог, по которому раскладку узким считает шар
        narrow: window.innerWidth < 900,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { height, screen, narrow } = size
  const paths = useMemo(() => build(seed, height, screen, narrow), [seed, height, screen, narrow])

  return (
    <div className="threads" ref={box} aria-hidden="true">
      <svg viewBox={`0 0 ${W} ${height}`} fill="none" preserveAspectRatio="none">
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            className={p.warm ? 'threads__warm' : undefined}
            style={{
              ['--dash-speed' as string]: `${p.speed.toFixed(1)}s`,
              ['--dash-dir' as string]: p.back ? 'reverse' : 'normal',
              strokeDasharray: p.dash,
              strokeWidth: p.width,
              opacity: p.fade,
            }}
          />
        ))}
      </svg>
    </div>
  )
}
