/**
 * КАДРЫ ПРОЕКТОВ
 *
 * Снимает живые сайты проектов и складывает кадры в src/assets/previews.
 * Скриншот с работающего адреса честнее макета: на нём видно продукт
 * таким, каким его открывает человек, вместе со шрифтами, отступами
 * и тем, что успело измениться после запуска.
 *
 *   node scripts/shots.mjs           — снять всё по плану
 *   node scripts/shots.mjs pifika    — только один проект
 *   node scripts/shots.mjs --survey  — обзор: по четыре экрана
 *                                      с каждого сайта, чтобы выбрать
 *                                      места для настоящих кадров
 *
 * Обзорные кадры уходят в scripts/.survey и в сборку не попадают.
 */

import { chromium } from 'playwright'
import { mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'src/assets/previews')
const SURVEY = resolve(root, 'scripts/.survey')

const DESKTOP = { width: 1440, height: 900 }
const PHONE = { width: 390, height: 844 }

/**
 * План съёмки.
 *
 * at — куда прокрутить перед кадром: число (пиксели) или селектор.
 * hide — что убрать: плашки согласия, чат-виджеты и прочее, чего
 * на кадре быть не должно.
 * settle — сколько ждать после прокрутки: у половины сайтов анимации
 * появления, и без паузы в кадр попадает недоехавший блок.
 */
const PLAN = [
  {
    id: 'pifika',
    url: 'https://pifika.ru/',
    shots: [
      { file: 'pifika', at: 0, settle: 2600 },
      { file: 'pifika-how', at: 1, settle: 1600 },
      { file: 'pifika-styles', at: 2, settle: 1600 },
      { file: 'pifika-practice', url: 'https://pifika.ru/practice/', at: 0, settle: 2600 },
      { file: 'pifika-phone', at: 0, device: PHONE, settle: 2600 },
    ],
  },
  {
    id: 'fabrico',
    url: 'https://fabrico.design/',
    shots: [
      { file: 'fabrico', at: 0.35, settle: 2600 },
      { file: 'fabrico-bundles', at: 1.05, settle: 1600 },
      { file: 'fabrico-how', at: 2.05, settle: 1600 },
      { file: 'fabrico-quiz', url: 'https://fabrico.design/quiz/', at: 0, settle: 2600 },
      { file: 'fabrico-phone', at: 0.2, device: PHONE, settle: 2600 },
    ],
  },
  {
    id: 'thnkers',
    url: 'https://testtnkerz.netlify.app/',
    /*
      Сайт переписан заказчиком после сдачи, и разделы разъехались:
      прежние кадры на единице и двойке брали пустое место между
      блоками. Числа сняты с живой страницы по положению заголовков,
      а не подобраны на глаз.
    */
    shots: [
      { file: 'thnkers', at: 0, settle: 2400 },
      /* На одну десятую экрана выше самого заголовка: у сайта липкая
         шапка в семьдесят шесть точек, и кадр ровно по заголовку
         срезает ему верхнюю строку */
      { file: 'thnkers-what', at: 1.24, settle: 1600 },
      { file: 'thnkers-work', at: 2.65, settle: 1600 },
      /* Команда: там карточка с её именем и должностью. Это
         подтверждение авторства с самого сайта, а не с наших слов */
      { file: 'thnkers-team', at: 5.62, settle: 1800 },
    ],
  },
  {
    id: 'gromstroy',
    url: 'https://grmstr.ru/',
    shots: [
      { file: 'gromstroy', at: 0, settle: 2400 },
      { file: 'gromstroy-services', at: 1, settle: 1600 },
      { file: 'gromstroy-why', at: 2, settle: 1600 },
      { file: 'gromstroy-works', at: 3, settle: 1600 },
    ],
  },
  {
    id: 'denis-lyakh',
    url: 'https://denis-lyakh.netlify.app/',
    shots: [
      { file: 'denis-lyakh', at: 0, settle: 2600 },
      { file: 'denis-lyakh-about', at: 1, settle: 1600 },
      { file: 'denis-lyakh-work', at: 3, settle: 1600 },
    ],
  },
]

/**
 * Убрать с кадра всё, что не продукт: согласие на куки, кнопку
 * «сообщить об ошибке», плашку «сайт в разработке», пузырь чата.
 *
 * По классам это не ловится — у каждого сайта они свои. Ловим по
 * двум признакам сразу: элемент прибит к экрану и либо говорит про
 * куки, либо это маленький кружок в углу. Оба признака вместе дают
 * ровно тот мусор, который мешает, и не трогают шапки и меню.
 */
async function clean(page) {
  await page.evaluate(() => {
    const words = /cookie|куки|согласи|соглашени|сообщить об ошибке|в разработке и тестировании|accept|decline/i
    // Полоса «сайт в разработке» стоит в потоке, а не поверх страницы,
    // поэтому под правило для прибитых элементов она не попадает.
    // Ловим её отдельно и по точной фразе: широкая, низкая, наверху
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

    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const cs = getComputedStyle(el)
      if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue

      const text = (el.textContent || '').slice(0, 400)
      const talksAboutCookies = words.test(text) && r.height < window.innerHeight * 0.5

      // Пузырь чата: небольшой квадрат, прижатый к нижнему углу
      const corner =
        r.width < 110 &&
        r.height < 110 &&
        r.bottom > window.innerHeight - 140 &&
        (r.left > window.innerWidth - 200 || r.right < 200)

      if (talksAboutCookies || corner) el.remove()
    }
  })
  // Виджеты часто живут в iframe и вставляются позже загрузки
  await page.addStyleTag({
    content: `
      iframe[src*="jivosite"], iframe[src*="jivo"], iframe[src*="bitrix"],
      iframe[title*="chat" i], iframe[id*="chat" i],
      [class*="jivo" i], [id*="jivo" i] { display: none !important; }
    `,
  })
}

async function shoot(browser, plan, shot, { survey }) {
  const device = shot.device ?? DESKTOP
  const ctx = await browser.newContext({
    viewport: device,
    deviceScaleFactor: 1,
    // Русский первым: половина этих сайтов смотрит на язык браузера
    locale: 'ru-RU',
    reducedMotion: 'no-preference',
  })
  const page = await ctx.newPage()

  try {
    await page.goto(shot.url ?? plan.url, { waitUntil: 'networkidle', timeout: 45000 })
  } catch {
    // networkidle не наступает на сайтах с постоянными запросами —
    // это не повод не снимать: ждём просто загрузку документа
    await page.goto(shot.url ?? plan.url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  }

  await clean(page)

  const frames = survey ? [0, 1, 2, 3] : [shot.at ?? 0]

  for (const at of frames) {
    if (typeof at === 'string') {
      await page.locator(at).first().scrollIntoViewIfNeeded()
    } else {
      await page.evaluate((k) => window.scrollTo(0, window.innerHeight * k), at)
    }
    await page.waitForTimeout(shot.settle ?? 1500)
    // Ещё раз: часть виджетов приезжает только после прокрутки
    await clean(page)

    const name = survey ? `${plan.id}-${at}${shot.device ? '-phone' : ''}` : shot.file
    const path = resolve(survey ? SURVEY : OUT, `${name}.jpg`)
    await page.screenshot({ path, type: 'jpeg', quality: 78 })
    console.log(`  ${name}.jpg`)
  }

  await ctx.close()
}

const args = process.argv.slice(2)
const survey = args.includes('--survey')
const only = args.filter((a) => !a.startsWith('--'))

await mkdir(OUT, { recursive: true })
if (survey) {
  await rm(SURVEY, { recursive: true, force: true })
  await mkdir(SURVEY, { recursive: true })
}

const browser = await chromium.launch()

for (const plan of PLAN) {
  if (only.length && !only.includes(plan.id)) continue
  console.log(plan.id)
  // В обзоре по одному проходу на устройство, а не по кадру:
  // четыре экрана снимаются за одну загрузку страницы
  const shots = survey
    ? [{ file: plan.id }, { file: plan.id, device: PHONE }]
    : plan.shots
  for (const shot of shots) {
    try {
      await shoot(browser, plan, shot, { survey })
    } catch (e) {
      console.log(`  ✕ ${shot.file}: ${String(e).split('\n')[0]}`)
    }
  }
}

await browser.close()
console.log(survey ? `\nобзор: ${SURVEY}` : `\nготово: ${OUT}`)
