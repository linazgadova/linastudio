import { useRef } from 'react'
import { useLang } from '../i18n/lang'
import { ABOUT, PROFILE, STRENGTHS } from '../data/profile'
import { portrait } from '../assets/previews'
import { useAuroraSection } from '../aurora/target'
import { Reveal } from './Reveal'

export function About() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)

  // Блок уходит вправо, шар откатывается к левому краю и снова
  // вырастает. Уходит за край он намеренно: половина шара за кадром
  // читается как продолжение, которого не видно
  useAuroraSection(
    ref,
    // Холодная мята: раздел про метод, самый спокойный на странице.
    // После фиолета она читается как смена темы, а не как оттенок
    {
      cx: 0.04, cy: 0.5, radius: 0.4, form: 0.62, intensity: 0.95, shift: 0.62,
      accent: '#22C9E8', tint: 0.52,
    },
    // Путь отсюда к центру самый длинный на странице: шар идёт через
    // всю ширину и одновременно опускается. Без точки на полпути обе
    // половины пути сглаживаются как одна, и выход в центр получается
    // рывком. С ней движение делится надвое и разгоняется дважды
    {
      cx: 0.28, cy: 0.42, radius: 0.3, form: 0.5, intensity: 0.92, shift: 0.74,
      accent: '#4FA8F0', tint: 0.5,
    },
  )

  return (
    <section
      className="shell section side side--right side--wide"
      id="about"
      ref={ref}
      aria-labelledby="about-title"
    >

      <Reveal className="section__head">
        <h2 className="section__title" id="about-title">
          {t(ABOUT.title)}
        </h2>
      </Reveal>

      <div className="about">
        {PROFILE.portrait && (
          <Reveal className="about__portrait">
            <img
              src={portrait}
              alt={t(PROFILE.name)}
              loading="lazy"
              decoding="async"
              width={900}
              height={1125}
            />
          </Reveal>
        )}

        <div className="about__text">
          {ABOUT.paragraphs.map((p, i) => (
            <Reveal as="p" key={p.ru} delay={i * 80}>
              {t(p)}
            </Reveal>
          ))}
        </div>
      </div>

      {/*
        Сильные стороны стоят отдельной сеткой, а не абзацами: это
        список утверждений, каждое из которых нужно уметь найти
        глазами по отдельности, а не вычитать из сплошного текста.
      */}
      <div className="strengths">
        <Reveal as="h3" className="strengths__title">
          {t(STRENGTHS.title)}
        </Reveal>

        <ul className="strengths__list">
          {STRENGTHS.items.map((item, i) => (
            <Reveal as="li" className="strength" key={item.title.ru} delay={i * 70}>
              <h4 className="strength__title">{t(item.title)}</h4>
              <p className="strength__detail">{t(item.detail)}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
