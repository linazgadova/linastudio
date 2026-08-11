import type { ReactNode, RefObject } from 'react'
import { Link } from 'react-router-dom'

/**
 * КНОПКА
 *
 * Наведение делает две вещи разом. Снизу приходит заливка, а подпись
 * уезжает вверх, и на её место снизу же встаёт вторая, точно такая
 * же. Читается это как поворот планки: всё содержимое кнопки
 * движется в одну сторону одним движением.
 *
 * Вторая подпись — копия первой, и лежит она в разметке дважды.
 * Иначе не выйдет: браузер не умеет двигать одну строку из двух
 * положений сразу. Копия скрыта от озвучки — вслух название
 * действия должно прозвучать один раз.
 *
 * Компонент, а не набор классов, ровно из-за этого удвоения:
 * восемь мест, где текст пишется дважды руками, однажды разойдутся
 * между собой, и на кнопке при наведении сменится смысл.
 */

type Look = {
  /** Название действия. */
  label: string
  /** Значок справа от подписи. Едет вместе с ней. */
  icon?: ReactNode
  /** Заливкой набирается главное действие из пары. */
  solid?: boolean
  /** Подпись у курсора — см. components/Cursor.tsx. */
  cursor?: string
  className?: string
  /** Ссылка на сам узел: окно согласия ставит на первую кнопку фокус. */
  innerRef?: RefObject<HTMLButtonElement | null>
  /** Действие сработало, но на странице ничего не изменилось —
      см. копирование адреса. Заливка держится сама, без наведения. */
  done?: boolean
}

type Props = Look &
  (
    | { to: string; href?: never; onClick?: never }
    | { href: string; to?: never; onClick?: never }
    | { onClick: () => void; to?: never; href?: never }
  )

function Body({ label, icon }: Pick<Look, 'label' | 'icon'>) {
  return (
    <span className="btn__swap">
      <span className="btn__row">
        {label}
        {icon}
      </span>
      <span className="btn__row btn__row--next" aria-hidden="true">
        {label}
        {icon}
      </span>
    </span>
  )
}

export function Btn({
  label,
  icon,
  solid,
  cursor,
  className,
  innerRef,
  done,
  to,
  href,
  onClick,
}: Props) {
  const cls = `btn${solid ? ' btn--solid' : ''}${className ? ` ${className}` : ''}`
  const body = <Body label={label} icon={icon} />

  if (to) {
    return (
      <Link className={cls} to={to} data-cursor={cursor}>
        {body}
      </Link>
    )
  }

  // Ссылка наружу. rel обязателен вместе с target: без него открытая
  // вкладка получает доступ к этой через window.opener
  if (href) {
    const external = href.startsWith('http')
    return (
      <a
        className={cls}
        href={href}
        data-cursor={cursor}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {body}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={onClick}
      data-cursor={cursor}
      data-done={done ? '' : undefined}
      ref={innerRef}
    >
      {body}
    </button>
  )
}
