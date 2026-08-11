/**
 * ПАПКА ДЛЯ ВЫКЛАДКИ
 *
 * Складывает готовый сайт в папку `site` рядом с проектом — ту самую,
 * которую выбирают в браузере на странице выкладки.
 *
 * Отдельная папка, а не сама `dist`, по одной причине: `dist`
 * пересобирается с нуля при каждой сборке, и если в этот момент
 * браузер как раз читает из неё файлы, он читает наполовину стёртое.
 * `site` собирается один раз и лежит неподвижно, пока её заливают.
 *
 * Архивом это больше не отдаётся. `Compress-Archive` из Windows
 * PowerShell записывает пути внутри архива через обратный слэш, хотя
 * формат zip требует прямого. Большинство распаковщиков такое прощают,
 * но не все, а ошибку при этом не показывает никто: снаружи выглядит
 * как бесконечная загрузка. Папка этой ямы не имеет вовсе.
 *
 * В папке всё, что нужно для работы сайта целиком: страницы, правила
 * сервера (.htaccess), блок с вопросами (api/ask.php) и файл ключа
 * для IndexNow. Настройки с ключом модели (api/config.php) в сборку
 * не попадают, но переживают её — см. ниже.
 */

import { cpSync, existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const site = join(root, 'site')

/**
 * Без чего сайт приедет сломанным.
 *
 * Проверка не формальность: половина этого списка ломает сайт молча.
 * Пропавший `sitemap.xml` не заметен вообще никак, кроме как через
 * полгода по индексации, а без `work` страницы проектов существуют
 * только внутри браузера и в поиск не попадают.
 */
const MUST = [
  'index.html',
  '404.html',
  '.htaccess',
  'api/ask.php',
  'api/.prompts.json',
  'privacy.html',
  'en/index.html',
  'en/privacy.html',
  'en/llms.txt',
  'en/work',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'og.jpg',
  'assets',
  'work',
]

const missing = MUST.filter((f) => !existsSync(join(dist, f)))
if (missing.length) {
  console.error(`[pack] в сборке нет: ${missing.join(', ')}`)
  process.exit(1)
}

/*
 * Ключ переживает пересборку.
 *
 * Настройки блока с вопросами лежат в api/config.php, и класть их
 * удобнее всего сюда же: тогда папку заливают целиком, ничего не
 * доставая и не возвращая руками. Но собирается эта папка с нуля,
 * а значит каждая пересборка стирала бы ключ, и заметно это стало бы
 * только по замолчавшему блоку на живом сайте.
 *
 * Поэтому файл читается до очистки и возвращается после. В dist его
 * нет и не будет: dist собирается из исходников, а исходников с
 * ключом не существует.
 */
const keep = join(site, 'api/config.php')
const saved = existsSync(keep) ? readFileSync(keep) : null

rmSync(site, { recursive: true, force: true })
cpSync(dist, site, { recursive: true })

if (saved) {
  writeFileSync(keep, saved)
  console.log('[pack] api/config.php сохранён из прошлой сборки')
}

/* Список собранных файлов нужен только постобработке на своей машине.
   На сервере он бесполезен, а рассказывает о внутреннем устройстве
   сборки больше, чем стоит рассказывать наружу */
rmSync(join(site, '.vite'), { recursive: true, force: true })

/** Сколько весит папка и сколько в ней файлов. */
function weigh(dir) {
  let bytes = 0
  let files = 0
  for (const name of readdirSync(dir)) {
    const s = statSync(join(dir, name))
    if (s.isDirectory()) {
      const inner = weigh(join(dir, name))
      bytes += inner.bytes
      files += inner.files
    } else {
      bytes += s.size
      files++
    }
  }
  return { bytes, files }
}

const { bytes, files } = weigh(site)
const mb = (bytes / 1024 / 1024).toFixed(1)

console.log(`\n[pack] папка site собрана: ${files} файлов, ${mb} МБ`)
console.log(`[pack] ${site}`)
console.log('')
console.log('  Содержимое этой папки идёт в корень сайта на хостинге.')
console.log('  Внутри всё, что нужно: страницы, правила сервера (.htaccess)')
console.log('  и блок с вопросами (api/ask.php).')
console.log('')
console.log('  Файл api/config.php с ключом собран не отсюда: он остаётся')
console.log('  в папке между пересборками, поэтому заливка не стирает его')
console.log('  на сервере. В репозиторий он не попадает, наружу сервер его')
console.log('  не отдаёт. Пока его нет, блок с вопросами отвечает поиском')
console.log('  по данным самого сайта.')
