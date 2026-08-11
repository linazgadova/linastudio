import type { L } from '../i18n/lang'

/** Служебные надписи интерфейса. Всё, что не является контентом проектов. */
export const UI = {
  skipToContent: { ru: 'К основному содержимому', en: 'Skip to content' } as L,
  navWork: { ru: 'Проекты', en: 'Work' } as L,
  navServices: { ru: 'Услуги', en: 'Services' } as L,
  switchLang: { ru: 'Switch to English', en: 'Переключить на русский' } as L,

  workTitle: { ru: 'Проекты', en: 'Work' } as L,
  workLede: {
    ru: 'Внутри каждого — разбор того, что там устроено и что делала я.',
    en: 'Each one opens into how it works and what part of it was mine.',
  } as L,


  /** Хвост описания страницы проекта. Лежит здесь, а не в генераторе
      страниц, потому что нужен обоим: и файлу для робота, и живой
      вкладке. Две копии одной строки однажды разошлись бы. */
  projectMeta: {
    ru: 'Разбор того, как проект устроен и что в нём делала я.',
    en: 'A breakdown of how the project works and what I did on it.',
  } as L,

  /* ── Страница, которой нет ─────────────────────────────────────
     Без извинений и без шуток про потерянную страницу. Человек сюда
     попал не по своей вине и хочет не сочувствия, а дороги дальше. */
  lostTitle: { ru: 'Такой страницы нет', en: 'This page doesn’t exist' } as L,
  lostLede: {
    ru: 'Ссылка ведёт в никуда: адрес набран с опечаткой или страницу переименовали. Всё, что есть на сайте, — ниже.',
    en: 'The link leads nowhere: either the address has a typo or the page was renamed. Everything the site does have is below.',
  } as L,
  lostWork: { ru: 'Проекты целиком', en: 'All the work' } as L,

  /* ── Куки ──────────────────────────────────────────────────────
     Текст говорит, что собирается и зачем. «Мы используем файлы cookie
     для улучшения работы сайта» не значит ничего и потому не считается
     ни предупреждением, ни уважением к человеку. */
  cookiesTitle: { ru: 'Файлы cookie', en: 'Cookies' } as L,
  cookiesText: {
    ru: 'Сайт использует файлы cookie и систему веб-аналитики. Собираются обезличенные сведения о посещении: источник перехода, просмотренные страницы и время на сайте. Данные нужны для оценки работы сайта. Без вашего согласия аналитика не подключается.',
    en: 'This site uses cookies and a web analytics service. It collects anonymised visit data: referral source, pages viewed and time on site. The data is used to assess how the site performs. Without your consent, analytics is not loaded.',
  } as L,
  cookiesNote: {
    ru: 'Отказ ничего не ломает: сайт работает целиком, включая ответы на вопросы обо мне.',
    en: 'Declining breaks nothing: the whole site keeps working, including the answers about me.',
  } as L,
  /* Вопрос уходит на обработку зарубежному сервису. Умолчать об
     этом нельзя, а пугать этим до первого вопроса — незачем */
  askPrivacy: {
    ru: 'Вопрос обрабатывает языковая модель. Ни вопрос, ни ответ не сохраняются. Персональные данные сюда вводить не нужно.',
    en: 'Questions are handled by a language model. Neither question nor answer is stored. Please don’t type personal data here.',
  } as L,

  /* Ссылка из окна и из подвала на политику обработки данных.
     Формулировка одна и та же в обоих местах намеренно: человек
     должен узнать ту же ссылку, а не гадать, туда ли она ведёт */
  privacyLink: {
    ru: 'Политика обработки персональных данных',
    en: 'Personal data processing policy',
  } as L,

  /** Подпись к значку качества сайта. Пустой alt на ссылке —
      это ссылка без названия: озвучка прочитает адрес картинки */
  iksAlt: {
    ru: 'Индекс качества сайта по версии Яндекса',
    en: 'Yandex site quality index',
  } as L,

  cookiesYes: { ru: 'Принять', en: 'Accept' } as L,
  cookiesNo: { ru: 'Отклонить', en: 'Decline' } as L,
  backToWork: { ru: 'Все проекты', en: 'All work' } as L,
  backHome: { ru: 'На главную', en: 'Home' } as L,
  nextProject: { ru: 'Следующий проект', en: 'Next project' } as L,
  writeTelegram: { ru: 'Написать в Telegram', en: 'Message me on Telegram' } as L,
  closedNote: {
    ru: 'Внутренняя система агентства — открытой ссылки нет. Показываю по запросу: демо-сборка на выдуманных данных.',
    en: 'An internal agency system — there is no public link. I can show it on request: a demo build on fabricated data.',
  } as L,

  /* Видны только на телефоне: там кадр десктопного сайта вписан в
     экран в четверть величины, и текста на нём не разобрать */
  shotZoom: { ru: 'Рассмотреть кадр', en: 'Look closer' } as L,
  shotZoomOff: { ru: 'Вписать в экран', en: 'Fit to screen' } as L,

  inside: { ru: 'Что внутри', en: 'What’s inside' } as L,
  openSite: { ru: 'Открыть сайт', en: 'Open site' } as L,
  /** Подпись под роликом прохода по живому сайту. */
  clipCaption: {
    ru: 'Проход по живому сайту: то, чего не видно на скриншоте',
    en: 'A walk through the live site: what a screenshot cannot show',
  } as L,
  layersLabel: { ru: 'Слои', en: 'Layers' } as L,
  stackLabel: { ru: 'Стек', en: 'Stack' } as L,
  roleLabel: { ru: 'Роль', en: 'Role' } as L,

  /* Не «Услуги», а обещание того, что там лежит. Ссылка стоит под
     списком из шести слов, и «Услуги» после них не добавляет ничего */
  servicesMore: {
    ru: 'Что входит в каждую и от чего зависит цена →',
    en: 'What each one includes and what the price depends on →',
  } as L,

  /* Дорога на страницу для работодателя. Стоит сразу под списком
     проектов: место, где человек уже посмотрел работы и решает, что
     делать дальше. В блоке контактов эта ссылка была строчкой в самом
     низу длинной страницы, и до неё не доходили.

     Формулировка ровная, без «ищу работу»: её видит и заказчик,
     пришедший за сайтом, и для него это сведения о том, кто будет
     делать работу, а не объявление. */
  hireLabel: { ru: 'Для работодателя', en: 'For employers' } as L,
  hireName: { ru: 'Работа в штате', en: 'A full-time role' } as L,
  hirePage: {
    ru: 'Что я веду сама в каждом проекте, стек, формат работы и открытый код этого сайта',
    en: 'What I run myself on each project, the stack, the working format and this site’s open source',
  } as L,

  /* Подписи двух столбцов подвала. Слева адреса, справа страницы,
     и без подписей это два соседних набора ссылок без единого
     признака, чем они отличаются */
  footerReach: { ru: 'Связаться', en: 'Get in touch' } as L,
  footerNav: { ru: 'Страницы', en: 'Pages' } as L,

  /* Все пять вопросов свёрнуты под одну строку. Раскрытые
     заголовки занимали высоту в экран и стояли последним, что
     человек видит на главной */
  faqTitle: { ru: 'Частые вопросы', en: 'Frequent questions' } as L,

  /* Подписи у курсора. Короткие и в повелительном наклонении:
     это не пояснение, а название действия, и читается оно боковым
     зрением за долю секунды. Ставятся не на всё подряд, а там, где
     по виду предмета не очевидно, что произойдёт: строка проекта
     выглядит заголовком, а не ссылкой, и ссылка наружу с виду
     не отличается от внутренней */
  cursorView: { ru: 'Смотреть', en: 'View' } as L,
  cursorOpen: { ru: 'Внешняя ссылка', en: 'External link' } as L,
  cursorCopy: { ru: 'Скопировать', en: 'Copy' } as L,

  emailLabel: { ru: 'Почта', en: 'Email' } as L,
  copied: { ru: 'Скопировано', en: 'Copied' } as L,
  copyEmail: { ru: 'Скопировать адрес', en: 'Copy address' } as L,

  askLabel: { ru: 'Вопрос об Ангелине', en: 'A question about Angelina' } as L,
  askPlaceholder: {
    ru: 'Спросите обо мне что угодно',
    en: 'Ask me anything',
  } as L,
  askSend: { ru: 'Спросить', en: 'Ask' } as L,
  askExamples: [
    { ru: 'Что самое сложное ты сделала?', en: 'What’s the hardest thing you built?' },
    { ru: 'Умеешь в бэкенд?', en: 'Can you do backend?' },
    { ru: 'Сколько у тебя опыта?', en: 'How much experience do you have?' },
    { ru: 'Чего ты не умеешь?', en: 'What can’t you do?' },
  ] as L[],
  askOffline: {
    ru: 'Ответ собран без ИИ, поиском по данным самого сайта. Так бывает при локальном запуске или когда кончилась бесплатная квота.',
    en: 'This answer came from a search over the site’s own data, without AI. That happens on a local run, or when the free quota runs out.',
  } as L,
}
