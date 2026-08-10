import type { L } from '../i18n/lang'

/**
 * Картинки импортируются через сборщик, а не лежат абсолютными
 * путями в public: Vite сам проставит адреса и хеши, и собранная
 * страница откроется хоть с сервера, хоть двойным кликом из папки.
 *
 * Почти всё здесь снято с живых адресов скриптом scripts/shots.mjs.
 * Скриншот с работающего сайта честнее макета: на нём продукт такой,
 * каким его открывает человек, — со шрифтами, отступами и тем, что
 * успело измениться после запуска. Пересобрать набор можно одной
 * командой, и кадры не устареют вместе с сайтами.
 */
import pifika from './previews/pifika.jpg'
import pifikaHow from './previews/pifika-how.jpg'
import pifikaStyles from './previews/pifika-styles.jpg'
import pifikaPractice from './previews/pifika-practice.jpg'
import pifikaPhone from './previews/pifika-phone.jpg'

import thcrm from './previews/thcrm.jpg'

import stapsi from './previews/stapsi.jpg'
import stapsiHome from './previews/stapsi-home.jpg'
import stapsiInput from './previews/stapsi-input.jpg'

import fabrico from './previews/fabrico.jpg'
import fabricoBundles from './previews/fabrico-bundles.jpg'
import fabricoHow from './previews/fabrico-how.jpg'
import fabricoQuiz from './previews/fabrico-quiz.jpg'
import fabricoPhone from './previews/fabrico-phone.jpg'

import thnkers from './previews/thnkers.jpg'
import thnkersWhat from './previews/thnkers-what.jpg'
import thnkersWork from './previews/thnkers-work.jpg'
import thnkersTeam from './previews/thnkers-team.jpg'

import gromstroy from './previews/gromstroy.jpg'
import gromstroyServices from './previews/gromstroy-services.jpg'
import gromstroyWhy from './previews/gromstroy-why.jpg'
import gromstroyWorks from './previews/gromstroy-works.jpg'

import denisLyakh from './previews/denis-lyakh.jpg'
import denisLyakhAbout from './previews/denis-lyakh-about.jpg'
import denisLyakhWork from './previews/denis-lyakh-work.jpg'

export { default as portrait } from './portrait.jpg'

/** id проекта → обложка для строки списка и превью у курсора. */
export const PREVIEWS: Record<string, string[]> = {
  pifika: [pifika],
  thcrm: [thcrm],
  stapsi: [stapsiHome],
  fabrico: [fabrico],
  thnkers: [thnkers],
  gromstroy: [gromstroy],
  'denis-lyakh': [denisLyakh],
}

/**
 * Ролики проходов по живым сайтам: id проекта → адрес в public.
 *
 * Здесь именно адреса, а не импорты. Видео не нужно ни хешировать,
 * ни разбирать сборщиком — оно просто лежит по пути и отдаётся
 * по запросу, причём кусками, а импорт затащил бы его в граф зависимостей.
 * Пересобираются ролики командой node scripts/clips.mjs.
 */
export const CLIPS: Record<string, string> = {
  pifika: '/clips/pifika.webm',
  thnkers: '/clips/thnkers.webm',
  fabrico: '/clips/fabrico.webm',
  gromstroy: '/clips/gromstroy.webm',
  'denis-lyakh': '/clips/denis-lyakh.webm',
}

export type Shot = {
  src: string
  /** phone — кадр встаёт в рамку телефона, desktop — в рамку браузера. */
  kind: 'phone' | 'desktop'
  caption: L
}

/**
 * Кадры на странице проекта. Мобильное показываем телефоном,
 * а не растянутым десктопным скриншотом: иначе непонятно,
 * подо что продукт вообще сделан.
 *
 * Подпись объясняет решение, а не пересказывает картинку. «Первый
 * экран» человек и сам видит; ему нужно знать, почему экран такой.
 */
export const SHOTS: Record<string, Shot[]> = {
  pifika: [
    {
      src: pifika,
      kind: 'desktop',
      caption: {
        ru: 'Первый экран сразу даёт решить задачу, а не рассказывает про платформу',
        en: 'The hero hands you a problem to solve instead of describing the platform',
      },
    },
    {
      src: pifikaPractice,
      kind: 'desktop',
      caption: {
        ru: 'Конструктор тренировки: восемь курсов, темы набираются галочками',
        en: 'The training builder: eight courses, topics picked with checkboxes',
      },
    },
    {
      src: pifikaStyles,
      kind: 'desktop',
      caption: {
        ru: 'Четыре оформления заданий. Сам сайт при этом не меняется — переодеваются только задачи',
        en: 'Four skins for the exercises. The site itself stays put; only the tasks change clothes',
      },
    },
    {
      src: pifikaHow,
      kind: 'desktop',
      caption: {
        ru: 'Как это работает: выбрать тему, решать, держать серию дней',
        en: 'How it works: pick a topic, solve, keep the day streak going',
      },
    },
    {
      src: pifikaPhone,
      kind: 'phone',
      caption: {
        ru: 'На телефоне навигация уходит вниз, под большой палец',
        en: 'On a phone the navigation moves to the bottom, under the thumb',
      },
    },
  ],
  fabrico: [
    {
      src: fabrico,
      kind: 'desktop',
      caption: {
        ru: 'Первый экран: дизайн мой. Крупная антиква и кадр во всю ширину вместо витрины товаров',
        en: 'The hero: the design is mine. A large serif and a full-bleed photograph instead of a product grid',
      },
    },
    {
      src: fabricoQuiz,
      kind: 'desktop',
      caption: {
        ru: 'Квиз: десять вопросов, шесть типов результата',
        en: 'The quiz: ten questions, six result types',
      },
    },
    {
      src: fabricoBundles,
      kind: 'desktop',
      caption: {
        ru: 'Наборы выкроек: состав виден списком ещё до перехода в карточку',
        en: 'Pattern bundles: what is inside is listed before you open the card',
      },
    },
    {
      src: fabricoHow,
      kind: 'desktop',
      caption: {
        ru: 'Три шага от файла до готовой вещи — блок для тех, кто выкройки ещё не покупал',
        en: 'Three steps from a file to a finished garment, for people who have never bought a pattern',
      },
    },
    {
      src: fabricoPhone,
      kind: 'phone',
      caption: {
        ru: 'На телефоне заголовок перестраивается в две строки, кадр остаётся во всю ширину',
        en: 'On a phone the headline reflows to two lines and the photograph stays full-bleed',
      },
    },
  ],
  thcrm: [
    {
      src: thcrm,
      kind: 'desktop',
      caption: {
        ru: 'Сводка: ход за мной, загрузка, ближайшее — демо на выдуманных данных',
        en: 'The summary: my turn, workload, what’s next — a demo on fabricated data',
      },
    },
  ],
  stapsi: [
    {
      src: stapsiHome,
      kind: 'phone',
      caption: {
        ru: 'Аура на шейдере: форма и цвет меняются вместе с тем, как идёт месяц',
        en: 'The shader aura: shape and colour shift with how the month is going',
      },
    },
    {
      src: stapsiInput,
      kind: 'phone',
      caption: {
        ru: 'Ввод фразой или голосом — сумма, категория и эмоция разбираются локально',
        en: 'Phrase or voice input — amount, category and mood parsed locally',
      },
    },
    {
      src: stapsi,
      kind: 'phone',
      caption: {
        ru: 'Онбординг: пять шагов, к первому экрану приложение уже настроено',
        en: 'Onboarding: five steps, and by the first screen the app is configured',
      },
    },
  ],
  thnkers: [
    {
      src: thnkers,
      kind: 'desktop',
      caption: {
        ru: 'Первый экран: волны выпрямляются там, где курсор',
        en: 'The hero: the waves straighten where the cursor goes',
      },
    },
    {
      src: thnkersWhat,
      kind: 'desktop',
      caption: {
        ru: 'Раздел услуг открывается вопросом клиента, а не перечнем компетенций',
        en: 'The services section opens with the client’s question, not a list of competencies',
      },
    },
    {
      src: thnkersWork,
      kind: 'desktop',
      caption: {
        ru: 'Каждое направление подписано тем, что у компании обычно болит',
        en: 'Each line of work carries the pain that usually brings a company in',
      },
    },
    {
      src: thnkersTeam,
      kind: 'desktop',
      caption: {
        ru: 'Раздел команды: я в нём как Design Lead',
        en: 'The team section: I am in it as Design Lead',
      },
    },
  ],
  gromstroy: [
    {
      src: gromstroy,
      kind: 'desktop',
      caption: {
        ru: 'Первый экран: фотография стройки под тёмной вуалью, чтобы текст поверх читался',
        en: 'The hero: a construction photograph under a dark veil so the text on top stays readable',
      },
    },
    {
      src: gromstroyServices,
      kind: 'desktop',
      caption: {
        ru: 'Услуги: список работ вместо общих слов про комплексный подход',
        en: 'Services: a list of actual work instead of generalities about a comprehensive approach',
      },
    },
    {
      src: gromstroyWhy,
      kind: 'desktop',
      caption: {
        ru: 'Преимущества пронумерованы и разведены по экранам — так их читают, а не пролистывают',
        en: 'The strengths are numbered and spread across screens, so people read them instead of scrolling past',
      },
    },
    {
      src: gromstroyWorks,
      kind: 'desktop',
      caption: {
        ru: 'Крупные кадры с объектов: у подрядчика это единственное настоящее доказательство',
        en: 'Large photographs from the sites: for a contractor that is the only real proof',
      },
    },
  ],
  'denis-lyakh': [
    {
      src: denisLyakh,
      kind: 'desktop',
      caption: {
        ru: 'Живая схема из узлов и связей на канвасе',
        en: 'A live schematic of nodes and links on canvas',
      },
    },
    {
      src: denisLyakhAbout,
      kind: 'desktop',
      caption: {
        ru: 'Схема идёт фоном через всю страницу, текст лежит поверх неё',
        en: 'The schematic runs behind the whole page and the text sits on top of it',
      },
    },
    {
      src: denisLyakhWork,
      kind: 'desktop',
      caption: {
        ru: 'Фотографии из лаборатории в тон схеме: обесцвеченные, с тонкой рамкой и подписью',
        en: 'Lab photographs tuned to the schematic: desaturated, thin-framed, captioned',
      },
    },
  ],
}
