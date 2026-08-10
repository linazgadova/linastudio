import { useEffect, useRef, type RefObject } from 'react'

/**
 * Лёгкая половина авроры: где должна стоять капля на каждом участке
 * страницы.
 *
 * Отдельным файлом — потому что сама сцена тянет Three и постобработку.
 * Если бы секции импортировали хук оттуда же, где живёт сцена, сборщик
 * затащил бы всю тяжесть в основной кусок и ленивая загрузка потеряла
 * бы смысл.
 *
 * ГЛАВНОЕ: здесь нет ни одного обработчика скролла и ни одного
 * ScrollTrigger. Раньше положение писалось из события прокрутки, а
 * сцена потом его догоняла — два разных таймера на одно движение,
 * отсюда и подёргивание при смене направления. Теперь функция чистая:
 * дай ей прокрутку — получишь положение. Сцена вызывает её сама, в
 * своём кадре, поэтому картинка и прокрутка идут одним тактом.
 */

export type AuroraState = {
  /** Центр капли в долях экрана: 0,0 — левый низ. */
  cx: number
  cy: number
  /** Радиус в долях высоты экрана. */
  radius: number
  /** Насколько сияние внутри собрано и плотно. */
  form: number
  intensity: number
  /**
   * Поворот палитры по кольцу цветов, 0..1.
   *
   * Палитра плёнки замкнута в кольцо, поэтому сдвиг не выводит её
   * за пределы набора: он лишь меняет, какие цвета выходят на первый
   * план. От секции к секции шар перекрашивается, оставаясь в тех же
   * четырёх красках.
   */
  shift: number

  /**
   * Акцент секции: цвет, в который уведён весь шар, в долях 0..1.
   *
   * Поворота палитры мало. Кольцо цветов всё равно показывает их все
   * сразу, и секции отличаются друг от друга оттенком, а не цветом:
   * человек, пролиставший страницу, помнит один переливающийся шар.
   * Акцент решает иначе — он тянет всю плёнку к одной краске, оставляя
   * переливы работать светом и рисунком внутри неё.
   */
  accent: [number, number, number]
  /** Насколько сильно акцент забирает плёнку себе, 0..1. */
  tint: number
}

/** #RRGGBB → три доли. Секции задают цвет строкой, считать её каждый кадр незачем. */
export function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

export const AURORA_DEFAULT: AuroraState = {
  cx: 0.5,
  cy: 0.5,
  radius: 0.32,
  form: 0.28,
  intensity: 1,
  shift: 0,
  // Белый при нулевой силе ничего не делает: секция, которая про цвет
  // не сказала, получает плёнку в её собственных красках
  accent: [1, 1, 1],
  tint: 0,
}

/**
 * Собрать состояние поверх значений по умолчанию.
 *
 * Обязательно с новым массивом цвета. Раскладывание объекта копирует
 * ссылку, а не содержимое, и все состояния, собранные из одного
 * умолчания, оказались бы одним и тем же массивом: первый же кадр
 * интерполяции перекрасил бы разом все секции.
 */
function make(over: Partial<AuroraState> = {}): AuroraState {
  const s = { ...AURORA_DEFAULT, ...over }
  s.accent = [...(over.accent ?? AURORA_DEFAULT.accent)] as [number, number, number]
  return s
}

/** Куда капля стремится прямо сейчас. Сцена читает это каждый кадр. */
export const auroraState: AuroraState = make()

type Stop = { el: HTMLElement; state: AuroraState; via?: AuroraState }

const stops: Stop[] = []
/** Обмеренные точки: y — середина секции в координатах документа. */
let layout: { y: number; hold: number; state: AuroraState; via?: AuroraState }[] = []
let pinned: AuroraState | null = null
let dirty = true
let watching = false

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Мягкая кривая: движение начинается и заканчивается спокойно. */
function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Кривая для размера, цвета и плотности — отдельная от кривой
 * перемещения.
 *
 * Кубическая кривая выше спокойна у концов, но ровно за это платит
 * серединой: чтобы отстояться в начале и в конце, ей приходится
 * проходить середину втрое быстрее равномерного хода. Для перемещения
 * это правильно — так движение выглядит живым. Для размера это и есть
 * та резкость, которую видно: шар почти стоит, потом за пару десятков
 * пикселей прокрутки прыгает в новую величину, потом опять почти стоит.
 *
 * Здесь максимальная скорость всего в полтора раза выше равномерной.
 * Разница между «втрое» и «в полтора» — это и есть разница между
 * скачком размера и перетеканием.
 */
function soft(t: number) {
  return t * t * (3 - 2 * t)
}

function measure() {
  const top = window.scrollY
  layout = stops
    .map((s) => {
      const r = s.el.getBoundingClientRect()
      return {
        y: r.top + top + r.height / 2,
        // Зона покоя вокруг середины секции. Раньше переход занимал
        // всё расстояние от середины до середины, а кривая плавности
        // у концов почти останавливается — в длинной секции шар
        // подолгу стоял. Теперь покой короткий и явный, а между
        // зонами шар едет всю дорогу
        // Зона покоя короткая. Чем она длиннее, тем меньше остаётся
        // дороги между секциями и тем круче приходится идти по ней:
        // весь переход сжимается в короткий участок прокрутки и
        // читается броском. Короткий покой отдаёт почти всю высоту
        // секции под движение, и то же расстояние шар проходит
        // втрое спокойнее
        hold: Math.min(r.height * 0.07, window.innerHeight * 0.16),
        state: s.state,
        via: s.via,
      }
    })
    .sort((a, b) => a.y - b.y)
  dirty = false
}

/** Пометить обмеры устаревшими: пересчёт случится в следующем кадре. */
export function invalidateAurora() {
  dirty = true
}

/**
 * Следим за тем, от чего меняется высота страницы. Обмер идёт лениво,
 * в кадре, поэтому наблюдатель только ставит флаг и ничего не считает
 * прямо в обработчике.
 */
function watch() {
  if (watching) return
  watching = true
  window.addEventListener('resize', invalidateAurora, { passive: true })
  if ('ResizeObserver' in window) {
    new ResizeObserver(invalidateAurora).observe(document.documentElement)
  }
  window.addEventListener('load', invalidateAurora, { once: true })
}

function write(out: AuroraState, from: AuroraState, to: AuroraState, raw: number) {
  const p = raw < 0 ? 0 : raw > 1 ? 1 : raw
  const t = ease(p)
  const s = soft(p)
  out.cx = lerp(from.cx, to.cx, t)
  out.cy = lerp(from.cy, to.cy, t)
  out.radius = lerp(from.radius, to.radius, s)
  out.form = lerp(from.form, to.form, s)
  out.intensity = lerp(from.intensity, to.intensity, s)
  out.shift = lerp(from.shift, to.shift, s)
  // Цвет перетекает по той же спокойной кривой, что размер: скачок
  // краски глаз ловит ещё охотнее, чем скачок величины
  out.accent[0] = lerp(from.accent[0], to.accent[0], s)
  out.accent[1] = lerp(from.accent[1], to.accent[1], s)
  out.accent[2] = lerp(from.accent[2], to.accent[2], s)
  out.tint = lerp(from.tint, to.tint, s)
}

/**
 * Скопировать состояние, не подменяя массив акцента.
 *
 * Object.assign переставил бы ссылку на массив самой секции, и первый
 * же кадр интерполяции начал бы писать цвет прямо в неё. Секция после
 * этого «запоминает» чужой цвет навсегда.
 */
function hold(out: AuroraState, src: AuroraState) {
  const a = out.accent
  Object.assign(out, src)
  a[0] = src.accent[0]
  a[1] = src.accent[1]
  a[2] = src.accent[2]
  out.accent = a
}

/**
 * Положение шара для конкретной прокрутки — в переданный объект.
 *
 * Точка отсчёта — середина экрана: секция «занимает» шар тогда, когда
 * сама оказывается в центре взгляда. Между соседними серединами идёт
 * непрерывная интерполяция, поэтому движение одинаково живое вниз и
 * вверх и останавливается ровно там, где остановился человек.
 *
 * Функция чистая относительно прокрутки — её можно спросить и о том
 * положении, которого сейчас нет. На этом построен пунктирный след:
 * он не копит историю кадров, а просто спрашивает, где шар был
 * пол-экрана назад.
 */
export function sampleInto(out: AuroraState, scrollY: number, viewportH: number): AuroraState {
  if (pinned) {
    hold(out, pinned)
    return out
  }

  if (dirty) measure()
  if (layout.length === 0) return out

  const focus = scrollY + viewportH / 2

  if (focus <= layout[0].y || layout.length === 1) {
    hold(out, layout[0].state)
    return out
  }

  const last = layout[layout.length - 1]
  if (focus >= last.y) {
    hold(out, last.state)
    return out
  }

  for (let i = 0; i < layout.length - 1; i++) {
    const a = layout[i]
    const b = layout[i + 1]
    if (focus < a.y || focus >= b.y) continue

    // Зона покоя: секция в фокусе, шар стоит на своём месте
    if (focus <= a.y + a.hold) {
      hold(out, a.state)
      return out
    }
    if (focus >= b.y - b.hold) {
      hold(out, b.state)
      return out
    }

    // Дорога между зонами покоя
    const from = a.y + a.hold
    const to = b.y - b.hold
    const span = to - from
    const t = span > 0 ? (focus - from) / span : 0

    // Промежуточная точка. Без неё шар может только плавно перетечь
    // из одного состояния в другое, а иногда нужно, чтобы по дороге
    // он успел сжаться и снова вырасти. Путь делится пополам, и
    // каждая половина сглаживается отдельно, поэтому в самой точке
    // движение не дёргается, а замедляется и снова разгоняется
    if (a.via) {
      if (t < 0.5) write(out, a.state, a.via, t * 2)
      else write(out, a.via, b.state, (t - 0.5) * 2)
      return out
    }

    write(out, a.state, b.state, t)
    return out
  }

  return out
}

/** То же самое, но в общее состояние, которое читает сцена. */
export function sampleAurora(scrollY: number, viewportH: number): AuroraState {
  return sampleInto(auroraState, scrollY, viewportH)
}

/**
 * То, что объявляет секция. Цвет здесь строкой — секции пишут его
 * в том же виде, что и стили, и никому не приходится вспоминать,
 * что канал идёт долей от единицы.
 */
export type SectionState = Partial<Omit<AuroraState, 'accent'>> & { accent?: string }

function fromSection(s: SectionState): Partial<AuroraState> {
  const { accent, ...rest } = s
  return accent ? { ...rest, accent: rgb(accent) } : rest
}

/**
 * Секция объявляет, каким должен быть шар, когда она в центре экрана.
 *
 * Третьим аргументом можно задать промежуточное состояние: шар пройдёт
 * через него на полпути к следующей секции. Так между двумя большими
 * положениями получается провал, а не ровный переезд.
 */
export function useAuroraSection(
  ref: RefObject<HTMLElement | null>,
  state: SectionState,
  via?: SectionState,
) {
  const stable = useRef(make(fromSection(state)))
  stable.current = make(fromSection(state))

  const stableVia = useRef(via ? make(fromSection(via)) : undefined)
  stableVia.current = via ? make(fromSection(via)) : undefined

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Появилась секция с собственной точкой — значит открыта страница
    // с цепочкой, и жёсткая привязка больше не нужна
    pinned = null

    const stop: Stop = { el, state: stable.current, via: stableVia.current }
    stops.push(stop)
    invalidateAurora()
    watch()

    return () => {
      const i = stops.indexOf(stop)
      if (i >= 0) stops.splice(i, 1)
      invalidateAurora()
    }
  }, [ref])
}

/** Для отдельных страниц, где цепочки нет — просто поставить каплю. */
export function pinAurora(state: SectionState) {
  pinned = make(fromSection(state))
  hold(auroraState, pinned)
}
