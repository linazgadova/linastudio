/**
 * ИКОНКИ ИЗ ОДНОГО ИСХОДНИКА
 *
 * Рисует растровые иконки из public/favicon.svg.
 *
 * Вектора хватило бы всем, если бы не два места. Айфон при добавлении
 * сайта на домашний экран берёт только png и, не найдя его, рисует
 * уменьшенный скриншот страницы. Андроид просит квадраты для окна
 * установки. Держать их вручную — значит однажды поменять шар и
 * забыть перерисовать.
 *
 *   node scripts/icons.mjs
 *
 * Запускать после правок favicon.svg. В обычную сборку не входит:
 * иконка меняется раз в год, а браузер за это время успевает
 * скачаться и запуститься.
 */

import { chromium } from 'playwright'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(resolve(root, 'public/favicon.svg'), 'utf8')

/** Что кому нужно. */
const SIZES = [
  { file: 'apple-touch-icon.png', size: 180, pad: 0 },
  { file: 'icon-192.png', size: 192, pad: 0 },
  { file: 'icon-512.png', size: 512, pad: 0 },
]

const browser = await chromium.launch()

for (const { file, size } of SIZES) {
  const page = await browser.newPage({
    viewport: { width: size, height: size },
    deviceScaleFactor: 1,
  })
  // Свой фон страницы прозрачный: непрозрачность иконка задаёт сама,
  // и подложка от браузера смешалась бы с её собственными углами
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}
     svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  )
  await page.screenshot({
    path: resolve(root, 'public', file),
    omitBackground: true,
  })
  console.log(`  ${file} — ${size}×${size}`)
  await page.close()
}

await browser.close()

/*
 * FAVICON.ICO — ДЛЯ ПОИСКОВИКОВ
 *
 * Браузерам хватает вектора, и они рисуют его чётко на любом экране.
 * Но за значком для выдачи Яндекс ходит по старому адресу
 * /favicon.ico, а объявленный SVG нередко пропускает: на его месте
 * в результатах поиска оказывается серый глобус.
 *
 * Перекодировать ничего не нужно. Формат ICO с версии Vista разрешает
 * положить внутрь обычный PNG, так что вся работа — приписать спереди
 * два заголовка на 22 байта. Берём тот же icon-192.png, который
 * только что нарисовался из того же favicon.svg: одна картинка на всё.
 */
const png = readFileSync(resolve(root, 'public/icon-192.png'))
const side = png.readUInt32BE(16)

const dir = Buffer.alloc(6)
dir.writeUInt16LE(1, 2) // тип: 1 — значок
dir.writeUInt16LE(1, 4) // одна картинка внутри

const entry = Buffer.alloc(16)
entry.writeUInt8(side >= 256 ? 0 : side, 0) // ноль здесь означает 256
entry.writeUInt8(side >= 256 ? 0 : side, 1)
entry.writeUInt16LE(1, 4) // плоскостей
entry.writeUInt16LE(32, 6) // бит на точку
entry.writeUInt32LE(png.length, 8)
entry.writeUInt32LE(22, 12) // картинка идёт сразу за заголовками

writeFileSync(resolve(root, 'public/favicon.ico'), Buffer.concat([dir, entry, png]))
console.log(`  favicon.ico — ${side}×${side}`)

console.log('\nготово: public/')
