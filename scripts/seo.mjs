/**
 * ПОСТОБРАБОТКА СБОРКИ ДЛЯ ПОИСКА
 *
 * Сайт рисуется в браузере. Google свои страницы выполняет и видит,
 * Яндекс — далеко не всегда, а языковые модели читают чаще всего
 * голый ответ сервера. Для всех троих сайт на React выглядит как
 * пустой <div id="root"> — то есть как страница без единого слова.
 *
 * Здесь это чинится в четыре руки:
 *
 * 1. По адресам проектов раскладываются настоящие файлы со своим
 *    заголовком, описанием, каноническим адресом и разметкой. Хостинг
 *    отдаёт существующий файл раньше, чем срабатывает правило
 *    «всё на index.html», поэтому статика выигрывает у SPA сама собой.
 *
 * 2. В тело каждой страницы пишется её содержимое обычным HTML.
 *    Это и есть то, что увидит робот, не выполняющий скрипты.
 *    Разметка идёт теми же классами, что и живая страница, поэтому
 *    до загрузки скриптов человек видит не голый текст, а ту же
 *    страницу без движения. React заменит её собой, когда доедет.
 *
 * 3. Каждая страница собирается дважды: русская по своему адресу,
 *    английская по /en. Раньше английской версии как страницы
 *    не существовало вовсе — язык переключался в браузере, а сервер
 *    по адресу `?lang=en` отдавал ту же самую русскую страницу.
 *    Разметка при этом объявляла английскую версию. Поисковик
 *    такое разбирает однозначно: адреса — копии, английский из
 *    индекса вон, обещание не выполнено.
 *
 * 4. Разметка Schema.org собирается здесь же и своя для каждого типа
 *    страницы. В index.html лежит только заготовка на время
 *    разработки. Общая на весь сайт разметка тащила бы блок вопросов
 *    и ответов из шапки на страницы проектов, где этих вопросов нет,
 *    а описывать то, чего на странице не видно, запрещают оба
 *    поисковика: за такое снимают, а не добавляют.
 *
 * Заодно отсюда собираются sitemap.xml, llms.txt и страница 404:
 * держать их руками значит однажды забыть про новый проект.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')

/**
 * Адрес сайта. Ровно одно место, откуда он берётся.
 *
 * От него зависят канонические ссылки, карта сайта, превью ссылки
 * в мессенджерах и выжимка для языковых моделей.
 *
 * Раньше здесь стояли ещё две переменные окружения — площадки,
 * собиравшие сайт у себя, подставляли адрес сами. Сайт собирается
 * на своей машине и заливается папкой, подставлять некому, а
 * переменная с именем `URL` в чужом окружении встречается легко:
 * попадись она — и весь сайт молча объявил бы каноническим чужой
 * адрес. Дыра неочевидная, поэтому её нет.
 */
const SITE = readSiteUrl().replace(/\/$/, '')

if (SITE.includes('example.com')) {
  console.warn(
    '[seo] адрес сайта — заглушка example.com. Канонические ссылки, sitemap и превью\n' +
      '      будут указывать в никуда. Впиши настоящий адрес в SITE_URL (src/data/seo.ts).',
  )
}

function readSiteUrl() {
  const src = readFileSync(join(root, 'src/data/seo.ts'), 'utf8')
  const m = src.match(/SITE_URL\s*=\s*'([^']+)'/)
  return m ? m[1] : 'https://example.com'
}

const dataFile = join(dist, 'seo-data.json')
if (!existsSync(dataFile)) {
  console.error('[seo] нет dist/seo-data.json — плагин seo-data не отработал')
  process.exit(1)
}
const DATA = JSON.parse(readFileSync(dataFile, 'utf8'))
const {
  projects,
  profile,
  hero,
  heroLines,
  about,
  strengths,
  contact,
  seo,
  faq,
  services,
  servicesPage,
  hire,
  layers,
  limits,
  ui,
  privacy,
  operator,
  indexNowKey,
} = DATA

const html = readFileSync(join(dist, 'index.html'), 'utf8')

/* ────────────────────────────────────────────────────────────────
   ЯЗЫКИ

   Русский — основной и идёт без приставки в адресе. Английский
   живёт по /en и /en/work/<id>. Так же, как у Google и Яндекса
   рекомендовано: отдельный адрес, отдельный файл, отдельный текст.
   ──────────────────────────────────────────────────────────────── */

const LANGS = ['ru', 'en']

/** Достаёт язык из двуязычной строки. */
function T(value, lang) {
  if (value == null) return ''
  return typeof value === 'string' ? value : (value[lang] ?? value.ru ?? '')
}

/** Внутренний адрес на нужном языке: ('/work/pifika','en') → /en/work/pifika
 *
 *  Английская главная — со слэшем на конце: /en/, а не /en. Это
 *  единственный адрес сайта, где иначе нельзя, и причина внешняя.
 *  Рядом обязана лежать папка en/ с английскими проектами, и Apache,
 *  увидев запрос /en, узнаёт в нём папку раньше, чем успевают
 *  сработать правила сайта: отвечает перенаправлением на /en/. Спорить
 *  с этим бессмысленно, а последствия для поиска серьёзные —
 *  канонический адрес и hreflang указывали бы на адрес, который сам
 *  же перенаправляет, и английская версия рискует не попасть в индекс.
 *
 *  Поэтому главная лежит файлом en/index.html, а каноническим адресом
 *  объявлен /en/ — ровно тот, который сервер и отдаёт. Русская главная
 *  живёт по / и тоже со слэшем, так что вид у пары одинаковый.
 */
function loc(bare, lang) {
  if (lang === 'ru') return bare
  return bare === '/' ? '/en/' : `/en${bare}`
}

/** Подписи разделов, которых нет в UI страницы. */
const LABEL = {
  services: { ru: 'Услуги', en: 'Services' },
  faq: { ru: 'Частые вопросы', en: 'Frequently asked questions' },
  role: { ru: 'Роль', en: 'Role' },
  year: { ru: 'Год', en: 'Year' },
  stack: { ru: 'Стек', en: 'Stack' },
  open: { ru: 'Открыть сайт', en: 'Open the site' },
  closed: {
    ru: 'Внутренняя система — публичной ссылки нет.',
    en: 'An internal system — there is no public link.',
  },
  contact: { ru: 'Связаться', en: 'Get in touch' },
  mail: { ru: 'Почта', en: 'Email' },
  allWork: { ru: 'Все проекты', en: 'All work' },
  breadcrumb: { ru: 'Проекты', en: 'Work' },
  clip: { ru: 'проход по сайту', en: 'walkthrough' },
  clipDesc: { ru: 'Запись работы сайта', en: 'A recording of the site in use' },
  /* Хвост описания страницы проекта живёт в src/data/ui.ts: ту же
     строку ставит себе живая вкладка, и копия здесь однажды
     разошлась бы с оригиналом */
  projectDesc: ui.projectMeta,
  notFound: { ru: 'Страница не найдена', en: 'Page not found' },
  notFoundLede: {
    ru: 'Такого адреса на сайте нет. Возможно, страницу переименовали или в ссылке опечатка.',
    en: 'There is no such address on this site. The page may have been renamed, or the link has a typo.',
  },
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Настоящее имя собранного файла по исходному пути.
 *
 * В именах файлов сборки стоит хеш содержимого, и заранее их не знает
 * никто, кроме самого сборщика. Он же оставляет список соответствий —
 * из него и берём.
 */
const manifest = (() => {
  const file = join(dist, '.vite/manifest.json')
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {}
})()

function built(source) {
  const entry = source && manifest[source]
  return entry ? `/${entry.file}` : null
}

/**
 * Настоящий размер картинки превью.
 *
 * Раньше в разметке у всех страниц стояло 1200×630 — цифры от
 * картинки, которой там давно нет. Мессенджеры верят объявленному
 * размеру, а не файлу: они по нему заранее готовят место под
 * картинку. Разойдутся числа — ссылка дёргается при загрузке, а
 * иногда превью не показывается вовсе.
 */
function sizeOf(rel) {
  const file = join(dist, rel.replace(/^\//, ''))
  if (!existsSync(file)) return null
  const b = readFileSync(file)

  // PNG: ширина и высота лежат в первом же блоке, по фиксированному смещению
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) {
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }
  }

  // JPEG: размер живёт в блоке SOF, а до него идёт сколько угодно
  // других блоков, поэтому их приходится перебирать по длине
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2
    while (i + 9 < b.length && b[i] === 0xff) {
      const marker = b[i + 1]
      const len = b.readUInt16BE(i + 2)
      const isSOF = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
      if (isSOF) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }
      i += 2 + len
    }
  }
  return null
}

/** Ролики, снятые scripts/clips.mjs. Есть не у всех проектов. */
function clipOf(id) {
  const rel = `/clips/${id}.webm`
  return existsSync(join(dist, 'clips', `${id}.webm`)) ? rel : null
}

const today = new Date().toISOString().slice(0, 10)

/*
  ДАТА ДЛЯ РАЗМЕТКИ — С ВРЕМЕНЕМ И ПОЯСОМ

  Голое «2026-08-06» — правильная дата по ISO 8601 и годится для карты
  сайта, но не для schema.org. Google проверяет dateModified и
  uploadDate строже и на дату без времени отвечает двумя замечаниями
  сразу: «не указан часовой пояс» и «недопустимое значение даты».
  Второе для видео критично — ролик с такой датой в видеовыдачу
  не попадает вовсе.

  Причина у строгости простая. Дата без пояса означает разное время
  в разных местах: для робота в Калифорнии «шестое августа» наступает
  на одиннадцать часов позже, чем для нас, и ролик, выложенный сегодня
  утром, оказывается выложенным в будущем. Будущую дату публикации
  поиск отбрасывает.

  Поэтому в карте сайта остаётся голая дата — там формат разрешён
  и читается человеком, — а в разметку уходит она же с полуночью
  по Москве. Пояс жёсткий, потому что жёсткий он и в жизни: сайт
  собирается и заливается из Москвы.
*/
const TZ = '+03:00'
function stamp(date) {
  return `${date}T00:00:00${TZ}`
}

/* ────────────────────────────────────────────────────────────────
   ДАТА ИЗМЕНЕНИЯ — НАСТОЯЩАЯ, А НЕ ДАТА СБОРКИ

   Раньше в карте сайта у всех восемнадцати адресов стояло сегодняшнее
   число. Поправишь опечатку в политике — и сайт объявляет, что за
   сутки переписаны все страницы разом. Оба поисковика этому учатся
   быстро: заметив, что дата меняется независимо от содержимого, они
   перестают её читать вовсе, и тогда настоящее обновление проходит
   незамеченным.

   Поэтому рядом с проектом лежит seo-dates.json: для каждого адреса
   отпечаток его содержимого и день, когда этот отпечаток появился.
   Совпал отпечаток — дата остаётся прежней, сколько бы раз сайт ни
   пересобирали. Изменился — записывается сегодняшнее число.

   Файл нужно хранить вместе с исходниками: сотрёшь его, и все даты
   разом станут сегодняшними, то есть ровно тем, от чего уходили.
   ──────────────────────────────────────────────────────────────── */

const datesFile = join(root, 'seo-dates.json')
const dates = existsSync(datesFile) ? JSON.parse(readFileSync(datesFile, 'utf8')) : {}
const seenKeys = new Set()

/** Когда содержимое этого адреса менялось в последний раз. */
function lastmod(key, content) {
  seenKeys.add(key)
  const hash = createHash('sha1').update(content).digest('hex').slice(0, 16)
  const prev = dates[key]
  if (prev && prev.hash === hash) return prev.date
  dates[key] = { hash, date: today }
  return today
}

/* Что считается содержимым главной. Один объект на весь файл: дату
   спрашивают дважды — в разметке страницы и в карте сайта, — и
   собери его в двух местах по отдельности, порядок ключей однажды
   разошёлся бы, а с ним и отпечаток */
const HOME_SRC = { profile, hero, heroLines, about, strengths, contact, seo, faq, services }
const PRIVACY_SRC = { privacy, operator }

/** Сохранить даты, выкинув адреса, которых больше нет. */
function saveDates() {
  for (const key of Object.keys(dates)) {
    if (!seenKeys.has(key)) delete dates[key]
  }
  const sorted = Object.fromEntries(Object.keys(dates).sort().map((k) => [k, dates[k]]))
  writeFileSync(datesFile, JSON.stringify(sorted, null, 2) + '\n')
}

/* ────────────────────────────────────────────────────────────────
   ГОЛОВА СТРАНИЦЫ

   index.html описывает русскую главную. Здесь из него делается
   любая другая страница: подменяются заголовок, описание,
   канонический адрес, языковые пары, превью и разметка.
   ──────────────────────────────────────────────────────────────── */

function head(page, { lang, title, desc, bare, cover, coverAlt, graph, noindex }) {
  const url = SITE + loc(bare, lang)
  const ruUrl = SITE + loc(bare, 'ru')
  const enUrl = SITE + loc(bare, 'en')
  const image = SITE + cover
  const size = sizeOf(cover)

  return (
    page
      .replace('<html lang="ru">', `<html lang="${lang}">`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
      .replace(
        /<meta\s+name="description"[\s\S]*?\/>/,
        `<meta name="description" content="${esc(desc)}" />`,
      )
      .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(url)}" />`)
      /*
        Языковые пары ведут на эту же страницу в другой версии, а не
        на главную: иначе поисковик считает, что английской версии
        проекта нет, и английский запрос приводит человека куда угодно,
        кроме неё. x-default оставлен на русской: сайт про исполнителя
        из Москвы, и по умолчанию правильно показать именно её.
      */
      .replace(
        /<link rel="alternate" hreflang="ru"[^>]*>/,
        `<link rel="alternate" hreflang="ru" href="${esc(ruUrl)}" />`,
      )
      .replace(
        /<link rel="alternate" hreflang="en"[^>]*>/,
        `<link rel="alternate" hreflang="en" href="${esc(enUrl)}" />`,
      )
      .replace(
        /<link rel="alternate" hreflang="x-default"[^>]*>/,
        `<link rel="alternate" hreflang="x-default" href="${esc(ruUrl)}" />`,
      )
      .replace(
        /<meta property="og:locale" content="[^"]*"\s*\/>/,
        `<meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_US'}" />`,
      )
      .replace(
        /<meta property="og:locale:alternate" content="[^"]*"\s*\/>/,
        `<meta property="og:locale:alternate" content="${lang === 'ru' ? 'en_US' : 'ru_RU'}" />`,
      )
      .replace(
        /<meta property="og:site_name" content="[^"]*"\s*\/>/,
        `<meta property="og:site_name" content="${esc(`${T(profile.name, lang)} ${T(profile.surname, lang)}`)}" />`,
      )
      .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(url)}" />`)
      .replace(
        /<meta\s+property="og:title"[\s\S]*?\/>/,
        `<meta property="og:title" content="${esc(title)}" />`,
      )
      .replace(
        /<meta\s+property="og:description"[\s\S]*?\/>/,
        `<meta property="og:description" content="${esc(desc)}" />`,
      )
      .replace(
        /<meta property="og:image" content="[^"]*"\s*\/>/,
        `<meta property="og:image" content="${esc(image)}" />`,
      )
      .replace(
        /<meta\s+property="og:image:alt"[\s\S]*?\/>/,
        `<meta property="og:image:alt" content="${esc(coverAlt)}" />`,
      )
      .replace(
        /<meta property="og:image:width" content="[^"]*"\s*\/>/,
        `<meta property="og:image:width" content="${size ? size.w : 1200}" />`,
      )
      .replace(
        /<meta property="og:image:height" content="[^"]*"\s*\/>/,
        `<meta property="og:image:height" content="${size ? size.h : 630}" />`,
      )
      .replace(
        /<meta\s+name="twitter:title"[\s\S]*?\/>/,
        `<meta name="twitter:title" content="${esc(title)}" />`,
      )
      .replace(
        /<meta\s+name="twitter:description"[\s\S]*?\/>/,
        `<meta name="twitter:description" content="${esc(desc)}" />`,
      )
      .replace(
        /<meta name="twitter:image" content="[^"]*"\s*\/>/,
        `<meta name="twitter:image" content="${esc(image)}" />`,
      )
      .replace(
        /<meta\s+name="robots"[\s\S]*?\/>/,
        noindex
          ? '<meta name="robots" content="noindex, follow" />'
          : '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />',
      )
      // Разметка своя у каждого типа страницы. В index.html лежит
      // заготовка для разработки — здесь она заменяется целиком
      .replace(
        /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script type="application/ld+json">\n${JSON.stringify(
          { '@context': 'https://schema.org', '@graph': graph },
          null,
          2,
        )}\n    </script>`,
      )
  )
}

/** Вписать разметку внутрь корневого узла, а не рядом с ним. */
function withBody(page, body) {
  return page.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
}

/* ────────────────────────────────────────────────────────────────
   ОБЩИЕ УЗЛЫ РАЗМЕТКИ

   Person и WebSite стоят на каждой странице: по ним поисковик
   связывает страницы в один сайт одного человека. Всё остальное
   зависит от того, что на странице есть.
   ──────────────────────────────────────────────────────────────── */

const OG_FALLBACK = '/og.jpg'

/* Все технологии портфолио, каждая по одному разу и в том порядке,
   в каком они идут по проектам */
const STACKS = [...new Set(projects.flatMap((p) => p.stack))]

function personNode(lang) {
  return {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: `${T(profile.name, lang)} ${T(profile.surname, lang)}`,
    alternateName: lang === 'ru' ? 'Angelina Zgadova' : 'Ангелина Згадова',
    jobTitle: lang === 'ru' ? 'Веб-дизайнер и разработчик' : 'Web designer and developer',
    email: `mailto:${profile.email}`,
    url: `${SITE}${loc('/', lang)}`,
    image: `${SITE}${OG_FALLBACK}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: lang === 'ru' ? 'Москва' : 'Moscow',
      addressCountry: 'RU',
    },
    /* sameAs связывает страницу с профилями того же человека в других
       местах. По нему поисковик понимает, что автор сайта и владелец
       гитхаба — один человек, а не два однофамильца. Пустая строка
       в profile.github убирает ссылку сама */
    sameAs: [
      `https://t.me/${profile.telegram}`,
      ...(profile.github ? [`https://github.com/${profile.github}`] : []),
    ],
    hasOccupation: {
      '@type': 'Occupation',
      name: lang === 'ru' ? 'Веб-разработчик и дизайнер' : 'Web developer and designer',
      occupationLocation: { '@type': 'City', name: lang === 'ru' ? 'Москва' : 'Moscow' },
    },
    worksFor: { '@id': `${SITE}/#practice` },
    /*
      Чем занимается — словами, и чем именно — названиями из стеков.

      Вторая половина списка собрана из стеков самих проектов, а не
      выписана руками. Руками здесь стояло три названия из сорока
      настоящих, и главное — это была вторая копия списка, который
      уже есть в проектах. Разошлись бы они молча, а расхождение тут
      означает разметку, обещающую технологию, за которой нет работы.
    */
    knowsAbout: [
      ...(lang === 'ru'
        ? ['веб-дизайн', 'разработка сайтов', 'интернет-магазины', 'веб-приложения']
        : ['web design', 'website development', 'online stores', 'web applications']),
      ...STACKS,
    ],
    knowsLanguage: ['ru', 'en'],
    description: `${T(hero.claim, lang)} ${T(hero.detail, lang)}`,
  }
}

function siteNode(lang) {
  return {
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    url: `${SITE}/`,
    name: `${T(profile.name, lang)} ${T(profile.surname, lang)}`,
    inLanguage: ['ru', 'en'],
    publisher: { '@id': `${SITE}/#person` },
  }
}

/**
 * Исполнитель услуги — с городом и способом связи.
 *
 * Person говорит, кто она; эта запись — что у неё можно заказать
 * и где. Без неё на коммерческий запрос с городом страница читается
 * как рассказ о человеке, а не как предложение работы.
 */
function practiceNode(lang) {
  return {
    '@type': 'ProfessionalService',
    '@id': `${SITE}/#practice`,
    name:
      lang === 'ru'
        ? 'Ангелина Згадова — создание сайтов'
        : 'Angelina Zgadova — website development',
    description: T(seo.home.description, lang),
    url: `${SITE}${loc('/', lang)}`,
    image: `${SITE}${OG_FALLBACK}`,
    email: `mailto:${profile.email}`,
    founder: { '@id': `${SITE}/#person` },
    employee: { '@id': `${SITE}/#person` },
    priceRange: lang === 'ru' ? 'по договорённости' : 'on request',
    address: {
      '@type': 'PostalAddress',
      addressLocality: lang === 'ru' ? 'Москва' : 'Moscow',
      addressCountry: 'RU',
    },
    areaServed: [
      { '@type': 'City', name: lang === 'ru' ? 'Москва' : 'Moscow' },
      { '@type': 'Country', name: lang === 'ru' ? 'Россия' : 'Russia' },
    ],
    knowsLanguage: ['ru', 'en'],
    /* sameAs связывает страницу с профилями того же человека в других
       местах. По нему поисковик понимает, что автор сайта и владелец
       гитхаба — один человек, а не два однофамильца. Пустая строка
       в profile.github убирает ссылку сама */
    sameAs: [
      `https://t.me/${profile.telegram}`,
      ...(profile.github ? [`https://github.com/${profile.github}`] : []),
    ],
  }
}

/* ────────────────────────────────────────────────────────────────
   ТЕЛО СТРАНИЦЫ

   Разметка нарочно скупая: заголовки, абзацы, ссылки и списки.
   Всё, что делает страницу красивой, приезжает вместе со скриптами,
   а роботу нужны текст и связи между страницами. Классы при этом
   настоящие, а не выдуманные, — до загрузки скриптов человек видит
   ту же страницу, только неподвижную.
   ──────────────────────────────────────────────────────────────── */

/** Ссылка на другую языковую версию этой же страницы, обычной ссылкой. */
function langSwitch(bare, lang) {
  const other = lang === 'ru' ? 'en' : 'ru'
  const label = other === 'en' ? 'English version' : 'Русская версия'
  return `  <p><a href="${loc(bare, other)}" hreflang="${other}">${label}</a></p>`
}

function homeBody(lang) {
  const title = heroLines.map((l) => T(l.text, lang)).join(' ')

  return `<main id="main" class="shell">
${langSwitch('/', lang)}
  <h1>${esc(title)}</h1>
  <p>${esc(T(hero.claim, lang))}</p>
  <p>${esc(T(hero.detail, lang))}</p>

  <h2>${esc(T(ui.workTitle, lang))}</h2>
  <ul>
${projects
  .map(
    (p) => `    <li>
      <a href="${loc(`/work/${p.id}`, lang)}"><strong>${esc(T(p.name, lang))}</strong> — ${esc(T(p.tagline, lang))}</a>
      <p>${esc(T(p.summary, lang))}</p>
    </li>`,
  )
  .join('\n')}
  </ul>
  <!-- Дорога на /rabota, на том же месте, что и в живой странице:
       сразу под работами. Нарисована она реактом, и без этой строки
       робот и языковые модели нашли бы страницу для работодателя
       только через карту сайта -->
  <p><a href="${loc('/rabota', lang)}">${esc(T(ui.hireName, lang))} — ${esc(T(ui.hirePage, lang))}</a></p>

  <h2>${esc(T(about.title, lang))}</h2>
${about.paragraphs.map((x) => `  <p>${esc(T(x, lang))}</p>`).join('\n')}

  <h2>${esc(T(strengths.title, lang))}</h2>
${strengths.items
  .map((s) => `  <h3>${esc(T(s.title, lang))}</h3>\n  <p>${esc(T(s.detail, lang))}</p>`)
  .join('\n')}

  <h2>${esc(T(LABEL.services, lang))}</h2>
  <ul>
${services
  .map((s) =>
    lang === 'ru'
      ? `    <li><strong>${esc(T(s.label, lang))}</strong> — ${esc(s.term)}</li>`
      : `    <li>${esc(T(s.label, lang))}</li>`,
  )
  .join('\n')}
  </ul>
  <p><a href="${loc('/uslugi', lang)}">${esc(T(ui.servicesMore, lang))}</a></p>

  <h2>${esc(T(LABEL.faq, lang))}</h2>
${faq.map((f) => `  <h3>${esc(T(f.q, lang))}</h3>\n  <p>${esc(T(f.a, lang))}</p>`).join('\n')}

  <h2>${esc(T(contact.title, lang))}</h2>
  <p>${esc(T(contact.lede, lang))}</p>
  <p>
    <a href="https://t.me/${esc(profile.telegram)}">Telegram: @${esc(profile.telegram)}</a><br />
    <a href="mailto:${esc(profile.email)}">${esc(T(LABEL.mail, lang))}: ${esc(profile.email)}</a><br />
${profile.github ? `    <a href="https://github.com/${esc(profile.github)}">GitHub: ${esc(profile.github)}</a><br />\n` : ''}    ${esc(T(profile.location, lang))}
  </p>
</main>`
}

function projectBody(p, lang) {
  const clip = clipOf(p.id)
  const bare = `/work/${p.id}`

  /*
    Обложка идёт в тело картинкой, а не только строкой в карте сайта.

    Карту сайта читает поиск по картинкам, но не читает никто больше:
    языковой модели, разбирающей страницу, о снимке продукта оттуда
    не узнать, а Яндексу картинка в разметке нужнее, чем ссылка
    в отдельном файле.

    Отложенная загрузка обязательна. Эту разметку человек не видит —
    React заменяет её собой, — и без loading="lazy" браузер успел бы
    скачать снимок до того, как узел исчезнет.
  */
  const cover = built(p.cover)
  const size = cover ? sizeOf(cover) : null
  const shotAlt = `${T(p.name, lang)} — ${T(p.tagline, lang)}`

  return `<main id="main" class="shell">
${langSwitch(bare, lang)}
  <p><a href="${loc('/', lang)}">← ${esc(T(profile.name, lang))} ${esc(T(profile.surname, lang))}</a> · <a href="${loc('/', lang)}#work">${esc(T(LABEL.allWork, lang))}</a></p>

  <h1>${esc(T(p.name, lang))}</h1>
  <p><strong>${esc(T(p.tagline, lang))}</strong></p>
  <p>${esc(T(p.summary, lang))}</p>

  <p>${esc(T(LABEL.role, lang))}: ${esc(T(p.role, lang))}. ${esc(T(LABEL.year, lang))}: ${esc(p.year)}. ${esc(T(LABEL.stack, lang))}: ${esc(p.stack.join(', '))}.</p>
${
  p.url
    ? `  <p><a href="${esc(p.url)}" rel="noopener">${esc(T(LABEL.open, lang))}: ${esc(p.url)}</a></p>`
    : `  <p>${esc(T(LABEL.closed, lang))}</p>`
}
${
  cover
    ? `  <p><img src="${cover}" alt="${esc(shotAlt)}"${size ? ` width="${size.w}" height="${size.h}"` : ''} loading="lazy" /></p>`
    : ''
}
${clip ? `  <p><video src="${clip}" muted loop playsinline preload="none"></video></p>` : ''}

  <h2>${esc(T(ui.inside, lang))}</h2>
${p.inside.map((i) => `  <h3>${esc(T(i.title, lang))}</h3>\n  <p>${esc(T(i.detail, lang))}</p>`).join('\n')}

  <h2>${esc(T(LABEL.contact, lang))}</h2>
  <p>
    <a href="https://t.me/${esc(profile.telegram)}">Telegram: @${esc(profile.telegram)}</a> ·
    <a href="mailto:${esc(profile.email)}">${esc(profile.email)}</a>${profile.github ? ` ·\n    <a href="https://github.com/${esc(profile.github)}">GitHub</a>` : ''}
  </p>
</main>`
}

/* ────────────────────────────────────────────────────────────────
   ЗАПИСЬ СТРАНИЦ
   ──────────────────────────────────────────────────────────────── */

/** Куда лечь файлу, чтобы адрес отдавался без перенаправления.
 *
 *  Файл кладётся как work/<id>.html, а не work/<id>/index.html.
 *  Разница видна только в ответе сервера, и она важна. Папка с
 *  index.html отдаётся по адресу со слэшем на конце, а на адрес без
 *  слэша площадка отвечает перенаправлением. Канонический адрес в
 *  разметке при этом стоит без слэша — получается, что страница
 *  объявляет себя главной копией по адресу, который сама же
 *  перенаправляет в другое место.
 *
 *  Исключение — адреса, кончающиеся слэшем: / и /en/. У них наоборот,
 *  index.html внутри папки и есть тот файл, который сервер отдаёт без
 *  единого перенаправления. Почему у английской главной так — в
 *  примечании к loc().
 */
function fileFor(bare, lang) {
  const rel = loc(bare, lang)
  return rel.endsWith('/') ? `${rel.slice(1)}index.html` : `${rel.slice(1)}.html`
}

function write(relFile, page) {
  const full = join(dist, relFile)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(full, page)
}

/* ────────────────────────────────────────────────────────────────
   ГЛАВНАЯ — на каждом языке
   ──────────────────────────────────────────────────────────────── */

for (const lang of LANGS) {
  const graph = [
    personNode(lang),
    siteNode(lang),
    {
      '@type': 'ProfilePage',
      '@id': `${SITE}${loc('/', lang)}#page`,
      url: `${SITE}${loc('/', lang)}`,
      isPartOf: { '@id': `${SITE}/#website` },
      /*
        mainEntity и about указывают на один и тот же узел, и оба
        нужны. about говорит «страница про этого человека» — это
        общее свойство любой страницы. mainEntity говорит «этот
        человек и есть содержимое страницы», и для типа ProfilePage
        Google считает его обязательным: без него страница профиля
        к показу в поиске не допускается вовсе.
      */
      mainEntity: { '@id': `${SITE}/#person` },
      about: { '@id': `${SITE}/#person` },
      inLanguage: lang,
      dateModified: stamp(lastmod(loc('/', lang), JSON.stringify([lang, HOME_SRC]))),
      primaryImageOfPage: `${SITE}${OG_FALLBACK}`,
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE}${loc('/', lang)}#faq`,
      isPartOf: { '@id': `${SITE}/#website` },
      inLanguage: lang,
      mainEntity: faq.map((f) => ({
        '@type': 'Question',
        name: T(f.q, lang),
        acceptedAnswer: { '@type': 'Answer', text: T(f.a, lang) },
      })),
    },
    practiceNode(lang),
    {
      '@type': 'Service',
      name: lang === 'ru' ? 'Создание сайтов под ключ' : 'Websites built end to end',
      serviceType: lang === 'ru' ? 'Разработка и дизайн сайтов' : 'Website design and development',
      provider: { '@id': `${SITE}/#practice` },
      areaServed: [
        { '@type': 'City', name: lang === 'ru' ? 'Москва' : 'Moscow' },
        { '@type': 'Country', name: lang === 'ru' ? 'Россия' : 'Russia' },
      ],
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: `${SITE}${loc('/', lang)}#contact`,
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: lang === 'ru' ? 'Что можно заказать' : 'What you can order',
        itemListElement: services.map((s) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name: T(s.label, lang) },
        })),
      },
    },
    /*
      Список работ отдельной сущностью.

      Он же говорит поисковику, что главная — не одна страница, а вход
      в семь других, и связывает их с автором. Без него страницы
      проектов выглядят найденными по отдельности.
    */
    {
      '@type': 'ItemList',
      '@id': `${SITE}${loc('/', lang)}#work`,
      name: T(ui.workTitle, lang),
      numberOfItems: projects.length,
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}${loc(`/work/${p.id}`, lang)}`,
        name: T(p.name, lang),
      })),
    },
  ]

  write(
    fileFor('/', lang),
    withBody(
      head(html, {
        lang,
        title: T(seo.home.title, lang),
        desc: T(seo.home.description, lang),
        bare: '/',
        cover: OG_FALLBACK,
        coverAlt:
          lang === 'ru'
            ? 'Первый экран сайта Ангелины Згадовой: заголовок «Придумываю продукты и собираю сама»'
            : 'The opening screen of Angelina Zgadova’s site: “I design products and build it myself”',
        graph,
      }),
      homeBody(lang),
    ),
  )
}

/* ────────────────────────────────────────────────────────────────
   ПОЛИТИКА ОБРАБОТКИ ДАННЫХ — на каждом языке

   Документ, который закон требует держать в открытом доступе.
   Раскладывается готовым HTML по той же причине, что и всё
   остальное, только здесь причина строже: страница, содержимое
   которой видно лишь после выполнения скриптов, для проверяющего
   выглядит пустой.
   ──────────────────────────────────────────────────────────────── */

function privacyBody(lang) {
  const bare = '/privacy'

  return `<main id="main" class="shell">
${langSwitch(bare, lang)}
  <p><a href="${loc('/', lang)}">← ${esc(T(profile.name, lang))} ${esc(T(profile.surname, lang))}</a></p>

  <h1>${esc(T(privacy.title, lang))}</h1>
  <p>${esc(T(privacy.lede, lang))}</p>

${privacy.blocks
  .map(
    (b) => `  <h2>${esc(T(b.title, lang))}</h2>
  <ul>
${b.items.map((i) => `    <li>${esc(T(i, lang))}</li>`).join('\n')}
  </ul>`,
  )
  .join('\n\n')}

  <h2>${esc(T(privacy.contactTitle, lang))}</h2>
  <ul>
    <li>${esc(T(operator.fullName, lang))} — ${esc(T(operator.status, lang))}</li>
${operator.inn ? `    <li>${esc(T(privacy.innLabel, lang))}: ${esc(operator.inn)}</li>\n` : ''}    <li><a href="mailto:${esc(operator.email)}">${esc(operator.email)}</a></li>
    <li>${esc(T(privacy.updatedLabel, lang))} ${esc(T(operator.updated, lang))}</li>
  </ul>
</main>`
}

/* ────────────────────────────────────────────────────────────────
   УСЛУГИ — на каждом языке

   Единственная страница сайта, которую пишут ради запроса, а не ради
   рассказа. Поэтому разметка здесь не только текстовая: каждая услуга
   идёт отдельным узлом Service со ссылкой на работу-пример, а весь
   список — каталогом. Оферты (Offer) в узлах нет намеренно: цены на
   странице нет, а Offer без цены — обещание, которое разметка не
   подтверждает, и поисковик такое считает разметкой не по делу.
   ──────────────────────────────────────────────────────────────── */

function servicesBody(lang) {
  const bare = '/uslugi'
  const byId = Object.fromEntries(projects.map((p) => [p.id, p]))

  const block = (s) => {
    const shown = s.examples.map((id) => byId[id]).filter(Boolean)
    return `  <h2>${esc(T(s.label, lang))}</h2>
  <p>${esc(T(s.lede, lang))}</p>
  <h3>${esc(T(servicesPage.includesLabel, lang))}</h3>
  <ul>
${s.includes.map((x) => `    <li>${esc(T(x, lang))}</li>`).join('\n')}
  </ul>${
    shown.length
      ? `\n  <h3>${esc(T(servicesPage.exampleLabel, lang))}</h3>\n  <ul>\n${shown
          .map(
            (p) =>
              `    <li><a href="${loc(`/work/${p.id}`, lang)}">${esc(T(p.name, lang))}</a> — ${esc(T(p.tagline, lang))}</li>`,
          )
          .join('\n')}\n  </ul>`
      : ''
  }${s.gap ? `\n  <p>${esc(T(s.gap, lang))}</p>` : ''}`
  }

  return `<main id="main" class="shell">
${langSwitch(bare, lang)}
  <p><a href="${loc('/', lang)}">← ${esc(T(profile.name, lang))} ${esc(T(profile.surname, lang))}</a> · <a href="${loc('/', lang)}#work">${esc(T(LABEL.allWork, lang))}</a></p>

  <h1>${esc(T(servicesPage.title, lang))}</h1>
  <p>${esc(T(servicesPage.lede, lang))}</p>

${services.map(block).join('\n\n')}

  <h2>${esc(T(servicesPage.priceTitle, lang))}</h2>
  <p>${esc(T(servicesPage.priceLede, lang))}</p>
  <ul>
${servicesPage.factors.map((f) => `    <li>${esc(T(f, lang))}</li>`).join('\n')}
  </ul>

  <h2>${esc(T(servicesPage.askTitle, lang))}</h2>
  <ol>
${servicesPage.ask.map((q) => `    <li>${esc(T(q, lang))}</li>`).join('\n')}
  </ol>
  <p>${esc(T(servicesPage.askClosing, lang))}</p>

  <h2>${esc(T(servicesPage.ctaTitle, lang))}</h2>
  <p>${esc(T(servicesPage.ctaLede, lang))}</p>
  <p>
    <a href="https://t.me/${esc(profile.telegram)}">Telegram: @${esc(profile.telegram)}</a><br />
    <a href="mailto:${esc(profile.email)}">${esc(T(LABEL.mail, lang))}: ${esc(profile.email)}</a><br />
${profile.github ? `    <a href="https://github.com/${esc(profile.github)}">GitHub: ${esc(profile.github)}</a><br />\n` : ''}    ${esc(T(profile.location, lang))}
  </p>
</main>`
}

for (const lang of LANGS) {
  const bare = '/uslugi'
  const url = SITE + loc(bare, lang)
  const byId = Object.fromEntries(projects.map((p) => [p.id, p]))

  write(
    fileFor(bare, lang),
    withBody(
      head(html, {
        lang,
        title: T(servicesPage.seoTitle, lang),
        desc: T(servicesPage.seoDescription, lang),
        bare,
        cover: OG_FALLBACK,
        coverAlt: T(servicesPage.title, lang),
        graph: [
          personNode(lang),
          siteNode(lang),
          {
            '@type': 'BreadcrumbList',
            '@id': `${url}#crumbs`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: `${T(profile.name, lang)} ${T(profile.surname, lang)}`,
                item: `${SITE}${loc('/', lang)}`,
              },
              { '@type': 'ListItem', position: 2, name: T(servicesPage.title, lang), item: url },
            ],
          },
          {
            '@type': 'WebPage',
            '@id': `${url}#page`,
            url,
            name: T(servicesPage.seoTitle, lang),
            description: T(servicesPage.seoDescription, lang),
            isPartOf: { '@id': `${SITE}/#website` },
            about: { '@id': `${SITE}/#person` },
            inLanguage: lang,
            dateModified: stamp(
              lastmod(loc(bare, lang), JSON.stringify([lang, services, servicesPage])),
            ),
          },
          {
            '@type': 'OfferCatalog',
            '@id': `${url}#catalog`,
            name: T(servicesPage.title, lang),
            inLanguage: lang,
            itemListElement: services.map((s, i) => ({
              '@type': 'Service',
              '@id': `${url}#${s.id}`,
              position: i + 1,
              name: T(s.label, lang),
              /* Русский поисковый термин — только в русской версии.
                 В английской он читался бы транслитом ниоткуда */
              alternateName: lang === 'ru' ? s.term : undefined,
              description: T(s.lede, lang),
              serviceType: lang === 'ru' ? s.term : T(s.label, lang),
              provider: { '@id': `${SITE}/#person` },
              areaServed: { '@type': 'Country', name: lang === 'ru' ? 'Россия' : 'Russia' },
              url: `${url}#${s.id}`,
              /* Работа-пример прямо в узле услуги: утверждение и
                 доказательство к нему не должны разъезжаться и в
                 разметке тоже */
              subjectOf: s.examples
                .filter((id) => byId[id])
                .map((id) => ({ '@id': `${SITE}${loc(`/work/${id}`, lang)}#work` })),
            })),
          },
        ],
      }),
      servicesBody(lang),
    ),
  )
}

/*
 * СТРАНИЦА ДЛЯ РАБОТОДАТЕЛЯ
 *
 * Матрица «кто что вёл» отдаётся роботу настоящей таблицей: у неё
 * есть заголовки строк и столбцов, и языковая модель читает её как
 * данные, а не как набор слов. Из точек в вёрстке смысла не извлечь,
 * поэтому здесь на их месте стоят «да» и прочерк.
 */
function hireBody(lang) {
  const head = layers.map((l) => `<th scope="col">${esc(T(l.title, lang))}</th>`).join('')

  const rows = projects
    .map((p) => {
      const cells = layers
        .map((l) => `<td>${p.layers.includes(l.id) ? esc(T(hire.layerYes, lang)) : '—'}</td>`)
        .join('')
      const name = p.url
        ? `<a href="${loc(`/work/${p.id}`, lang)}">${esc(T(p.name, lang))}</a>`
        : esc(T(p.name, lang))
      return `    <tr>
      <th scope="row">${name}</th>
      <td>${esc(T(p.role, lang))}</td>${cells}
      <td>${esc(p.stack.join(' · '))}</td>
    </tr>`
    })
    .join('\n')

  return `<main id="main">
  <p><a href="${loc('/', lang)}">${esc(T(ui.backHome, lang))}</a></p>

  <h1>${esc(T(hire.title, lang))}</h1>
  <p>${esc(T(hire.lede, lang))}</p>
  <p><strong>${esc(T(hire.akaTitle, lang))}:</strong> ${esc(T(hire.aka, lang))}</p>

  <h2>${esc(T(hire.layersTitle, lang))}</h2>
  <p>${esc(T(hire.layersLede, lang))}</p>
  <table>
    <thead>
      <tr><th scope="col">${esc(T(hire.colProject, lang))}</th><th scope="col">${esc(
        T(hire.colRole, lang),
      )}</th>${head}<th scope="col">${esc(T(hire.colStack, lang))}</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <h2>${esc(T(hire.howTitle, lang))}</h2>
  <p>${esc(T(limits, lang))}</p>

  <h2>${esc(T(hire.codeTitle, lang))}</h2>
  <p>${esc(T(hire.codeLede, lang))}</p>
  <ul>
${hire.code
  .map(
    (c) =>
      `    <li><a href="https://github.com/${esc(profile.github)}/linastudio/blob/main/${esc(
        c.path,
      )}">${esc(c.path)}</a> — ${esc(T(c.what, lang))}</li>`,
  )
  .join('\n')}
  </ul>

  <h2>${esc(T(hire.formatTitle, lang))}</h2>
  <ul>
${hire.format.map((f) => `    <li>${esc(T(f, lang))}</li>`).join('\n')}
  </ul>

  <h2>${esc(T(hire.ctaTitle, lang))}</h2>
  <p>
    <a href="https://t.me/${esc(profile.telegram)}">Telegram: @${esc(profile.telegram)}</a><br />
    <a href="mailto:${esc(profile.email)}">${esc(T(LABEL.mail, lang))}: ${esc(profile.email)}</a><br />
${profile.github ? `    <a href="https://github.com/${esc(profile.github)}">GitHub: ${esc(profile.github)}</a><br />\n` : ''}    ${esc(T(profile.location, lang))}
  </p>
</main>`
}

for (const lang of LANGS) {
  const bare = '/rabota'
  const url = SITE + loc(bare, lang)

  write(
    fileFor(bare, lang),
    withBody(
      head(html, {
        lang,
        title: T(hire.seoTitle, lang),
        desc: T(hire.seoDescription, lang),
        bare,
        cover: OG_FALLBACK,
        coverAlt: T(hire.title, lang),
        graph: [
          /* Связь «человек ищет вот это» идёт от человека к запросу,
             а не наоборот: свойство seeks есть только у Person, и без
             него узел ниже висел бы сам по себе, ничей */
          { ...personNode(lang), seeks: { '@id': `${url}#seeks` } },
          siteNode(lang),
          {
            '@type': 'BreadcrumbList',
            '@id': `${url}#crumbs`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: `${T(profile.name, lang)} ${T(profile.surname, lang)}`,
                item: `${SITE}${loc('/', lang)}`,
              },
              { '@type': 'ListItem', position: 2, name: T(hire.title, lang), item: url },
            ],
          },
          {
            /* ProfilePage, а не обычная WebPage: страница описывает
               человека, и поисковику это говорит, кого именно */
            '@type': 'ProfilePage',
            '@id': `${url}#page`,
            url,
            name: T(hire.seoTitle, lang),
            description: T(hire.seoDescription, lang),
            isPartOf: { '@id': `${SITE}/#website` },
            mainEntity: { '@id': `${SITE}/#person` },
            about: { '@id': `${SITE}/#person` },
            inLanguage: lang,
            dateModified: stamp(lastmod(loc(bare, lang), JSON.stringify([lang, hire, limits]))),
          },
          {
            /*
              Чего человек ищет — отдельным узлом и только здесь.

              Поисковой выдаче он ничего не даёт: расширенных
              результатов по seeks нет ни у Яндекса, ни у Google.
              Читают его языковые модели, и на вопрос «кого можно
              позвать продуктовым дизайнером в Москве» отвечают уже
              не пересказом страницы, а этими полями.

              На главной и на услугах его нет намеренно: там разговор
              с заказчиком, и объявление о поиске работы посреди него
              сбивает и человека, и робота.
            */
            '@type': 'Demand',
            '@id': `${url}#seeks`,
            name: T(hire.title, lang),
            description: T(hire.seoDescription, lang),
            availableAtOrFrom: {
              '@type': 'Place',
              address: {
                '@type': 'PostalAddress',
                addressLocality: lang === 'ru' ? 'Москва' : 'Moscow',
                addressCountry: 'RU',
              },
            },
            areaServed: [
              { '@type': 'City', name: lang === 'ru' ? 'Москва' : 'Moscow' },
              { '@type': 'Country', name: lang === 'ru' ? 'Россия' : 'Russia' },
            ],
          },
        ],
      }),
      hireBody(lang),
    ),
  )
}

for (const lang of LANGS) {
  const bare = '/privacy'
  const url = SITE + loc(bare, lang)
  const title = `${T(privacy.title, lang)} | ${T(profile.name, lang)} ${T(profile.surname, lang)}`

  write(
    fileFor(bare, lang),
    withBody(
      head(html, {
        lang,
        title,
        desc: T(privacy.lede, lang).slice(0, 300),
        bare,
        cover: OG_FALLBACK,
        coverAlt: T(privacy.title, lang),
        graph: [
          personNode(lang),
          siteNode(lang),
          {
            '@type': 'BreadcrumbList',
            '@id': `${url}#crumbs`,
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: `${T(profile.name, lang)} ${T(profile.surname, lang)}`,
                item: `${SITE}${loc('/', lang)}`,
              },
              { '@type': 'ListItem', position: 2, name: T(privacy.title, lang), item: url },
            ],
          },
          {
            '@type': 'WebPage',
            '@id': `${url}#page`,
            url,
            name: T(privacy.title, lang),
            description: T(privacy.lede, lang),
            isPartOf: { '@id': `${SITE}/#website` },
            about: { '@id': `${SITE}/#person` },
            inLanguage: lang,
            dateModified: stamp(operator.updatedISO),
          },
        ],
      }),
      privacyBody(lang),
    ),
  )
}

/* ────────────────────────────────────────────────────────────────
   СТРАНИЦЫ ПРОЕКТОВ — на каждом языке
   ──────────────────────────────────────────────────────────────── */

for (const p of projects) {
  const bare = `/work/${p.id}`
  const clip = clipOf(p.id)

  /*
    Превью ссылки — кадр самого проекта, а не общая картинка сайта.

    Ссылку на проект чаще всего кидают в мессенджер, и там от неё
    видно ровно две вещи: заголовок и картинку. Одинаковая картинка
    на все семь проектов превращает их в одну ссылку, отправленную
    семь раз. Она же идёт в разметку как изображение работы — по ней
    страница попадает в поиск по картинкам.
  */
  const cover = built(p.cover) ?? OG_FALLBACK

  for (const lang of LANGS) {
    const url = SITE + loc(bare, lang)
    const tagline = T(p.tagline, lang)
    /*
     * Имя в конце заголовка — подпись, а не содержание. Она полезна,
     * пока видна: человек в выдаче понимает, чей это проект. Но у
     * «Рабочего места» заголовок с подписью выходил в семьдесят шесть
     * знаков, и обрезка съедала как раз её, оставляя висеть огрызок
     * фамилии. Поэтому подпись дописывается, только если помещается
     * целиком; иначе заголовок кончается на строчке о проекте.
     */
    const stem = `${T(p.name, lang)} — ${tagline}`
    const sign = ` | ${T(profile.name, lang)} ${T(profile.surname, lang)}`
    const title = stem.length + sign.length <= 70 ? stem + sign : stem
    const desc = `${T(p.name, lang)}: ${tagline}. ${T(LABEL.projectDesc, lang)}`

    const graph = [
      personNode(lang),
      siteNode(lang),
      /*
        Навигационная цепочка. Яндекс показывает её вместо адреса
        под заголовком в выдаче: вместо голого «/work/pifika» человек
        видит «Ангелина Згадова › Проекты › Пифика» и понимает, куда
        попадёт, ещё до перехода.

        Три ступени, а не две. Первой обязательно идёт главная: цепочка,
        начинающаяся сразу с раздела, для поисковика повисает в воздухе,
        и он собирает её сам как умеет — то есть из адреса, ради ухода
        от которого всё и затевалось.
      */
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#crumbs`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: `${T(profile.name, lang)} ${T(profile.surname, lang)}`,
            item: `${SITE}${loc('/', lang)}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: T(LABEL.breadcrumb, lang),
            item: `${SITE}${loc('/', lang)}#work`,
          },
          { '@type': 'ListItem', position: 3, name: T(p.name, lang), item: url },
        ],
      },
      {
        '@type': 'CreativeWork',
        '@id': `${url}#work`,
        name: T(p.name, lang),
        headline: `${T(p.name, lang)} — ${tagline}`,
        description: T(p.summary, lang),
        url,
        ...(p.url ? { sameAs: [p.url] } : {}),
        inLanguage: lang,
        keywords: p.stack.join(', '),
        dateCreated: String(p.year).slice(0, 4),
        author: { '@id': `${SITE}/#person` },
        creator: { '@id': `${SITE}/#person` },
        image: `${SITE}${cover}`,
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#page`,
        url,
        name: title,
        description: desc,
        isPartOf: { '@id': `${SITE}/#website` },
        about: { '@id': `${url}#work` },
        primaryImageOfPage: `${SITE}${cover}`,
        inLanguage: lang,
        dateModified: stamp(lastmod(loc(bare, lang), JSON.stringify([lang, p]))),
      },
    ]

    // Ролик прохода по сайту — отдельная сущность. Поиск показывает
    // видео отдельной выдачей, и попасть туда куда проще, чем в общую:
    // конкурентов с видео на такие запросы почти нет
    if (clip) {
      graph.push({
        '@type': 'VideoObject',
        name: `${T(p.name, lang)} — ${T(LABEL.clip, lang)}`,
        description: `${T(LABEL.clipDesc, lang)} «${T(p.name, lang)}»: ${tagline}.`,
        contentUrl: `${SITE}${clip}`,
        thumbnailUrl: `${SITE}${cover}`,
        /* Дата ролика — дата последней правки проекта, а не сборки.
           Ролик снимается вместе со страницей и меняется вместе с ней,
           а сегодняшнее число тут означало бы, что все семь роликов
           переснимаются каждый раз, когда правишь запятую */
        uploadDate: stamp(lastmod(loc(bare, lang), JSON.stringify([lang, p]))),
        inLanguage: lang,
        isFamilyFriendly: true,
        author: { '@id': `${SITE}/#person` },
      })
    }

    write(
      fileFor(bare, lang),
      withBody(
        head(html, {
          lang,
          title,
          desc,
          bare,
          cover,
          coverAlt: `${T(p.name, lang)} — ${tagline}`,
          graph,
        }),
        projectBody(p, lang),
      ),
    )
  }
}

/* ────────────────────────────────────────────────────────────────
   СТРАНИЦА «НЕ НАЙДЕНО»

   Файл нужен для того, чтобы несуществующий адрес отдавался с кодом
   404, а не с кодом 200. Раньше площадке было велено отдавать на
   такой адрес главную страницу, и сайт разбирался с ошибкой уже
   в браузере. Человек при этом видел правильное, а поисковик —
   успешный ответ по битому адресу. Такие адреса он заносит в индекс
   как страницы с пустым содержимым и снижает оценку всему сайту.
   ──────────────────────────────────────────────────────────────── */

write(
  '404.html',
  withBody(
    head(html, {
      lang: 'ru',
      title: `404 — ${T(LABEL.notFound, 'ru')} | ${T(profile.name, 'ru')} ${T(profile.surname, 'ru')}`,
      desc: T(LABEL.notFoundLede, 'ru'),
      bare: '/404',
      cover: OG_FALLBACK,
      coverAlt: T(LABEL.notFound, 'ru'),
      graph: [personNode('ru'), siteNode('ru')],
      noindex: true,
    }),
    `<main id="main" class="shell">
  <h1>404</h1>
  <p>${esc(T(LABEL.notFound, 'ru'))}. ${esc(T(LABEL.notFoundLede, 'ru'))}</p>
  <p><a href="/">${esc(T(ui.backHome, 'ru'))}</a> · <a href="/#work">${esc(T(LABEL.allWork, 'ru'))}</a></p>
  <ul>
${projects
  .map(
    (p) =>
      `    <li><a href="/work/${p.id}">${esc(T(p.name, 'ru'))} — ${esc(T(p.tagline, 'ru'))}</a></li>`,
  )
  .join('\n')}
  </ul>
</main>`,
  ),
)

/* ────────────────────────────────────────────────────────────────
   КАРТА САЙТА
   ──────────────────────────────────────────────────────────────── */

/*
  Карта сайта.

  Кроме адресов в ней перечислены картинки и языковые пары.

  Картинки — потому что поиск по изображениям это отдельная выдача,
  и конкуренция там несравнимо ниже, чем в основной: по запросу
  «сайт строительной компании» в картинках у неё шансы есть, а
  в тексте — нет. Подпись к каждой берётся из названия проекта,
  и это не формальность: по подписи поиск и понимает, что на кадре.

  Языковые пары перечислены у каждого адреса и с обеих сторон:
  правило требует, чтобы английский адрес ссылался на русский ровно
  так же, как русский на английский. Односторонняя ссылка не
  засчитывается вовсе.
*/
const pages = [
  {
    bare: '/',
    priority: '1.0',
    freq: 'weekly',
    img: null,
    title: null,
    /* Собранные файлы в отпечаток не идут намеренно: их имена
       меняются с каждой правкой любой строчки кода, и дата
       обновления снова стала бы датой сборки */
    src: HOME_SRC,
  },
  ...projects.map((p) => ({
    bare: `/work/${p.id}`,
    priority: '0.8',
    freq: 'monthly',
    img: built(p.cover),
    title: {
      ru: `${T(p.name, 'ru')} — ${T(p.tagline, 'ru')}`,
      en: `${T(p.name, 'en')} — ${T(p.tagline, 'en')}`,
    },
    src: p,
  })),
  /* Услуги стоят сразу за главной и выше работ. Работы отвечают на
     вопрос «а что она умеет», услуги — на вопрос, с которым человек
     пришёл в поиск. Обход стоит тратить на второе раньше */
  {
    bare: '/uslugi',
    priority: '0.9',
    freq: 'monthly',
    img: null,
    title: null,
    src: { services, servicesPage },
  },
  /* Страница для работодателя. Приоритет ниже услуг: её адрес идёт
     прямой ссылкой в сопроводительное письмо, а из поиска на неё
     приходят редко — по имени, и тогда первой встречает главная */
  {
    bare: '/rabota',
    priority: '0.6',
    freq: 'monthly',
    img: null,
    title: null,
    src: { hire, limits, layers },
  },
  /* Политика идёт последней и с низким приоритетом: она обязана быть
     в индексе и находиться поиском по названию, но обход стоит
     тратить в первую очередь на работы */
  {
    bare: '/privacy',
    priority: '0.3',
    freq: 'yearly',
    img: null,
    title: null,
    src: PRIVACY_SRC,
  },
]

const entries = pages.flatMap((page) =>
  LANGS.map((lang) => ({
    loc: SITE + loc(page.bare, lang),
    ru: SITE + loc(page.bare, 'ru'),
    en: SITE + loc(page.bare, 'en'),
    // Английская версия ниже по приоритету: аудитория сайта русская,
    // и обход стоит тратить в первую очередь на неё
    priority: lang === 'ru' ? page.priority : (Number(page.priority) - 0.2).toFixed(1),
    freq: page.freq,
    img: page.img,
    title: page.title ? T(page.title, lang) : null,
    /* Дата у каждого языка своя: английский текст можно поправить,
       не тронув русский, и объявлять обновлённым оба неправда */
    date: lastmod(loc(page.bare, lang), JSON.stringify([lang, page.src])),
  })),
)

saveDates()

writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${entries
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <xhtml:link rel="alternate" hreflang="ru" href="${u.ru}" />
    <xhtml:link rel="alternate" hreflang="en" href="${u.en}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${u.ru}" />
    <lastmod>${u.date}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>${
      u.img
        ? `
    <image:image>
      <image:loc>${SITE}${u.img}</image:loc>
      <image:title>${esc(u.title)}</image:title>
    </image:image>`
        : ''
    }
  </url>`,
  )
  .join('\n')}
</urlset>
`,
)

/* ────────────────────────────────────────────────────────────────
   КЕШ ДЛЯ НЕИЗМЕНЯЕМЫХ ФАЙЛОВ

   Правила кеша нельзя написать одним файлом в корне: там пришлось бы
   различать папки по маске имени, а маску легко ошибиться. Apache
   читает .htaccess в каждой папке отдельно — это надёжнее и короче.

   Кладутся они здесь, а не в public/, потому что самих папок до
   сборки не существует: assets собирает Vite, clips снимает Playwright.
   ──────────────────────────────────────────────────────────────── */

const FOREVER = `# У файлов сборки хеш содержимого в имени: меняется содержимое —
# меняется имя. Значит их можно кешировать навсегда, старое имя
# просто перестанет запрашиваться.
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
`

const WEEK = `# Ролики лежат по постоянным адресам и пересобираются вручную.
# Неделя — компромисс между тем, чтобы не качать десять мегабайт
# заново, и тем, чтобы обновление доехало.
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=604800"
</IfModule>
`

for (const [dir, rules] of [
  ['assets', FOREVER],
  ['clips', WEEK],
]) {
  if (existsSync(join(dist, dir))) writeFileSync(join(dist, dir, '.htaccess'), rules)
}

/* ────────────────────────────────────────────────────────────────
   ПРАВИЛА ДЛЯ РОБОТОВ

   Собираются здесь, а не лежат готовым файлом в public/. Причина
   одна: адрес сайта. В robots.txt он стоит трижды, и при переезде
   на свой домен файл, оставшийся со старым адресом, отправлял бы
   роботов за картой сайта не туда — а карта сайта это то, по чему
   поисковик и узнаёт, что у сайта появился новый адрес.
   ──────────────────────────────────────────────────────────────── */

writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *
Allow: /

# Языковым моделям — короткая выжимка о сайте, чтобы они отвечали
# фактами, а не пересказом первого попавшегося абзаца
# ${SITE}/llms.txt
# ${SITE}/en/llms.txt

# Ботам, которые собирают данные для ответов в чатах, вход открыт
# сознательно. Портфолио живёт тем, что о нём рассказывают, и
# закрываться от места, где всё чаще спрашивают исполнителя, значит
# отказаться от половины будущих обращений.
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: YandexAdditional
Allow: /

# Метки рекламных кампаний не меняют содержимое страницы. Без этой
# строки Яндекс считает /?utm_source=... отдельным адресом и делит
# между дублями вес одной и той же страницы.
#
# Метки lang здесь намеренно нет: язык больше не метка, а отдельный
# адрес (/en), и склеивать его с русским было бы прямой ошибкой
User-agent: Yandex
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid&fbclid&from&ref
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
)

/* ────────────────────────────────────────────────────────────────
   КЛЮЧ INDEXNOW

   Файл с единственной строкой — тем же ключом, что и в имени.
   Поисковик, получив отправку, приходит по этому адресу и сверяет:
   совпало — значит отправлял тот, кто распоряжается доменом.

   Кладётся при сборке, а не руками в public, чтобы имя файла и ключ
   в отправителе не могли разойтись: и то и другое берётся из одной
   строки в src/data/seo.ts.
   ──────────────────────────────────────────────────────────────── */

if (indexNowKey) {
  writeFileSync(join(dist, `${indexNowKey}.txt`), indexNowKey)
}

/* ────────────────────────────────────────────────────────────────
   ВЫЖИМКА ДЛЯ ЯЗЫКОВЫХ МОДЕЛЕЙ

   Отдельный файл, потому что модели читают не разметку, а текст,
   и им нужна не страница, а справка: что человек делает, чем это
   подтверждено и куда писать. Проверяемость здесь важнее краткости —
   на каждое утверждение есть ссылка.

   Файла два: русский по /llms.txt и английский по /en/llms.txt.
   Модель, которой задали вопрос по-английски, ищет и цитирует
   английский текст, а пересказ русского она делает своими словами
   и с ошибками в именах.

   Ссылки идут разметкой markdown, а не голым адресом. Формат
   описан именно так, и разбирают файл по нему: голый адрес в
   строке половина читателей просто не считает ссылкой, и проект,
   на который она вела, остаётся без источника.
   ──────────────────────────────────────────────────────────────── */

function llms(lang) {
  const L = (ru, en) => (lang === 'ru' ? ru : en)

  return `# ${T(profile.name, lang)} ${T(profile.surname, lang)}

> ${L(
    'Веб-дизайнер и разработчик из Москвы, 21 год. Делает сайты под ключ:\n> дизайн, интерфейс, база данных, интеграции и запуск. Открыта к найму\n> и к фрилансу, работает удалённо.',
    'Web designer and developer from Moscow, 21. Builds websites end to end:\n> design, interface, database, integrations and launch. Open to employment\n> and to freelance, works remotely.',
  )}

${L(
  'Этот файл написан для языковых моделей, которые отвечают на вопросы\nо людях и исполнителях. Всё перечисленное ниже проверяемо по ссылкам.',
  'This file is written for language models answering questions about\npeople and contractors. Everything below can be checked against a link.',
)}

## ${L('Ссылки', 'Links')}
- [${L('Сайт', 'Site')}](${SITE}${loc('/', lang)}): ${L('портфолио целиком', 'the full portfolio')}
- [${L('Английская версия', 'Русская версия')}](${SITE}${loc('/', lang === 'ru' ? 'en' : 'ru')}): ${L('тот же сайт по-английски', 'the same site in Russian')}
- [Telegram](https://t.me/${profile.telegram}): ${L('быстрее всего ответит здесь', 'the fastest way to reach her')}
- [${T(LABEL.mail, lang)}](mailto:${profile.email}): ${profile.email}
${profile.github ? `- [GitHub](https://github.com/${profile.github}): ${L('исходник этого сайта целиком, с комментариями к решениям', 'the full source of this site, with a comment on every decision')}` : ''}
- [${L('Для работодателя', 'For employers')}](${SITE}${loc('/rabota', lang)}): ${L(
    'что она вела сама в каждом проекте, стек, формат работы',
    'what she ran herself on each project, the stack, the working format',
  )}

## ${L('Что делает', 'What she does')}
${services
  .map((s) => {
    /* Поисковый запрос в скобках — только если он отличается от
       названия. Иначе выходило «Веб-приложение (веб-приложение)»:
       модель читает это как сбой разметки, а не как уточнение */
    const label = T(s.label, lang)
    const same = label.toLowerCase() === s.term.toLowerCase()
    return `- **${label}**${lang === 'ru' && !same ? ` (${s.term})` : ''} — ${T(s.lede, lang)}`
  })
  .join('\n')}

[${L('Состав работы и примеры по каждой услуге', 'What each service includes, with examples')}](${SITE}${loc('/uslugi', lang)})

## ${T(servicesPage.priceTitle, lang)}
${T(servicesPage.priceLede, lang)}

${servicesPage.factors.map((f) => `- ${T(f, lang)}`).join('\n')}

${T(servicesPage.askClosing, lang)}

## ${L('Как работает', 'How she works')}
${about.paragraphs.map((p) => T(p, lang)).join('\n\n')}

## ${L('Сильные стороны', 'Strengths')}
${strengths.items.map((s) => `### ${T(s.title, lang)}\n${T(s.detail, lang)}`).join('\n\n')}

## ${L('Проекты', 'Projects')}
${projects
  .map(
    (p) =>
      `### ${T(p.name, lang)}\n${T(p.tagline, lang)}\n${T(p.summary, lang)}\n${T(LABEL.role, lang)}: ${T(p.role, lang)}. ${T(LABEL.year, lang)}: ${p.year}. ${T(LABEL.stack, lang)}: ${p.stack.join(', ')}.\n- [${L('Разбор проекта', 'Project breakdown')}](${SITE}${loc(`/work/${p.id}`, lang)})${
        p.url
          ? `\n- [${L('Живой сайт', 'The live site')}](${p.url})`
          : `\n- ${L('Закрытая система, публичной ссылки нет', 'A closed system, no public link')}`
      }`,
  )
  .join('\n\n')}

## ${L('Частые вопросы', 'Frequently asked questions')}
${faq.map((f) => `### ${T(f.q, lang)}\n${T(f.a, lang)}`).join('\n\n')}

## ${L('Связь', 'Contact')}
- [Telegram](https://t.me/${profile.telegram}): @${profile.telegram}
- [${T(LABEL.mail, lang)}](mailto:${profile.email}): ${profile.email}
- ${L('Город', 'City')}: ${T(profile.location, lang)}${L(', работает и удалённо по России', ', also works remotely across Russia')}
`
}

writeFileSync(join(dist, 'llms.txt'), llms('ru'))
mkdirSync(join(dist, 'en'), { recursive: true })
writeFileSync(join(dist, 'en/llms.txt'), llms('en'))

rmSync(dataFile, { force: true })

const made = existsSync(join(dist, 'work'))
  ? readdirSync(join(dist, 'work')).filter((f) => f.endsWith('.html')).length
  : 0
console.log(
  `[seo] страниц: ${entries.length} (${made} проектов + главная, услуги, работа и политика, × 2 языка),\n` +
    `      404 с настоящим кодом, sitemap на ${entries.length} адресов,\n` +
    `      llms.txt на двух языках, всё для ${SITE}`,
)
