import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { HERO, HERO_LINES } from '../data/profile'
import { useAuroraSection } from '../aurora/target'
import { Ask } from './Ask'

export function Hero() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)

  // Первый экран: шар ровно по центру, за текстом. Сияние заполняет
  // объём, но яркость приглушена — заголовок лежит поверх, и на полной
  // отдаче буквы бы в нём тонули
  // shift — точка на цветовом кольце. На первом экране фиолет
  // с малиновым, дальше по странице кольцо проворачивается
  useAuroraSection(ref, {
    cx: 0.5,
    cy: 0.5,
    radius: 0.3,
    form: 0.78,
    intensity: 1.18,
    shift: 0,
    // Малиновый — главный акцент всего сайта. С него страница
    // начинается, к нему же возвращается в контактах
    accent: '#FF2D6F',
    tint: 0.5,
  })

  /*
    Заход начинается со следующего кадра, а не через 90 мс.
    Таймер тут был нужен ради одного: дать браузеру нарисовать
    исходное положение, иначе переход не с чего начинать и текст
    просто возникает на месте. Два кадра решают ту же задачу и
    привязаны к отрисовке, а не к часам: на медленной машине,
    где кадр идёт дольше, ожидание растянется ровно настолько,
    насколько нужно, а на быстрой кончится за тридцать миллисекунд
    вместо девяноста.
  */
  useEffect(() => {
    let second = 0
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setEntered(true))
    })
    return () => {
      cancelAnimationFrame(first)
      cancelAnimationFrame(second)
    }
  }, [])

  return (
    <section className="hero" id="top" ref={ref}>

      <div className="shell hero__inner">
        <h1 className={`hero__headline${entered ? ' is-in' : ''}`}>
          {HERO_LINES.map((line, i) => (
            <span
              className="hero__line"
              key={line.text.ru}
              style={{
                ['--i' as string]: i,
                ['--offset' as string]: `${line.offset ?? 0}%`,
                ['--scale' as string]: line.scale ?? 1,
                ['--rot' as string]: `${line.rot ?? 0}deg`,
              }}
            >
              <span className={line.outline ? 'hero__outline' : undefined}>{t(line.text)}</span>
            </span>
          ))}
        </h1>

        {/*
          Подводка не в плашке. Плашка на светящемся шаре читается
          как заплатка: у неё есть край, и этот край спорит с кругом.
          Здесь вместо края мягкая размывка бумаги, которая гаснет
          к краям, — текст читается, а прямоугольника нет.
        */}
        <div className={`hero__meta${entered ? ' is-in' : ''}`}>
          <p className="hero__claim">{t(HERO.claim)}</p>
          <p className="hero__detail">{t(HERO.detail)}</p>
          <p className="hero__invite">
            <span>{t(HERO.invite)}</span>
            <svg viewBox="0 0 14 18" width="12" height="15" aria-hidden="true">
              <path
                d="M7 1v15M2.4 11.4 7 16l4.6-4.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </p>
        </div>

        <div className={`ask${entered ? ' is-in' : ''}`}>
          <Ask />
        </div>
      </div>
    </section>
  )
}
