import { Link, useLocation } from 'react-router-dom'
import { useLang, withLang } from '../i18n/lang'
import { PROFILE } from '../data/profile'
import { UI } from '../data/ui'

/**
 * В шапке только имя и город. Должности нет сознательно:
 * ярлык вроде «fullstack-разработчик» ставит человека в один ряд
 * с теми, у кого пять лет коммерческого опыта, и по этой линейке
 * четыре месяца выглядят слабо. Работа объясняет себя сама.
 *
 * mix-blend-mode: difference — шапка остаётся читаемой и поверх
 * тёмного полотна, и поверх светлых скриншотов проектов.
 */
export function Header() {
  const { lang, t, path } = useLang()
  const { pathname } = useLocation()

  return (
    <header className="header">
      <div className="shell header__inner">
        {/*
          Имя и город — одна ссылка на главную. Раньше здесь стоял
          якорь #top: на главной он прокручивал к первому экрану, а на
          странице проекта вёл в никуда, потому что элемента с таким
          именем там нет. Адрес с якорем работает в обоих случаях —
          с главной прокручивает, с любой другой страницы возвращает.
        */}
        <Link className="header__home" to={`${path('/')}#top`} aria-label={t(UI.backHome)}>
          <span className="header__name">{t(PROFILE.name)}</span>
          <span className="header__city">{t(PROFILE.location)}</span>
        </Link>

        <div className="header__right">
          {/*
            Переключатель — ссылки, а не кнопки.

            Английская версия живёт по своим адресам, и попасть на неё
            робот может единственным способом: по ссылке со страницы,
            которую он уже читает. Кнопка переключала бы язык в
            браузере и никакой ссылки в разметке не оставляла — для
            поиска английской версии сайта тогда просто нет.

            hrefLang говорит, что за язык на том конце, а
            aria-current — какой открыт сейчас.
          */}
          <nav className="lang" aria-label={t(UI.switchLang)}>
            {(['ru', 'en'] as const).map((code) => (
              <Link
                key={code}
                className="lang__btn"
                to={withLang(pathname, code)}
                hrefLang={code}
                aria-current={lang === code ? 'true' : undefined}
              >
                {code.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
