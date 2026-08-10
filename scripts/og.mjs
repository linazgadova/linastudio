/**
 * КАРТИНКА ДЛЯ ПРЕВЬЮ ССЫЛОК
 *
 * Когда ссылку на сайт кидают в телеграм или в резюме, мессенджер
 * показывает не сайт, а одну картинку. Рисовать её отдельно значит
 * завести вторую версию оформления, которая разойдётся с первой на
 * первой же правке. Поэтому карточка снимается с самого сайта:
 * страница открывается в окне 1200×630, шар доводится до нужного
 * места, лишнее прячется, и кадр сохраняется.
 *
 * Запуск: node scripts/og.mjs (нужен поднятый dev-сервер)
 *   node scripts/og.mjs http://localhost:4173   — по другому адресу
 */

import { chromium } from 'playwright'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const url = process.argv[2] || 'http://localhost:5173/'
const out = join(root, 'public', 'og.jpg')

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
})

await page.goto(url, { waitUntil: 'networkidle' })

// Шар и шрифты доезжают позже разметки. Ждём кадр сцены, а не
// фиксированную паузу: на медленной машине пауза не спасёт,
// а на быстрой окажется лишней тратой времени
await page.waitForSelector('.aurora-stage canvas', { timeout: 15000 }).catch(() => {})
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(2500)

// Строка вопроса и подсказки в карточке лишние: нажать на них там
// нельзя. Имя в шапке остаётся — по нему карточку и узнают.
//
// Кегль заголовка задан отдельно: в окне 1200×630 экранный размер
// не помещается, и верхняя строка уезжала за край кадра
await page.addStyleTag({
  content: `
    .ask, .hero__invite { opacity: 0 !important; }
    :root { --step-hero: 3.1rem !important; }
    .hero {
      min-height: 630px !important;
      padding-block: 3.5rem 1rem !important;
      justify-content: center !important;
    }
    .hero__meta { padding-block: 1rem !important; }
  `,
})
await page.waitForTimeout(600)

await page.screenshot({ path: out, type: 'jpeg', quality: 88 })
await browser.close()

console.log(`[og] карточка сохранена: ${out}`)
