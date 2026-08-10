/**
 * ВИДЕО ПЛАТФОРМ
 *
 * Скриншот показывает, как продукт выглядит. Видео показывает, как он
 * себя ведёт: как выпрямляются волны под курсором, как раскрывается
 * тема, как страница отвечает на прокрутку. Для проектов, у которых
 * половина работы лежит в движении, это единственный способ показать
 * её, не заставляя человека уходить с портфолио.
 *
 *   node scripts/clips.mjs           — снять все ролики
 *   node scripts/clips.mjs pifika    — только один
 *
 * Ролики уходят в public/clips. Их не трогает сборщик: видео не нужно
 * ни хешировать, ни импортировать, оно просто лежит по адресу.
 *
 * Playwright пишет webm и умеет только начать и закончить запись —
 * обрезать нечем. Поэтому длину ролика задаёт сам сценарий: сколько
 * он идёт, столько и получится.
 */

import { chromium } from 'playwright'
import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'public/clips')
const TMP = resolve(root, 'scripts/.clips-tmp')

/*
  Размер кадра.

  Уменьшать нельзя. Playwright пишет webm с постоянным качеством и
  без ручек: единственное, чем можно управлять, — сколько пикселей
  в кадре. Меньше кадр — меньше деталей, и мелкий текст на сайтах
  превращается в кашу. Вес ролика приходится терпеть.
*/
const SIZE = { width: 1280, height: 720 }

/**
 * Сценарии.
 *
 * `path` — доля высоты страницы: куда доехать к этому моменту.
 * `hold` — сколько там постоять, мс.
 * `move` — провести курсором по экрану: [откуда x, откуда y, куда x, куда y]
 *          в долях кадра. Ради этого половина роликов и снимается.
 */
const PLAN = [
  {
    id: 'pifika',
    url: 'https://pifika.ru/',
    steps: [
      { hold: 1400, move: [0.2, 0.55, 0.78, 0.45] },
      { to: 0.14, hold: 1000 },
      { to: 0.3, hold: 1200, move: [0.3, 0.7, 0.72, 0.4] },
      { to: 0.46, hold: 1400 },
      { to: 0.62, hold: 1200 },
    ],
  },
  {
    id: 'thnkers',
    url: 'https://testtnkerz.netlify.app/',
    /*
      Остановки пересчитаны под переписанную страницу: доли взяты
      от положения заголовков на живом сайте, а не от прежней вёрстки.
      Последняя — команда: там карточка с её именем.
    */
    steps: [
      // Волны выпрямляются там, где курсор. Это первое, что нужно
      // показать, и на скриншоте этого не видно вовсе
      { hold: 900 },
      { hold: 2600, move: [0.85, 0.25, 0.55, 0.72] },
      { to: 0.14, hold: 1200 },
      { to: 0.28, hold: 1400 },
      { to: 0.37, hold: 1200 },
      { to: 0.59, hold: 1600 },
    ],
  },
  {
    id: 'fabrico',
    url: 'https://fabrico.design/',
    steps: [
      { hold: 1400 },
      { to: 0.12, hold: 1200 },
      { to: 0.26, hold: 1400, move: [0.25, 0.6, 0.7, 0.45] },
      { to: 0.42, hold: 1200 },
      { to: 0.58, hold: 1200 },
    ],
  },
  {
    id: 'gromstroy',
    url: 'https://grmstr.ru/',
    steps: [
      { hold: 1400 },
      { to: 0.16, hold: 1200 },
      { to: 0.34, hold: 1400 },
      { to: 0.52, hold: 1200 },
      { to: 0.7, hold: 1200 },
    ],
  },
  {
    id: 'denis-lyakh',
    url: 'https://denis-lyakh.netlify.app/',
    steps: [
      // Схема на канвасе живёт сама и отвечает на курсор
      { hold: 1200, move: [0.15, 0.3, 0.8, 0.65] },
      { to: 0.16, hold: 1400 },
      { to: 0.36, hold: 1400 },
      { to: 0.56, hold: 1200 },
    ],
  },
]

/** Плашки и виджеты — не часть продукта. То же правило, что в shots.mjs. */
async function clean(page) {
  await page.evaluate(() => {
    const strip = /в разработке и тестировании/i
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const r = el.getBoundingClientRect()
      if (r.height > 0 && r.height < 120 && r.width > innerWidth * 0.6 && r.top < 120) {
        if (strip.test((el.textContent || '').slice(0, 300))) {
          el.remove()
          break
        }
      }
    }
    const words = /cookie|куки|согласи|соглашени|сообщить об ошибке|accept|decline/i
    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const cs = getComputedStyle(el)
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const text = (el.textContent || '').slice(0, 400)
      const cookies = words.test(text) && r.height < innerHeight * 0.5
      const corner =
        r.width < 110 && r.height < 110 && r.bottom > innerHeight - 140 &&
        (r.left > innerWidth - 200 || r.right < 200)
      if (cookies || corner) el.remove()
    }
  })
}

/**
 * Доехать до нужной точки страницы за отведённое время.
 *
 * Мгновенный переход в кадре читается склейкой, поэтому прокрутка идёт
 * по кривой с плавным началом и концом — так же, как её делает рука.
 * Считается всё в браузере, покадрово: снаружи такой ход не задать,
 * потому что запись идёт с частотой отрисовки страницы.
 */
async function glide(page, to, ms) {
  await page.evaluate(
    ([target, time]) =>
      new Promise((done) => {
        const max = document.documentElement.scrollHeight - innerHeight
        const from = scrollY
        const dist = Math.round(max * target) - from
        if (Math.abs(dist) < 2) return done()
        const t0 = performance.now()
        function step(now) {
          const p = Math.min(1, (now - t0) / time)
          const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2
          scrollTo(0, from + dist * e)
          p < 1 ? requestAnimationFrame(step) : done()
        }
        requestAnimationFrame(step)
      }),
    [to, ms],
  )
}

/** Провести курсором по дуге, а не по прямой рывком. */
async function sweep(page, [x1, y1, x2, y2], ms) {
  const steps = Math.max(12, Math.round(ms / 40))
  for (let i = 0; i <= steps; i++) {
    const p = i / steps
    const e = p * p * (3 - 2 * p)
    await page.mouse.move(
      SIZE.width * (x1 + (x2 - x1) * e),
      SIZE.height * (y1 + (y2 - y1) * e),
    )
    await page.waitForTimeout(ms / steps)
  }
}

async function record(browser, plan) {
  const ctx = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 1,
    locale: 'ru-RU',
    recordVideo: { dir: TMP, size: SIZE },
  })
  const page = await ctx.newPage()

  try {
    await page.goto(plan.url, { waitUntil: 'networkidle', timeout: 45000 })
  } catch {
    await page.goto(plan.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  }
  await page.waitForTimeout(2200)
  await clean(page)

  for (const step of plan.steps) {
    if (typeof step.to === 'number') {
      await glide(page, step.to, 1100)
      await clean(page)
    }
    if (step.move) await sweep(page, step.move, step.hold ?? 1200)
    else await page.waitForTimeout(step.hold ?? 1200)
  }

  const video = page.video()
  await ctx.close()
  const from = await video.path()
  await rename(from, resolve(OUT, `${plan.id}.webm`))
  console.log(`  ${plan.id}.webm`)
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))

await mkdir(OUT, { recursive: true })
await rm(TMP, { recursive: true, force: true })
await mkdir(TMP, { recursive: true })

const browser = await chromium.launch()

for (const plan of PLAN) {
  if (only.length && !only.includes(plan.id)) continue
  console.log(plan.id)
  try {
    await record(browser, plan)
  } catch (e) {
    console.log(`  ✕ ${String(e).split('\n')[0]}`)
  }
}

await browser.close()
// В папке остаются только пустые файлы неудачных попыток
const left = await readdir(TMP).catch(() => [])
if (left.length === 0) await rm(TMP, { recursive: true, force: true })
console.log(`\nготово: ${OUT}`)
