import type { L } from '../i18n/lang'

/**
 * УСЛУГИ
 *
 * Раньше услуги жили на сайте одной строчкой в блоке контактов:
 * шесть слов через точку. Для человека этого хватало, для поиска нет.
 * Страница ранжируется по тому, что на ней написано, а написано про
 * услуги было ровно шесть слов — по запросу «заказать интернет-магазин»
 * сайту нечего было показать.
 *
 * Здесь у каждой услуги есть состав работы и пример из портфолио.
 * Пример обязателен: правило сайта — никаких утверждений без него.
 * Где примера нет, это сказано вслух, а не замазано общими словами.
 *
 * Цены на странице нет, и это решение, а не пробел. Две задачи,
 * одинаковые на слух, отличаются по работе в несколько раз. Вместо
 * числа — то, от чего оно зависит, и вопросы, которые задаются до
 * оценки. Человеку это отвечает на его настоящий вопрос («от чего
 * зависит, сколько с меня возьмут»), а не на формальный.
 */

export type Service = {
  id: string
  /** Короткое имя. Оно же стоит строкой в блоке контактов. */
  label: L
  /** Как это называет человек в строке поиска. Идёт в разметку и llms.txt. */
  term: string
  /** Одна строка: что это на самом деле. */
  lede: L
  /** Состав работы. */
  includes: L[]
  /** id проектов-примеров. Пусто — примера нет. */
  examples: string[]
  /** Честная оговорка там, где примера в портфолио нет. */
  gap?: L
}

export const SERVICES: Service[] = [
  {
    id: 'site',
    label: { ru: 'Сайт под ключ', en: 'A website end to end' },
    term: 'разработка сайта',
    lede: {
      ru: 'Весь путь до работающего адреса: дизайн, вёрстка, домен, хостинг, запуск. Отдельного подрядчика на вёрстку или на переезд искать не нужно.',
      en: 'The whole way to a working address: design, build, domain, hosting, launch. No separate contractor for the markup or for the move.',
    },
    includes: [
      { ru: 'Дизайн под задачу, а не по готовому шаблону', en: 'Design for the task, not a bought template' },
      { ru: 'Вёрстка под телефон, планшет и монитор', en: 'Built for phone, tablet and desktop' },
      { ru: 'Домен, хостинг, сертификат, почта на домене', en: 'Domain, hosting, certificate, mail on the domain' },
      { ru: 'Разметка для поиска, карта сайта, счётчик посещений', en: 'Search markup, sitemap, analytics counter' },
      { ru: 'Доступы передаются вам: сайт остаётся ваш', en: 'Credentials handed over: the site stays yours' },
    ],
    examples: ['gromstroy', 'thnkers'],
  },
  {
    id: 'landing',
    label: { ru: 'Лендинг', en: 'Landing page' },
    term: 'создание лендинга',
    lede: {
      ru: 'Одна страница под одно действие: заявка, звонок, запись. Всё, что к этому действию не ведёт, с неё убирается.',
      en: 'One page for one action: a request, a call, a signup. Anything that does not lead there comes off the page.',
    },
    includes: [
      { ru: 'Сценарий: что человек читает и в каком порядке', en: 'The script: what a person reads, and in what order' },
      { ru: 'Форма заявки с проверкой полей и письмом вам', en: 'A request form with field validation and mail to you' },
      { ru: 'Скорость: страница открывается раньше, чем человек передумал', en: 'Speed: the page opens before the visitor changes their mind' },
      { ru: 'Телефон как основной экран, а не как уступка', en: 'Phone as the primary screen, not a concession' },
    ],
    examples: ['denis-lyakh'],
    gap: {
      ru: 'Продающей страницы в портфолио пока нет. Ближайшая по устройству работа — портфолио Дениса: одна задача, один путь по странице.',
      en: 'No sales page in the portfolio yet. The closest in structure is Denis’s portfolio: one task, one path through the page.',
    },
  },
  {
    id: 'shop',
    label: { ru: 'Интернет-магазин', en: 'Online store' },
    term: 'интернет-магазин',
    lede: {
      ru: 'Каталог, карточка товара, корзина, оплата. Товары заводит и правит владелец — без обращения ко мне за каждой ценой.',
      en: 'Catalogue, product page, cart, payment. The owner adds and edits products without coming to me for every price change.',
    },
    includes: [
      { ru: 'Каталог с фильтрами и поиском по товарам', en: 'A catalogue with filters and product search' },
      { ru: 'Корзина и оформление заказа', en: 'Cart and checkout' },
      { ru: 'Приём оплаты', en: 'Payment handling' },
      { ru: 'Панель, где товары заводит владелец', en: 'An admin panel where the owner adds products' },
      { ru: 'Письма покупателю и вам', en: 'Mail to the buyer and to you' },
    ],
    examples: ['fabrico'],
  },
  {
    id: 'app',
    label: { ru: 'Веб-приложение', en: 'Web app' },
    term: 'веб-приложение',
    lede: {
      ru: 'Не страница про продукт, а сам продукт: вход, свои данные у каждого, права доступа, база. То, что обычно называют личным кабинетом или внутренней системой.',
      en: 'Not a page about a product but the product itself: sign-in, each person’s own data, access rules, a database. What people usually call a dashboard or an internal system.',
    },
    includes: [
      { ru: 'Схема базы и правила доступа к строкам', en: 'The database schema and row-level access rules' },
      { ru: 'Вход, роли, разграничение прав', en: 'Sign-in, roles, permission boundaries' },
      { ru: 'Экраны работы, а не витрины', en: 'Screens for work, not for display' },
      { ru: 'Установка на телефон без магазина приложений', en: 'Installs on a phone without an app store' },
    ],
    examples: ['pifika', 'thcrm', 'stapsi'],
  },
  {
    id: 'design',
    label: { ru: 'Дизайн сайта', en: 'Website design' },
    term: 'дизайн сайта',
    lede: {
      ru: 'Макеты без разработки, если собирать будете вы или ваша команда. Отдаю не картинки, а набор: шрифты, цвета, отступы и правила, по которым это собирается.',
      en: 'Layouts without the build, if you or your team will assemble it. Not pictures but a kit: type, colour, spacing and the rules it goes together by.',
    },
    includes: [
      { ru: 'Макеты экранов под телефон и под монитор', en: 'Screen layouts for phone and for desktop' },
      { ru: 'Цвета, шрифты и отступы набором, а не картинкой', en: 'Colour, type and spacing as a kit, not an image' },
      { ru: 'Состояния: наведение, нажатие, ошибка, пусто', en: 'States: hover, press, error, empty' },
      { ru: 'Разбор макетов с вашим разработчиком', en: 'A walkthrough with your developer' },
    ],
    examples: ['thnkers', 'fabrico'],
  },
  {
    id: 'redesign',
    label: { ru: 'Редизайн', en: 'Redesign' },
    term: 'редизайн сайта',
    lede: {
      ru: 'Сайт есть, но не работает: не читается с телефона, долго грузится, не находится поиском. Сначала разбираю, что именно мешает, и переделываю это, а не всё подряд.',
      en: 'The site exists but does not work: unreadable on a phone, slow to load, invisible to search. First I work out what exactly is in the way, then rebuild that rather than everything.',
    },
    includes: [
      { ru: 'Разбор: мешает вид, скорость или поиск', en: 'A diagnosis: is it the look, the speed or the search' },
      { ru: 'Перенос текстов и адресов без потери позиций', en: 'Moving content and URLs without losing positions' },
      { ru: 'Новый дизайн и вёрстка', en: 'New design and build' },
      { ru: 'Замер до и после — цифрами, а не на глаз', en: 'A before-and-after measurement, in numbers' },
    ],
    examples: [],
    gap: {
      ru: 'Чужого редизайна в портфолио пока нет. Ближайшее по сути — этот сайт: домен достался с прошлой жизнью, дорвеем и чужим счётчиком. Полная пересборка, проверка, что старое не тянет вниз, и разбор — в блоке «Как это устроено».',
      en: 'No client redesign in the portfolio yet. The closest thing is this site: the domain came with a past life, a doorway and someone else’s analytics. A full rebuild, a check that the old content is not dragging it down, and the write-up sits under “How this works”.',
    },
  },
]

export const SERVICES_PAGE = {
  /** H1. Заголовок вкладки собирается отдельно — см. seoTitle. */
  title: {
    ru: 'Разработка сайтов и веб-приложений',
    en: 'Websites and web apps, built end to end',
  } as L,
  seoTitle: {
    ru: 'Услуги: сайты, магазины и веб-приложения на заказ, Москва',
    en: 'Services: websites, stores and web apps built to order',
  } as L,
  seoDescription: {
    ru: 'Разработка сайтов, интернет-магазинов и веб-приложений под ключ: дизайн, вёрстка, база, запуск. Что входит в каждую услугу, примеры работ и из чего складывается цена.',
    en: 'Websites, online stores and web apps built end to end: design, build, database, launch. What each service includes, examples of the work, and what the price depends on.',
  } as L,
  lede: {
    ru: 'Шесть вещей, которые я беру целиком: от первого экрана до работающего адреса. Под каждой — что входит в работу и какая моя работа этому примером.',
    en: 'Six things I take on end to end: from the first screen to a working address. Under each one: what the work includes and which of my projects stands as the example.',
  } as L,

  includesLabel: { ru: 'Что входит', en: 'What it includes' } as L,
  exampleLabel: { ru: 'Пример из работ', en: 'From the work' } as L,

  /*
    Блок вместо цены.

    Число «от» на такой странице — самый ожидаемый ход, и он же самый
    бесполезный: одинаковые на слух задачи отличаются по работе в
    несколько раз, и цифра до разговора вводит в заблуждение чаще,
    чем помогает. Вместо неё сказано, от чего цифра зависит, — это
    ответ на настоящий вопрос человека, а не на формальный.
  */
  priceTitle: { ru: 'Из чего складывается цена', en: 'What the price depends on' } as L,
  priceLede: {
    ru: 'Числа «от» здесь нет намеренно. Две задачи, одинаковые на слух, отличаются по работе в несколько раз, и цифра до разговора скажет вам неправду. Вот от чего она зависит.',
    en: 'There is no “from” figure here, and that is deliberate. Two briefs that sound the same can differ several times over in the work, so a number before the conversation would tell you something untrue. Here is what it depends on.',
  } as L,
  factors: [
    { ru: 'Сколько экранов и сколько среди них непохожих друг на друга', en: 'How many screens, and how many of them differ from one another' },
    { ru: 'Нужна ли база — остаются ли данные между визитами', en: 'Whether a database is needed — does data survive between visits' },
    { ru: 'Нужен ли вход и личный кабинет', en: 'Whether sign-in and a personal account are needed' },
    { ru: 'Интеграции: оплата, доставка, CRM, письма, мессенджер', en: 'Integrations: payment, delivery, CRM, mail, messengers' },
    { ru: 'Дизайн свой или по вашему образцу', en: 'Design from scratch or following your reference' },
    { ru: 'Тексты и фотографии готовы или их надо собрать', en: 'Whether copy and photography exist or have to be produced' },
    { ru: 'Нужен ли второй язык', en: 'Whether a second language is needed' },
    { ru: 'Кто ведёт сайт после запуска', en: 'Who runs the site after launch' },
  ] as L[],

  askTitle: { ru: 'Что я спрошу до оценки', en: 'What I ask before quoting' } as L,
  ask: [
    { ru: 'Что за продукт и для кого', en: 'What the product is and who it is for' },
    { ru: 'Что человек должен сделать на сайте и как вы поймёте, что он это сделал', en: 'What a visitor should do on the site, and how you will know they did' },
    { ru: 'Что уже есть: домен, тексты, фотографии, дизайн', en: 'What already exists: domain, copy, photography, design' },
    { ru: 'К какому сроку', en: 'By when' },
    { ru: 'Что будет считаться неудачей', en: 'What would count as a failure' },
  ] as L[],
  askClosing: {
    ru: 'После этих ответов называю срок и цену.',
    en: 'After those answers I name the timeline and the price.',
  } as L,

  ctaTitle: { ru: 'Написать', en: 'Get in touch' } as L,
  ctaLede: {
    ru: 'Напишите, что нужно сделать. Отвечу, за какой срок это реально и что из этого я беру на себя.',
    en: 'Tell me what needs building. I will say how long it realistically takes and what part of it I take on.',
  } as L,
}
