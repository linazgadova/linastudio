import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export type Lang = 'ru' | 'en'

/** Двуязычная строка. Любой текст на сайте хранится в этой форме. */
export type L = { ru: string; en: string }

/** Приставка английских адресов. Русский идёт без приставки. */
export const EN_PREFIX = '/en'

/**
 * ЯЗЫК ЖИВЁТ В АДРЕСЕ ОТДЕЛЬНОЙ СТРАНИЦЕЙ
 *
 * Раньше он стоял в адресе меткой: `?lang=en`. Ссылку можно было
 * переслать, и открывалась она правильно, — но для поиска этого мало.
 * По адресу с меткой сервер отдавал тот же самый файл: русский
 * заголовок, русское описание, русский текст внутри. Разметка при
 * этом объявляла английскую версию, а по указанному адресу лежала
 * русская. Поисковик такую пару разбирает просто: считает
 * адреса копиями друг друга, английский выкидывает из индекса,
 * а обещание в hreflang запоминает как несбывшееся.
 *
 * Теперь у английской версии свои адреса — /en и /en/work/<id> — и
 * по ним после сборки лежат свои файлы: свой заголовок, своё описание,
 * свой текст, своя разметка. Обещание и страница за ним совпали.
 *
 * Из этого следует правило, которое ломать нельзя: язык определяется
 * адресом и ничем больше. Ни память браузера, ни язык системы права
 * голоса не имеют — иначе один и тот же адрес отдавал бы разным людям
 * разное, и канонический адрес перестал бы что-либо значить. По той
 * же причине здесь нет автоматической переброски по языку браузера:
 * робот приходит с английской локалью, и такая переброска увела бы
 * его с главной ещё до того, как он её прочитал.
 */
export function langOf(pathname: string): Lang {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'ru'
}

/** Адрес без языковой приставки: /en/work/pifika → /work/pifika */
export function stripLang(pathname: string): string {
  if (pathname === EN_PREFIX) return '/'
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length)
  return pathname
}

/**
 * Адрес с приставкой нужного языка: ('/work/pifika', 'en') → /en/work/pifika
 *
 * Английская главная — со слэшем: /en/. Ровно этот адрес стоит в
 * canonical, в hreflang и в карте сайта, потому что ровно его отдаёт
 * сервер: рядом лежит папка en/ с английскими проектами, и Apache
 * отвечает на /en перенаправлением на /en/ раньше любых правил сайта.
 * Ссылка изнутри сайта обязана вести туда же, куда указывает разметка,
 * иначе каждый переход на английский идёт лишним перенаправлением.
 */
export function withLang(pathname: string, lang: Lang): string {
  const bare = stripLang(pathname)
  if (lang === 'ru') return bare
  return bare === '/' ? `${EN_PREFIX}/` : `${EN_PREFIX}${bare}`
}

type LangContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Достаёт нужный язык из двуязычной строки. */
  t: (value: L) => string
  /** Внутренний адрес на текущем языке. Все ссылки сайта идут через него. */
  path: (to: string) => string
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const lang = langOf(location.pathname)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  /*
    Старые ссылки с меткой `?lang=en` ведут на новый адрес.

    Такие ссылки уже разошлись: они стояли в карте сайта и в разметке
    предыдущей сборки. Отвечать на них русской страницей значит
    обмануть и человека, и робота, который придёт перепроверить
    прежнее обещание. replace, а не push: промежуточный адрес не
    должен оставаться в истории, иначе кнопка «назад» возвращает
    человека на него же и он снова переезжает вперёд.
  */
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const legacy = params.get('lang')
    if (legacy !== 'ru' && legacy !== 'en') return

    params.delete('lang')
    const rest = params.toString()
    navigate(withLang(location.pathname, legacy) + (rest ? `?${rest}` : '') + location.hash, {
      replace: true,
    })
  }, [location.pathname, location.search, location.hash, navigate])

  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang) return
      navigate(withLang(location.pathname, next) + location.search + location.hash)
    },
    [lang, location.pathname, location.search, location.hash, navigate],
  )

  const t = useCallback((value: L) => value[lang], [lang])
  const path = useCallback((to: string) => withLang(to, lang), [lang])

  const value = useMemo(() => ({ lang, setLang, t, path }), [lang, setLang, t, path])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang должен вызываться внутри <LangProvider>')
  return ctx
}
