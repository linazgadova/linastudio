<?php
/**
 * БЛОК «СПРОСИТЕ ОБО МНЕ» — СЕРВЕРНАЯ ЧАСТЬ
 *
 * Четыре шага: принять вопрос, добавить к нему то, что модель знает
 * об Ангелине, спросить модель, вернуть ответ.
 *
 * Ключ живёт в config.php рядом и в браузер не попадает — иначе его
 * снял бы любой, кто открыл вкладку «Сеть».
 *
 * Знания модели лежат в .prompts.json, который собирается вместе
 * с сайтом из тех же данных, что рисуют страницы: правка проекта в
 * исходниках сразу меняет и ответы, дописывать отдельно ничего не
 * нужно. Точка перед именем не случайна — файлы, начинающиеся с точки,
 * .htaccess наружу не отдаёт.
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex');

/**
 * Обрезать строку по длине.
 *
 * mb_substr считает символы, substr — байты. На хостинге mbstring
 * стоит почти всегда, но почти не значит всегда, а падение здесь
 * молча выключило бы весь блок. Байтовая обрезка режет грубее
 * и может оставить половину буквы — для ограничителя это неважно.
 */
function clip(string $s, int $max): string
{
    return function_exists('mb_substr') ? mb_substr($s, 0, $max) : substr($s, 0, $max);
}

/**
 * Привести к нижнему регистру.
 *
 * strtolower знает только латиницу: «Пифика» после него остаётся
 * «Пифика», и поиск по приметам проекта не сработал бы ни разу.
 * Оговорка та же, что у clip: mbstring есть почти всегда.
 */
function lower(string $s): string
{
    return function_exists('mb_strtolower') ? mb_strtolower($s, 'UTF-8') : strtolower($s);
}

/** Ответить ошибкой и закончить. */
function fail(int $code, string $slug): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $slug], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'method_not_allowed');
}

/*
 * Запрос пришёл с чужого сайта?
 *
 * Ручка публичная и стоит денег: каждый вызов уходит к провайдеру
 * модели. Без проверки любой поставил бы у себя форму, дёргающую этот
 * адрес, и тратил бы чужую квоту.
 *
 * Правило обратное очевидному: не «пускать только своих», а «отклонять
 * заведомо чужих». Origin браузер обязан проставлять на межсайтовых
 * запросах и подделать его со страницы нельзя, но на своих запросах
 * его может и не быть. Требовать наличия значило бы молча отключить
 * блок у части живых людей.
 */
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && $origin !== 'null') {
    $host = parse_url($origin, PHP_URL_HOST);
    $self = $_SERVER['HTTP_HOST'] ?? '';
    $ours = $host !== null
        && ($host === $self
            || $host === 'www.' . $self
            || 'www.' . $host === $self
            || $host === 'localhost'
            || $host === '127.0.0.1');
    if (!$ours) {
        fail(403, 'forbidden');
    }
}

/* Тело больше десяти килобайт — не вопрос о работе, а попытка
   что-то сломать или дорого прокатиться за наш счёт */
$raw = file_get_contents('php://input', false, null, 0, 10_001);
if ($raw === false || strlen($raw) > 10_000) {
    fail(413, 'too_large');
}

$body = json_decode($raw, true);
if (!is_array($body)) {
    fail(400, 'bad_json');
}

$lang = (($body['lang'] ?? 'ru') === 'en') ? 'en' : 'ru';
$question = is_string($body['question'] ?? null) ? trim(clip($body['question'], 4000)) : '';
if ($question === '') {
    fail(400, 'empty_question');
}

/*
 * ДВА ОГРАНИЧИТЕЛЯ, И ОНИ ЛОВЯТ РАЗНОЕ
 *
 * Каждый вопрос уходит платному провайдеру. Считать надо не запросы,
 * а деньги: один вопрос стоит примерно полрубля, и без потолка
 * достаточно одного скучающего человека с открытой вкладкой, чтобы
 * за ночь набежал счёт в тысячи.
 *
 * Первый ограничитель — на адрес, шесть вопросов в минуту. Живому
 * человеку столько не нужно: прочитать ответ и придумать следующий
 * вопрос быстрее чем за десять секунд не выходит.
 *
 * Второй — общий на весь сайт, на сутки. Он ловит то, чего первый
 * не видит: сотню разных адресов, каждый в пределах своей нормы.
 * Упереться в него не страшно: блок не ломается, а переходит на
 * поиск по данным сайта, и это честно подписано на странице.
 *
 * Первый обходится подделкой заголовка X-Real-IP, и это известно.
 * Убрать заголовок нельзя — за прокси хостинга настоящий адрес
 * приходит только в нём, а без него все посетители сойдутся в один
 * счётчик. Поэтому деньги стережёт второй ограничитель, а первый
 * отсекает обычное частое нажатие.
 *
 * Счётчики живут файлами во временной папке. Общей памяти между
 * запросами у PHP нет, а база ради такого не окупается.
 */
$ip = $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$mark = sys_get_temp_dir() . '/zg-ask-' . sha1((string) $ip);
$now = time();
$times = is_file($mark) ? array_filter(
    array_map('intval', explode(',', (string) file_get_contents($mark))),
    static fn(int $t): bool => $now - $t < 60
) : [];

if (count($times) >= 6) {
    fail(429, 'rate_limited');
}
$times[] = $now;
@file_put_contents($mark, implode(',', $times), LOCK_EX);

/* Суточный потолок на весь сайт. Имя файла содержит дату, поэтому
   в полночь счётчик начинается заново сам, без уборки старых.
   Сама величина — в config.php, чтобы менять её без пересборки */
$dayFile = sys_get_temp_dir() . '/zg-ask-day-' . gmdate('Y-m-d');
$dayCount = is_file($dayFile) ? (int) file_get_contents($dayFile) : 0;

/* ── НАСТРОЙКИ И ЗНАНИЯ ───────────────────────────────────────── */

$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) {
    // Настроек нет — страница сама перейдёт на поиск по своим данным.
    // Это рабочий режим, а не поломка: он честно подписан
    fail(503, 'no_api_key');
}
/** @var array<string,string|int> $cfg */
$cfg = require $configFile;

$cap = (int) ($cfg['dailyCap'] ?? 100);
if ($cap > 0 && $dayCount >= $cap) {
    fail(429, 'daily_cap');
}
@file_put_contents($dayFile, (string) ($dayCount + 1), LOCK_EX);

$promptsFile = __DIR__ . '/.prompts.json';
$prompts = is_file($promptsFile)
    ? json_decode((string) file_get_contents($promptsFile), true)
    : null;
if (!is_array($prompts) || !isset($prompts['chat'][$lang])) {
    fail(500, 'no_prompts');
}
$system = (string) $prompts['chat'][$lang];
$needle = lower($question);

/*
 * ПОПЫТКА ВЫТЯНУТЬ ИНСТРУКЦИЮ
 *
 * Запрет, написанный внутри самой инструкции, не держится: проверено
 * на живом сайте, модель послушно печатала свои же правила по прямой
 * просьбе. Она маленькая, и просьба человека перевешивает написанное
 * выше. Поэтому проверка стоит здесь, до обращения к провайдеру.
 *
 * Совпало — отвечаем сами. Запрос к модели не уходит: надёжнее, и
 * такие попытки перестают стоить денег.
 */
$probe = is_array($prompts['probe'] ?? null) ? $prompts['probe'] : [];
foreach ($probe['words'] ?? [] as $w) {
    if (is_string($w) && $w !== '' && strpos($needle, $w) !== false) {
        echo (string) ($probe['reply'][$lang] ?? '');
        exit;
    }
}

/*
 * РАЗБОР ПРОЕКТА — ТОЛЬКО КОГДА ПРО НЕГО СПРОСИЛИ
 *
 * Подробный разбор всех семи проектов занимал больше половины
 * инструкции и уходил провайдеру при каждом вопросе, даже когда
 * спрашивали про опыт или про контакты. Платится это за каждый
 * запрос заново, поэтому разбор лежит отдельно и дописывается,
 * только если вопрос называет проект.
 *
 * Не больше двух: спросили «сравни Пифику и Тапси» — оба приедут,
 * а перечислить все семь названий разом уже не выйдет.
 */
$hints = is_array($prompts['hints'] ?? null) ? $prompts['hints'] : [];
$inside = is_array($prompts['inside'][$lang] ?? null) ? $prompts['inside'][$lang] : [];
$extra = [];
foreach ($hints as $id => $words) {
    if (count($extra) >= 2 || !is_array($words) || !isset($inside[$id])) {
        continue;
    }
    foreach ($words as $w) {
        if (is_string($w) && $w !== '' && strpos($needle, $w) !== false) {
            $extra[] = (string) $inside[$id];
            break;
        }
    }
}
/*
 * СПРАВКА ПО ЧАСТОМУ ВОПРОСУ
 *
 * Четыре вопроса стоят подсказками под полем ввода, и по ним щёлкают
 * первыми. Ответы на них написаны заранее и вручную — те же, что
 * отдаёт запасной режим без модели.
 *
 * Подбирается ровно одна и только по словам вопроса. Без этого выходил
 * перекос: подробности про Supabase и Postgres лежат в разборах
 * проектов, разбор приезжает только на имя проекта, а слово «бэкенд»
 * ни одного проекта не называет — и на собственную подсказку сайт
 * отвечал уклончиво.
 */
$notes = is_array($prompts['notes'][$lang] ?? null) ? $prompts['notes'][$lang] : [];
foreach ($prompts['noteHints'] ?? [] as $id => $words) {
    if (!is_array($words) || !isset($notes[$id])) {
        continue;
    }
    foreach ($words as $w) {
        if (is_string($w) && $w !== '' && strpos($needle, $w) !== false) {
            $extra[] = "Готовый ответ на такой вопрос, можно взять за основу:\n" . $notes[$id];
            break 2;
        }
    }
}

if ($extra) {
    $system .= "\n\n" . implode("\n\n", $extra);
}

/*
 * Переписка предыдущих ходов приходит от страницы, а значит от кого
 * угодно, кто умеет отправить POST. Каждое сообщение обрезается,
 * роль приводится к одной из двух известных, всё остальное
 * отбрасывается: шесть строк по мегабайту иначе прошли бы насквозь
 * к провайдеру, и счёт за них выставили бы владельцу сайта.
 */
$history = [];
if (is_array($body['history'] ?? null)) {
    foreach (array_slice($body['history'], -6) as $m) {
        if (!is_array($m) || !is_string($m['content'] ?? null)) {
            continue;
        }
        $text = trim(clip($m['content'], 1500));
        if ($text === '') {
            continue;
        }
        $history[] = [
            'role' => (($m['role'] ?? '') === 'assistant') ? 'assistant' : 'user',
            'text' => $text,
        ];
    }
}

/* ── ЗАПРОС К МОДЕЛИ ──────────────────────────────────────────── */

/**
 * Отправить и вернуть [код ответа, тело].
 *
 * Таймаут обязателен: без него зависший провайдер держит соединение
 * до упора, а человек всё это время смотрит на крутящийся индикатор.
 */
function post(string $url, array $headers, array $payload): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 25,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $out = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$code, is_string($out) ? $out : ''];
}

$provider = $cfg['provider'] ?? 'yandex';

if ($provider === 'yandex') {
    /*
     * YandexGPT. Формат отличается от привычного: роль и текст лежат
     * в поле text, а не content, и модель называется адресом вида
     * gpt://<папка>/<модель>/latest.
     */
    $messages = [['role' => 'system', 'text' => $system]];
    foreach ($history as $m) {
        $messages[] = $m;
    }
    $messages[] = ['role' => 'user', 'text' => $question];

    [$code, $out] = post(
        'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
        [
            'Content-Type: application/json',
            'Authorization: Api-Key ' . ($cfg['key'] ?? ''),
            'x-folder-id: ' . ($cfg['folder'] ?? ''),
        ],
        [
            'modelUri' => 'gpt://' . ($cfg['folder'] ?? '') . '/' . ($cfg['model'] ?? 'yandexgpt-lite') . '/latest',
            'completionOptions' => [
                'stream' => false,
                'temperature' => 0.55,
                'maxTokens' => '400',
            ],
            'messages' => $messages,
        ]
    );

    if ($code !== 200) {
        fail(502, 'upstream_failed');
    }
    $data = json_decode($out, true);
    $text = $data['result']['alternatives'][0]['message']['text'] ?? '';
} else {
    /*
     * Любой провайдер с привычным форматом: Groq, GigaChat, OpenAI.
     * Отличается только адресом и названием модели, поэтому вынесен
     * в настройки, а не в отдельную ветку кода.
     */
    $messages = [['role' => 'system', 'content' => $system]];
    foreach ($history as $m) {
        $messages[] = ['role' => $m['role'], 'content' => $m['text']];
    }
    $messages[] = ['role' => 'user', 'content' => $question];

    [$code, $out] = post(
        rtrim($cfg['base'] ?? '', '/') . '/chat/completions',
        ['Content-Type: application/json', 'Authorization: Bearer ' . ($cfg['key'] ?? '')],
        [
            'model' => $cfg['model'] ?? '',
            'messages' => $messages,
            'temperature' => 0.55,
            'max_tokens' => 400,
        ]
    );

    if ($code !== 200) {
        fail(502, 'upstream_failed');
    }
    $data = json_decode($out, true);
    $text = $data['choices'][0]['message']['content'] ?? '';
}

if (!is_string($text) || trim($text) === '') {
    fail(502, 'empty_answer');
}

/*
 * Вторая сетка — на готовый ответ.
 *
 * Первая ловит вопрос по словам, но обойти её можно, спросив теми
 * словами, которых в списке нет. Здесь проверяется уже сам ответ:
 * если в нём всплыли строки, встречающиеся только в служебной
 * инструкции, наружу он не идёт.
 *
 * Ответ при этом всё равно оплачен — модель его уже составила.
 * Зато он не будет показан, а это и есть задача.
 */
foreach ($probe['leaks'] ?? [] as $mark) {
    if (is_string($mark) && $mark !== '' && strpos($text, $mark) !== false) {
        echo (string) ($probe['reply'][$lang] ?? '');
        exit;
    }
}

echo $text;
