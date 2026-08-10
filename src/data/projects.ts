import type { L } from '../i18n/lang'
import type { LayerId } from './layers'

export type ProjectKind = 'product' | 'site'

export type Project = {
  id: string
  /**
   * Название так, как оно звучит в самом продукте.
   *
   * Двуязычное, и это не формальность. Кириллическое имя в
   * английском заголовке англоязычный человек не прочитает вовсе,
   * а в выдаче Google оно выглядит строкой сломанных символов.
   * Бренды идут привычной латиницей — ровно так, как их уже пишет
   * английский текст внутри страниц. Описательное имя переводится
   * по смыслу: «Рабочее место» бренд не называет, а объясняет.
   */
  name: L
  /** Одна строка: что это. Стоит рядом с названием. */
  tagline: L
  /** Абзац: задача и решение. */
  summary: L
  url: string
  /** Вторая ссылка — на конкретный кусок, который стоит открыть отдельно. */
  extraLink?: { label: L; url: string }
  /**
   * Закрытая система: ссылки наружу не даём вовсе. Вести человека
   * на экран входа, куда он не сможет войти, — хуже, чем честно
   * сказать, что система внутренняя.
   */
  closed?: boolean
  year: string
  role: L
  kind: ProjectKind
  /** true — крупный блок с превью; false — компактная карточка. */
  featured: boolean
  /** Фирменный цвет проекта. Только плашки и заливки. */
  color: string
  /** Затемнённый вариант — для текста на светлом фоне. */
  ink: string
  /** Первый кадр — главный. Остальные встают полосой миниатюр. */
  preview: string[]
  /** Слои, которые я вела в этом проекте. Из них собирается матрица. */
  layers: LayerId[]
  /** Чего в проекте нет и почему — если это осознанное решение. */
  notMine?: L
  stack: string[]
  /**
   * «Что внутри» — конкретные вещи, сделанные руками.
   * Самая ценная часть карточки: она отличает
   * «я сверстала сайт» от «я построила продукт».
   */
  inside: { title: L; detail: L }[]
}

/**
 * Порядок в массиве — порядок на странице. Первым стоит то, что
 * должно быть прочитано первым, а не то, что сделано последним.
 *
 * Новый проект — просто ещё один объект здесь. Матрица слоёв,
 * счётчики и сетка подхватят его сами, править их не нужно.
 */
export const PROJECTS: Project[] = [
  {
    id: 'pifika',
    name: { ru: 'Пифика', en: 'Pifika' },
    tagline: {
      ru: 'Тренажёр по математике, 5–9 класс',
      en: 'Maths trainer, school years 5–9',
    },
    summary: {
      ru: 'Моя идея и мой самый большой проект. Школьнику нужна причина открыть задачу сегодня, а потом ещё раз завтра, и учебник её не даёт. Пифика покрывает 142 темы школьной программы, и в каждой генератор собирает задания заново, поэтому выучить ответы не получится. Придумала, спроектировала и собрала одна: от характеров персонажей до схемы базы.',
      en: 'My idea and my largest project. A student needs a reason to open a problem today and then again tomorrow, and a textbook does not give one. Pifika covers 142 topics of the school curriculum, and in each one a generator builds the tasks from scratch, so memorising answers gets you nowhere. I worked it out, designed it and built it alone: from the characters to the database schema.',
    },
    url: 'https://pifika.ru/',
    extraLink: {
      label: { ru: 'Конструктор тренировки', en: 'Training builder' },
      url: 'https://pifika.ru/practice/',
    },
    year: '2025—2026',
    role: { ru: 'Идея и весь продукт', en: 'Idea and entire product' },
    kind: 'product',
    featured: true,
    color: '#6D3BE4',
    ink: '#5426BE',
    preview: ['/previews/pifika.jpg'],
    layers: ['design', 'interface', 'logic', 'data', 'integrations', 'deploy'],
    stack: [
      'Next.js',
      'TypeScript',
      'Tailwind',
      'Three.js',
      'React Three Fiber',
      'Spline',
      'GSAP',
      'Lenis',
      'Motion',
      'KaTeX',
      'sharp',
      'Puppeteer',
    ],
    inside: [
      {
        title: { ru: 'Генераторы задач на 142 темы', en: 'Task generators across 142 topics' },
        detail: {
          ru: 'Восемь курсов: математика 5–6, алгебра 7–9, геометрия 7–9. У каждой темы своя логика сборки задания — числа, условие и правильный ответ считаются на лету, а не берутся из готового списка. Поэтому «прорешать всё» нельзя, можно только научиться.',
          en: 'Eight courses: maths 5–6, algebra 7–9, geometry 7–9. Every topic has its own generation logic — the numbers, the wording and the correct answer are computed on the fly rather than pulled from a fixed list. You cannot finish it all; you can only get better.',
        },
      },
      {
        title: { ru: 'Задания, а не тесты', en: 'Exercises, not multiple choice' },
        detail: {
          ru: 'Не только выбор варианта: расставить по порядку, перетащить точку на числовую прямую, проверить теорему. Под каждый тип взаимодействия — свой компонент с проверкой и разбором ошибки.',
          en: 'Not just picking an option: put things in order, drag a point onto the number line, verify a theorem. Each interaction type has its own component with validation and an error walkthrough.',
        },
      },
      {
        title: { ru: 'База данных и личный кабинет', en: 'Database and personal account' },
        detail: {
          ru: 'Схема базы, авторизация, хранение решённых задач, опыта, уровней и «искры» — серии дней. Прогресс переживает выход из аккаунта и смену устройства, попробовать можно и без регистрации.',
          en: 'Database schema, authentication, storage of solved tasks, experience, levels and the «spark» — the day streak. Progress survives logout and a change of device, and you can try it without signing up at all.',
        },
      },
      {
        title: { ru: 'Конструктор тренировки', en: 'Training builder' },
        detail: {
          ru: 'Можно собрать свой набор из тем разных классов — например, подтянуть дроби за пятый и уравнения за седьмой в одной сессии. Тренировка собирается под выбор, а не выдаётся готовым блоком.',
          en: 'You can assemble your own set from topics across different years — say, fractions from year 5 and equations from year 7 in one session. The session is built to the selection instead of being served as a fixed block.',
        },
      },
      {
        title: { ru: 'Четыре стиля оформления', en: 'Four visual styles' },
        detail: {
          ru: 'Классика, аниме, корейский пастельный и космос — переключаются прямо в тренажёре. Сам сайт при этом остаётся спокойным: стиль меняет задания, а не навигацию.',
          en: 'Classic, anime, Korean pastel and space — switchable inside the trainer. The site itself stays calm: the style changes the exercises, not the navigation.',
        },
      },
      {
        title: { ru: 'Персонажи', en: 'Characters' },
        detail: {
          ru: 'Хорёк Пифи, Рокси, Лео, Нова и Дэн. Придумала характеры и роль каждого: кто подсказывает, кто хвалит, кто разбирает ошибку. Персонажа выбирают один раз, и дальше он идёт рядом.',
          en: 'Pifi the ferret, Roxy, Leo, Nova and Dan. I wrote each character and their role: who hints, who praises, who walks you through a mistake. You pick one and they stay with you.',
        },
      },
      {
        title: { ru: 'Теория и шпора', en: 'Theory and cheat sheet' },
        detail: {
          ru: 'Правила и разобранные примеры к каждой теме, чтобы не уходить с сайта за объяснением. Программа сверена с учебниками Мерзляка и Атанасяна.',
          en: 'Rules and worked examples for every topic, so nobody leaves the site to find an explanation. The curriculum is matched to the Merzlyak and Atanasyan textbooks.',
        },
      },
    ],
  },

  {
    id: 'thcrm',
    name: { ru: 'Рабочее место', en: 'The Workspace' },
    tagline: {
      ru: 'CRM агентства: конвейер, а не доска задач',
      en: 'Agency CRM: a conveyor, not a task board',
    },
    summary: {
      ru: 'Внутренняя система агентства. Работа в агентстве идёт конвейером: сбор материала, текст, дизайн, разработка, согласование. Систему я построила вокруг этого порядка. Дизайнер закончил свой этап, ответственным становится разработчик, и бот пишет ему в Telegram. Никому не приходится спрашивать «глянь, пожалуйста» и выяснять, чья сейчас задача.',
      en: 'An agency’s internal system. Agency work runs as a conveyor: gather material, copy, design, build, sign-off. I built the system around that order. The designer finishes their stage, the developer becomes the owner, and the bot messages them in Telegram. Nobody has to ask “could you take a look” or work out whose task it is.',
    },
    url: '',
    closed: true,
    year: '2025—2026',
    role: { ru: 'Весь продукт', en: 'Entire product' },
    kind: 'product',
    featured: true,
    color: '#C81E63',
    ink: '#A81551',
    preview: ['/previews/thcrm.jpg'],
    layers: ['design', 'interface', 'logic', 'data', 'integrations', 'deploy'],
    stack: [
      'React',
      'Vite',
      'TypeScript',
      'Tauri',
      'Supabase',
      'PostgreSQL',
      'zustand',
      'React Router',
      'dnd-kit',
      'Telegram Bot API',
      'LLM',
    ],
    inside: [
      {
        title: { ru: 'Конвейер с автопередачей', en: 'A conveyor with automatic handover' },
        detail: {
          ru: 'Система знает порядок этапов и сама назначает ответственным того, чья специализация совпала со следующим этапом. Если подходящего человека нет — на карточке загорается «ждёт исполнителя», и ничья задача видна сразу, а не через неделю.',
          en: 'The system knows the order of stages and assigns whoever’s specialism matches the next one. If there is no suitable person, the card lights up «waiting for an owner», so an orphaned task is visible immediately rather than a week later.',
        },
      },
      {
        title: { ru: 'Бот: голосовое или письмо → задача', en: 'Bot: a voice note or an email becomes a task' },
        detail: {
          ru: 'Наговорил голосовое или переслал письмо клиента — бот расшифровывает, достаёт, что сделать, к какому сроку и насколько срочно, и заводит задачу в нужный проект. Десять секунд вместо «потом внесу».',
          en: 'Record a voice note or forward a client’s email — the bot transcribes it, extracts what needs doing, by when and how urgently, and files the task into the right project. Ten seconds instead of «I’ll add it later».',
        },
      },
      {
        title: { ru: 'Согласование прямо в Telegram', en: 'Sign-off inside Telegram' },
        detail: {
          ru: 'Задача приходит с файлами и двумя кнопками. Вернуть на правки можно только с объяснением — причина записывается в задачу, а не теряется в переписке.',
          en: 'The task arrives with its files and two buttons. Sending it back for changes requires a reason — and that reason is written into the task instead of getting lost in a chat.',
        },
      },
      {
        title: { ru: 'Экран «Кто чем занят»', en: 'The «who is on what» screen' },
        detail: {
          ru: 'Каждый сам отмечает загрузку: есть место, норма, плотно, завал — рядом список текущих задач. Кому отдать работу, видно до того, как открыли рот.',
          en: 'Everyone marks their own load: room to spare, normal, tight, buried — with their current tasks alongside. You can see who to hand work to before anyone opens their mouth.',
        },
      },
      {
        title: { ru: 'Подсветка залипших задач', en: 'Stuck-task highlighting' },
        detail: {
          ru: 'Без движения дольше трёх дней — задача помечается на общей доске, дольше недели — красным. Простой виден за секунду, без отчётов и совещаний.',
          en: 'No movement for three days marks the task on the shared board; more than a week turns it red. A stall is visible in a second, with no reports and no meetings.',
        },
      },
      {
        title: { ru: 'Настоящее десктопное приложение', en: 'A real desktop application' },
        detail: {
          ru: 'Собрано на Tauri: ставится в систему, стартует вместе с ней и шлёт нативные уведомления — не вкладка в браузере, которую забыли открыть. Данные живут в Supabase, то есть в обычном Postgres.',
          en: 'Built on Tauri: it installs into the system, starts with it and sends native notifications — not a browser tab someone forgot to open. The data lives in Supabase, which is plain Postgres.',
        },
      },
      {
        title: { ru: 'Три интерфейса на одну систему', en: 'Three interfaces, one system' },
        detail: {
          ru: 'Компьютер, телефон и Telegram работают с одними данными. Тому, кто не хочет заходить в CRM, достаточно переписки с ботом.',
          en: 'Desktop, phone and Telegram all work on the same data. Anyone who does not want to open the CRM can just talk to the bot.',
        },
      },
      {
        title: { ru: 'Чего в системе нет — специально', en: 'What the system deliberately lacks' },
        detail: {
          ru: 'Нет учёта рабочего времени, нет статистики «кто сколько закрыл» и нет уведомлений по расписанию. Каждый пункт обсуждался и был отклонён: как только появляется счётчик, люди начинают играть в счётчик. Система показывает состояние работы, а не оценки людей.',
          en: 'No time tracking, no «who closed how many» statistics, no scheduled notifications. Each was discussed and rejected: the moment a counter appears, people start playing the counter. The system shows the state of the work, not a scoreboard of people.',
        },
      },
    ],
  },

  {
    id: 'stapsi',
    name: { ru: 'Тапси', en: 'Tapsi' },
    tagline: {
      ru: 'PWA для учёта трат — голосом и словами',
      en: 'Expense PWA — by voice, in plain words',
    },
    summary: {
      ru: 'Приложение про деньги, которое не читает нотаций. Трату не заносят в форму — её проговаривают: «кофе 250, устал». Приложение само определяет сумму, категорию и эмоцию, а голосом можно надиктовать несколько трат подряд. Вместо графиков-простыней — шейдерная аура, по которой видно, как идёт месяц.',
      en: 'A money app that does not lecture. You do not fill in a form — you say it: «coffee 250, tired». The app works out the amount, the category and the mood on its own, and by voice you can dictate several expenses in a row. Instead of wall-to-wall charts there is a shader aura that shows how the month is going.',
    },
    url: 'https://stapsi.netlify.app/',
    year: '2025—2026',
    role: { ru: 'Весь продукт', en: 'Entire product' },
    kind: 'product',
    featured: true,
    color: '#7B5CFA',
    ink: '#5B3EE0',
    preview: ['/previews/stapsi.jpg'],
    layers: ['design', 'interface', 'logic', 'data', 'integrations', 'deploy'],
    stack: [
      'React',
      'Vite',
      'TypeScript',
      'Supabase',
      'zustand',
      'PWA',
      'Service Worker',
      'Web Speech API',
      'WebGL',
    ],
    inside: [
      {
        title: { ru: 'Голосовой ввод пачкой', en: 'Batch voice input' },
        detail: {
          ru: 'Нажал кнопку и надиктовал несколько трат подряд — приложение разберёт их по одной. Самый быстрый путь от «потратил» до «записал», а именно на нём такие приложения обычно и теряют людей.',
          en: 'Press the button and dictate several expenses in a row — the app breaks them apart one by one. The shortest path from «spent» to «recorded», which is exactly where apps like this usually lose people.',
        },
      },
      {
        title: { ru: 'Разбор фразы: сумма, категория, эмоция', en: 'Phrase parsing: amount, category, mood' },
        detail: {
          ru: '«Кофе 250, устал» превращается в запись с суммой, категорией и настроением. Эмоция — не украшение: она потом объясняет, почему месяц пошёл именно так.',
          en: '«Coffee 250, tired» becomes an entry with an amount, a category and a mood. The mood is not decoration: later it explains why the month went the way it did.',
        },
      },
      {
        title: { ru: 'Шейдер настроения', en: 'The mood shader' },
        detail: {
          ru: 'Аура-спутник живёт на шейдере: форма и цвет меняются вместе с тем, как ты тратишь. Считывается за секунду — в отличие от столбиковой диаграммы, в которую надо вчитываться.',
          en: 'The aura companion runs on a shader: its shape and colour shift with how you spend. It reads in a second, unlike a bar chart you have to study.',
        },
      },
      {
        title: { ru: 'Семейный аккаунт', en: 'Family account' },
        detail: {
          ru: 'Бюджет можно вести вдвоём или семьёй — общие траты видны обоим, и не нужно сверять два разных приложения в конце месяца.',
          en: 'A budget can be kept by a couple or a family — shared spending is visible to everyone, with no reconciling two different apps at the end of the month.',
        },
      },
      {
        title: { ru: 'Онбординг, который настраивает продукт', en: 'Onboarding that configures the product' },
        detail: {
          ru: 'Пять шагов: имя и доход, лимит и цель накопления, свои категории из четырнадцати, установка на телефон. К первому экрану приложение уже знает, что показывать, — без пустого состояния.',
          en: 'Five steps: name and income, a spending cap and a savings goal, your own categories out of fourteen, installing to the home screen. By the first screen the app already knows what to show — no empty state.',
        },
      },
      {
        title: { ru: 'Офлайн и данные на устройстве', en: 'Offline, data on the device' },
        detail: {
          ru: 'PWA ставится на телефон и работает без сети. Данные лежат на устройстве, облачный бэкап и синхронизация подключаются отдельно — по желанию, а не по умолчанию.',
          en: 'The PWA installs on a phone and works without a connection. Data lives on the device; cloud backup and sync are opt-in rather than default.',
        },
      },
    ],
  },

  {
    id: 'fabrico',
    name: { ru: 'Fabrico', en: 'Fabrico' },
    tagline: {
      ru: 'Магазин PDF-выкроек, 120+ товаров',
      en: 'PDF sewing pattern shop, 120+ items',
    },
    summary: {
      ru: 'Магазин выкроек для тех, кто шьёт сам. Главная сложность здесь не витрина, а выбор: человек приходит, видит сто двадцать вариантов и уходит. Я предложила и сделала квиз «What kind of seamstress are you?» — десять вопросов, шесть типов результата и подборка выкроек под свой ответ вместо каталога.',
      en: 'A pattern shop for people who sew. The hard part is not the storefront but the choice: a visitor arrives, sees a hundred and twenty options and leaves. I proposed and built the «What kind of seamstress are you?» quiz — ten questions, six result types and a pattern selection matched to your answers instead of a catalogue.',
    },
    url: 'https://fabrico.design/',
    extraLink: {
      label: { ru: 'Открыть квиз', en: 'Open the quiz' },
      url: 'https://fabrico.design/quiz/',
    },
    year: '2025',
    role: { ru: 'Дизайн страниц и квиз', en: 'Page design and the quiz' },
    kind: 'site',
    featured: true,
    color: '#9C6B3F',
    ink: '#7A5230',
    preview: ['/previews/fabrico.jpg', '/previews/fabrico-quiz.jpg'],
    layers: ['design', 'logic'],
    stack: ['UI/UX', 'WooCommerce', 'JavaScript'],
    inside: [
      {
        title: { ru: 'Квиз: моя идея и моя реализация', en: 'The quiz: my idea, my build' },
        detail: {
          ru: 'Десять вопросов за две минуты, шесть типов результата — не «подбор по параметрам», а разговор про то, как человек шьёт. На выходе подборка выкроек, а не сто двадцать карточек. Это был мой ответ на вопрос «почему заходят и не покупают»: я его предложила и сама сделала.',
          en: 'Ten questions in two minutes, six result types — not a parameter filter but a conversation about how a person sews. The output is a short selection rather than a hundred and twenty cards. It was my answer to «why do people arrive and not buy»: I proposed it and built it myself.',
        },
      },
      {
        title: { ru: 'Дизайн главной страницы', en: 'The home page design' },
        detail: {
          ru: 'Первый экран, порядок блоков, подача товара и вход в квиз. Витрина должна за секунду объяснить, что здесь продают выкройки, а не готовую одежду, — на этом строилась вся композиция.',
          en: 'The hero, the order of blocks, how the product is presented and where the quiz begins. The storefront has to explain in a second that this shop sells patterns, not finished clothes — the whole composition was built on that.',
        },
      },
      {
        title: { ru: 'Внутренние страницы', en: 'The inner pages' },
        detail: {
          ru: 'Дизайн всех побочных страниц, кроме Learning Hub. Каталог, карточки, служебные разделы — одна сетка и одна типографика на всех, чтобы магазин не рассыпался на разные сайты.',
          en: 'Design for every inner page except the Learning Hub. Catalogue, product cards, utility pages — one grid and one type system across all of them, so the shop does not fall apart into separate sites.',
        },
      },
      {
        title: { ru: 'Страница для бизнеса', en: 'The business page' },
        detail: {
          ru: 'Отдельный дизайн раздела Fabrico for business: там другой читатель и другой разговор, чем на витрине для тех, кто шьёт себе.',
          en: 'A separate design for the Fabrico for business section: a different reader and a different conversation than the storefront for people sewing for themselves.',
        },
      },
      {
        title: { ru: 'Страница курсов', en: 'The courses page' },
        detail: {
          ru: 'Дизайн раздела с курсами — как показать программу так, чтобы человек понял объём и результат до оплаты.',
          en: 'Design for the courses section — how to show a programme so a person understands the scope and the outcome before paying.',
        },
      },
    ],
  },

  {
    id: 'thnkers',
    name: { ru: 'Thnkers', en: 'Thnkers' },
    tagline: {
      ru: 'Сайт research-агентства, EN/DE',
      en: 'Research agency site, EN/DE',
    },
    summary: {
      ru: 'Агентство, которое начинает с исследования, а потом строит продукт. Логотип и палитру мне выдали готовыми — я собрала из них сайт: тридцать статических страниц, два языка, семь кейсов, дизайн-система из восьми размеров шрифта и один WebGL в первом экране.',
      en: 'An agency that starts with research and then builds the product. The logo and palette were handed to me — I built the site from them: thirty static pages, two languages, seven cases, a design system of exactly eight type sizes, and one WebGL field in the hero.',
    },
    url: 'https://testtnkerz.netlify.app/',
    year: '2025',
    role: { ru: 'Вёрстка и сборка сайта', en: 'Site build' },
    kind: 'site',
    featured: false,
    color: '#FF2E8A',
    ink: '#C0176A',
    preview: ['/previews/thnkers.jpg'],
    layers: ['interface', 'logic', 'deploy'],
    notMine: {
      ru: 'Логотип, фирменную палитру и тексты кейсов мне выдали готовыми — моя часть здесь начинается с вёрстки.',
      en: 'The logo, the brand palette and the case copy were handed to me — my part starts at the build.',
    },
    stack: ['Next.js 16', 'TypeScript', 'Tailwind v4', 'next-intl'],
    inside: [
      {
        title: { ru: 'Дизайн-система из восьми размеров', en: 'A design system of eight sizes' },
        detail: {
          ru: 'Ровно восемь типографических размеров и ни одним больше: если макету нужен девятый — берётся ближайший. Всё живёт в одном файле, компоненты своих значений не изобретают. Именно это и удерживает тридцать страниц в одном ритме.',
          en: 'Exactly eight type sizes and not one more: if a layout wants a ninth, it takes the nearest. Everything lives in one file and components invent no values of their own. That is what holds thirty pages in one rhythm.',
        },
      },
      {
        title: { ru: 'Один WebGL — и тот со смыслом', en: 'One WebGL field, and it means something' },
        detail: {
          ru: 'В первом экране поле волн, которые выпрямляются и краснеют там, где курсор. Логотип агентства — слово с волнистым подчёркиванием, как ошибка в Word; здесь курсор буквально работает исправлением. Один полноэкранный треугольник, без библиотек. Отключается сам при prefers-reduced-motion, на экранах уже 768 пикселей, когда секция уходит из вида и когда вкладка скрыта.',
          en: 'The hero holds a field of waves that straighten and redden where the cursor goes. The agency logo is a word with a wavy underline, like a spellcheck error; here the cursor literally acts as the correction. One fullscreen triangle, no libraries. It disables itself on prefers-reduced-motion, below 768px, when the section leaves view and when the tab is hidden.',
        },
      },
      {
        title: { ru: 'Два языка с отдельными адресами', en: 'Two languages, separate URLs' },
        detail: {
          ru: 'Английский и немецкий через next-intl: не подмена текста на лету, а нормальная структура с /en/ и /de/, hreflang и переключателем. В компонентах нет ни одной захардкоженной строки — добавить язык значит добавить файл перевода. Немецкую локаль отдельно проверяла на длинных составных словах: переполнений нет.',
          en: 'English and German via next-intl: a real structure with /en/ and /de/, hreflang and a switcher — not text swapped on the fly. Not a single hardcoded string in the components: adding a language means adding a translation file. The German locale was checked separately against long compound words: nothing overflows.',
        },
      },
      {
        title: { ru: 'Прогон контраста по всем страницам', en: 'A contrast pass over every page' },
        detail: {
          ru: 'Малиновый на индиго даёт 2,2:1 — для текста этого мало. Поэтому на тёмных поверхностях работает отдельный светлый акцент, а не фирменный малиновый. Проверила расчётом каждый текстовый узел на каждой странице к фактическому фону: нарушений AA нет.',
          en: 'Magenta on indigo gives 2.2:1 — not enough for text. So a separate lighter accent works on dark surfaces instead of the brand magenta. I computed contrast for every text node on every page against its actual background: no AA violations.',
        },
      },
      {
        title: { ru: 'Страница читается без JavaScript', en: 'The page reads without JavaScript' },
        detail: {
          ru: 'Скролл-анимации прячут содержимое только после того, как скрипт подтвердил, что сможет его показать. Если JS не загрузился, текст просто на месте, а не остаётся невидимым навсегда.',
          en: 'Scroll animations hide content only after the script confirms it will be able to reveal it. If JS never loads, the text is simply there instead of staying invisible forever.',
        },
      },
      {
        title: { ru: 'Честно помечено, что заглушка', en: 'Placeholders are labelled as such' },
        detail: {
          ru: 'В сдаточном README отдельным разделом: какие кейсы, цифры и скриншоты настоящие, а какие профили команды и обложки — стоковые и подлежат замене. Показывать клиенту прототип, не сказав этого, — способ подставить и его, и себя.',
          en: 'The handover README has a section of its own: which cases, numbers and screenshots are real, and which team profiles and covers are stock and need replacing. Showing a client a prototype without saying so is a way to expose both of you.',
        },
      },
    ],
  },

  {
    id: 'gromstroy',
    name: { ru: 'Громстрой', en: 'Gromstroy' },
    tagline: {
      ru: 'Сайт строительной компании',
      en: 'Construction company site',
    },
    summary: {
      ru: 'Строительная компания на рынке с 2016 года. Задача была снять ощущение «подрядчик из объявления»: тёмная схема с золотом, крупная антиква в заголовке и портфолио построенных объектов вместо списка услуг мелким шрифтом.',
      en: 'A construction company operating since 2016. The task was to shed the «contractor from a classified ad» feeling: a dark scheme with gold, a large serif headline and a portfolio of finished buildings instead of a fine-print service list.',
    },
    url: 'https://grmstr.ru/',
    year: '2025',
    role: { ru: 'Дизайн и интерфейс', en: 'Design and interface' },
    kind: 'site',
    featured: false,
    color: '#C6A052',
    ink: '#8A6A22',
    preview: ['/previews/gromstroy.jpg'],
    layers: ['design', 'interface', 'deploy'],
    stack: ['HTML', 'CSS', 'JavaScript', 'UI/UX'],
    inside: [
      {
        title: { ru: 'Галерея объектов вместо списка услуг', en: 'An object gallery instead of a service list' },
        detail: {
          ru: 'Первый экран отдан построенному: крупные кадры зданий с подписью, что это и где. Список услуг я убрала вниз и свернула до строк — до него доходят те, кто уже посмотрел работы.',
          en: 'The first screen goes to what was built: large photographs of buildings, labelled with what and where. I moved the service list down and cut it to single lines, for the people who already looked at the work.',
        },
      },
      {
        title: { ru: 'Тёмная схема и антиква', en: 'A dark scheme and a serif' },
        detail: {
          ru: 'Тёмный фон, золото в акцентах, крупная антиква в заголовках и никаких скруглённых кнопок с градиентом. Это решение против ощущения «подрядчик из объявления», с которым компания ко мне и пришла.',
          en: 'A dark background, gold accents, a large serif in the headings and no rounded gradient buttons. That decision works against the «contractor from a classified ad» feeling the company came to me with.',
        },
      },
      {
        title: { ru: 'Короткий путь до звонка', en: 'A short path to a call' },
        detail: {
          ru: 'Телефон закреплён в шапке и остаётся на экране при прокрутке, кнопка связи стоит на первом экране, между разделами якорная навигация. Позвонить можно из любой точки страницы, не возвращаясь наверх.',
          en: 'The phone stays pinned in the header while you scroll, a contact button sits on the first screen, and anchors link the sections. You can call from anywhere on the page without scrolling back up.',
        },
      },
      {
        title: { ru: 'Что я делала', en: 'What was mine' },
        detail: {
          ru: 'Дизайн всех экранов, структура страницы и вёрстка. Тексты и фотографии объектов дала компания.',
          en: 'The design of every screen, the page structure and the front end. The copy and the building photographs came from the company.',
        },
      },
    ],
  },

  {
    id: 'denis-lyakh',
    name: { ru: 'Denis Lyakh', en: 'Denis Lyakh' },
    tagline: {
      ru: 'Портфолио инженера-электронщика',
      en: 'Electronics engineer portfolio',
    },
    summary: {
      ru: 'Первый сайт, который я сделала целиком — и полигон, на котором проверяла, что вообще можно вытащить из браузера. Визуальный язык взят из предметной области: фон — живая схема из узлов и связей, навигация пронумерована как разделы техдокументации, в углу идут московское время и координаты. Отсюда в мои проекты пришли Three.js, GSAP и Lenis.',
      en: 'The first site I built end to end — and the test bench where I found out what a browser can actually be made to do. The visual language comes from the subject’s own field: the background is a live schematic of nodes and links, the navigation numbered like datasheet sections, the corner running Moscow time and coordinates. Three.js, GSAP and Lenis entered my work here.',
    },
    url: 'https://denis-lyakh.netlify.app/',
    year: '2025',
    role: { ru: 'Дизайн и интерфейс', en: 'Design and interface' },
    kind: 'site',
    featured: false,
    color: '#2563FF',
    ink: '#1749C7',
    preview: ['/previews/denis-lyakh.jpg'],
    layers: ['design', 'interface', 'deploy'],
    stack: [
      'Next.js',
      'TypeScript',
      'Tailwind',
      'Three.js',
      'React Three Fiber',
      'drei',
      'postprocessing',
      'GSAP',
      'Lenis',
      'Motion',
    ],
    inside: [
      {
        title: { ru: 'Схема из узлов на фоне', en: 'A schematic of nodes in the background' },
        detail: {
          ru: 'Фон собран на канвасе: узлы связаны линиями, вся сетка медленно дышит и расступается под курсором. Рисунок взят из предметной области человека, для которого сайт, — он проектирует платы.',
          en: 'The background runs on canvas: nodes joined by links, the whole grid breathing slowly and parting under the cursor. The drawing comes from the subject’s own field — he designs circuit boards.',
        },
      },
      {
        title: { ru: 'Нумерованные разделы', en: 'Numbered sections' },
        detail: {
          ru: '01 About, 02 Skills, 03 Process и дальше. Нумерация тут не украшение: разделы читаются по порядку, как маршрут от схемы до серийной платы, и номер в навигации показывает, где человек сейчас.',
          en: '01 About, 02 Skills, 03 Process and onward. The numbering is not decoration: the sections read in order, like a route from schematic to production board, and the number in the navigation shows where you are.',
        },
      },
      {
        title: { ru: 'Часы и координаты в углу', en: 'Clock and coordinates in the corner' },
        detail: {
          ru: 'В углу идёт московское время и стоят координаты. Мелочь, но она делает страницу местом, а не документом: понятно, где человек находится и в каком он часовом поясе.',
          en: 'Moscow time runs in the corner alongside coordinates. A small thing, but it turns the page into a place rather than a document: you see where the person is and what time zone he keeps.',
        },
      },
      {
        title: { ru: 'Чем он стал для меня', en: 'What it became for me' },
        detail: {
          ru: 'Здесь я впервые разбиралась с Three.js, R3F, постобработкой, GSAP и Lenis. Оставила в проекте только то, что выдержало проверку, остальное выбросила. Всё, что потом ушло в Пифику и в это портфолио, сначала было опробовано тут.',
          en: 'This is where I first worked through Three.js, R3F, postprocessing, GSAP and Lenis. I kept only what survived the test and threw the rest away. Everything that later went into Pifika and into this portfolio was tried out here first.',
        },
      },
    ],
  },
]

export const FEATURED = PROJECTS.filter((p) => p.featured)
export const COMPACT = PROJECTS.filter((p) => !p.featured)
