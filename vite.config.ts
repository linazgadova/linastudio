import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import {
  chatSystemPrompt,
  insideBlocks,
  matchSystemPrompt,
  PROBE,
  projectHints,
  topicHints,
  topicNotes,
} from './src/ai/knowledge'
import { PROJECTS } from './src/data/projects'
import { ABOUT, CONTACT, HERO, HERO_LINES, PROFILE, STRENGTHS } from './src/data/profile'
import { FAQ, INDEXNOW_KEY, SEO, SERVICES, SITE_URL } from './src/data/seo'
import { SERVICES_PAGE } from './src/data/services'
import { UI } from './src/data/ui'
import { OPERATOR, PRIVACY } from './src/data/legal'

/**
 * Обложка каждого проекта — исходным путём, до сборки.
 *
 * Импортировать сам `previews.ts` отсюда нельзя: он тянет за собой
 * настоящие jpg, а конфиг Vite выполняется в Node, где такой импорт
 * ничего не значит. Поэтому здесь только пути, а сопоставить их
 * с собранными файлами постобработка сумеет по manifest.
 */
const PREVIEW_SOURCE: Record<string, string> = {
  pifika: 'src/assets/previews/pifika.jpg',
  thcrm: 'src/assets/previews/thcrm.jpg',
  stapsi: 'src/assets/previews/stapsi-home.jpg',
  fabrico: 'src/assets/previews/fabrico.jpg',
  thnkers: 'src/assets/previews/thnkers.jpg',
  gromstroy: 'src/assets/previews/gromstroy.jpg',
  'denis-lyakh': 'src/assets/previews/denis-lyakh.jpg',
}

/**
 * Адрес сайта — в index.html.
 *
 * В самом файле стоит %SITE%: канонические ссылки, языковые пары,
 * превью и заготовка разметки. Раньше там был вписан руками полный
 * адрес, двенадцать раз. При переезде на свой домен пропустить одно
 * вхождение означало бы страницу, которая объявляет своей главной
 * копией чужой адрес.
 *
 * Работает и в `vite dev`: transformIndexHtml вызывается на каждый
 * запрос страницы, поэтому на локальной машине разметка тоже верная.
 */
function siteUrl(): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      return html.split('%SITE%').join(SITE_URL)
    },
  }
}

/**
 * Данные сайта — в файл рядом со сборкой.
 *
 * После сборки по адресам проектов раскладываются настоящие страницы
 * (scripts/seo.mjs). Раньше тот скрипт вытаскивал поля из projects.ts
 * регулярным выражением: обычный Node не умеет читать TypeScript, а
 * поднимать ради шести полей второй сборщик казалось лишним.
 *
 * Так доставались только те поля, что лежат в начале объекта, и любая
 * перестановка в данных молча ломала разбор. Здесь же данные берутся
 * теми же самыми импортами, что и на странице, — расходиться им
 * больше негде.
 */
function seoData(): Plugin {
  return {
    name: 'seo-data',
    apply: 'build',
    closeBundle() {
      /*
       * Знания модели — рядом с ручкой, которая их читает.
       *
       * Ручка теперь на PHP, а промпты собираются из тех же данных,
       * что рисуют страницы, и лежат в TypeScript. Прочитать его PHP
       * не может, поэтому промпты выкладываются готовым файлом здесь,
       * при сборке. Источник правды остаётся один: поправишь проект
       * в projects.ts — блок начнёт отвечать по-новому.
       *
       * Имя с точки не случайно: .htaccess не отдаёт наружу файлы,
       * начинающиеся с точки.
       */
      mkdirSync(resolve(process.cwd(), 'dist/api'), { recursive: true })
      writeFileSync(
        resolve(process.cwd(), 'dist/api/.prompts.json'),
        JSON.stringify({
          chat: { ru: chatSystemPrompt('ru'), en: chatSystemPrompt('en') },
          inside: { ru: insideBlocks('ru'), en: insideBlocks('en') },
          hints: projectHints(),
          notes: { ru: topicNotes('ru'), en: topicNotes('en') },
          noteHints: topicHints(),
          probe: PROBE,
        }),
      )

      writeFileSync(
        resolve(process.cwd(), 'dist/seo-data.json'),
        JSON.stringify({
          profile: PROFILE,
          hero: HERO,
          heroLines: HERO_LINES,
          about: ABOUT,
          strengths: STRENGTHS,
          contact: CONTACT,
          seo: SEO,
          indexNowKey: INDEXNOW_KEY,
          faq: FAQ,
          services: SERVICES,
          servicesPage: SERVICES_PAGE,
          /* Подписи разделов. Раньше постобработка писала их по-русски
             прямо в коде — на английской версии это давало страницу
             с русскими заголовками разделов */
          ui: UI,
          /* Политика обработки данных: её тоже надо разложить готовым
             HTML — документ обязан читаться без выполнения скриптов */
          privacy: PRIVACY,
          operator: OPERATOR,
          projects: PROJECTS.map((p) => ({
            id: p.id,
            name: p.name,
            tagline: p.tagline,
            summary: p.summary,
            url: p.url,
            closed: p.closed ?? false,
            year: p.year,
            role: p.role,
            stack: p.stack,
            inside: p.inside,
            /* Исходный путь обложки. По нему постобработка находит
               в manifest настоящее имя файла с хешем */
            cover: PREVIEW_SOURCE[p.id] ?? null,
          })),
        }),
      )
    },
  }
}

/**
 * Мост к модели для локальной разработки.
 *
 * На боевом сайте /api/ask обслуживает public/api/ask.php на обычном
 * хостинге. В `vite dev` никакого PHP нет, поэтому блок «спросите обо
 * мне» на локальной машине всегда молча уходил в запасной режим —
 * поиск по данным без модели. Посмотреть, как он работает на самом
 * деле, было негде.
 *
 * Плагин повторяет ту же ручку прямо в dev-сервере: тот же адрес, тот
 * же формат тела, те же промпты из одного файла. Ключ читается из .env
 * и остаётся в Node — в браузер, как и на бою, он не попадает.
 * В сборку плагин не входит вовсе: apply: 'serve'.
 *
 * Адрес по умолчанию — любой совместимый с форматом OpenAI. Боевая
 * модель другая (YandexGPT, её зовёт PHP), и это осознанно: локально
 * важно проверить саму ручку и промпты, а не конкретного провайдера.
 */
function askBridge(env: Record<string, string>): Plugin {
  const BASE = env.ASK_BASE_URL ?? 'https://api.groq.com/openai/v1'
  const MODEL = env.ASK_MODEL ?? 'llama-3.3-70b-versatile'
  const KEY = env.ASK_API_KEY

  return {
    name: 'ask-bridge',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/ask', async (req, res) => {
        res.setHeader('Cache-Control', 'no-store')

        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end('{"error":"method_not_allowed"}')
        }
        if (!KEY) {
          res.statusCode = 503
          return res.end('{"error":"no_api_key"}')
        }

        const chunks: Buffer[] = []
        for await (const c of req) chunks.push(c as Buffer)

        let body: { mode?: string; lang?: string; question?: string }
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        } catch {
          res.statusCode = 400
          return res.end('{"error":"bad_json"}')
        }

        const lang = body.lang === 'en' ? 'en' : 'ru'
        const match = body.mode === 'match'
        const question = (body.question ?? '').slice(0, 4000).trim()
        if (!question) {
          res.statusCode = 400
          return res.end('{"error":"empty_question"}')
        }

        try {
          const upstream = await fetch(`${BASE}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                {
                  role: 'system',
                  content: match ? matchSystemPrompt(lang) : chatSystemPrompt(lang),
                },
                { role: 'user', content: question },
              ],
              temperature: match ? 0.2 : 0.55,
              max_tokens: match ? 900 : 320,
              ...(match ? { response_format: { type: 'json_object' } } : {}),
            }),
          })

          if (!upstream.ok) {
            res.statusCode = 502
            return res.end(JSON.stringify({ error: 'upstream_failed', status: upstream.status }))
          }

          const data = (await upstream.json()) as {
            choices?: { message?: { content?: string } }[]
          }
          const text = data.choices?.[0]?.message?.content ?? ''

          if (match) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            return res.end(text || '{}')
          }
          // На бою чат идёт потоком, здесь — одним куском. Интерфейсу
          // всё равно: он читает тело кусками, а сколько их придёт,
          // одна или сотня, его не касается
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(text)
        } catch (e) {
          // Нет сети или провайдер недоступен. Отвечаем ошибкой, а не
          // молчанием: интерфейс перейдёт в запасной режим сам
          res.statusCode = 502
          res.end(JSON.stringify({ error: 'unreachable', detail: String(e).slice(0, 200) }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Третий аргумент пустой строкой — читать все переменные, а не
  // только VITE_*. Ключ провайдера намеренно без этого префикса:
  // всё, что начинается с VITE_, Vite подставляет прямо в код
  // страницы, то есть отдаёт в браузер
  const env = loadEnv(mode, process.cwd(), '')

  return {
    /*
     * База абсолютная, потому что у сайта появились вложенные адреса
     * (/work/pifika). С относительной базой на такой странице браузер
     * искал бы файлы в /work/assets/ и не нашёл бы их.
     *
     * Из-за этого собранный index.html больше нельзя открыть двойным
     * кликом — смотреть надо через `npm run preview`.
     */
    base: '/',
    plugins: [react(), siteUrl(), askBridge(env), seoData()],
    build: {
      target: 'es2020',
      assetsInlineLimit: 2048,
      /*
       * Список собранных файлов с их настоящими именами.
       *
       * У картинок в именах хеш содержимого, и заранее их адреса
       * не известны. Постобработке (scripts/seo.mjs) они нужны:
       * каждой странице проекта она подставляет в превью ссылки
       * его собственный кадр, а не общую картинку сайта.
       */
      manifest: true,
    },
  }
})
