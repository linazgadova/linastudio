import type { L } from '../i18n/lang'

/**
 * Шесть слоёв продукта. Порядок важен: он задаёт строки матрицы
 * и порядок «срезов» внутри карточки проекта — сверху вниз,
 * от того, что видит пользователь, к тому, на чём это стоит.
 */
export const LAYER_IDS = [
  'design',
  'interface',
  'logic',
  'data',
  'integrations',
  'deploy',
] as const

export type LayerId = (typeof LAYER_IDS)[number]

export type Layer = {
  id: LayerId
  /** Полное имя — в матрице и в списке слоёв проекта. */
  title: L
  /** Короткое имя — для узких экранов. */
  short: L
  /** Что этот слой означает — в подсказке матрицы. */
  hint: L
}

export const LAYERS: Layer[] = [
  {
    id: 'design',
    title: { ru: 'Дизайн', en: 'Design' },
    short: { ru: 'Диз', en: 'Des' },
    hint: {
      ru: 'Концепция, макеты, типографика, иллюстрации, дизайн-система',
      en: 'Concept, layouts, typography, illustration, design system',
    },
  },
  {
    id: 'interface',
    title: { ru: 'Интерфейс', en: 'Interface' },
    short: { ru: 'UI', en: 'UI' },
    hint: {
      ru: 'Вёрстка, компоненты, состояния, анимация, адаптив, доступность',
      en: 'Markup, components, states, motion, responsive, accessibility',
    },
  },
  {
    id: 'logic',
    title: { ru: 'Логика', en: 'Logic' },
    short: { ru: 'Лог', en: 'Log' },
    hint: {
      ru: 'Правила продукта: расчёты, генерация, валидация, роли и доступы',
      en: 'Product rules: calculations, generation, validation, roles and access',
    },
  },
  {
    id: 'data',
    title: { ru: 'Данные', en: 'Data' },
    short: { ru: 'БД', en: 'DB' },
    hint: {
      ru: 'Схема базы, запросы, миграции, хранение состояния и прогресса',
      en: 'Database schema, queries, migrations, state and progress storage',
    },
  },
  {
    id: 'integrations',
    title: { ru: 'Интеграции', en: 'Integrations' },
    short: { ru: 'Инт', en: 'Int' },
    hint: {
      ru: 'Боты, ИИ, платежи, почта, аналитика, внешние API',
      en: 'Bots, AI, payments, email, analytics, third-party APIs',
    },
  },
  {
    id: 'deploy',
    title: { ru: 'Деплой', en: 'Deploy' },
    short: { ru: 'Деп', en: 'Ops' },
    hint: {
      ru: 'Сборка, домен, хостинг, сертификаты, обновления после запуска',
      en: 'Build, domain, hosting, certificates, post-launch updates',
    },
  },
]
