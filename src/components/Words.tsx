import { Fragment, useEffect, useRef, useState } from 'react'

/**
 * ЗАГОЛОВОК, ВСТАЮЩИЙ ПО СЛОВАМ
 *
 * Слово выезжает снизу из-под собственной строки, следующее — на
 * шестьдесят миллисекунд позже. Строка не появляется целиком, а
 * набирается, и глаз успевает пройти её слева направо ровно один
 * раз — в том же порядке, в каком её и читают.
 *
 * Каждое слово сидит в окошке высотой в строку: за его пределами
 * слово не видно, поэтому оно именно выезжает, а не проявляется.
 * Едет transform, а не отступ, — раскладка страницы при этом не
 * пересчитывается ни разу.
 *
 * Пробел стоит между окошками, а не внутри окошка. Внутри его
 * съедало overflow: hidden — концевой пробел в блочном элементе
 * браузер отбрасывает, и «Давайте поговорим» слипалось в одно
 * слово. Снаружи он остаётся обычным пробелом строки: по нему
 * переносится строка, его же читает озвучка.
 *
 * Наблюдатель отключается после первого срабатывания: заголовок
 * встаёт один раз и при обратной прокрутке не прячется.
 */

type Props = {
  children: string
  className?: string
  id?: string
  as?: 'h1' | 'h2' | 'h3'
}

export function Words({ children, className = '', id, as = 'h2' }: Props) {
  const ref = useRef<HTMLHeadingElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (!('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const Tag = as
  const words = children.split(' ')

  return (
    <Tag ref={ref} id={id} className={`words${visible ? ' is-in' : ''} ${className}`.trim()}>
      {words.map((w, i) => (
        <Fragment key={`${w}-${i}`}>
          <span className="words__box">
            <span className="words__w" style={{ ['--i' as string]: i }}>
              {w}
            </span>
          </span>
          {i < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  )
}
