import { useState } from 'react'
import { useLang } from '../i18n/lang'
import { UI } from '../data/ui'

/**
 * КАДР ДЕСКТОПНОГО САЙТА
 *
 * На мониторе тут нечего решать: кадр снят в 1440 точек и в колонку
 * влезает почти в натуральную величину. Кнопки под ним там нет вовсе.
 *
 * На телефоне тот же кадр вписывается в 350 точек, то есть в четверть
 * величины: заголовки на нём ещё угадываются, а весь остальной текст
 * становится серой рябью в четыре точки высотой. Разбор проекта,
 * собранный из таких картинок, не разбор.
 *
 * Растянуть их все до читаемой величины — не выход: страница проекта
 * вырастает вдвое, и до текста под кадрами человек уже не доходит.
 * Поэтому кадр по умолчанию остаётся обзором — по нему видно
 * композицию, цвет и характер, — а разглядеть его человек просит сам.
 * В раскрытом виде картинка идёт шире экрана и листается вбок.
 *
 * Кнопка настоящая, а не картинка с обработчиком: до неё доходит
 * табуляция, её читает озвучка, и она сама говорит, что делает.
 */
export function Shot({ src, alt }: { src: string; alt: string }) {
  const { t } = useLang()
  const [zoom, setZoom] = useState(false)

  return (
    <>
      <div className={`frame-desktop${zoom ? ' is-zoom' : ''}`}>
        <div className="frame-desktop__bar" aria-hidden="true">
          <span className="frame-desktop__dot" />
          <span className="frame-desktop__dot" />
          <span className="frame-desktop__dot" />
        </div>
        <img src={src} alt={alt} loading="lazy" />
      </div>

      <button type="button" className="shot__zoom" onClick={() => setZoom((v) => !v)}>
        {t(zoom ? UI.shotZoomOff : UI.shotZoom)}
        <svg viewBox="0 0 14 14" width="11" height="11" aria-hidden="true">
          {zoom ? (
            <path
              d="M5.5 1.5v4h-4M8.5 12.5v-4h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M1.5 5.5v-4h4M12.5 8.5v4h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </button>
    </>
  )
}
