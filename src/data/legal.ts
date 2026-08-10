import type { L } from '../i18n/lang'

/**
 * ПОЛИТИКА ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ
 *
 * Документ, который часть 2 статьи 18.1 152-ФЗ требует держать
 * в открытом доступе, если сайт собирает о посетителях хоть
 * что-нибудь. Счётчик аналитики собирает — значит требует.
 *
 * Текст лежит данными, а не разметкой, ровно по той же причине, что
 * и весь остальной текст сайта: после сборки он раскладывается по
 * страницам обеих языковых версий готовым HTML, и робот, который
 * не выполняет скрипты, читает его целиком.
 *
 * Здесь нет ни одного пункта «на всякий случай». Каждый абзац
 * описывает то, что сайт делает на самом деле: перечислять сбор
 * данных, которого нет, так же неверно, как умалчивать о том,
 * который есть.
 *
 * ОТКУДА ВЗЯТА СТРУКТУРА
 *
 * Готовый шаблон сюда не подходил. Все ходовые шаблоны написаны для
 * юридического лица с отделом кадров: там половина документа про
 * работников, кандидатов и контрагентов, а этого сайта не касается
 * ничего из перечисленного. Документ, описывающий обработку, которой
 * нет, читается как отписка и первым же вопросом разваливается.
 *
 * Поэтому текст написан по фактам сайта, но по той структуре, которую
 * Роскомнадзор ждёт увидеть: термины и правовые основания, категории
 * субъектов и перечень данных, цели, перечень действий и способ
 * обработки, место хранения баз, трансграничная передача, сроки,
 * права субъекта и порядок запроса, меры защиты, порядок изменения.
 * Ни один из этих блоков не пропущен — пропущенный блок и есть то,
 * за что цепляется автоматическая проверка.
 */

/**
 * Кто оператор.
 *
 * ФИО полностью и способ связи — обязательный минимум. ИНН для
 * физического лица не обязателен; пустая строка просто убирает
 * строку со страницы.
 */
export const OPERATOR = {
  /** Полное имя. Документ именной, поэтому с отчеством. */
  fullName: { ru: 'Згадова Ангелина Владимировна', en: 'Angelina Vladimirovna Zgadova' } as L,
  /** Статус. У самозанятого он указывается прямо. */
  status: {
    ru: 'самозанятая (налог на профессиональный доход)',
    en: 'self-employed (professional income tax regime)',
  } as L,
  /** ИНН. Пустая строка — строка не выводится. */
  inn: '',
  email: 'zgadova123@gmail.com',
  /** Дата последней редакции — для человека. Меняется вместе с текстом. */
  updated: { ru: '6 августа 2026', en: '6 August 2026' } as L,
  /** Она же для машин: dateModified в разметке требует такого вида */
  updatedISO: '2026-08-06',
}

export type LegalBlock = { title: L; items: L[] }

export const PRIVACY = {
  title: {
    ru: 'Политика обработки персональных данных',
    en: 'Personal data processing policy',
  } as L,

  lede: {
    ru: 'Этот документ объясняет, какие сведения сайт собирает о посетителях, зачем и что с ними происходит дальше. Он написан обычными словами: юридическая сила от этого не меняется, а прочитать его можно целиком.',
    en: 'This document explains what the site collects about visitors, why, and what happens to it afterwards. It is written in plain words: that changes nothing legally, and it means you can actually read it.',
  } as L,

  blocks: [
    {
      title: { ru: 'Общие положения', en: 'General provisions' } as L,
      items: [
        {
          ru: 'Политика составлена в соответствии с частью 2 статьи 18.1 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению их безопасности на этом сайте.',
          en: 'This policy is drawn up under part 2 of article 18.1 of Russian Federal Law No. 152-FZ of 27 July 2006 “On Personal Data” and sets out how personal data is processed on this site and how it is kept secure.',
        },
        {
          ru: 'Персональные данные — любая информация, относящаяся к прямо или косвенно определённому физическому лицу. Обработка — любое действие с такими данными. Оператор — лицо, которое определяет цели и состав обработки. Субъект — человек, к которому данные относятся.',
          en: 'Personal data means any information relating to a directly or indirectly identified individual. Processing means any operation performed on such data. The operator is the person who determines the purposes and scope of processing. The data subject is the person the data relates to.',
        },
        {
          ru: 'Действующая редакция политики постоянно доступна по адресу этой страницы. Продолжая пользоваться сайтом, вы подтверждаете, что ознакомились с ней.',
          en: 'The current version of this policy is permanently available at this page’s address. By continuing to use the site you confirm you have read it.',
        },
      ],
    },
    {
      title: { ru: 'Кто обрабатывает данные', en: 'Who processes the data' } as L,
      items: [
        {
          ru: 'Оператор — физическое лицо, владелец этого сайта. Полное имя, статус и способ связи указаны в конце страницы.',
          en: 'The operator is a private individual, the owner of this site. Full name, status and contact details are at the end of this page.',
        },
        {
          ru: 'Категория субъектов одна: посетители сайта. Работников, кандидатов, клиентов с договорами и иных категорий оператор через этот сайт не обрабатывает.',
          en: 'There is a single category of data subjects: visitors to this site. The operator processes no employees, applicants, contracted clients or other categories through it.',
        },
        {
          ru: 'Сайт не является интернет-магазином, не принимает оплату и не заключает договоров онлайн. Всё, что здесь есть, — это портфолио и способ связаться.',
          en: 'This site is not an online store. It takes no payments and concludes no contracts online. It is a portfolio and a way to get in touch.',
        },
      ],
    },
    {
      title: { ru: 'Что собирается', en: 'What is collected' } as L,
      items: [
        {
          ru: 'Сведения о посещении, которые собирает система веб-аналитики: адрес, с которого вы пришли, просмотренные страницы, время на сайте, тип устройства и браузера, приблизительное местоположение по IP-адресу, а также запись действий на странице — движение указателя, прокрутка и нажатия.',
          en: 'Visit data collected by a web analytics service: the address you came from, pages viewed, time on site, device and browser type, approximate location by IP address, and a recording of on-page activity: pointer movement, scrolling and clicks.',
        },
        {
          ru: 'Ваш выбор в окне о файлах cookie. Он хранится в памяти вашего же браузера и никуда не передаётся.',
          en: 'Your answer in the cookie dialog. It is stored in your own browser and sent nowhere.',
        },
        {
          ru: 'Текст вопроса, если вы напишете его в блок «спросите обо мне». Что с ним происходит — отдельным пунктом ниже.',
          en: 'The text of your question, if you type one into the “ask about me” block. What happens to it is covered separately below.',
        },
        {
          ru: 'Формы регистрации на сайте нет. Имя, телефон, адрес и платёжные данные сайт не запрашивает и не хранит.',
          en: 'There is no sign-up form. The site never asks for or stores your name, phone number, address or payment details.',
        },
        {
          ru: 'Специальные категории персональных данных — о расе, национальности, политических взглядах, религии, здоровье, интимной жизни, судимости — не обрабатываются. Биометрические персональные данные не обрабатываются. Сайт не адресован детям и не собирает данные о них умышленно.',
          en: 'Special categories of personal data — race, ethnicity, political views, religion, health, sex life, criminal record — are not processed. Biometric personal data is not processed. The site is not addressed to children and does not knowingly collect data about them.',
        },
        {
          ru: 'Решения, порождающие юридические последствия, на основании исключительно автоматизированной обработки не принимаются. Профилирование в рекламных целях не ведётся.',
          en: 'No decisions with legal consequences are taken on the basis of automated processing alone. No profiling for advertising purposes is carried out.',
        },
      ],
    },
    {
      title: { ru: 'Зачем', en: 'Why' } as L,
      items: [
        {
          ru: 'Чтобы понимать, какие страницы читают, а какие закрывают на втором экране, и переделывать вторые. Других целей у сбора нет.',
          en: 'To see which pages people read and which they close on the second screen, and to rework the latter. There is no other purpose.',
        },
        {
          ru: 'Данные не используются для рекламы, не объединяются с другими базами, не продаются и не передаются третьим лицам, кроме случаев, названных ниже.',
          en: 'The data is not used for advertising, is not merged with other databases, is not sold, and is not passed to third parties except as stated below.',
        },
      ],
    },
    {
      title: { ru: 'На каком основании', en: 'On what basis' } as L,
      items: [
        {
          ru: 'На вашем согласии. До того как вы ответите в окне о файлах cookie, счётчик аналитики не загружается вообще: страница работает без него.',
          en: 'On your consent. Until you answer in the cookie dialog, the analytics counter does not load at all: the page works without it.',
        },
        {
          ru: 'Отказ ничего не ограничивает. Сайт в полном объёме работает и для тех, кто нажал «отклонить».',
          en: 'Declining limits nothing. The site works in full for anyone who chooses “decline”.',
        },
      ],
    },
    {
      title: { ru: 'Что именно делается с данными', en: 'What exactly is done with the data' } as L,
      items: [
        {
          ru: 'Перечень действий: сбор, запись, систематизация, накопление, хранение, использование, передача обработчику, обезличивание, блокирование, удаление и уничтожение.',
          en: 'The operations performed: collection, recording, organisation, accumulation, storage, use, transfer to a processor, depersonalisation, blocking, erasure and destruction.',
        },
        {
          ru: 'Способ обработки — автоматизированный, средствами сервиса веб-аналитики. Обработка без использования средств автоматизации не ведётся: бумажных и ручных картотек оператор не имеет.',
          en: 'Processing is automated, by means of the analytics service. No processing takes place without automation: the operator keeps no paper or manual records.',
        },
        {
          ru: 'Оператор не поручает обработку никому, кроме названного ниже сервиса веб-аналитики, и не размещает данные в открытом доступе.',
          en: 'The operator entrusts processing to no one other than the analytics service named below, and publishes no data.',
        },
      ],
    },
    {
      title: { ru: 'Где хранятся базы', en: 'Where the databases are held' } as L,
      items: [
        {
          ru: 'Собственной базы персональных данных у оператора нет: сайт ничего не записывает на своей стороне. Сведения о посещении накапливаются в базах сервиса веб-аналитики, расположенных на территории Российской Федерации, — как того требует часть 5 статьи 18 152-ФЗ.',
          en: 'The operator holds no personal data database of its own: the site records nothing on its side. Visit data accumulates in the analytics service’s databases located in the Russian Federation, as part 5 of article 18 of Law 152-FZ requires.',
        },
      ],
    },
    {
      title: { ru: 'Кому передаются', en: 'Who receives it' } as L,
      items: [
        {
          ru: 'Сведения о посещении обрабатывает сервис веб-аналитики, серверы которого расположены на территории Российской Федерации. Он выступает обработчиком по поручению оператора и связан собственными обязательствами по защите данных.',
          en: 'Visit data is processed by a web analytics service whose servers are located in the Russian Federation. It acts as a processor on the operator’s instructions and is bound by its own data protection obligations.',
        },
        {
          ru: 'Сайт размещён у российского хостинг-провайдера, серверы которого находятся на территории Российской Федерации. Он видит технические сведения, неизбежные при любом обращении к сайту: IP-адрес запроса и заголовки браузера. Содержимое посещения ему не передаётся.',
          en: 'The site is hosted by a Russian provider whose servers are located in the Russian Federation. It sees the technical data unavoidable in any request: the request IP address and browser headers. No visit content is passed to it.',
        },
        {
          ru: 'Государственным органам — только по мотивированному запросу в предусмотренных законом случаях.',
          en: 'To public authorities only on a reasoned request in cases provided for by law.',
        },
      ],
    },
    {
      title: {
        ru: 'Блок с вопросами',
        en: 'The question block',
      } as L,
      items: [
        {
          ru: 'Вопрос, набранный в блоке «спросите обо мне», отправляется на обработку языковой модели российского провайдера, серверы которой находятся на территории Российской Федерации. Передаётся только сам текст вопроса: запрос идёт через сервер сайта, поэтому ваш IP-адрес провайдеру модели не сообщается.',
          en: 'A question typed into the “ask about me” block is sent to a language model run by a Russian provider on servers located in the Russian Federation. Only the text itself is transmitted: the request goes through the site’s own server, so your IP address is not disclosed to the model provider.',
        },
        {
          ru: 'Ни вопрос, ни ответ на сайте не сохраняются: они существуют только в вашем браузере, пока открыта страница.',
          en: 'Neither the question nor the answer is stored by the site: both exist only in your browser while the page is open.',
        },
        {
          ru: 'Персональные данные в это поле вводить всё равно не нужно — ни свои, ни чужие. Оно предназначено для вопросов о работе и опыте. Такое же напоминание стоит на самой странице рядом с полем.',
          en: 'You still should not type personal data into that field, yours or anyone else’s. It is meant for questions about work and experience. The same reminder appears next to the field itself.',
        },
      ],
    },
    {
      title: { ru: 'Трансграничная передача', en: 'Cross-border transfer' } as L,
      items: [
        {
          ru: 'Не осуществляется. Все обработчики, к которым обращается сайт, — хостинг, веб-аналитика и языковая модель — работают на серверах в Российской Федерации.',
          en: 'None takes place. Every processor the site relies on — hosting, web analytics and the language model — runs on servers in the Russian Federation.',
        },
      ],
    },
    {
      title: { ru: 'Файлы cookie', en: 'Cookies' } as L,
      items: [
        {
          ru: 'Cookie — небольшие файлы, которые сайт сохраняет в браузере, чтобы узнавать его при следующем обращении. Сами по себе они не называют вашего имени, но по ним посетителя можно отличить от другого, поэтому здесь они считаются персональными данными и подчиняются всему сказанному выше.',
          en: 'Cookies are small files a site stores in your browser so it can recognise it on a later visit. They do not name you, but they do tell one visitor from another, so this policy treats them as personal data and everything above applies to them.',
        },
        {
          ru: 'Сайт использует cookie двух видов. Технические — ваш ответ в окне о файлах cookie; без них окно спрашивало бы одно и то же при каждом заходе. Аналитические — те, что ставит сервис веб-аналитики; они появляются только после вашего согласия и не появляются вовсе, если вы нажали «отклонить».',
          en: 'The site uses two kinds of cookie. Technical ones store your answer in the cookie dialog; without them the dialog would ask the same question on every visit. Analytics ones are set by the analytics service; they appear only after you consent, and not at all if you chose “decline”.',
        },
        {
          ru: 'Рекламных и партнёрских cookie на сайте нет. Отказаться от любых cookie можно и средствами браузера — сайт от этого не сломается.',
          en: 'There are no advertising or affiliate cookies on this site. You can refuse any cookies through your browser settings as well; the site will not break.',
        },
      ],
    },
    {
      title: { ru: 'Сколько хранится', en: 'How long it is kept' } as L,
      items: [
        {
          ru: 'Сведения о посещении — на стороне сервиса аналитики, в сроки, установленные его правилами. Оператор отдельных копий не делает и собственной базы посетителей не ведёт.',
          en: 'Visit data stays with the analytics service for the period set by its own rules. The operator keeps no separate copies and maintains no visitor database.',
        },
        {
          ru: 'Ваш ответ в окне о файлах cookie хранится в браузере, пока вы его не очистите.',
          en: 'Your cookie answer stays in your browser until you clear it.',
        },
      ],
    },
    {
      title: { ru: 'Когда обработка прекращается', en: 'When processing stops' } as L,
      items: [
        {
          ru: 'Обработка прекращается, а данные удаляются или обезличиваются в любом из четырёх случаев: цель обработки достигнута либо отпала; вы отозвали согласие; выяснилось, что данные обрабатываются неправомерно; истёк срок, на который согласие давалось.',
          en: 'Processing stops, and the data is deleted or depersonalised, in any of four cases: the purpose has been achieved or has fallen away; you withdraw consent; the processing turns out to be unlawful; or the period the consent was given for has expired.',
        },
        {
          ru: 'Оператор прекращает обработку в срок, не превышающий тридцати дней с даты, когда наступило любое из этих обстоятельств, и обращается к сервису веб-аналитики за удалением относящихся к вам сведений.',
          en: 'The operator stops processing within thirty days of any of these circumstances arising, and asks the analytics service to delete the data relating to you.',
        },
      ],
    },
    {
      title: { ru: 'Ваши права', en: 'Your rights' } as L,
      items: [
        {
          ru: 'Отозвать согласие: очистите данные сайта в настройках браузера — окно с выбором появится снова.',
          en: 'Withdraw consent: clear the site data in your browser settings and the dialog will appear again.',
        },
        {
          ru: 'Запросить сведения о том, какие ваши данные обрабатываются, и потребовать их уточнения, блокирования или уничтожения, если они неполны, устарели, получены незаконно или не нужны для заявленной цели.',
          en: 'Request information about the data being processed about you, and require it to be corrected, blocked or destroyed if it is incomplete, outdated, unlawfully obtained or unnecessary for the stated purpose.',
        },
        {
          ru: 'Запрос направляется письмом на адрес в конце страницы. В нём нужно указать фамилию, имя, отчество, сведения, подтверждающие ваше обращение к сайту (например, дату и приблизительное время посещения), и подпись — собственноручную или электронную. Ответ оператор даёт в течение тридцати дней со дня получения запроса.',
          en: 'Send the request to the address at the end of this page. It should state your full name, information confirming your visit to the site (for example, the date and approximate time), and your signature, handwritten or electronic. The operator replies within thirty days of receiving the request.',
        },
        {
          ru: 'Отозвать согласие можно и письмом. По получении оператор прекращает обработку и обращается к сервису веб-аналитики за удалением относящихся к вам сведений.',
          en: 'Consent may also be withdrawn by letter. On receipt the operator stops processing and asks the analytics service to delete the data relating to you.',
        },
        {
          ru: 'Обжаловать действия оператора можно в Роскомнадзоре как в уполномоченном органе по защите прав субъектов персональных данных или в судебном порядке.',
          en: 'The operator’s actions may be appealed to Roskomnadzor as the authority for the protection of data subjects’ rights, or in court.',
        },
      ],
    },
    {
      title: { ru: 'Как всё защищено', en: 'How it is protected' } as L,
      items: [
        {
          ru: 'Оператор принимает правовые, организационные и технические меры, требуемые статьями 18.1 и 19 152-ФЗ, соразмерно тому объёму, который здесь обрабатывается.',
          en: 'The operator takes the legal, organisational and technical measures required by articles 18.1 and 19 of Law 152-FZ, proportionate to the volume processed here.',
        },
        {
          ru: 'Практически это означает следующее. Сайт работает только по защищённому соединению. Ключи доступа к сторонним сервисам хранятся на сервере и в браузер не попадают. Собственной базы персональных данных у сайта нет, поэтому и утечь из неё нечему. Доступ к статистике есть только у оператора и защищён паролем с двухфакторным подтверждением.',
          en: 'In practice that means the following. The site works over a secure connection only. Access keys to third-party services live on the server and never reach the browser. The site holds no personal data database of its own, so there is nothing there to leak. Access to the statistics belongs to the operator alone and is protected by a password with two-factor confirmation.',
        },
      ],
    },
    {
      title: { ru: 'Изменения', en: 'Changes' } as L,
      items: [
        {
          ru: 'Новая редакция вступает в силу с момента публикации на этой странице. Дата последней редакции указана ниже.',
          en: 'A new version takes effect when it is published on this page. The date of the latest version is shown below.',
        },
      ],
    },
  ] as LegalBlock[],

  contactTitle: { ru: 'Оператор и связь', en: 'Operator and contact' } as L,
  updatedLabel: { ru: 'Редакция от', en: 'Version of' } as L,
  innLabel: { ru: 'ИНН', en: 'Tax ID' } as L,
}
