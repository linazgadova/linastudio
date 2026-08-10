import type { L } from '../i18n/lang'
import { SITE_URL } from './seo'

export const PROFILE = {
  /** В шапке стоит только имя — должности нет сознательно. */
  name: { ru: 'Ангелина', en: 'Angelina' } as L,

  /**
   * Фамилия. В шапке её нет сознательно — там только имя и город.
   * Отсюда она идёт в заголовок вкладки и в разметку для поиска:
   * человека ищут по «Ангелина Згадова», а не по одному имени.
   */
  surname: { ru: 'Згадова', en: 'Zgadova' } as L,

  location: { ru: 'Москва', en: 'Moscow' } as L,

  email: 'zgadova123@gmail.com',
  telegram: 'iteachzg',
  /** Имя аккаунта, не адрес: ссылку собирает Contact.tsx.
      Пустая строка прячет блок — так было, пока репозитория не было. */
  github: 'linazgadova',

  available: true,

  /** Адрес сайта. Живёт в одном месте — SITE_URL в data/seo.ts. */
  siteUrl: SITE_URL,

  portrait: 'portrait',
}

/**
 * Заголовок первого экрана. Строки стоят на разных отступах
 * и наезжают на сияние — поэтому они и хранятся отдельными
 * кусками, а не одной строкой с переносами.
 *
 * outline: true — слово набирается контуром. Ровно одно на весь
 * заголовок: оно ломает однородную массу букв и держит на себе взгляд.
 */
export type HeroLine = {
  text: L
  /** Контурный набор вместо сплошного. */
  outline?: boolean
  /** Сдвиг от центра в процентах ширины: минус — влево, плюс — вправо. */
  offset?: number
  /** Множитель кегля относительно базового. */
  scale?: number
  /** Наклон в градусах — чуть-чуть, чтобы строка не стояла по линейке. */
  rot?: number
}

/**
 * Заголовок первого экрана. Раскладка живёт здесь, а не в стилях:
 * композицию можно двигать, не трогая CSS.
 *
 * Строки собраны вокруг центра, но ни одна не стоит ровно по нему:
 * каждая сдвинута в свою сторону, у каждой свой кегль и свой наклон
 * в полтора-два градуса. Точка равновесия при этом остаётся в центре
 * экрана — там же, где капля. Это не хаос ради хаоса: сбивка ведёт
 * взгляд сверху вниз и упирает его в «САМА», а капля светит ровно
 * в просветах между строками.
 */
export const HERO_LINES: HeroLine[] = [
  { text: { ru: 'Придумываю', en: 'I design' }, offset: -14, scale: 0.86, rot: -1.6 },
  { text: { ru: 'продукты', en: 'products' }, offset: 11, scale: 1.1, rot: 1.2 },
  { text: { ru: 'и собираю', en: 'and build' }, offset: -13, scale: 0.8, rot: -0.7, outline: true },
  { text: { ru: 'сама', en: 'it myself' }, offset: 13, scale: 1.42, rot: 2.1, outline: true },
]

/**
 * Подводка первого экрана разбита на три части, потому что они
 * работают по-разному. Первая — утверждение, её набирают крупно.
 * Вторая — уточнение, она тише. Третья ведёт руку к строке вопроса
 * снизу и потому стоит отдельной строкой у самого её края.
 */
export const HERO = {
  claim: {
    ru: 'Два с половиной года я проектировала продукты, которые не могла собрать. Теперь собираю их сама.',
    en: 'For two and a half years I designed products I could not build. Now I build them myself.',
  } as L,
  detail: {
    ru: 'Дизайн, интерфейс, база и запуск на мне: от первого экрана до работающего адреса.',
    en: 'Design, interface, database and launch are mine, from the first screen to a working address.',
  } as L,
  invite: {
    ru: 'Спросите обо мне у сайта — он отвечает на моих же данных',
    en: 'Ask the site about me — it answers from my own data',
  } as L,
}

export const ABOUT = {
  title: { ru: 'Как это устроено', en: 'How this works' } as L,
  paragraphs: [
    {
      ru: 'Мне 21. Два с половиной года в дизайне: начинала с интерактивных тренажёров, потом меню для кафе, потом соцсети, потом веб. Всё это время у меня были идеи продуктов, которые я не могла собрать, потому что не умела писать код.',
      en: 'I’m 21. Two and a half years in design: I started with interactive trainers, then cafe menus, then social media, then the web. All that time I had ideas for products I could not build, because I could not write code.',
    },
    {
      ru: 'Недавно я научилась доводить их до конца. Код руками не пишу: проектирую систему и веду её до продакшена в паре с ИИ. Метод требует того же, чему меня научил дизайн. Понять, что человеку нужно, разобрать это на части и принять решение по каждой, вместо того чтобы бросить на середине.',
      en: 'Recently I learned to finish them. I don’t write code by hand: I design the system and carry it to production with AI. The method asks for the same thing design taught me. Work out what a person needs, break it into parts, then decide on each one instead of abandoning it halfway.',
    },
  ] as L[],
}

/**
 * ЧЕГО ОНА НЕ ДЕЛАЕТ
 *
 * Эта формулировка уже была написана и работала — но только в запасном
 * режиме, том, что отвечает поиском по данным, когда модель недоступна.
 * В знания самой модели она не попадала, и получалось наоборот
 * задуманному: без ИИ сайт отвечал на вопрос о слабых сторонах честно
 * и по делу, а с ИИ — «этого в данных нет, спросите напрямую».
 *
 * Проверено на живом сайте: «чего ты не умеешь» модель иногда угадывала
 * по единственной фразе «кода руками не пишет» в общем описании, а
 * «какие у тебя минусы» и весь английский отбивала отказом.
 *
 * Теперь текст лежит здесь, и его читают оба режима разом.
 *
 * Про содержание: пункты названы прямо и без смягчения. Портфолио,
 * которое честно говорит «этого у меня нет», вызывает больше доверия,
 * чем закрывающее собой всё.
 *
 * Порядок здесь важнее слов. Прежняя редакция начиналась с трёх
 * отрицаний подряд («не пишу код», «нет гитхаба», «нет пяти лет»),
 * и до сильных сторон ниже читатель мог не дойти. Теперь сначала
 * то, что она делает, потом граница, потом доказательство.
 *
 * Доказательство выбрано то, которого нет больше нигде на странице:
 * открытый исходник. Прежняя концовка про семь продуктов на своих
 * доменах слово в слово повторяла строку из сильных сторон, а
 * повторённый дважды довод перестаёт быть доводом.
 */
export const LIMITS = {
  ru: 'Архитектуру и схему базы придумываю я, код набирает ИИ: читаю его, правлю и отвечаю за результат. На разработчика я не училась, алгоритмической подготовки у меня нет. Исходник этого сайта открыт на гитхабе, с комментариями к каждому решению.',
  en: 'I work out the architecture and the database schema; the AI types the code. I read it, correct it and answer for the result. I did not train as a developer and I have no algorithms background. The source of this site is open on GitHub, with a comment on every decision.',
} as L

/**
 * Сильные стороны.
 *
 * Здесь нет ни одной формулировки без примера: «внимательна к деталям»
 * можно написать о ком угодно, а «в CRM у ИИ-агента нет инструмента
 * удаления» — только о том, кто это решение принимал. Каждый пункт
 * держится на конкретном случае из проектов, которые лежат выше,
 * и каждый я могу разобрать вслух.
 */
export const STRENGTHS = {
  title: { ru: 'Сильные стороны', en: 'Strengths' } as L,
  items: [
    {
      title: { ru: 'Решаю, чего в продукте не будет', en: 'I decide what the product won’t have' } as L,
      detail: {
        ru: 'В CRM нет учёта рабочего времени и статистики «кто сколько закрыл»: как только появляется счётчик, люди начинают играть в счётчик. Там же у ИИ-агента нет инструмента удаления: он создаёт и меняет, а снести запись может только человек. В Тапси я обошлась без ИИ совсем, строку «кофе 300» разбирает локальный словарь. Запрос на сервер ради одной подсказки стоил бы денег и секунды ожидания на ровном месте.',
        en: 'The CRM has no time tracking and no “who closed how many” stats: once a counter appears, people start playing the counter. In the same system the AI agent has no delete tool. It creates and edits, and only a person removes a record. Tapsi does without AI altogether, and a local dictionary parses the line “coffee 300”. A round trip to a server for one hint would cost money and a second of waiting for nothing.',
      } as L,
    },
    {
      title: { ru: 'Довожу до живого адреса', en: 'I get things to a live address' } as L,
      detail: {
        ru: 'Каждый проект здесь стоит на своём домене, с базой и живыми пользователями, а не лежит макетом в фигме. Придумать продукт и спроектировать его я умела и раньше. Довести до этой точки научилась недавно, и это та часть, которой мне не хватало два с половиной года.',
        en: 'Every project here sits on its own domain, with a database and people using it, rather than a mockup in Figma. Working out a product and designing it I could do before. Getting to this point I learned recently, and that was the part missing for two and a half years.',
      } as L,
    },
    {
      title: { ru: 'Говорю голосом продукта, а не своим', en: 'I speak in the product’s voice, not mine' } as L,
      detail: {
        ru: 'У портфолио дизайнера обычно один узнаваемый почерк. У меня наоборот, и это осознанно. Тренажёр для пятиклассника, магазин выкроек и сайт строительной компании не могут выглядеть одинаково — если они похожи, значит кто-то решал за продукт, как ему выглядеть.',
        en: 'A designer’s portfolio usually has one recognisable signature. Mine does not, and that is deliberate. A trainer for an eleven-year-old, a sewing pattern shop and a construction company site cannot look alike — if they do, someone decided for the product how it should look.',
      } as L,
    },
    {
      title: { ru: 'Проверяю, что работает не только у меня', en: 'I check it works for people who aren’t me' } as L,
      detail: {
        ru: 'В Thnkers язык живёт в адресе: ссылку можно переслать, и она откроется на нужном. Текст читается, даже если скрипты не загрузились. Контраст я измеряю, а не подбираю на глаз. Заглушки подписаны, чтобы человек видел, что здесь будет, и не решил, что сайт сломался.',
        en: 'In Thnkers the language lives in the URL: forward a link and it opens in the right one. The text reads even when scripts fail to load. I measure contrast instead of eyeballing it. Placeholders carry labels, so a visitor sees what will go there and does not decide the site is broken.',
      } as L,
    },
  ],
}

export const CONTACT = {
  title: { ru: 'Давайте поговорим', en: 'Let’s talk' } as L,
  lede: {
    ru: 'Напишите, что нужно сделать. Отвечу, за какой срок это реально и что из этого я беру на себя.',
    en: 'Write to me about what you need. I’ll come back with a realistic timeline and the part I can take on.',
  } as L,
}
