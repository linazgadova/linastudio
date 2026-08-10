import { useRef, useState } from 'react'
import { useLang } from '../i18n/lang'
import { UI } from '../data/ui'
import { localAnswer } from '../ai/knowledge'

type State = 'idle' | 'asking' | 'answered' | 'offline'

/**
 * Блок «спроси обо мне».
 *
 * Ключ живёт в серверной функции, в браузер не попадает. Ответ идёт
 * потоком — печатается по мере генерации, а не появляется через
 * три секунды тишины.
 *
 * Свечение под пилюлей — та же аврора, что и в первом экране,
 * только собранная в пятно и размытая. Один шейдер на два состояния.
 */
export function Ask() {
  const { lang, t } = useLang()
  const [value, setValue] = useState('')
  const [answer, setAnswer] = useState('')
  const [state, setState] = useState<State>('idle')
  const abortRef = useRef<AbortController | null>(null)

  async function ask(question: string) {
    const q = question.trim()
    if (!q || state === 'asking') return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState('asking')
    setAnswer('')

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', lang, question: q }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) throw new Error(String(res.status))

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      for (;;) {
        const { done, value: chunk } = await reader.read()
        if (done) break
        acc += decoder.decode(chunk, { stream: true })
        setAnswer(acc)
      }

      setState('answered')
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      // Функция недоступна: сайт открыт локально или кончилась квота.
      // Отвечаем поиском по тем же данным и честно это подписываем.
      setAnswer(localAnswer(q, lang).text)
      setState('offline')
    }
  }

  return (
    <>
      {/* Свечение под пилюлей — CSS, а не второй холст WebGL:
          второй контекст стоил бы дороже, чем выглядит */}
      <div className="ask__glow" aria-hidden="true" />

      <form
        className="ask__form"
        onSubmit={(e) => {
          e.preventDefault()
          void ask(value)
        }}
      >
        <label className="sr-only" htmlFor="ask-input">
          {t(UI.askLabel)}
        </label>
        {/*
          ym-disable-keys — служебный класс Яндекс.Метрики. Вебвизор
          записывает нажатия клавиш во всех полях сразу, и отключить
          это можно либо целиком в настройках счётчика, либо по такому
          классу на конкретном поле.

          Здесь он стоит страховкой. Настройка в кабинете выключена, но
          она живёт в чужом интерфейсе и переключается одним щелчком —
          а это единственное поле ввода на сайте, и всё, что в него
          набирают, уходит зарубежной модели. Класс держит запрет на
          стороне страницы: включат запись обратно — поле всё равно
          останется вне её.
        */}
        <input
          id="ask-input"
          className="ask__input ym-disable-keys"
          type="text"
          autoComplete="off"
          placeholder={t(UI.askPlaceholder)}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={state === 'asking'}
        />
        <button
          className="ask__send"
          type="submit"
          disabled={!value.trim() || state === 'asking'}
          aria-label={t(UI.askSend)}
        >
          {state === 'asking' ? (
            <span className="ask__spinner" aria-hidden="true" />
          ) : (
            <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true">
              <path
                d="M4 10h11M10.5 5.5 15 10l-4.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>

      {state === 'idle' && (
        <ul className="ask__suggestions">
          {UI.askExamples.map((ex) => (
            <li key={ex.ru}>
              <button
                type="button"
                className="ask__chip"
                onClick={() => {
                  setValue(t(ex))
                  void ask(t(ex))
                }}
              >
                {t(ex)}
              </button>
            </li>
          ))}
        </ul>
      )}

      {answer && (
        <div className="ask__answer" role="status" aria-live="polite">
          <p>{answer}</p>
          {state === 'offline' && <p className="ask__note">{t(UI.askOffline)}</p>}

          {/*
            Предупреждение появляется вместе с первым ответом, а не
            висит под пустым полем. До того как человек написал, оно
            отпугивает: строка про зарубежный сервис под приглашением
            задать вопрос читается как «сюда лучше не писать».
            А после первого ответа он уже понял, что это за блок, и
            предупреждение попадает ровно в тот момент, когда он
            собирается спросить второе.
          */}
          <p className="ask__note">{t(UI.askPrivacy)}</p>
        </div>
      )}
    </>
  )
}
