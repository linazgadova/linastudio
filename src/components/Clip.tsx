import { useEffect, useRef, useState } from 'react'

/**
 * РОЛИК ПЛАТФОРМЫ
 *
 * Скриншот показывает, как продукт выглядит. Видео показывает, как он
 * себя ведёт: как волны выпрямляются под курсором, как страница
 * отвечает на прокрутку. Записывается это scripts/clips.mjs — проход
 * по живому сайту, а не монтаж.
 *
 * Файл весит около двух мегабайт, поэтому он не грузится вместе со
 * страницей. Адрес подставляется в src только тогда, когда блок
 * доехал до экрана, и снимается, когда уехал: браузер сам оборвёт
 * загрузку, и человек, пролиставший мимо, не заплатит за ролик,
 * которого не видел.
 *
 * Звука здесь нет вовсе. Ролик без звука браузер разрешает запустить
 * сам, и это единственный способ показать движение, не заставляя
 * нажимать кнопку. Он же и причина, по которой нет управления: играть
 * нечего, кроме беззвучной петли.
 */
export function Clip({ src, poster, caption }: { src: string; poster?: string; caption: string }) {
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return

    // Экономия здесь важнее точности: ролик заводится за экран до
    // появления, чтобы к моменту, когда человек до него доедет,
    // он уже играл, а не начинал грузиться у него на глазах
    const io = new IntersectionObserver(
      ([entry]) => setLive(entry.isIntersecting),
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (live) {
      // play возвращает обещание, и оно отклоняется, если элемент
      // убрали с экрана раньше, чем начался показ. Это не ошибка,
      // и в консоль ей попадать незачем
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [live])

  return (
    <figure className="clip" ref={box}>
      <div className="clip__frame">
        <div className="clip__bar" aria-hidden="true">
          <span className="clip__dot" />
          <span className="clip__dot" />
          <span className="clip__dot" />
        </div>
        <video
          ref={video}
          src={live ? src : undefined}
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={caption}
        />
      </div>
      <figcaption className="frame-caption">{caption}</figcaption>
    </figure>
  )
}
