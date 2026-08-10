import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  /** Задержка в миллисекундах — чтобы соседние блоки появлялись каскадом. */
  delay?: number
  /** Какой тег отрисовать: div по умолчанию. */
  as?: 'div' | 'section' | 'article' | 'p' | 'h2' | 'h3' | 'li' | 'header'
  className?: string
  id?: string
  style?: CSSProperties
}

/**
 * Появление блока при попадании в область просмотра.
 * Наблюдатель отключается сразу после срабатывания: блок
 * показывается один раз и не прячется при обратном скролле.
 */
export function Reveal({
  children,
  delay = 0,
  as = 'div',
  className = '',
  id,
  style,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)
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
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return createElement(
    as,
    {
      ref,
      id,
      className: `reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`,
      style: { ...style, ['--reveal-delay' as string]: `${delay}ms` },
    },
    children,
  )
}
