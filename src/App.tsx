import { lazy, Suspense, useEffect, useRef } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { LangProvider, stripLang, useLang, withLang } from './i18n/lang'
import { PROFILE } from './data/profile'
import { SEO, SITE_URL } from './data/seo'
import { PRIVACY } from './data/legal'
import { PROJECTS } from './data/projects'
import { SERVICES_PAGE } from './data/services'
import { HIRE } from './data/hire'
import { UI } from './data/ui'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { WorkList } from './components/WorkList'
import { About } from './components/About'
import { Contact, Footer } from './components/Contact'
import { Threads } from './components/Threads'
import { trackPage } from './analytics/metrika'
import { ProjectPage } from './pages/ProjectPage'
import { NotFound } from './pages/NotFound'
import { Privacy } from './pages/Privacy'
import { Services } from './pages/Services'
import { Hire } from './pages/Hire'
import { Cookies } from './components/Cookies'
import { Cursor } from './components/Cursor'
import { AuroraFlat, useOrbSupport } from './aurora/flat'

/*
 * Аврора тянет за собой Three и постобработку — это больше, чем вся
 * остальная страница вместе. Грузим её отдельным куском: текст
 * появляется сразу, сияние доезжает следом. До этого момента
 * на месте холста лежит мягкий CSS-градиент, поэтому пустоты нет.
 */
const AuroraStage = lazy(() =>
  import('./aurora/stage').then((m) => ({ default: m.AuroraStage })),
)

/**
 * Шар: лучом или краской.
 *
 * Проверка на WebGL2 стоит здесь, до загрузки сцены, а не внутри неё:
 * иначе машина, которая шар не покажет, скачает мегабайт Three и лишь
 * потом узнает, что он ей не нужен.
 *
 * prefers-reduced-motion даёт неподвижный шар, а не пустоту: правило
 * просит убрать движение, а не цвет.
 */
function Aurora() {
  const support = useOrbSupport()

  // Проверка ещё идёт. Первый экран уже виден, и пустым он остаться
  // не должен — держим на месте шара мягкое пятно
  if (!support) return <div className="aurora-stage aurora-stage--flat" aria-hidden="true" />

  if (!support.webgl || support.still) return <AuroraFlat still={support.still} />

  return (
    <Suspense fallback={<div className="aurora-stage aurora-stage--flat" aria-hidden="true" />}>
      <AuroraStage />
    </Suspense>
  )
}

/** Пишет или заводит тег в head — чтобы не плодить дубли при смене языка. */
function setTag(selector: string, make: () => HTMLElement, apply: (el: HTMLElement) => void) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = make()
    document.head.appendChild(el)
  }
  apply(el)
}

/**
 * Заголовок, описание и канонический адрес для текущего маршрута.
 *
 * Статическая разметка в index.html описывает главную и покрывает тех,
 * кто читает страницу без скриптов. Здесь она уточняется под конкретный
 * проект.
 */
function DocumentMeta() {
  const { lang, t } = useLang()
  const { pathname } = useLocation()

  useEffect(() => {
    const bare = stripLang(pathname)
    const match = bare.match(/^\/work\/(.+)$/)
    const project = match ? PROJECTS.find((p) => p.id === match[1]) : undefined

    const legal = bare === '/privacy'
    const uslugi = bare === '/uslugi'
    const rabota = bare === '/rabota'

    /*
      Правило повторяет scripts/seo.mjs намеренно: там заголовок идёт
      в файл для робота, здесь — в живую вкладку, и разойтись им нельзя.
      Подпись с именем дописывается, только если весь заголовок
      укладывается в семьдесят знаков: иначе поиск обрежет её на
      середине фамилии.
    */
    const sign = ` | ${t(PROFILE.name)} ${t(PROFILE.surname)}`
    const signed = (stem: string) => (stem.length + sign.length <= 70 ? stem + sign : stem)

    const title = project
      ? signed(`${t(project.name)} — ${t(project.tagline)}`)
      : legal
        ? signed(t(PRIVACY.title))
        : uslugi
          ? signed(t(SERVICES_PAGE.seoTitle))
          : rabota
            ? signed(t(HIRE.seoTitle))
            : t(SEO.home.title)

    const description = project
      ? `${t(project.name)}: ${t(project.tagline)}. ${t(UI.projectMeta)}`
      : legal
        ? t(PRIVACY.lede).slice(0, 300)
        : uslugi
          ? t(SERVICES_PAGE.seoDescription)
          : rabota
            ? t(HIRE.seoDescription)
            : t(SEO.home.description)
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname}`

    document.title = title
    document.documentElement.lang = lang

    setTag(
      'meta[name="description"]',
      () => Object.assign(document.createElement('meta'), { name: 'description' }),
      (el) => el.setAttribute('content', description),
    )
    setTag(
      'link[rel="canonical"]',
      () => Object.assign(document.createElement('link'), { rel: 'canonical' }),
      (el) => el.setAttribute('href', url),
    )

    /*
      Языковые пары ведут на эту же страницу в другой версии.

      В собранных файлах они уже стоят правильно, и роботу, читающему
      голый ответ сервера, этого хватает. Здесь то же самое делается
      после перехода внутри сайта: адрес сменился без перезагрузки,
      и без этой правки на странице проекта остались бы пары от
      главной — то есть каждая страница объявляла бы своим переводом
      главную.
    */
    const pairs: [string, string][] = [
      ['ru', `${SITE_URL}${withLang(bare, 'ru')}`],
      ['en', `${SITE_URL}${withLang(bare, 'en')}`],
      ['x-default', `${SITE_URL}${withLang(bare, 'ru')}`],
    ]
    for (const [hreflang, href] of pairs) {
      setTag(
        `link[rel="alternate"][hreflang="${hreflang}"]`,
        () => {
          const el = document.createElement('link')
          el.setAttribute('rel', 'alternate')
          el.setAttribute('hreflang', hreflang)
          return el
        },
        (el) => el.setAttribute('href', href),
      )
    }

    const og: [string, string][] = [
      ['og:title', title],
      ['og:description', description],
      ['og:url', url],
      ['og:locale', lang === 'ru' ? 'ru_RU' : 'en_US'],
    ]
    for (const [property, content] of og) {
      setTag(
        `meta[property="${property}"]`,
        () => {
          const el = document.createElement('meta')
          el.setAttribute('property', property)
          return el
        },
        (el) => el.setAttribute('content', content),
      )
    }
  }, [lang, t, pathname])

  return null
}

/**
 * Сообщать счётчику о переходах внутри сайта.
 *
 * Страница при переходе на проект не перезагружается, и счётчик такого
 * перехода не видит: без этого вызова визит остаётся на первом адресе,
 * а статистика по страницам проектов пустая.
 *
 * Первый заход не считаем — его счётчик записывает сам при загрузке.
 */
function useTrackPages() {
  const { pathname } = useLocation()
  const previous = useRef<string | null>(null)

  useEffect(() => {
    const from = previous.current
    previous.current = pathname
    if (from === null || from === pathname) return
    trackPage(window.location.href, window.location.origin + from)
  }, [pathname])
}

/**
 * ПЛАВНАЯ ПРОКРУТКА, ПОКА ОНА ПЛАВНАЯ
 *
 * Lenis отрисовывает прокрутку сам, кадр за кадром. Пока кадры
 * успевают, выходит мягче родной. Как только перестают — хуже: родную
 * прокрутку браузер считает отдельно от страницы и не роняет даже под
 * нагрузкой, а эта живёт в общей очереди и запинается вместе с ней.
 * На слабой машине сглаживание отбирает единственное, что работало
 * гладко и без него.
 *
 * Поэтому здесь сторож, такой же, как у сцены: считает длину кадров
 * во время прокрутки и, если она раз за разом выходит вдвое длиннее
 * положенного, отдаёт прокрутку браузеру. Решение окончательное —
 * включать и выключать сглаживание туда-сюда хуже, чем не иметь его.
 */
function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    /*
      Прокрутка обычной скорости. Растягивать её ради плавности шара
      нельзя: страница начинает листаться вязко, и это заметнее, чем
      рывки шара. Мягкость его переездов живёт в его собственном
      сглаживании — см. stage.tsx.
    */
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true })
    let raf = 0
    let last = 0
    let strikes = 0
    let alive = true

    /* Считаем только кадры на ходу. Пока страница стоит, браузер
       вправе отдавать кадры реже — на неподвижной странице это
       незаметно и о его силах ничего не говорит */
    function frame(time: number) {
      lenis.raf(time)

      const dt = last ? time - last : 0
      last = time
      if (alive && dt > 0 && Math.abs(lenis.velocity) > 0.5) {
        // 32 мс — это два пропущенных кадра подряд из шестидесяти.
        // Один такой глаз не ловит, серия из них и есть «дёрганый»
        if (dt > 32) strikes++
        else if (strikes > 0) strikes--

        if (strikes >= 14) {
          alive = false
          lenis.destroy()
          document.documentElement.dataset.scroll = 'native'
          return
        }
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      if (alive) lenis.destroy()
    }
  }, [])
}

/**
 * Куда смотреть после перехода и после загрузки.
 *
 * Адрес с якорем открывается на своём куске — так возврат со страницы
 * проекта попадает в список работ, а не в шапку. Любой другой переход
 * начинается сверху.
 *
 * Верх нужен явно по двум причинам. Переход внутри сайта страницу не
 * перезагружает, и браузер оставляет прокрутку там, где она была:
 * ссылка снизу главной открывала услуги сразу на последнем экране.
 * А при обычной перезагрузке браузер сам возвращает прокрутку туда,
 * где человек был в прошлый раз, — на телефоне из-за этого страница
 * открывалась то с середины, то с конца. Восстановлением занимаемся
 * сами: scrollRestoration переводится в ручной режим.
 *
 * Второй заход через кадр — на случай, когда высота страницы ещё
 * растёт: шрифты и картинки доезжают после первой отрисовки и сдвигают
 * содержимое под уже поставленной прокруткой.
 */
function ScrollOnRoute() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        el.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
    const again = requestAnimationFrame(() => window.scrollTo(0, 0))
    return () => cancelAnimationFrame(again)
  }, [pathname, hash])

  return null
}

function HomePage() {
  return (
    <main id="main">
      <Hero />
      <WorkList />
      <About />
      <Contact />
    </main>
  )
}

function Shell() {
  const { t } = useLang()
  useSmoothScroll()
  useTrackPages()

  return (
    <>
      <DocumentMeta />
      <ScrollOnRoute />

      <a className="skip-link" href="#main">
        {t(UI.skipToContent)}
      </a>

      {/*
        Три слоя в порядке от дальнего к ближнему.

        Пунктир идёт через весь документ одним слоем и уходит за оба
        края экрана: по секциям его раскладывать нельзя, на стыках
        видно, где один набор линий кончился и начался следующий.
        Он лежит в самом низу, под шаром, и прокручивается со страницей.

        Шар зафиксирован поверх пунктира и за содержимым; секции
        только говорят ему, где встать.
      */}
      <Threads seed={7} />

      <Aurora />

      <Header />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work/:id" element={<ProjectPage />} />
        {/* Адрес русский на обоих языках, и это не недосмотр. Язык
            здесь живёт одной приставкой /en, а разные слова в адресе
            на разных языках потребовали бы карты соответствий в
            роутере, в сборке страниц, в карте сайта и в hreflang.
            Разойтись им достаточно однажды, чтобы английская версия
            выпала из индекса — это уже было. Слово в адресе стоит
            дешевле такого риска */}
        <Route path="/uslugi" element={<Services />} />
        <Route path="/rabota" element={<Hire />} />
        <Route path="/privacy" element={<Privacy />} />
        {/* Английская версия — не режим отображения, а свои адреса.
            За ними после сборки лежат свои файлы: без них обещание
            hreflang указывало бы на русскую страницу */}
        <Route path="/en" element={<HomePage />} />
        <Route path="/en/work/:id" element={<ProjectPage />} />
        <Route path="/en/uslugi" element={<Services />} />
        <Route path="/en/rabota" element={<Hire />} />
        <Route path="/en/privacy" element={<Privacy />} />
        {/* Раньше на неизвестный адрес отдавалась главная. Человек
            при этом видел рабочий сайт по неправильному адресу и не
            понимал, что ошибся, а поисковик получал полную копию
            главной под каждым битым адресом */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
      <Cookies />
      {/* Последним в дереве, потому что он лежит поверх всего:
          порядок узлов решает спор одинаковых z-index, а у окна
          согласия он свой и выше */}
      <Cursor />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
        <Shell />
      </LangProvider>
    </BrowserRouter>
  )
}
