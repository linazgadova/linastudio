import type { L } from '../i18n/lang'

/**
 * СТРАНИЦА ДЛЯ РАБОТОДАТЕЛЯ
 *
 * Её адрес идёт в сопроводительное письмо вместо главной. Главная
 * и услуги разговаривают с заказчиком: там «напишите, что нужно
 * сделать» и «из чего складывается цена». Нанимающий приходит с
 * другими вопросами и в другом порядке — что делала сама, в каком
 * стеке, какого уровня, где посмотреть код, — и здесь они стоят
 * именно в этом порядке.
 *
 * Первым экраном идут названия должностей во множественном числе.
 * Одна и та же работа в вакансиях зовётся по-разному, и человек,
 * пришедший с вакансии «UI/UX-дизайнер», не должен упереться в
 * заголовок «продуктовый дизайнер» и решить, что ошибся адресом.
 *
 * Зарплаты здесь нет намеренно: число на странице закрепляет планку
 * раньше разговора. В отклике на hh вилку спрашивают отдельно.
 */

export type CodeSpot = {
  /** Путь в репозитории — он же подпись ссылки. */
  path: string
  /** Какое решение там принято. */
  what: L
}

export const HIRE = {
  /** H1. Заголовок вкладки собирается отдельно — см. seoTitle. */
  title: {
    ru: 'Продуктовый дизайнер и дизайнер-разработчик',
    en: 'Product designer and design engineer',
  } as L,

  seoTitle: {
    ru: 'Ищу работу: продуктовый дизайнер, дизайнер-разработчик, Москва',
    en: 'Open to work: product designer and design engineer, Moscow',
  } as L,

  seoDescription: {
    ru: 'Продуктовый дизайнер с семью запущенными продуктами: дизайн, интерфейс, база и деплой. Что делала сама в каждом проекте, стек, открытый исходник портфолио, формат работы и контакты.',
    en: 'A product designer with seven launched products: design, interface, database and deploy. What I did myself on each one, the stack, the open source of this portfolio, working format and contacts.',
  } as L,

  /**
   * Названия, под которыми одна и та же работа встречается в
   * вакансиях. Список закрывает разрыв между заголовком страницы
   * и заголовком вакансии, на которую идёт отклик.
   */
  akaTitle: { ru: 'В вакансиях это называют по-разному', en: 'Job ads call this different things' } as L,
  aka: {
    ru: 'Продуктовый дизайнер · UI/UX-дизайнер · веб-дизайнер · дизайнер-разработчик · design engineer · продуктовый дизайнер с руками. Работа за этими названиями одна; какая именно — в таблице ниже.',
    en: 'Product designer · UI/UX designer · web designer · design engineer · designer who ships. In Russian job ads: продуктовый дизайнер, дизайнер-разработчик. The work behind these names is one and the same; the table below shows what it is.',
  } as L,

  lede: {
    ru: 'Два с половиной года в дизайне, семь продуктов на своих адресах. Дизайн, интерфейс, базу и выкладку веду одна: ниже видно, в каких проектах какой слой был мой, и три места в коде, где видно решение.',
    en: 'Two and a half years in design, seven products at their own addresses. Design, interface, database and deploy are all mine: below, which layer was mine on which project, and three places in the code where the decision is visible.',
  } as L,

  /* ── Слои ─────────────────────────────────────────────────────── */

  layersTitle: { ru: 'Что я веду сама', en: 'What I run myself' } as L,
  layersLede: {
    ru: 'Шесть слоёв продукта против семи проектов. Закрашено то, что вела я; пустая клетка значит, что слой вёл кто-то другой.',
    en: 'Six layers of a product against seven projects. Filled means I ran it; an empty cell means someone else did.',
  } as L,
  colProject: { ru: 'Проект', en: 'Project' } as L,
  colRole: { ru: 'Роль', en: 'Role' } as L,
  colStack: { ru: 'Стек', en: 'Stack' } as L,
  /* Клетки матрицы озвучке отдаются словами: точка декоративная,
     и без этих подписей строка прочиталась бы как шесть пустых ячеек */
  layerYes: { ru: 'вела', en: 'ran it' } as L,
  layerNo: { ru: 'не вела', en: 'did not run it' } as L,
  closedNote: { ru: 'закрытая система, демо по запросу', en: 'private system, demo on request' } as L,

  /* ── Метод ────────────────────────────────────────────────────── */

  howTitle: { ru: 'Как я работаю', en: 'How I work' } as L,

  /* ── Код ──────────────────────────────────────────────────────── */

  codeTitle: { ru: 'Код можно открыть', en: 'The code is open' } as L,
  codeLede: {
    ru: 'Сайт лежит в открытом репозитории целиком. Три файла, где было из чего выбирать, — решение видно прямо в коде.',
    en: 'The site sits in a public repository in full. Three files where there was a real choice — the decision is visible in the code.',
  } as L,
  code: [
    {
      path: 'public/api/ask.php',
      what: {
        ru: 'Защита промпта решетом в коде, а не запретом внутри промпта: словесный запрет маленькая модель не держит — проверка показала утечку в двух попытках из трёх. Там же ограничители по адресу и по суткам.',
        en: 'The prompt is guarded by a sieve in code rather than by an instruction inside the prompt: a small model does not hold a worded ban — a check leaked it in two attempts out of three. The same file carries the per-address and per-day limits.',
      },
    },
    {
      path: 'scripts/seo.mjs',
      what: {
        ru: 'Страница рисуется в браузере, но роботу и языковым моделям отдаётся готовым текстом. Оттуда же собираются sitemap, llms.txt и разметка schema.org на двух языках, а даты обновления берутся из отпечатка содержимого, а не из даты сборки.',
        en: 'The page renders in the browser but reaches robots and language models as finished text. The same script builds the sitemap, llms.txt and schema.org markup in two languages, and the update dates come from a fingerprint of the content rather than the build date.',
      },
    },
    {
      path: 'src/aurora/',
      what: {
        ru: 'Шар на Three.js с четырьмя ступенями качества: сцена меряет свою частоту кадров и опускается сама. Рядом версия слоями краски для машин без WebGL2, и решение принимается до загрузки Three.',
        en: 'A Three.js orb with four quality tiers: the scene measures its own frame rate and steps down by itself. Beside it, a version made of paint layers for machines without WebGL2, and the choice is made before Three is loaded.',
      },
    },
  ] as CodeSpot[],

  /* ── Формат ───────────────────────────────────────────────────── */

  formatTitle: { ru: 'Формат', en: 'Format' } as L,
  format: [
    { ru: 'Москва: офис, гибрид или полная удалёнка', en: 'Moscow: office, hybrid or fully remote' },
    { ru: 'Готова к тестовому заданию и к разбору любого проекта вслух', en: 'Happy to do a test task and to walk through any project out loud' },
    { ru: 'Английский рабочий: сайт и разборы проектов написаны на двух языках', en: 'English is working level: the site and the project write-ups exist in both languages' },
  ] as L[],

  /*
   * В конце страницы только адреса.
   *
   * Приглашения написать тут не будет: адрес страницы уходит в отклик
   * на вакансию, ответ приходит в переписку на площадке, и никто не
   * пойдёт с этой страницы искать телеграм. Контакты здесь на случай,
   * когда страницу переслали дальше, — а строка «отвечу в тот же
   * день» на этом месте обращена в пустоту.
   */
  ctaTitle: { ru: 'Контакты', en: 'Contacts' } as L,
}
