/**
 * «ЗАЙДИ СЕЙЧАС» — ОТПРАВКА АДРЕСОВ В ПОИСК
 *
 * Обычно поисковик приходит, когда придёт. У нового домена это недели:
 * обхода ещё не заслужили, авторитета нет, очередь длинная. IndexNow
 * переворачивает порядок — сайт сам сообщает, что изменилось.
 *
 * Один адрес отправки, несколько поисковиков: Яндекс, Bing, Seznam,
 * Naver. Google в протоколе не участвует, ему страницы подают руками
 * через Search Console. Для этого сайта главный здесь Яндекс.
 *
 * Запускается ПОСЛЕ заливки, а не до. Отправка говорит «зайди
 * и посмотри»: если по адресу лежит ещё старое, поисковик увидит
 * старое и уйдёт, а следующего его прихода ждать долго.
 *
 * Что отправляется: только то, что изменилось. Отпечатки страниц
 * лежат в seo-dates.json — том же файле, из которого берётся дата
 * обновления для карты сайта. Гнать все восемнадцать адресов при
 * каждой правке одной запятой значит расходовать доверие: поисковики
 * считают долю ложных тревог и перестают верить тем, кто зовёт зря.
 *
 *   npm run ping          — отправить изменённое сегодня
 *   npm run ping -- --all — отправить всё (первый раз, после переезда)
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function readConst(name, fallback) {
  const src = readFileSync(join(root, 'src/data/seo.ts'), 'utf8')
  const m = src.match(new RegExp(`${name}\\s*=\\s*'([^']+)'`))
  return m ? m[1] : fallback
}

const SITE = readConst('SITE_URL', '').replace(/\/$/, '')
const KEY = readConst('INDEXNOW_KEY', '')

if (!SITE || !KEY) {
  console.error('[ping] нет SITE_URL или INDEXNOW_KEY в src/data/seo.ts')
  process.exit(1)
}

const host = new URL(SITE).hostname
const all = process.argv.includes('--all')

const datesFile = join(root, 'seo-dates.json')
if (!existsSync(datesFile)) {
  console.error('[ping] нет seo-dates.json — сначала собери сайт: npm run build')
  process.exit(1)
}

const dates = JSON.parse(readFileSync(datesFile, 'utf8'))
const today = new Date().toISOString().slice(0, 10)

const urls = Object.entries(dates)
  .filter(([, v]) => all || v.date === today)
  .map(([path]) => SITE + path)

if (!urls.length) {
  console.log('[ping] сегодня ничего не менялось, отправлять нечего')
  console.log('       если нужно позвать на всё: npm run ping -- --all')
  process.exit(0)
}

/*
 * Проверяем ключ до отправки. Поисковик всё равно пойдёт за ним сам,
 * и если файла нет, отправка молча пропадёт — а сообщения об этом
 * не будет ни здесь, ни в панели.
 *
 * Три исхода, и путать их нельзя. Прошлая версия валила всё в одну
 * фразу «не читается или не совпадает» и советовала перезалить сайт —
 * а сайт был залит правильно, просто до него не дошёл запрос с этой
 * машины. Совет получался вредный: человек заливает заново то же
 * самое и получает тот же ответ.
 *
 * Файл лежит и совпал — отправляем.
 * Файл ответил, но не тем — останавливаемся: сайт залит не тот.
 * Если до сайта не достучаться, отправка всё равно уходит, с
 * предупреждением: за ключом придёт поисковик со своей стороны, и
 * увидит он его или нет, от здешнего канала не зависит.
 */
const keyUrl = `${SITE}/${KEY}.txt`

let served = null
let reason = ''
try {
  const res = await fetch(keyUrl)
  served = res.ok ? (await res.text()).trim() : null
  if (!res.ok) reason = `сервер ответил кодом ${res.status}`
} catch (err) {
  reason = err.cause?.code ?? err.message
}

if (served !== null && served !== KEY) {
  console.error(`[ping] по адресу ${keyUrl} лежит не тот ключ.`)
  console.error(`       ожидали ${KEY}`)
  console.error(`       получили ${served.slice(0, 60)}`)
  console.error('       Похоже, на сервере сборка от прежнего ключа. Залей заново.')
  process.exit(1)
}

if (served === null) {
  console.warn(`[ping] проверить ключ с этой машины не вышло: ${reason}`)
  console.warn('       Отправляю всё равно — за ключом поисковик придёт сам.')
  console.warn(`       Если сомневаешься, открой в браузере: ${keyUrl}`)
  console.warn('       Видишь строку из 32 знаков — всё в порядке.\n')
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: KEY, keyLocation: keyUrl, urlList: urls }),
})

/*
 * 200 — приняли. 202 — приняли, но ключ ещё проверяют; так отвечают
 * на первую отправку с домена, и это нормально. Всё остальное разбор
 * не требует: текст ответа объясняет сам.
 */
if (res.status === 200 || res.status === 202) {
  console.log(`\n[ping] отправлено адресов: ${urls.length}`)
  for (const u of urls) console.log('  ', u.replace(SITE, '') || '/')
  console.log(
    res.status === 202
      ? '\n[ping] код 202: приняли, ключ проверяют. Для первой отправки так и должно быть.'
      : '\n[ping] код 200: приняли.',
  )
  console.log('[ping] слушают Яндекс, Bing, Seznam и Naver. Google — отдельно, через Search Console.')
} else {
  console.error(`\n[ping] отказ, код ${res.status}`)
  console.error((await res.text()).slice(0, 400))
  process.exit(1)
}
