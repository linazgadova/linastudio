import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import * as THREE from 'three'
import { AURORA_FRAG, AURORA_VERT, LIMB_FRAG, LIMB_VERT } from './shader'
import { auroraState, sampleAurora } from './target'

/**
 * СТЕКЛЯННЫЙ ШАР
 *
 * Один шар на весь сайт. Он не появляется в каждой секции заново,
 * а перекатывается по странице: положение и размер берутся прямо из
 * прокрутки (см. target.ts), вращение — из пройденного пути.
 * Прокрутил вверх, шар катится назад и растёт обратно.
 *
 * Шар остаётся кругом всегда: он не сплющивается на разгоне и не
 * вытягивается за движением. Живёт в нём содержимое — перламутровая
 * плёнка, которая течёт внутри стеклянного объёма.
 *
 * Положение, размер, вращение и отклик на курсор считаются в одном
 * useFrame, то есть одним тактом с отрисовкой: иначе они догоняли бы
 * друг друга и шар дёргался бы.
 */

/** Черновик кватерниона для обратного поворота точки касания. */
const INV = new THREE.Quaternion()

/** Кадронезависимое сглаживание: за секунду добираем долю пути. */
function damp(rate: number, delta: number) {
  return 1 - Math.exp(-rate * delta)
}

/**
 * СТУПЕНИ КАЧЕСТВА
 *
 * Дорого в шаре обходятся три вещи: число шагов луча внутри плёнки,
 * плотность пикселей холста и проход свечения по всему кадру.
 *
 * Ступеней четыре, и по названию устройства они не выбираются:
 * у слабого ноутбука бывает восемь ядер, а у телефона быстрый
 * графический чип. Первая ступень берётся догадкой, дальше сцена
 * меряет собственную частоту кадров и опускается сама — см. Watchdog.
 */
type Tier = 'full' | 'lite' | 'min' | 'off'

const GRADE: Record<
  Exclude<Tier, 'off'>,
  { steps: number; film: number; limb: number; dpr: number | [number, number]; bloom: boolean }
> = {
  full: { steps: 16, film: 44, limb: 96, dpr: [1, 1.5], bloom: true },
  lite: { steps: 10, film: 24, limb: 48, dpr: 1, bloom: false },
  /* Последняя ступень перед отказом. Шар здесь заметно грубее:
     шесть шагов вместо шестнадцати дают видимую слоистость внутри.
     Но грубый шар лучше отсутствующего — а именно между ними и
     стоит выбор на машине, которая не тянет остальное */
  min: { steps: 6, film: 20, limb: 40, dpr: 0.7, bloom: false },
}

/**
 * Сторож частоты кадров.
 *
 * Считает среднее время кадра секундными окнами и, если три окна
 * подряд вышли медленнее порога, просит опустить ступень.
 *
 * Пороги мягкие намеренно. Сторож, срабатывающий легко, опаснее его
 * отсутствия: он проходит всю лестницу вниз за несколько секунд и
 * оставляет без шара человека, у которого просто грузилась картинка.
 * Порог стоит на двадцати четырёх кадрах в секунду, и подтвердить его
 * должны три окна подряд.
 *
 * Первые секунды не считаются: в них компилируются шейдеры, и кадры
 * там медленные на любой машине.
 */
function Watchdog({ onSlow }: { onSlow: () => void }) {
  const spent = useRef(0)
  const frames = useRef(0)
  const strikes = useRef(0)
  const warmup = useRef(0)

  useFrame((_, delta) => {
    if (warmup.current < 2) {
      warmup.current += delta
      return
    }

    spent.current += delta
    frames.current++
    if (spent.current < 1) return

    const avg = spent.current / frames.current
    spent.current = 0
    frames.current = 0

    if (avg > 1 / 24) {
      strikes.current++
      if (strikes.current >= 3) onSlow()
    } else {
      strikes.current = 0
    }
  })

  return null
}

function Orb({ grade, narrow }: { grade: (typeof GRADE)['full']; narrow: boolean }) {
  const move = useRef<THREE.Group>(null)
  const roll = useRef<THREE.Group>(null)
  const core = useRef<THREE.ShaderMaterial>(null)

  const { viewport, size } = useThree()

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uForm: { value: 0.4 },
      uIntensity: { value: 1 },
      uShift: { value: 0 },
      uRipOrigin: { value: new THREE.Vector3(0, 0, 1) },
      uRipAmp: { value: 0 },
      uHot: { value: new THREE.Color('#FF2D6F') },
      uCool: { value: new THREE.Color('#4B2BF5') },
      uMint: { value: new THREE.Color('#22C9E8') },
      /* Розовая ступень между малиновым и голубым: без неё переход
         шёл бы напрямую и давал грязный лиловый.

         Она насыщенная, а не бледная: раньше здесь стоял почти белый
         оттенок, и на него приходилась четверть цветового кольца —
         то есть четверть поверхности шара в любой момент была белёсой.
         Отсюда и брались светлые проплешины.

         Но и розовой она быть не должна. Розовая ступень рядом
         с малиновым сливается с ним, и больше половины кольца
         оказывается одного цвета — шар выходит плотным, но одноцветным.
         Сиреневая держит и то и другое: она не выцветает и остаётся
         отдельным цветом, а не оттенком соседнего */
      uSoft: { value: new THREE.Color('#B978FF') },
      uAccent: { value: new THREE.Color('#ffffff') },
      uTint: { value: 0 },
    }),
    [],
  )

  /**
   * Кромка. Она не крутится вместе с плёнкой, поэтому точка касания
   * берётся прямо из курсора, без обратного поворота: вмятина у края
   * стоит ровно там, куда наведён курсор.
   */
  const limbUniforms = useMemo(
    () => ({
      uRipOrigin: { value: new THREE.Vector3(0, 0, 1) },
      uRipAmp: { value: 0 },
      uIntensity: { value: 1 },
      /* Самый край: густой индиго, а не чёрный и не серый. Чёрный
         на светлой странице читается дырой, серый — грязью, а
         насыщенный тёмный цвет остаётся цветом даже в тени */
      uInk: { value: new THREE.Color('#4326A8') },
      /* Склон: тот же индиго, но в силе. Он уводит розовую плёнку
         в тень по краю, оставаясь при этом краской, а не пеплом */
      uGlass: { value: new THREE.Color('#5B3BE8') },
    }),
    [],
  )

  /** Те же волны, но для оболочки: она не разделяет поворот сияния. */
  const touch = useMemo(
    () => ({
      uRipTime: { value: 0 },
      uRipAmp: { value: 0 },
      uRipOrigin: { value: new THREE.Vector3(0, 0, 1) },
    }),
    [],
  )

  const rolled = useRef(0)
  const lastScroll = useRef(0)
  const started = useRef(false)
  const hover = useRef(0)
  const stir = useRef(0)
  const stirTarget = useRef(0)
  const cursor = useRef({ x: 0, y: 0, live: false })
  /** Точка касания, за которой оболочка тянется с запаздыванием. */
  const originAim = useMemo(() => new THREE.Vector3(0, 0, 1), [])

  useEffect(() => {
    function look(e: PointerEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -((e.clientY / window.innerHeight) * 2 - 1)

      // Резкое движение курсора взбалтывает воду сильнее, чем
      // медленное. Копим рывок в цель, а не в саму величину: если
      // писать прямо в неё, каждое событие указателя даёт ступеньку,
      // и вместо волны получается щелчок. В кадре величина догоняет
      // цель плавно, а цель гаснет сама
      stirTarget.current = Math.min(
        1,
        stirTarget.current + Math.hypot(nx - cursor.current.x, ny - cursor.current.y) * 1.4,
      )

      cursor.current.x = nx
      cursor.current.y = ny
      cursor.current.live = true
    }
    function leave() {
      cursor.current.live = false
    }
    window.addEventListener('pointermove', look, { passive: true })
    window.addEventListener('pointerleave', leave)
    return () => {
      window.removeEventListener('pointermove', look)
      window.removeEventListener('pointerleave', leave)
    }
  }, [])

  useFrame((state, raw) => {
    if (!move.current || !roll.current) return

    // Большой delta бывает после переключения вкладки. Без потолка
    // шар в этот кадр телепортируется через пол-экрана
    const delta = Math.min(raw, 1 / 30)
    const time = state.clock.elapsedTime

    // 1. КУДА. Прокрутка читается здесь же, в кадре отрисовки, а не
    // по событию scroll. Событие приходит вне такта отрисовки, и
    // именно рассинхрон этих двух часов давал рывки при смене
    // направления прокрутки
    const scrollY = window.scrollY
    const vh = window.innerHeight
    sampleAurora(scrollY, vh)

    /*
      На узком экране горизонтальный размах приходится ужимать —
      но не так сильно, как казалось сначала.

      Раскладка секций рассчитана на широкий монитор: там шар уезжает
      к самому краю и половина его остаётся за кадром. На телефоне
      ширина втрое меньше, и тот же уход за край вынес бы шар целиком.

      Сжимать размах вдвое, однако, оказалось хуже, чем не сжимать
      вовсе: шар оставался посреди экрана, то есть ровно под колонкой
      текста, и серые строки ложились прямо на плёнку. Теперь он
      сжат слабее и одновременно уменьшен по ширине (ниже) — уходит
      к краю, оставаясь целиком на виду, а колонка идёт по бумаге.
    */
    const spread = narrow ? 0.8 : 1
    const targetX = (auroraState.cx - 0.5) * spread * viewport.width
    const targetY = (auroraState.cy - 0.5) * viewport.height
    /*
      Радиус задан в долях высоты экрана — так шар остаётся одного
      размера на любом мониторе. На телефоне это правило ломается:
      экран там высокий и узкий, и шар в треть высоты выходит шире
      самого экрана. Он перестаёт быть предметом на странице и
      становится фоном, поверх которого нечитаемо лежит текст.

      Поэтому вторым правилом идёт потолок по ширине. Из двух величин
      берётся меньшая: на широком экране работает высота, на узком —
      ширина, и шар всегда остаётся шаром, который целиком видно.

      Множитель на телефоне ниже единицы намеренно. При 1.35 шар
      выходил шире экрана почти на треть и переставал быть предметом
      на странице: он становился фоном, а текст поверх фона — серым
      по сиреневому. При 1.15 он занимает две трети ширины: остаётся
      крупным предметом, но перестаёт быть подложкой всему экрану,
      и рядом с ним есть бумага, по которой идут строки.
    */
    const targetR = Math.min(
      auroraState.radius * viewport.height,
      auroraState.radius * viewport.width * (narrow ? 1.15 : 1.35),
    )

    // Вся плавность шара живёт в этих двух числах. Это скорость
    // догона: за секунду шар добирает такую долю оставшегося пути.
    // Чем меньше, тем длиннее у него выбег и тем спокойнее выглядят
    // переезды — ценой того, что при быстрой прокрутке он заметно
    // отстаёт. Отставание тут в плюс: оно и читается как инерция
    const k = damp(3.6, delta)
    move.current.position.x += (targetX - move.current.position.x) * k
    move.current.position.y += (targetY - move.current.position.y) * k

    // Размер догоняет цель вдвое ленивее положения. Глаз замечает
    // рывок величины гораздо охотнее, чем рывок положения: шар,
    // едущий чуть быстрее нужного, выглядит живым, а шар, дёрнувшийся
    // в размере, выглядит сломанным. Заодно этот запас съедает всё,
    // что осталось от ступенек прокрутки
    const ks = damp(2.2, delta)
    move.current.scale.setScalar(
      move.current.scale.x + (targetR - move.current.scale.x) * ks,
    )

    // 2. КУРСОР. Ищем точку на поверхности прямо под курсором —
    // из неё и пойдут круги. Пока курсор за пределами шара, точка
    // скользит по силуэту, поэтому рябь встречает его на подходе
    let near = 0
    if (cursor.current.live) {
      const px = (cursor.current.x * viewport.width) / 2
      const py = (cursor.current.y * viewport.height) / 2
      const r = Math.max(move.current.scale.x, 1e-4)
      const dx = (px - move.current.position.x) / r
      const dy = (py - move.current.position.y) / r
      const flat = dx * dx + dy * dy

      if (flat <= 1) {
        originAim.set(dx, dy, Math.sqrt(1 - flat))
      } else {
        const len = Math.sqrt(flat)
        originAim.set(dx / len, dy / len, 0)
      }

      // Точка касания догоняет курсор, а не прыгает за ним. При
      // рывке мышью центр волн иначе переносится мгновенно, и весь
      // рисунок ряби перещёлкивается целиком — это и читалось резко
      const o = touch.uRipOrigin.value
      o.lerp(originAim, damp(7, delta)).normalize()

      // Содержимое шара крутится, оболочка — нет. Без обратного
      // поворота рябь внутри уезжала бы вместе с сиянием
      coreUniforms.uRipOrigin.value
        .copy(o)
        .applyQuaternion(INV.copy(roll.current.quaternion).invert())

      // Отклик начинается заранее, за радиус до касания: вода
      // чувствует приближение, а не только прикосновение
      near = 1 - Math.min(1, Math.max(0, (Math.sqrt(flat) - 0.85) / 1.0))
      near *= near
    }
    hover.current += (near - hover.current) * damp(3.4, delta)

    // Рывок гаснет сам, а сама величина догоняет его с задержкой:
    // так у волны есть и нарастание, и спад, а не мгновенный скачок
    // на каждое движение мыши
    stirTarget.current *= Math.exp(-delta * 1.9)
    stir.current += (stirTarget.current - stir.current) * damp(4.5, delta)
    const amp = hover.current * (1 + 0.7 * stir.current)


    // 3. ПЕРЕКАТ. Знак завязан на направление прокрутки, поэтому
    // вверх шар катится обратно, а не крутится в ту же сторону
    if (!started.current) {
      lastScroll.current = scrollY
      started.current = true
    }
    const dy = scrollY - lastScroll.current
    lastScroll.current = scrollY
    rolled.current += (dy / Math.max(size.height, 1)) * Math.PI * 1.35

    roll.current.rotation.x = rolled.current
    roll.current.rotation.z = rolled.current * 0.22
    roll.current.rotation.y += delta * 0.05

    /*
      4. МАТЕРИАЛЫ

      На узком экране шар приглушается почти вдвое, и это не про
      скорость, а про текст.

      На мониторе секции построены так, что шар и колонка не
      пересекаются: он уходит к краю, текст остаётся на бумаге. На
      телефоне ширины на такое разведение нет — шар неизбежно
      оказывается под строками, и на плотной плёнке чёрный текст
      перестаёт читаться. Приглушённый шар остаётся фоном: цвет виден,
      а буквы поверх него живут.
    */
    const dim = narrow ? 0.62 : 1

    if (core.current) {
      core.current.uniforms.uTime.value = time
      core.current.uniforms.uForm.value = auroraState.form
      core.current.uniforms.uIntensity.value = auroraState.intensity * dim
      core.current.uniforms.uShift.value = auroraState.shift
      core.current.uniforms.uRipAmp.value = amp
      core.current.uniforms.uAccent.value.setRGB(
        auroraState.accent[0],
        auroraState.accent[1],
        auroraState.accent[2],
      )
      core.current.uniforms.uTint.value = auroraState.tint
    }
    touch.uRipTime.value = time
    touch.uRipAmp.value = amp
    limbUniforms.uRipAmp.value = amp
    limbUniforms.uRipOrigin.value.copy(touch.uRipOrigin.value)
    limbUniforms.uIntensity.value = auroraState.intensity * dim
  })

  return (
    <group ref={move}>
      {/*
        Шар собран из двух проходов: плёнка внутри и кромка по краю.
        Стеклянной оболочки здесь больше нет, и это стоит объяснить.

        Она была настоящим преломляющим материалом: чтобы показать, что
        видно сквозь шар, он рендерил всю сцену заново в отдельный буфер,
        и не один раз, а по числу выборок — четыре полных прохода
        на каждый кадр. Ради этого страница и листалась тяжело.

        А показывать ему было нечего. Преломление работает разницей:
        оно искажает то, что за стеклом. За этим шаром ровная светлая
        бумага, и светлое, преломлённое в светлое, остаётся светлым.
        Из всех признаков стекла на однородном фоне выживают только
        отражение вскользь и расслойка цвета у самого силуэта — а их
        рисует проход кромки, ценой одного обычного шара.

        Заодно ушли и «края двух шаров»: у оболочки была своя кайма
        преломления, у кромки — своя, и обе было видно.
      */}
      <group ref={roll} renderOrder={3}>
        <mesh>
          {/* Сетка плёнки ни на что не влияет, кроме силуэта: весь
              рисунок живёт во фрагментном шейдере. На телефоне шар
              вдвое мельче, и на такой величине разницы между 44 и 24
              долями окружности не видно */}
          <sphereGeometry args={[1, grade.film, grade.film]} />
          <shaderMaterial
            /* Смена ступени меняет defines, а материал сам по себе
               их не перечитывает: шейдер компилируется один раз.
               key заставляет создать материал заново — иначе
               спуск по лестнице не менял бы вообще ничего */
            key={grade.steps}
            ref={core}
            vertexShader={AURORA_VERT}
            fragmentShader={AURORA_FRAG}
            uniforms={coreUniforms}
            /* Число шагов луча — главная цена шара. На телефоне их
               десять вместо шестнадцати: считается в полтора раза
               быстрее, а нарезка на мелком шаре не читается */
            defines={{ STEPS: grade.steps }}
            transparent
            depthWrite={false}
            depthTest={false}
            side={THREE.FrontSide}
          />
        </mesh>
      </group>

      {/*
        Кромка идёт последней, поверх плёнки. Порядок здесь имеет
        значение: плёнка закрывает собой почти весь шар, и объём,
        нарисованный под ней, до глаза бы не дошёл.

        Она не вращается вместе с содержимым — ей и незачем. Всё,
        от чего она зависит, это угол между поверхностью и взглядом,
        а он у шара от поворота не меняется.
      */}
      <mesh renderOrder={4}>
        {/* Кромке сетка нужнее всех: по ней идёт силуэт, и на редкой
            сетке круг становится многоугольником. Но 48 долей на
            телефоне дают грань в семь пикселей — этого хватает */}
        <sphereGeometry args={[1, grade.limb, grade.limb]} />
        <shaderMaterial
          vertexShader={LIMB_VERT}
          fragmentShader={LIMB_FRAG}
          uniforms={limbUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
          side={THREE.FrontSide}
        />
      </mesh>
    </group>
  )
}

/**
 * С какой ступени начинать.
 *
 * null — проверка ещё идёт, 'off' — не запускать вовсе.
 *
 * Раньше здесь стояло грубое «уже 700 пикселей — не запускать», и
 * телефоны видели вместо шара CSS-пятно. Это неправильный размен: шар
 * и есть лицо сайта, и убирать его с половины устройств значит
 * показывать половине людей другой сайт.
 *
 * Отказ остаётся ровно для двух случаев: человек просил меньше
 * движения, и машина не умеет WebGL2. И то и другое — не про скорость.
 *
 * Оба этих случая теперь отсекаются раньше — в App, до загрузки этого
 * файла: машине, которая шар не покажет, незачем скачивать мегабайт
 * сцены, чтобы это выяснить. Там же вместо отказа встаёт шар краской
 * (aurora/flat.tsx). Проверка здесь остаётся сторожем на случай, если
 * сцену когда-нибудь смонтируют напрямую, минуя App.
 *
 * Всё остальное здесь — только догадка о первой ступени, и ошибиться
 * в ней не страшно: дальше сцена меряет себя сама.
 */
type Guess = Tier | null

function useGuess(): Guess {
  const [guess, setGuess] = useState<Guess>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setGuess('off')
    try {
      if (!document.createElement('canvas').getContext('webgl2')) return setGuess('off')
    } catch {
      return setGuess('off')
    }

    // Ширину читаем один раз и на поворот экрана не пересматриваем:
    // пересборка холста посреди просмотра заметнее, чем лишняя пара
    // шагов луча в альбомной ориентации
    const narrow = window.innerWidth < 1000
    const weak = (navigator.hardwareConcurrency ?? 4) <= 4
    const touch = window.matchMedia('(hover: none)').matches

    /* Совсем слабая машина начинает с нижней ступени, а не спускается
       к ней через две медленные секунды. Две секунды рывков — это
       ровно первое впечатление о сайте, и отдавать их сторожу
       на разведку нельзя */
    const feeble = (navigator.hardwareConcurrency ?? 4) <= 2
    if (feeble) return setGuess('min')

    setGuess(narrow || weak || touch ? 'lite' : 'full')
  }, [])

  return guess
}

/**
 * Следующая ступень вниз.
 *
 * Вверх лестница не ведёт намеренно: качели между двумя ступенями
 * заметнее, чем любая из них.
 *
 * Внизу она упирается в 'min' и до 'off' не доходит. Убрать шар
 * совсем — решение не про скорость, а про то, каким человек увидит
 * сайт, и принимать его по секундомеру нельзя. Отказ остаётся только
 * там, где он честен: человек просил меньше движения или машина
 * не умеет WebGL2.
 */
const NEXT: Record<Exclude<Tier, 'off'>, Exclude<Tier, 'off'>> = {
  full: 'lite',
  lite: 'min',
  min: 'min',
}

export function AuroraStage() {
  const guess = useGuess()
  const [tier, setTier] = useState<Tier | null>(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    if (guess) setTier(guess)
    setNarrow(window.innerWidth < 900)
  }, [guess])

  const drop = useCallback(() => {
    setTier((now) => (now && now !== 'off' ? NEXT[now] : now))
  }, [])

  /* Ступень видна в разметке: <html data-orb="lite">. Это единственный
     способ узнать со стороны, что именно показала машина — по картинке
     ступени различаются слабо, а вопрос «почему у меня шар другой»
     возникает первым */
  useEffect(() => {
    if (tier) document.documentElement.dataset.orb = tier
  }, [tier])

  if (tier === null || tier === 'off') {
    return <div className="aurora-stage aurora-stage--flat" aria-hidden="true" />
  }

  const grade = GRADE[tier]

  return (
    <div className="aurora-stage" aria-hidden="true">
      <Canvas
        /* На телефонах плотность пикселей втрое выше настольной, и
           честный dpr означал бы вчетверо больше работы там, где её
           меньше всего. Единица на мелком шаре не читается как
           пикселизация: его край рисует кромка, а она мягкая */
        dpr={grade.dpr}
        /*
          flat — это отключённая тональная компрессия. По умолчанию
          три рендерит через ACES: кривую, придуманную для кино, где
          сцена тёмная и её нужно вытянуть. На светлой странице она
          делает ровно обратное — сажает насыщенность и уводит всё
          в серо-коричневый. Именно от неё шар выглядел грязным.
        */
        flat
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 6], fov: 40 }}
      >
        {/*
          Здесь больше нет ни источников света, ни окружения, и это
          не упущение.

          И то и другое нужно физическим материалам: они смотрят, чем
          освещена сцена и что вокруг отражается. Обоих таких материалов
          в шаре не осталось — плёнку и кромку рисуют собственные
          шейдеры, у которых свет вписан прямо в код одним направлением.
          Свет, который никто не читает, всё равно считается каждый кадр,
          а карта окружения к тому же рендерит сцену в куб из шести
          сторон. Это была чистая плата ни за что.
        */}
        <Orb grade={grade} narrow={narrow} />

        {/* На нижней ступени сторожу нечего делать: спускаться некуда */}
        {tier !== 'min' && <Watchdog onSlow={drop} />}

        {/* Зернистость отсюда убрана намеренно: на светлой странице
            наложение шума садится серой пылью и пачкает именно те
            места, где стекло должно быть чистым */}
        {/* Свечение — отдельный проход по всему кадру с несколькими
            уменьшениями и размытиями. На телефоне это заметная доля
            всей работы ради еле видимого ореола, поэтому там его нет.
            Зернистость убрана и на большом экране: на светлой странице
            наложение шума садится серой пылью ровно там, где шар
            должен быть чистым */}
        {grade.bloom && (
          <EffectComposer enableNormalPass={false}>
            <Bloom intensity={0.4} luminanceThreshold={0.78} luminanceSmoothing={0.5} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
