import type { CatBreedId, DifficultyLevel, GraphicsLevel } from './tuning';
import type { ToolId } from './tools';
import type { BindableAction } from '../core/keybindings';

export type LanguageCode =
  | 'en'
  | 'fr'
  | 'de'
  | 'es'
  | 'pt'
  | 'zh'
  | 'ar'
  | 'uk'
  | 'ru'
  | 'ja'
  | 'pl'
  | 'it'
  | 'vi'
  | 'fa'
  | 'qya'
  | 'ork';

export type RightClickMode = 'jump' | 'use_tool';

export type MusicZone =
  | 'title'
  | 'rooftops'
  | 'waterfront'
  | 'swimming'
  | 'stealth'
  | 'chase'
  | 'dam_summit';

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: readonly LanguageOption[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'fr', nativeName: 'Français' },
  { code: 'de', nativeName: 'Deutsch' },
  { code: 'es', nativeName: 'Español' },
  { code: 'pt', nativeName: 'Português' },
  { code: 'zh', nativeName: '中文' },
  { code: 'ar', nativeName: 'العربية', rtl: true },
  { code: 'uk', nativeName: 'Українська' },
  { code: 'ru', nativeName: 'Русский' },
  { code: 'ja', nativeName: '日本語' },
  { code: 'pl', nativeName: 'Polski' },
  { code: 'it', nativeName: 'Italiano' },
  { code: 'vi', nativeName: 'Tiếng Việt' },
  { code: 'fa', nativeName: 'فارسی', rtl: true },
  { code: 'qya', nativeName: 'Eldarin (Elvish)' },
  { code: 'ork', nativeName: 'Orkish' },
];

export interface UiLocaleBundle {
  subtitle: string;
  startBtn: string;
  difficultyLabel: string;
  graphicsLabel: string;
  catLabel: string;
  languageLabel: string;
  rightClickLabel: string;
  rcJump: string;
  rcTool: string;
  controlsLine: string;
  touchControlsToggle: string;
  difficultyNames: Record<DifficultyLevel, string>;
  graphicsNames: Record<GraphicsLevel, string>;
  catNames: Record<CatBreedId, string>;
  catBreedTraits: Record<CatBreedId, string>;
  tools: Record<ToolId, { name: string; effect: string }>;
  musicZones: Record<MusicZone, string>;
  chapters: Record<1 | 2 | 3 | 4, { title: string; objective: string }>;
  stats: {
    fish: string;
    affection: string;
    evaded: string;
    letters: string;
    rank: string;
    chimes: string;
    wheelsGulls: string;
  };
  prompts: {
    swimLedge: string;
    swimWater: string;
    stealFish: string;
    rubPerson: string;
    tipPail: string;
    cozyNest: string;
    stalkGull: string;
    scareBird: string;
    chasedAlert: string;
    carryingFishHint: string;
    owlStealthOk: string;
    owlAlert: string;
    sleepingHint: string;
    warmthBuff: string;
    ledgeReady: string;
    purringHint: string;
    crouchingHint: string;
    swimHint: string;
    defaultHint: string;
    lanternLit: string;
    toolHint: string;
    wheelScrollHint: string;
  };
  titleHeroHint: string;
  actions: {
    pause: string;
    resume: string;
    restart: string;
    exitMenu: string;
    continueWalk: string;
    controls: string;
    fullscreenEnter: string;
    fullscreenExit: string;
    musicToggle: string;
    sfxToggle: string;
    touchJump: string;
    touchTool: string;
    touchAct: string;
    touchPurr: string;
    touchCrouch: string;
    touchNextTool: string;
    touchDash: string;
    touchSense: string;
  };
  controlsModal: {
    title: string;
    subtitle: string;
    pressAnyKey: string;
    mouseHint: string;
    resetDefaults: string;
    close: string;
    actions: Record<BindableAction, string>;
  };
  abilities: {
    dash: { name: string; hint: string };
    glide: { name: string; hint: string };
    sense: { name: string; hint: string };
  };
  modals: {
    pauseTitle: string;
    epilogueKicker: string;
    epilogueTitle: string;
    epilogueBody: string;
  };
  ranks: {
    guardian: string;
    kitten: string;
    thief: string;
    shadow: string;
    sweetheart: string;
    bellmaster: string;
  };
}

const EN_BUNDLE: UiLocaleBundle = {
  subtitle: 'Flooded Harbor · Ginger Cat Story · Resonance Chime',
  startBtn: 'Start Adventure',
  difficultyLabel: 'Difficulty',
  graphicsLabel: 'Graphics',
  catLabel: 'Cat Breed',
  languageLabel: 'Language',
  rightClickLabel: 'Right-Click',
  rcJump: 'Jump',
  rcTool: 'Use Weapon',
  controlsLine: 'WASD Move · Space/RMB Jump (Hold Glide) · X Dash · V Sense · Scroll Tool · E Fire · Q Act · F Purr',
  touchControlsToggle: 'Touch Pad',
  difficultyNames: {
    relaxed: 'Cozy Wander',
    standard: 'Harbor Prowl',
    challenger: 'Clockwork Shadow',
  },
  graphicsNames: {
    low: 'Low (Eco)',
    medium: 'Medium',
    high: 'High',
    ultra: 'Ultra',
  },
  catNames: {
    ginger: 'Ginger Tabby',
    tuxedo: 'Maine Coon',
    siamese: 'Siamese',
    calico: 'Scottish Fold',
    russian_blue: 'Kuril Bobtail',
    void: 'Bombay',
  },
  catBreedTraits: {
    ginger: 'Balanced · Classic Ears',
    tuxedo: 'Lynx Tufts · Plume Tail',
    siamese: 'Lithe · Tall Ears · Whip',
    calico: 'Folded Ears · Plush',
    russian_blue: 'Pom-Pom Tail · Compact',
    void: 'Sleek Panther · Glossy',
  },
  tools: {
    bell: { name: 'Resonance Bell', effect: 'Reveals Echo Bridges & Reverses Mills' },
    fish_sling: { name: 'Peppermint Lure', effect: 'Tosses Decoy Fish to Distract Dogs' },
    sonic_claw: { name: 'Gale Claw', effect: 'Pushes & Stuns Dogs, Scatters Gulls' },
    lantern_flare: { name: 'Dawn Flare', effect: 'Blinds Owl Beams & Calms Patrols' },
  },
  musicZones: {
    title: 'Misty Harbor Dawn',
    rooftops: 'Copper Skyline Breeze',
    waterfront: 'Canal Quay Waltz',
    swimming: 'Sunken Tide Drift',
    stealth: 'Watch-Owl Suspense',
    chase: 'Dockside Alley Dash',
    dam_summit: 'Clockwork Carillon',
  },
  chapters: {
    1: {
      title: 'Chapter I · Voice of the Harbor',
      objective: 'Descend to the quay and rub against a citizen [Q] (or purr [F])',
    },
    2: {
      title: 'Chapter II · Fish Trickster',
      objective: 'Steal 3 fish [Q], distract dogs with lures [Scroll+Fire / G] & hide in beams [F]',
    },
    3: {
      title: 'Chapter III · Call of the Sunken Chime',
      objective: 'Reverse the waterwheels with Bell [E], climb to the upper perch or Dam & chime!',
    },
    4: {
      title: 'Chapter IV · Dawn Carillon',
      objective: 'The great chimes sing again! Collect all 5 letters, chase gulls & nap by chimneys.',
    },
  },
  stats: {
    fish: 'Fish',
    affection: 'Care',
    evaded: 'Escaped',
    letters: 'Letters',
    rank: 'Rank',
    chimes: 'Chimes',
    wheelsGulls: 'Mills / Gulls',
  },
  prompts: {
    swimLedge: 'Press [Space / RMB] to leap onto the dry dock',
    swimWater: 'Swim toward stone quay, pier, or skiff [WASD + Space]',
    stealFish: '[Q] Steal fresh fish',
    rubPerson: '[Q] Rub legs & purr affectionately',
    tipPail: '[Q] Tip bait pail to distract nearby dogs',
    cozyNest: '[Q] Curl up & nap (+16% speed boost)',
    stalkGull: '[Q] Stealth pounce on gull!',
    scareBird: '[Q] Startle perched bird',
    chasedAlert: 'Harbor dog in pursuit! Sprint [Shift], toss lure [G], or use Gale Claw!',
    carryingFishHint: 'Fresh fish in jaws · Press [G] to drop bait for dogs',
    owlStealthOk: 'Phase Purr [F]: Hidden inside owl searchlight',
    owlAlert: 'Owl Searchlight! Hold [F] or fire Dawn Flare!',
    sleepingHint: 'Curled in warm sleep… Move [WASD] to wake up',
    warmthBuff: 'Cozy Warmth · +16% Speed',
    ledgeReady: '[Space / RMB] Leap onto ledge',
    purringHint: 'Purring resonance [F] active',
    crouchingHint: 'Stalking [C] · Creep close to gulls & pounce [Q]',
    swimHint: 'WASD Swim · Space/RMB Leap · X Surge · Shift Faster',
    defaultHint: 'WASD Move · Space/RMB Jump · Wheel Tool · E Use Tool · Q Act · F Purr',
    lanternLit: 'Beacon Lit',
    toolHint: 'Scroll Wheel / [1-4] Switch Tool · [E] Fire',
    wheelScrollHint: 'Wheel',
  },
  titleHeroHint: 'Click Pip to play & meow',
  actions: {
    pause: 'Pause Game',
    resume: 'Resume',
    restart: 'Restart',
    exitMenu: 'Main Menu',
    continueWalk: 'Keep Exploring',
    controls: 'Controls',
    fullscreenEnter: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    musicToggle: 'Toggle Music',
    sfxToggle: 'Toggle Sound FX',
    touchJump: 'Jump',
    touchTool: 'Fire',
    touchAct: 'Act',
    touchPurr: 'Purr',
    touchCrouch: 'Sneak',
    touchNextTool: 'Tool',
    touchDash: 'Dash',
    touchSense: 'Sense',
  },
  controlsModal: {
    title: 'Keyboard & Mouse Controls',
    subtitle: 'Click any action to rebind with keyboard or mouse button. Conflicting keys swap automatically.',
    pressAnyKey: 'Press key or click…',
    mouseHint: 'Esc cancels · Supports Left / Middle / Right mouse buttons',
    resetDefaults: 'Reset Defaults',
    close: 'Done',
    actions: {
      moveForward: 'Move Forward',
      moveBackward: 'Move Backward',
      moveLeft: 'Move Left',
      moveRight: 'Move Right',
      jump: 'Jump / Hold Glide',
      sprint: 'Sprint / Swim Fast',
      crouch: 'Crouch / Stalk',
      purr: 'Purr / Phase Stealth',
      dash: 'Shadow Dash',
      sense: 'Whisker Sense',
      useTool: 'Use Active Tool',
      interact: 'Interact / Steal / Nap',
      dropBait: 'Drop Fish Bait',
      pause: 'Pause Menu',
      reset: 'Quick Restart',
      toggleHud: 'Toggle Photo Mode HUD',
    },
  },
  abilities: {
    dash: { name: 'Shadow Dash', hint: 'Burst + i-frames through danger' },
    glide: { name: 'Moon Glide', hint: 'Hold Space in air to soar' },
    sense: { name: 'Whisker Sense', hint: 'Sonar pillars reveal secrets' },
  },
  modals: {
    pauseTitle: 'Paused',
    epilogueKicker: 'Story Complete',
    epilogueTitle: 'Dawn of the Sunken Chimes',
    epilogueBody: 'Pip’s bronze resonance awakened the great tower gears. Bells ring out over Venice’s flooded docks, earning the ginger stray his title:',
  },
  ranks: {
    guardian: 'Keeper of Sunken Chimes',
    kitten: 'Awakened Stray',
    thief: 'Terror of Fish Markets',
    shadow: 'Shadow in Owl Light',
    sweetheart: 'Harbor Sweetheart',
    bellmaster: 'Master of Brass Chime',
  },
};

const RU_BUNDLE: UiLocaleBundle = {
  subtitle: 'Затопленная гавань · История рыжего кота · Резонансный звон',
  startBtn: 'Начать игру',
  difficultyLabel: 'Сложность',
  graphicsLabel: 'Графика',
  catLabel: 'Порода котика',
  languageLabel: 'Язык',
  rightClickLabel: 'Правый клик',
  rcJump: 'Прыжок',
  rcTool: 'Оружие / Инструмент',
  controlsLine: 'WASD Шаг · Space/ПКМ Прыжок (Удерж. Планер) · X Рывок · V Чутьё · E Огонь · Q Взять · F Мур',
  touchControlsToggle: 'Сенсор',
  difficultyNames: {
    relaxed: 'Уютная прогулка',
    standard: 'Портовая охота',
    challenger: 'Тень курантов',
  },
  graphicsNames: {
    low: 'Низкая (Эко)',
    medium: 'Средняя',
    high: 'Высокая',
    ultra: 'Ультра',
  },
  catNames: {
    ginger: 'Рыжий табби',
    tuxedo: 'Мейн-кун',
    siamese: 'Сиамский',
    calico: 'Вислоухая',
    russian_blue: 'Бобтейл',
    void: 'Бомбейская',
  },
  catBreedTraits: {
    ginger: 'Ловкий · Классика',
    tuxedo: 'Кисточки · Пышный хвост',
    siamese: 'Стройный · Длинные уши',
    calico: 'Висячие уши · Плюшевый',
    russian_blue: 'Хвост-помпон · Крепкий',
    void: 'Мини-пантера · Гладкий',
  },
  tools: {
    bell: { name: 'Резонансный колокол', effect: 'Открывает мосты-эхо и крутит мельницы' },
    fish_sling: { name: 'Мятная рыбка', effect: 'Бросает приманку и отвлекает псов' },
    sonic_claw: { name: 'Вихревой коготь', effect: 'Отталкивает псов и пугает чаек' },
    lantern_flare: { name: 'Вспышка зари', effect: 'Слепит прожекторы сов и успокаивает охрану' },
  },
  musicZones: {
    title: 'Туманный рассвет гавани',
    rooftops: 'Медный бриз над крышами',
    waterfront: 'Вальс каменных причалов',
    swimming: 'Подводное течение каналов',
    stealth: 'Напряжение фонаря-совы',
    chase: 'Погоня по набережной',
    dam_summit: 'Перезвон Затопленных Курантов',
  },
  chapters: {
    1: {
      title: 'Глава I · Голос гавани',
      objective: 'Спустись к набережной и потрись о ноги жителя [Q] (или помурлычь [F])',
    },
    2: {
      title: 'Глава II · Рыбный воришка',
      objective: 'Укради 3 рыбы [Q], отвлекай псов приманкой [Колёсико+E / G] и прячься в лучах [F]',
    },
    3: {
      title: 'Глава III · Зов Затопленных Курантов',
      objective: 'Разверни мельницы звоном [E], заберись на верхнюю башню или плотину и позвони!',
    },
    4: {
      title: 'Глава IV · Рассветный перезвон',
      objective: 'Куранты поют вновь! Собери все 5 записок Марко, гоняй чаек и дремли у дымоходов.',
    },
  },
  stats: {
    fish: 'Рыба',
    affection: 'Ласка',
    evaded: 'Псы',
    letters: 'Записки',
    rank: 'Титул',
    chimes: 'Звоны',
    wheelsGulls: 'Мельницы / Чайки',
  },
  prompts: {
    swimLedge: 'Нажми [Space / ПКМ], чтобы запрыгнуть на причал',
    swimWater: 'Плыви к набережной, пирсу или лодке [WASD + Space]',
    stealFish: '[Q] Украсть свежую рыбу',
    rubPerson: '[Q] Потереться о ноги и мурлыкать',
    tipPail: '[Q] Опрокинуть ведро (отвлечь пса)',
    cozyNest: '[Q] Свернуться клубком (+16% скорость)',
    stalkGull: '[Q] Тихо прыгнуть на чайку!',
    scareBird: '[Q] Спугнуть птицу',
    chasedAlert: 'Портовый пёс гонится! Беги [Shift], брось приманку [G] или бей когтем!',
    carryingFishHint: 'Рыба в зубах · [G] бросить приманку псу',
    owlStealthOk: 'Фазовый мур [F]: Пип скрыт в луче совы',
    owlAlert: 'Прожектор совы! Зажми [F] или пусти вспышку!',
    sleepingHint: 'Пип свернулся клубком… [WASD] проснуться',
    warmthBuff: 'Тёплый сон · +16% скорость',
    ledgeReady: '[Space / ПКМ] Прыжок на уступ',
    purringHint: 'Мур-мур… Резонанс колокольчика [F]',
    crouchingHint: 'Крадётся [C] · Подбирайся к чайкам и прыгай [Q]',
    swimHint: 'WASD Плыть · Space/ПКМ На берег · X Рывок · Shift Быстрее',
    defaultHint: 'WASD Шаг · Space/ПКМ Прыжок · Колёсико Оружие · E Огонь · Q Действие · F Мур',
    lanternLit: 'Фонарь зажжён',
    toolHint: 'Колёсико / [1-4] Выбор · [E] Применить',
    wheelScrollHint: 'Колёсико',
  },
  titleHeroHint: 'Кликни по Пипу — он мяукнет и подпрыгнет',
  actions: {
    pause: 'Пауза',
    resume: 'Продолжить',
    restart: 'Начать заново',
    exitMenu: 'В меню',
    continueWalk: 'Продолжить прогулку',
    controls: 'Управление',
    fullscreenEnter: 'Полный экран',
    fullscreenExit: 'Выйти из полного экрана',
    musicToggle: 'Музыка',
    sfxToggle: 'Звуки эффектов',
    touchJump: 'Прыг',
    touchTool: 'Удар',
    touchAct: 'Взять',
    touchPurr: 'Мур',
    touchCrouch: 'Тихо',
    touchNextTool: 'Снаряд',
    touchDash: 'Рывок',
    touchSense: 'Чутьё',
  },
  controlsModal: {
    title: 'Управление: клавиатура и мышь',
    subtitle: 'Нажми на действие, затем клавишу или кнопку мыши. Конфликтные клавиши меняются местами.',
    pressAnyKey: 'Нажми клавишу или клик…',
    mouseHint: 'Esc отменяет · Поддерживаются ЛКМ / СКМ / ПКМ',
    resetDefaults: 'Сбросить по умолчанию',
    close: 'Готово',
    actions: {
      moveForward: 'Вперёд',
      moveBackward: 'Назад',
      moveLeft: 'Влево',
      moveRight: 'Вправо',
      jump: 'Прыжок / Планер (удерж.)',
      sprint: 'Бег / Быстрый заплыв',
      crouch: 'Красться',
      purr: 'Мурлыкать / Скрытность',
      dash: 'Рывок Кометы',
      sense: 'Кошачье чутьё',
      useTool: 'Применить инструмент',
      interact: 'Взаимодействие / Взять / Сон',
      dropBait: 'Бросить приманку',
      pause: 'Пауза',
      reset: 'Быстрый рестарт',
      toggleHud: 'Фоторежим (скрыть HUD)',
    },
  },
  abilities: {
    dash: { name: 'Рывок Кометы', hint: 'Быстрый рывок и уворот' },
    glide: { name: 'Лунный планер', hint: 'Держи Space в воздухе' },
    sense: { name: 'Кошачье чутьё', hint: 'Сонар-лучи к целям и секретам' },
  },
  modals: {
    pauseTitle: 'Пауза',
    epilogueKicker: 'История завершена',
    epilogueTitle: 'Рассвет Затопленных Курантов',
    epilogueBody: 'Резонанс колокольчика Пипа разбудил главные шестерни башни. Жители гавани вновь слышат бой курантов, а рыжий бродяга получил титул:',
  },
  ranks: {
    guardian: 'Хранитель Затопленных Курантов',
    kitten: 'Проснувшийся котёнок',
    thief: 'Гроза рыбных лавок',
    shadow: 'Тень в свете совы',
    sweetheart: 'Любимец набережной',
    bellmaster: 'Мастер медного звона',
  },
};

function makeVariant(
  patch: Partial<
    Omit<
      UiLocaleBundle,
      | 'difficultyNames'
      | 'graphicsNames'
      | 'catNames'
      | 'catBreedTraits'
      | 'tools'
      | 'musicZones'
      | 'chapters'
      | 'stats'
      | 'prompts'
      | 'actions'
      | 'controlsModal'
      | 'abilities'
      | 'modals'
      | 'ranks'
    >
  > & {
    difficultyNames?: Partial<UiLocaleBundle['difficultyNames']>;
    graphicsNames?: Partial<UiLocaleBundle['graphicsNames']>;
    catNames?: Partial<UiLocaleBundle['catNames']>;
    catBreedTraits?: Partial<UiLocaleBundle['catBreedTraits']>;
    tools?: Partial<UiLocaleBundle['tools']>;
    musicZones?: Partial<UiLocaleBundle['musicZones']>;
    chapters?: Partial<UiLocaleBundle['chapters']>;
    stats?: Partial<UiLocaleBundle['stats']>;
    prompts?: Partial<UiLocaleBundle['prompts']>;
    actions?: Partial<UiLocaleBundle['actions']>;
    controlsModal?: Partial<Omit<UiLocaleBundle['controlsModal'], 'actions'>> & {
      actions?: Partial<UiLocaleBundle['controlsModal']['actions']>;
    };
    abilities?: Partial<UiLocaleBundle['abilities']>;
    modals?: Partial<UiLocaleBundle['modals']>;
    ranks?: Partial<UiLocaleBundle['ranks']>;
  },
  base: UiLocaleBundle = EN_BUNDLE
): UiLocaleBundle {
  return {
    ...base,
    ...patch,
    difficultyNames: { ...base.difficultyNames, ...patch.difficultyNames },
    graphicsNames: { ...base.graphicsNames, ...patch.graphicsNames },
    catNames: { ...base.catNames, ...patch.catNames },
    catBreedTraits: { ...base.catBreedTraits, ...patch.catBreedTraits },
    tools: { ...base.tools, ...patch.tools },
    musicZones: { ...base.musicZones, ...patch.musicZones },
    chapters: { ...base.chapters, ...patch.chapters },
    stats: { ...base.stats, ...patch.stats },
    prompts: { ...base.prompts, ...patch.prompts },
    actions: { ...base.actions, ...patch.actions },
    controlsModal: {
      ...base.controlsModal,
      ...patch.controlsModal,
      actions: {
        ...base.controlsModal.actions,
        ...patch.controlsModal?.actions,
      },
    },
    abilities: { ...base.abilities, ...patch.abilities },
    modals: { ...base.modals, ...patch.modals },
    ranks: { ...base.ranks, ...patch.ranks },
  };
}

export const LOCALES: Record<LanguageCode, UiLocaleBundle> = {
  en: EN_BUNDLE,
  ru: RU_BUNDLE,
  uk: makeVariant({
    subtitle: 'Затоплена гавань · Історія рудого кота · Резонансний дзвін',
    startBtn: 'Почати гру',
    difficultyLabel: 'Складність',
    graphicsLabel: 'Графіка',
    catLabel: 'Порода котика',
    languageLabel: 'Мова',
    rightClickLabel: 'Правий клік',
    rcJump: 'Стрибок',
    rcTool: 'Зброя',
    touchControlsToggle: 'Сенсор',
    difficultyNames: { relaxed: 'Затишна прогулянка', standard: 'Портове полювання', challenger: 'Тінь курантів' },
    graphicsNames: { low: 'Низька (Еко)', medium: 'Середня', high: 'Висока', ultra: 'Ультра' },
    catNames: { ginger: 'Рудий таббі', tuxedo: 'Мейн-кун', siamese: 'Сіамський', calico: 'Висловуха', russian_blue: 'Бобтейл', void: 'Бомбейська' },
    catBreedTraits: {
      ginger: 'Спритний · Класика',
      tuxedo: 'Пензлики · Пишний хвіст',
      siamese: 'Стрункий · Довгі вуха',
      calico: 'Висячі вуха · Плюшева',
      russian_blue: 'Хвіст-помпон · Міцний',
      void: 'Міні-пантера · Гладкий',
    },
    tools: {
      bell: { name: 'Резонансний дзвін', effect: 'Відкриває мости-ехо і крутить млини' },
      fish_sling: { name: 'М’ятна рибка', effect: 'Кидає приманку й відволікає псів' },
      sonic_claw: { name: 'Вихровий кіготь', effect: 'Відштовхує псів та лякає чайок' },
      lantern_flare: { name: 'Спалах зорі', effect: 'Сліпить прожектори сов' },
    },
    musicZones: {
      title: 'Туманний світанок',
      rooftops: 'Бриз над дахами',
      waterfront: 'Вальс причалів',
      swimming: 'Підводна течія',
      stealth: 'Тінь сови',
      chase: 'Погоня в порту',
      dam_summit: 'Передзвін курантів',
    },
    chapters: {
      1: { title: 'Розділ I · Голос гавані', objective: 'Спустися на причал і потрись об перехожого [Q] або замуркочи [F]' },
      2: { title: 'Розділ II · Рибний злодюжка', objective: 'Поцуп 3 риби [Q], відволікай псів приманкою [Колесо+E] і ховайся [F]' },
      3: { title: 'Розділ III · Поклик курантів', objective: 'Розверни млини дзвоном [E], піднімися на греблю й подзвони!' },
      4: { title: 'Розділ IV · Світанковий передзвін', objective: 'Збери 5 листів Марко, полюй на чайок і дрімай біля димарів.' },
    },
    stats: { fish: 'Риба', affection: 'Ласка', evaded: 'Пси', letters: 'Листи', rank: 'Титул', chimes: 'Дзвони', wheelsGulls: 'Млини / Чайки' },
    prompts: {
      swimLedge: 'Натисни [Space / ПКМ], щоб стрибнути на берег',
      swimWater: 'Пливи до кам’яного причалу чи човна [WASD + Space]',
      stealFish: '[Q] Вкрасти свіжу рибу',
      rubPerson: '[Q] Потертися об ноги',
      tipPail: '[Q] Перекинути відро (відволікти пса)',
      cozyNest: '[Q] Згорнутися клубком (+16% швидкість)',
      stalkGull: '[Q] Стрибнути на чайку!',
      scareBird: '[Q] Сполохати птаха',
      chasedAlert: 'Портовий пес женеться! Біжи [Shift] або кинь приманку!',
      carryingFishHint: 'Риба в зубах · [G] кинути приманку',
      owlStealthOk: 'Фазове мур [F]: приховано у світлі сови',
      owlAlert: 'Прожектор сови! Затисни [F]!',
      sleepingHint: 'Кіт дрімає… [WASD] прокинутися',
      warmthBuff: 'Теплий сон · +16% швидкість',
      ledgeReady: '[Space / ПКМ] Стрибок на виступ',
      purringHint: 'Муркотіння [F] активне',
      crouchingHint: 'Підкрадається [C] · Плигай на чайок [Q]',
      swimHint: 'WASD Пливти · Space / ПКМ На берег',
      defaultHint: 'WASD Рух · Space/ПКМ Стрибок · Колесо Зброя · E Дія',
      lanternLit: 'Ліхтар запалено',
      toolHint: 'Колесо / [1-4] Вибір · [E] Застосувати',
      wheelScrollHint: 'Колесо',
    },
    titleHeroHint: 'Натисни на Піпа — він нявкне і підстрибне',
    actions: { pause: 'Пауза', resume: 'Далі', restart: 'Спочатку', exitMenu: 'У меню', continueWalk: 'Прогулянка', controls: 'Керування', fullscreenEnter: 'На весь екран', fullscreenExit: 'Вийти з повного екрана', musicToggle: 'Музика', sfxToggle: 'Звуки', touchJump: 'Стриб', touchTool: 'Удар', touchAct: 'Взяти', touchPurr: 'Мур', touchCrouch: 'Тихо', touchNextTool: 'Зброя' },
    controlsModal: {
      title: 'Керування: клавіатура і миша',
      subtitle: 'Натисни на дію, потім клавішу або кнопку миші. Конфліктні клавіші обмінюються.',
      pressAnyKey: 'Натисни клавішу…',
      mouseHint: 'Esc скасовує · Підтримка ЛКМ / СКМ / ПКМ',
      resetDefaults: 'Скинути за замовчуванням',
      close: 'Готово',
      actions: {
        moveForward: 'Вперед', moveBackward: 'Назад', moveLeft: 'Вліво', moveRight: 'Вправо',
        jump: 'Стрибок / Планер', sprint: 'Біг / Пливти швидше', crouch: 'Крастися', purr: 'Муркотіти / Тінь',
        dash: 'Ривок Комети', sense: 'Котяче чуття', useTool: 'Інструмент', interact: 'Дія / Взяти / Сон',
        dropBait: 'Кинути приманку', pause: 'Пауза', reset: 'Швидкий рестарт', toggleHud: 'Фоторежим (HUD)',
      },
    },
    modals: { pauseTitle: 'Пауза', epilogueKicker: 'Історія завершена', epilogueTitle: 'Світанок Затоплених Курантів', epilogueBody: 'Передзвін розбудив стару вежу, а рудий бродяга здобув титул:' },
    ranks: { guardian: 'Охоронець Курантів', kitten: 'Пробуджений котик', thief: 'Гроза рибних яток', shadow: 'Тінь у світлі сови', sweetheart: 'Улюбленець порту', bellmaster: 'Майстер дзвону' },
  }),
  fr: makeVariant({
    subtitle: 'Port Englouti · Histoire du Chat Roux · Carillon d’Aube',
    startBtn: 'Commencer',
    difficultyLabel: 'Difficulté',
    graphicsLabel: 'Graphismes',
    catLabel: 'Choix du Chat',
    languageLabel: 'Langue',
    rightClickLabel: 'Clic Droit',
    rcJump: 'Sauter',
    rcTool: 'Arme / Outil',
    touchControlsToggle: 'Tactile',
    difficultyNames: { relaxed: 'Promenade Douce', standard: 'Ronde du Port', challenger: 'Ombre Horlogère' },
    graphicsNames: { low: 'Bas (Éco)', medium: 'Moyen', high: 'Élevé', ultra: 'Ultra' },
    catNames: { ginger: 'Roux Pip', tuxedo: 'Smoking', siamese: 'Siamois', calico: 'Calicot', russian_blue: 'Bleu Russe', void: 'Panthère' },
    tools: {
      bell: { name: 'Cloche Résonante', effect: 'Révèle les ponts-écho et inverse les moulins' },
      fish_sling: { name: 'Leurre Mentholé', effect: 'Lance un poisson pour distraire les chiens' },
      sonic_claw: { name: 'Griffe de Galerne', effect: 'Repousse les chiens et disperse les mouettes' },
      lantern_flare: { name: 'Éclat d’Aurore', effect: 'Éblouit les hiboux et calme les patrouilles' },
    },
    musicZones: { title: 'Aube Brumeuse', rooftops: 'Brise sur les Toits', waterfront: 'Valse des Quais', swimming: 'Courant du Canal', stealth: 'Veille du Hibou', chase: 'Course sur les Docks', dam_summit: 'Carillon Horloger' },
    chapters: {
      1: { title: 'Chapitre I · Voix du Port', objective: 'Descendez sur le quai et frottez-vous aux passants [Q] ou ronronnez [F]' },
      2: { title: 'Chapitre II · Voleur de Poissons', objective: 'Volez 3 poissons [Q], distrayez les chiens [Molette+E] et cachez-vous [F]' },
      3: { title: 'Chapitre III · Appel du Carillon', objective: 'Inversez les roues [E], grimpez sur le barrage et sonnez la cloche!' },
      4: { title: 'Chapitre IV · Réveil des Cloches', objective: 'Trouvez les 5 lettres de Marco, chassez les mouettes et dormez près des cheminées.' },
    },
    stats: { fish: 'Poisson', affection: 'Câlins', evaded: 'Esquives', letters: 'Lettres', rank: 'Rang', chimes: 'Carillons', wheelsGulls: 'Moulins / Mouettes' },
    titleHeroHint: 'Cliquez sur Pip pour le faire miauler',
    actions: { pause: 'Pause', resume: 'Reprendre', restart: 'Recommencer', exitMenu: 'Menu Principal', continueWalk: 'Explorer', controls: 'Contrôles', fullscreenEnter: 'Plein Écran', fullscreenExit: 'Quitter Plein Écran', musicToggle: 'Musique', sfxToggle: 'Effets Sonores', touchJump: 'Saut', touchTool: 'Outil', touchAct: 'Agir', touchPurr: 'Ronron', touchCrouch: 'Furtif', touchNextTool: 'Arme' },
    controlsModal: {
      title: 'Contrôles Clavier & Souris',
      subtitle: 'Cliquez sur une action puis appuyez sur une touche ou un bouton de souris.',
      pressAnyKey: 'Appuyez sur une touche…',
      mouseHint: 'Échap annule · Boutons Gauche / Milieu / Droit pris en charge',
      resetDefaults: 'Réinitialiser',
      close: 'Terminer',
      actions: {
        moveForward: 'Avancer', moveBackward: 'Reculer', moveLeft: 'Gauche', moveRight: 'Droite',
        jump: 'Sauter / Planer', sprint: 'Sprinter', crouch: 'S’accroupir', purr: 'Ronronner',
        dash: 'Ruée d’Ombre', sense: 'Sens Félin', useTool: 'Utiliser l’Outil', interact: 'Agir / Voler / Sieste',
        dropBait: 'Lâcher Appât', pause: 'Pause', reset: 'Redémarrer', toggleHud: 'Masquer l’ATH',
      },
    },
    modals: { pauseTitle: 'Pause', epilogueKicker: 'Histoire Terminée', epilogueTitle: 'L’Aube des Cloches Englouties', epilogueBody: 'La résonance de Pip a réveillé les engrenages du port, lui valant le titre de :' },
  }),
  de: makeVariant({
    subtitle: 'Versunkener Hafen · Geschichte des roten Katers · Glockenspiel',
    startBtn: 'Spiel Starten',
    difficultyLabel: 'Schwierigkeit',
    graphicsLabel: 'Grafik',
    catLabel: 'Katze wählen',
    languageLabel: 'Sprache',
    rightClickLabel: 'Rechtsklick',
    rcJump: 'Springen',
    rcTool: 'Waffe nutzen',
    touchControlsToggle: 'Touch-Pad',
    difficultyNames: { relaxed: 'Gemütlicher Streifzug', standard: 'Hafenstreife', challenger: 'Uhrwerk-Schatten' },
    graphicsNames: { low: 'Niedrig (Öko)', medium: 'Mittel', high: 'Hoch', ultra: 'Ultra' },
    catNames: { ginger: 'Roter Pip', tuxedo: 'Frackkatze', siamese: 'Siamese', calico: 'Glückskatze', russian_blue: 'Blaugrau', void: 'Panther' },
    tools: {
      bell: { name: 'Resonanzglocke', effect: 'Zeigt Echobrücken & dreht Mühlenräder' },
      fish_sling: { name: 'Minz-Köderfisch', effect: 'Lenkt Hafen-Hunde sofort mit Fisch ab' },
      sonic_claw: { name: 'Sturmkralle', effect: 'Stößt Hunde weg & scheucht Möwen auf' },
      lantern_flare: { name: 'Morgenlicht', effect: 'Blendet Eulen-Suchscheinwerfer' },
    },
    musicZones: { title: 'Nebliger Morgen', rooftops: 'Dachfirst-Brise', waterfront: 'Kai-Walzer', swimming: 'Kanalströmung', stealth: 'Eulenlicht-Spannung', chase: 'Hunde-Verfolgung', dam_summit: 'Großes Glockenspiel' },
    chapters: {
      1: { title: 'Kapitel I · Stimme des Hafens', objective: 'Klettere zum Kai und streife um Beine [Q] oder schnurre [F]' },
      2: { title: 'Kapitel II · Fischdieb', objective: 'Stiehl 3 Fische [Q], lenke Hunde ab [Mausrad+E] & tarne dich [F]' },
      3: { title: 'Kapitel III · Ruf des Glockenturms', objective: 'Drehe Wasserräder per Glocke [E], klettere auf den Damm & läute!' },
      4: { title: 'Kapitel IV · Morgendämmerung', objective: 'Sammle 5 Briefe Marcos, jage Möwen & schlafe an Kaminen.' },
    },
    stats: { fish: 'Fisch', affection: 'Zuneigung', evaded: 'Entkommen', letters: 'Briefe', rank: 'Titel', chimes: 'Glocken', wheelsGulls: 'Mühlen / Möwen' },
    titleHeroHint: 'Klicke auf Pip für einen Sprung & Miau',
    actions: { pause: 'Pause', resume: 'Weiter', restart: 'Neustart', exitMenu: 'Hauptmenü', continueWalk: 'Erkunden', controls: 'Steuerung', fullscreenEnter: 'Vollbild', fullscreenExit: 'Vollbild beenden', musicToggle: 'Musik', sfxToggle: 'Effekte', touchJump: 'Sprung', touchTool: 'Waffe', touchAct: 'Aktion', touchPurr: 'Schnurr', touchCrouch: 'Schleich', touchNextTool: 'Wechseln' },
    controlsModal: {
      title: 'Tastatur & Maus-Steuerung',
      subtitle: 'Klicke auf eine Aktion und drücke eine Taste oder Maustaste.',
      pressAnyKey: 'Taste drücken…',
      mouseHint: 'Esc bricht ab · Links-, Mittel- & Rechtsklick unterstützt',
      resetDefaults: 'Zurücksetzen',
      close: 'Fertig',
      actions: {
        moveForward: 'Vorwärts', moveBackward: 'Rückwärts', moveLeft: 'Links', moveRight: 'Rechts',
        jump: 'Springen / Gleiten', sprint: 'Sprinten', crouch: 'Schleichen', purr: 'Schnurren',
        dash: 'Schattensprint', sense: 'Katzensinn', useTool: 'Werkzeug nutzen', interact: 'Interagieren / Schlaf',
        dropBait: 'Köder fallen lassen', pause: 'Pause', reset: 'Neustart', toggleHud: 'HUD ausblenden',
      },
    },
    modals: { pauseTitle: 'Pause', epilogueKicker: 'Geschichte Abgeschlossen', epilogueTitle: 'Morgenröte der Glocken', epilogueBody: 'Pips Messingklang weckte das Uhrwerk des Hafens und verlieh ihm den Titel:' },
  }),
  es: makeVariant({
    subtitle: 'Puerto Sumergido · El Gato Pelirrojo · Campana de Resonancia',
    startBtn: 'Iniciar Aventura',
    difficultyLabel: 'Dificultad',
    graphicsLabel: 'Gráficos',
    catLabel: 'Elegir Gato',
    languageLabel: 'Idioma',
    rightClickLabel: 'Clic Derecho',
    rcJump: 'Saltar',
    rcTool: 'Usar Arma',
    touchControlsToggle: 'Táctil',
    difficultyNames: { relaxed: 'Paseo Tranquilo', standard: 'Ronda Portuaria', challenger: 'Sombra Mecánica' },
    graphicsNames: { low: 'Bajo (Eco)', medium: 'Medio', high: 'Alto', ultra: 'Ultra' },
    catNames: { ginger: 'Pelirrojo', tuxedo: 'Esmoquin', siamese: 'Siamés', calico: 'Tricolor', russian_blue: 'Azul Ruso', void: 'Pantera' },
    tools: {
      bell: { name: 'Campana Resonante', effect: 'Revela puentes eco e invierte molinos' },
      fish_sling: { name: 'Cebo de Menta', effect: 'Lanza pescado para distraer a los perros' },
      sonic_claw: { name: 'Garra Vendaval', effect: 'Empuja perros y espanta gaviotas' },
      lantern_flare: { name: 'Bengala del Alba', effect: 'Ciega los reflectores búho' },
    },
    musicZones: { title: 'Alba Brumosa', rooftops: 'Brisa en Tejados', waterfront: 'Vals del Muelle', swimming: 'Marea del Canal', stealth: 'Sigilo del Búho', chase: 'Persecución en Muelle', dam_summit: 'Carrillón del Alba' },
    stats: { fish: 'Peces', affection: 'Mimos', evaded: 'Evasiones', letters: 'Cartas', rank: 'Título', chimes: 'Toques', wheelsGulls: 'Molinos / Gaviotas' },
    titleHeroHint: 'Haz clic en Pip para que maúlle y salte',
    actions: { pause: 'Pausa', resume: 'Continuar', restart: 'Reiniciar', exitMenu: 'Menú Principal', continueWalk: 'Explorar', controls: 'Controles', fullscreenEnter: 'Pantalla Completa', fullscreenExit: 'Salir Pantalla Completa', musicToggle: 'Música', sfxToggle: 'Sonidos', touchJump: 'Saltar', touchTool: 'Arma', touchAct: 'Acción', touchPurr: 'Ronronear', touchCrouch: 'Sigilo', touchNextTool: 'Siguiente' },
    controlsModal: {
      title: 'Controles de Teclado y Ratón',
      subtitle: 'Haz clic en una acción y pulsa una tecla o botón del ratón.',
      pressAnyKey: 'Pulsa una tecla…',
      mouseHint: 'Esc cancela · Compatible con botones Izq / Centro / Der',
      resetDefaults: 'Restablecer',
      close: 'Listo',
      actions: {
        moveForward: 'Avanzar', moveBackward: 'Retroceder', moveLeft: 'Izquierda', moveRight: 'Derecha',
        jump: 'Saltar / Planear', sprint: 'Esprintar', crouch: 'Agacharse', purr: 'Ronronear',
        dash: 'Impulso Sombrío', sense: 'Sentido Felino', useTool: 'Usar Herramienta', interact: 'Actuar / Robar / Siesta',
        dropBait: 'Soltar Cebo', pause: 'Pausa', reset: 'Reiniciar', toggleHud: 'Ocultar HUD',
      },
    },
    modals: { pauseTitle: 'Pausa', epilogueKicker: 'Historia Completa', epilogueTitle: 'Amanecer del Carrillón', epilogueBody: 'La campana de Pip despertó los engranajes del puerto y le otorgó el título:' },
  }),
  pt: makeVariant({
    subtitle: 'Porto Submerso · Gato Ruivo · Sino Ressonante',
    startBtn: 'Começar Jogo',
    difficultyLabel: 'Dificuldade',
    graphicsLabel: 'Gráficos',
    catLabel: 'Escolher Gato',
    languageLabel: 'Idioma',
    rightClickLabel: 'Botão Direito',
    rcJump: 'Pular',
    rcTool: 'Usar Arma',
    touchControlsToggle: 'Toque',
    difficultyNames: { relaxed: 'Passeio Calmo', standard: 'Ronda no Cais', challenger: 'Sombra do Relógio' },
    graphicsNames: { low: 'Baixo (Eco)', medium: 'Médio', high: 'Alto', ultra: 'Ultra' },
    catNames: { ginger: 'Ruivo Pip', tuxedo: 'Frajola', siamese: 'Siamês', calico: 'Tricolor', russian_blue: 'Cinza Azul', void: 'Pantera' },
    tools: {
      bell: { name: 'Sino Ressonante', effect: 'Revela pontes-eco e inverte moinhos' },
      fish_sling: { name: 'Isca de Hortelã', effect: 'Joga peixe para distrair cães' },
      sonic_claw: { name: 'Garra Vendaval', effect: 'Empurra cães e espanta gaivotas' },
      lantern_flare: { name: 'Clarão da Aurora', effect: 'Cega holofotes de coruja' },
    },
    stats: { fish: 'Peixes', affection: 'Carinho', evaded: 'Fugas', letters: 'Cartas', rank: 'Título', chimes: 'Sinos', wheelsGulls: 'Moinhos / Gaivotas' },
    titleHeroHint: 'Clique em Pip para miar e pular',
    actions: { pause: 'Pausa', resume: 'Retomar', restart: 'Reiniciar', exitMenu: 'Menu Principal', continueWalk: 'Explorar', controls: 'Controles', fullscreenEnter: 'Tela Cheia', fullscreenExit: 'Sair Tela Cheia', musicToggle: 'Música', sfxToggle: 'Efeitos', touchJump: 'Pular', touchTool: 'Arma', touchAct: 'Agir', touchPurr: 'Ronronar', touchCrouch: 'Esgueirar', touchNextTool: 'Trocar' },
    controlsModal: {
      title: 'Controles de Teclado e Mouse',
      subtitle: 'Clique em uma ação e pressione uma tecla ou botão do mouse.',
      pressAnyKey: 'Pressione tecla…',
      mouseHint: 'Esc cancela · Suporta botões Esq / Meio / Dir do mouse',
      resetDefaults: 'Restaurar Padrões',
      close: 'Concluir',
      actions: {
        moveForward: 'Avançar', moveBackward: 'Recuar', moveLeft: 'Esquerda', moveRight: 'Direita',
        jump: 'Pular / Planear', sprint: 'Correr', crouch: 'Agachar', purr: 'Ronronar',
        dash: 'Arrancada', sense: 'Sentido Felino', useTool: 'Usar Ferramenta', interact: 'Agir / Pegar / Soneca',
        dropBait: 'Soltar Isca', pause: 'Pausa', reset: 'Reiniciar', toggleHud: 'Ocultar HUD',
      },
    },
  }),
  zh: makeVariant({
    subtitle: '沉没钟楼港 · 橘猫物语 · 共鸣铜铃',
    startBtn: '开始冒险',
    difficultyLabel: '难度',
    graphicsLabel: '画质',
    catLabel: '选择猫咪',
    languageLabel: '语言',
    rightClickLabel: '右键动作',
    rcJump: '跳跃',
    rcTool: '使用武器',
    touchControlsToggle: '触控手柄',
    difficultyNames: { relaxed: '悠闲漫步', standard: '海港潜行', challenger: '暗影钟表' },
    graphicsNames: { low: '低 (节能)', medium: '中', high: '高', ultra: '极致' },
    catNames: { ginger: '橘猫皮普', tuxedo: '奶牛警长', siamese: '暹罗', calico: '三花猫', russian_blue: '蓝猫', void: '黑豹' },
    tools: {
      bell: { name: '共鸣铜铃', effect: '显现幻影桥并反转水车齿轮' },
      fish_sling: { name: '薄荷鱼饵', effect: '投掷鲜鱼诱饵引开港犬' },
      sonic_claw: { name: '疾风音爪', effect: '击退追击猎犬并惊飞海鸥' },
      lantern_flare: { name: '晨曦信号弹', effect: '致盲猫头鹰探照灯并安抚巡逻' },
    },
    musicZones: { title: '晨雾海港', rooftops: '屋顶清风', waterfront: '码头华尔兹', swimming: '运河浮潮', stealth: '枭灯潜行', chase: '码头追逐', dam_summit: '大坝钟鸣' },
    chapters: {
      1: { title: '第一章 · 海港之声', objective: '下到石砌码头并蹭行人裤脚 [Q]（或呼噜 [F]）' },
      2: { title: '第二章 · 偷鱼小能手', objective: '偷取3条鲜鱼 [Q]，用滚轮武器或 [G] 引开港犬，探照灯下按 [F]' },
      3: { title: '第三章 · 沉钟呼唤', objective: '用铜铃 [E] 反转水车登上大坝高塔并敲响钟声！' },
      4: { title: '第四章 · 黎明钟乐', objective: '钟声重鸣！收集5封马可信件，潜近海鸥并依偎烟囱午睡。' },
    },
    stats: { fish: '偷鱼', affection: '亲昵', evaded: '甩开狗', letters: '信件', rank: '称号', chimes: '鸣铃', wheelsGulls: '水车 / 海鸥' },
    titleHeroHint: '点击小橘皮普查看互动与喵叫',
    actions: { pause: '暂停', resume: '继续游戏', restart: '重新开始', exitMenu: '返回主菜单', continueWalk: '继续漫步', controls: '键位设置', fullscreenEnter: '全屏模式', fullscreenExit: '退出全屏', musicToggle: '背景音乐', sfxToggle: '音效开关', touchJump: '跳跃', touchTool: '攻击', touchAct: '互动', touchPurr: '呼噜', touchCrouch: '潜伏', touchNextTool: '切换' },
    controlsModal: {
      title: '键盘与鼠标键位',
      subtitle: '点击任意操作后按下键盘或鼠标按键即可重绑，冲突按键会自动互换。',
      pressAnyKey: '请按按键或鼠标…',
      mouseHint: 'Esc 取消 · 支持左键 / 中键 / 右键',
      resetDefaults: '恢复默认',
      close: '完成',
      actions: {
        moveForward: '向前移动', moveBackward: '向后移动', moveLeft: '向左移动', moveRight: '向右移动',
        jump: '跳跃 / 长按滑翔', sprint: '冲刺 / 快速游泳', crouch: '潜行', purr: '呼噜 / 相位隐匿',
        dash: '暗影突进', sense: '猫须感知', useTool: '使用道具', interact: '互动 / 偷鱼 / 小憩',
        dropBait: '投掷鱼饵', pause: '暂停菜单', reset: '快速重开', toggleHud: '拍照模式 (隐藏HUD)',
      },
    },
    modals: { pauseTitle: '暂停', epilogueKicker: '故事完结', epilogueTitle: '沉没钟楼的黎明', epilogueBody: '小橘皮普的铃声唤醒了沉睡的钟塔齿轮，海港居民称他为：' },
    ranks: { guardian: '沉没钟楼守护者', kitten: '初醒小猫', thief: '鱼摊大盗', shadow: '夜枭暗影', sweetheart: '码头宠儿', bellmaster: '铜铃大师' },
  }),
  ar: makeVariant({
    subtitle: 'الميناء الغارق · حكاية القط الأحمر · جرس الرنين',
    startBtn: 'ابدأ المغامرة',
    difficultyLabel: 'الصعوبة',
    graphicsLabel: 'الجودة',
    catLabel: 'اختيار القط',
    languageLabel: 'اللغة',
    rightClickLabel: 'النقر الأيمن',
    rcJump: 'قفز',
    rcTool: 'استخدام السلاح',
    touchControlsToggle: 'أزرار اللمس',
    difficultyNames: { relaxed: 'نزهة هادئة', standard: 'دورية الميناء', challenger: 'ظل الساعة' },
    graphicsNames: { low: 'اقتصادي', medium: 'متوسطة', high: 'عالية', ultra: 'فائقة' },
    catNames: { ginger: 'بيب البرتقالي', tuxedo: 'تكسيدو', siamese: 'سيامي', calico: 'كاليكو', russian_blue: 'رمادي مزرق', void: 'النمر الأسود' },
    tools: {
      bell: { name: 'جرس الرنين', effect: 'يكشف الجسور الطيفية ويعكس الطواحين' },
      fish_sling: { name: 'طعم السمك', effect: 'يرمي سمكة لتشتيت الكلاب' },
      sonic_claw: { name: 'مخلب العاصفة', effect: 'يدفع الكلاب ويشتت النوارس' },
      lantern_flare: { name: 'شعلة الفجر', effect: 'يعمي كشاف البومة مؤقتاً' },
    },
    stats: { fish: 'سمك', affection: 'مودة', evaded: 'هروب', letters: 'رسائل', rank: 'اللقب', chimes: 'رنين', wheelsGulls: 'طواحين / نوارس' },
    titleHeroHint: 'انقر على بيب للمواء والقفز',
    actions: { pause: 'إيقاف مؤقت', resume: 'متابعة', restart: 'إعادة البدء', exitMenu: 'القائمة الرئيسية', continueWalk: 'واصل الاستكشاف', controls: 'عناصر التحكم', fullscreenEnter: 'ملء الشاشة', fullscreenExit: 'إنهاء ملء الشاشة', musicToggle: 'الموسيقى', sfxToggle: 'المؤثرات', touchJump: 'قفز', touchTool: 'سلاح', touchAct: 'تفاعل', touchPurr: 'خرخرة', touchCrouch: 'تسلل', touchNextTool: 'تبديل' },
    controlsModal: {
      title: 'التحكم بلوحة المفاتيح والفأرة',
      subtitle: 'انقر على أي إجراء ثم اضغط مفتاحاً أو زر فأرة لإعادة التعيين.',
      pressAnyKey: 'اضغط مفتاحاً أو انقر…',
      mouseHint: 'Esc للإلغاء · يدعم أزرار الفأرة الأيسر / الأوسط / الأيمن',
      resetDefaults: 'استعادة الافتراضي',
      close: 'تم',
      actions: {
        moveForward: 'تقدم', moveBackward: 'تراجع', moveLeft: 'يسار', moveRight: 'يمين',
        jump: 'قفز / طيران', sprint: 'ركض سريع', crouch: 'تسلل', purr: 'خرخرة / تخفي',
        dash: 'اندفاع الظل', sense: 'حاسة القط', useTool: 'استخدام الأداة', interact: 'تفاعل / سرقة / قيلولة',
        dropBait: 'إلقاء الطعم', pause: 'إيقاف مؤقت', reset: 'إعادة تشغيل', toggleHud: 'إخفاء الواجهة',
      },
    },
    modals: { pauseTitle: 'إيقاف مؤقت', epilogueKicker: 'نهاية القصة', epilogueTitle: 'فجر الأجراس الغارقة', epilogueBody: 'أيقظ رنين بيب تروس البرج العظيم وعادت أجراس الميناء للرنين، ونال لقب:' },
  }),
  ja: makeVariant({
    subtitle: '沈める鐘楼港 · 茶トラ猫の物語 · 共鳴の鈴',
    startBtn: '冒険を始める',
    difficultyLabel: '難易度',
    graphicsLabel: 'グラフィック',
    catLabel: '猫を選ぶ',
    languageLabel: '言語',
    rightClickLabel: '右クリック',
    rcJump: 'ジャンプ',
    rcTool: '武器を使う',
    touchControlsToggle: 'タッチ操作',
    difficultyNames: { relaxed: 'のんびり散歩', standard: '港の探索', challenger: '時計仕掛けの影' },
    graphicsNames: { low: '低 (エコ)', medium: '中', high: '高', ultra: '最高' },
    catNames: { ginger: '茶トラ', tuxedo: 'ハチワレ', siamese: 'シャム猫', calico: '三毛猫', russian_blue: 'ロシアン', void: '黒猫' },
    tools: {
      bell: { name: '共鳴の銅鈴', effect: '幻の橋を現し水車を逆転させる' },
      fish_sling: { name: 'ミント魚ルアー', effect: '魚を投げて番犬の注意を逸らす' },
      sonic_claw: { name: '疾風ソニック爪', effect: '番犬を押し返しカモメを驚かす' },
      lantern_flare: { name: '夜明けの閃光', effect: 'フクロウの探照灯を一時無力化' },
    },
    musicZones: { title: '霧の港の夜明け', rooftops: '屋根の上の海風', waterfront: '桟橋のワルツ', swimming: '運河の潮風', stealth: 'フクロウの警戒', chase: '港の追跡劇', dam_summit: '大時計のカリヨン' },
    stats: { fish: '魚', affection: '甘え', evaded: '回避', letters: '手紙', rank: '称号', chimes: '鈴鳴', wheelsGulls: '水車 / カモメ' },
    titleHeroHint: 'ピップをクリックすると鳴いて跳ねます',
    actions: { pause: '一時停止', resume: '再開', restart: 'やり直す', exitMenu: 'メニューへ', continueWalk: '散歩を続ける', controls: '操作設定', fullscreenEnter: '全画面', fullscreenExit: '全画面終了', musicToggle: 'BGM', sfxToggle: '効果音', touchJump: '跳ぶ', touchTool: '攻撃', touchAct: '行動', touchPurr: 'ゴロゴロ', touchCrouch: '忍び', touchNextTool: '切替' },
    controlsModal: {
      title: 'キーボード・マウス設定',
      subtitle: '項目をクリックしてからキーまたはマウスボタンを押してください。',
      pressAnyKey: 'キーを入力…',
      mouseHint: 'Escでキャンセル · 左・中・右クリック対応',
      resetDefaults: '初期設定に戻す',
      close: '完了',
      actions: {
        moveForward: '前進', moveBackward: '後退', moveLeft: '左へ移動', moveRight: '右へ移動',
        jump: 'ジャンプ / 滑空', sprint: 'ダッシュ泳ぎ・疾走', crouch: '忍び足', purr: 'ゴロゴロ / 隠密',
        dash: 'シャドウダッシュ', sense: 'ヒゲ感知', useTool: '道具を使う', interact: '調べる / 盗む / 昼寝',
        dropBait: 'エサを置く', pause: 'ポーズ', reset: 'リスタート', toggleHud: 'HUD表示切替',
      },
    },
    modals: { pauseTitle: '一時停止', epilogueKicker: '物語完了', epilogueTitle: '沈める鐘楼の夜明け', epilogueBody: 'ピップの鈴の共鳴が港の歯車を目覚めさせ、小さな旅猫は新たな称号を得た：' },
    ranks: { guardian: '沈鐘の守護猫', kitten: '目覚めた子猫', thief: '魚市場の怪盗', shadow: '梟光の影猫', sweetheart: '港の人気者', bellmaster: '銅鈴の達人' },
  }),
  pl: makeVariant({
    subtitle: 'Zatopiony Port · Historia Rudego Kota · Dzwon Rezonansu',
    startBtn: 'Rozpocznij Grę',
    difficultyLabel: 'Poziom',
    graphicsLabel: 'Grafika',
    catLabel: 'Wybierz Kota',
    languageLabel: 'Język',
    rightClickLabel: 'Prawy Klik',
    rcJump: 'Skok',
    rcTool: 'Użyj Broni',
    touchControlsToggle: 'Panel Dotykowy',
    difficultyNames: { relaxed: 'Spokojny Spacer', standard: 'Portowy Zwiad', challenger: 'Cień Zegarmistrza' },
    graphicsNames: { low: 'Niska (Eco)', medium: 'Średnia', high: 'Wysoka', ultra: 'Ultra' },
    catNames: { ginger: 'Rudy Pip', tuxedo: 'Smokingowy', siamese: 'Syjamski', calico: 'Szylkret', russian_blue: 'Niebieski', void: 'Czarna Pantera' },
    tools: {
      bell: { name: 'Dzwon Rezonansu', effect: 'Odkrywa mosty echo i obraca młyny' },
      fish_sling: { name: 'Miętowa Przynęta', effect: 'Rzuca rybę, by odwrócić uwagę psów' },
      sonic_claw: { name: 'Pazur Wichru', effect: 'Odpycha psy i płoszy mewy' },
      lantern_flare: { name: 'Flara Świtu', effect: 'Oślepia reflektory sów' },
    },
    stats: { fish: 'Ryby', affection: 'Czule', evaded: 'Ucieczki', letters: 'Listy', rank: 'Tytuł', chimes: 'Dzwony', wheelsGulls: 'Młyny / Mewy' },
    titleHeroHint: 'Kliknij Pipa, aby zamiauczał i podskoczył',
    actions: { pause: 'Pauza', resume: 'Wznów', restart: 'Od Nowa', exitMenu: 'Menu Główne', continueWalk: 'Zwiedzaj', controls: 'Sterowanie', fullscreenEnter: 'Pełny Ekran', fullscreenExit: 'Zamknij Pełny Ekran', musicToggle: 'Muzyka', sfxToggle: 'Dźwięki', touchJump: 'Skok', touchTool: 'Atak', touchAct: 'Akcja', touchPurr: 'Mrucz', touchCrouch: 'Skradaj', touchNextTool: 'Broń' },
    controlsModal: {
      title: 'Klawiatura i Mysz',
      subtitle: 'Kliknij akcję, aby przypisać klawisz lub przycisk myszy.',
      pressAnyKey: 'Naciśnij klawisz…',
      mouseHint: 'Esc anuluje · Obsługa LPM / ŚPM / PPM',
      resetDefaults: 'Domyślne',
      close: 'Gotowe',
      actions: {
        moveForward: 'Naprzód', moveBackward: 'Wstecz', moveLeft: 'W lewo', moveRight: 'W prawo',
        jump: 'Skok / Lot', sprint: 'Sprint', crouch: 'Skradanie', purr: 'Mruczenie / Ukrycie',
        dash: 'Zryw Cienia', sense: 'Koci Zmysł', useTool: 'Użyj Narzędzia', interact: 'Akcja / Kradzież / Drzemka',
        dropBait: 'Rzuć Przynętę', pause: 'Pauza', reset: 'Restart', toggleHud: 'Tryb Foto (HUD)',
      },
    },
  }),
  it: makeVariant({
    subtitle: 'Porto Sommerso · Storia del Gatto Rosso · Campana d’Alba',
    startBtn: 'Inizia Avventura',
    difficultyLabel: 'Difficoltà',
    graphicsLabel: 'Grafica',
    catLabel: 'Scegli Gatto',
    languageLabel: 'Lingua',
    rightClickLabel: 'Tasto Destro',
    rcJump: 'Salto',
    rcTool: 'Usa Arma',
    touchControlsToggle: 'Tasti Touch',
    difficultyNames: { relaxed: 'Passeggiata Dolce', standard: 'Ronda del Porto', challenger: 'Ombra Meccanica' },
    graphicsNames: { low: 'Bassa (Eco)', medium: 'Media', high: 'Alta', ultra: 'Ultra' },
    catNames: { ginger: 'Rosso Pip', tuxedo: 'Smoking', siamese: 'Siamese', calico: 'Tricolore', russian_blue: 'Blu Russo', void: 'Pantera' },
    tools: {
      bell: { name: 'Campana Risonante', effect: 'Rivela ponti-eco e inverte i mulini' },
      fish_sling: { name: 'Esca alla Menta', effect: 'Lancia pesce per distrarre i cani' },
      sonic_claw: { name: 'Artiglio di Brezza', effect: 'Respinge cani e disperde gabbiani' },
      lantern_flare: { name: 'Bagliore d’Alba', effect: 'Acceca i riflettori gufo' },
    },
    stats: { fish: 'Pesci', affection: 'Fusa', evaded: 'Fughe', letters: 'Lettere', rank: 'Titolo', chimes: 'Rintocchi', wheelsGulls: 'Mulini / Gabbiani' },
    titleHeroHint: 'Clicca su Pip per farlo miagolare',
    actions: { pause: 'Pausa', resume: 'Riprendi', restart: 'Ricomincia', exitMenu: 'Menu Principale', continueWalk: 'Esplora', controls: 'Comandi', fullscreenEnter: 'Schermo Intero', fullscreenExit: 'Esci Schermo Intero', musicToggle: 'Musica', sfxToggle: 'Effetti', touchJump: 'Salta', touchTool: 'Arma', touchAct: 'Agisci', touchPurr: 'Fusa', touchCrouch: 'Furtivo', touchNextTool: 'Cambia' },
    controlsModal: {
      title: 'Comandi Tastiera e Mouse',
      subtitle: 'Clicca su un’azione e premi un tasto o pulsante del mouse.',
      pressAnyKey: 'Premi un tasto…',
      mouseHint: 'Esc annulla · Supporta tasti SX / Centro / DX',
      resetDefaults: 'Ripristina',
      close: 'Fatto',
      actions: {
        moveForward: 'Avanti', moveBackward: 'Indietro', moveLeft: 'Sinistra', moveRight: 'Destra',
        jump: 'Salto / Planata', sprint: 'Scatto', crouch: 'Furtivo', purr: 'Fusa / Mimetismo',
        dash: 'Scatto d’Ombra', sense: 'Senso Felino', useTool: 'Usa Strumento', interact: 'Agisci / Ruba / Pisolino',
        dropBait: 'Lascia Esca', pause: 'Pausa', reset: 'Riavvia', toggleHud: 'Nascondi HUD',
      },
    },
    modals: { pauseTitle: 'Pausa', epilogueKicker: 'Storia Completata', epilogueTitle: 'L’Alba delle Campane', epilogueBody: 'La risonanza di Pip ha risvegliato gli ingranaggi del porto, guadagnando il titolo:' },
  }),
  vi: makeVariant({
    subtitle: 'Bến Cảng Chìm · Chuyện Mèo Vàng · Chuông Cộng Hưởng',
    startBtn: 'Bắt Đầu Chơi',
    difficultyLabel: 'Độ Khó',
    graphicsLabel: 'Đồ Họa',
    catLabel: 'Chọn Mèo',
    languageLabel: 'Ngôn Ngữ',
    rightClickLabel: 'Chuột Phải',
    rcJump: 'Nhảy',
    rcTool: 'Dùng Vũ Khí',
    touchControlsToggle: 'Cảm Ứng',
    difficultyNames: { relaxed: 'Dạo Phố Êm Ái', standard: 'Tuần Tra Cảng', challenger: 'Bóng Đồng Hồ' },
    graphicsNames: { low: 'Thấp (Eco)', medium: 'Trung Bình', high: 'Cao', ultra: 'Siêu Nét' },
    catNames: { ginger: 'Mèo Vàng', tuxedo: 'Mèo Mướp Đen', siamese: 'Mèo Xiêm', calico: 'Tam Thể', russian_blue: 'Xám Xanh', void: 'Mèo Đen' },
    tools: {
      bell: { name: 'Chuông Cộng Hưởng', effect: 'Mở cầu ảo ảnh & đảo chiều cối xay' },
      fish_sling: { name: 'Mồi Cá Bạc Hà', effect: 'Ném cá đánh lạc hướng chó cảng' },
      sonic_claw: { name: 'Vuốt Gió Lốc', effect: 'Đẩy lùi chó đuổi & xua hải âu' },
      lantern_flare: { name: 'Pháo Sáng Bình Minh', effect: 'Làm lóa đèn cú tuần tra' },
    },
    stats: { fish: 'Cá', affection: 'Vuốt Ve', evaded: 'Thoát Chó', letters: 'Thư', rank: 'Danh Hiệu', chimes: 'Tiếng Chuông', wheelsGulls: 'Cối Xay / Hải Âu' },
    titleHeroHint: 'Nhấp vào Pip để mèo kêu và nhảy',
    actions: { pause: 'Tạm Dừng', resume: 'Tiếp Tục', restart: 'Chơi Lại', exitMenu: 'Menu Chính', continueWalk: 'Khám Phá Tiếp', controls: 'Điều Khiển', fullscreenEnter: 'Toàn Màn Hình', fullscreenExit: 'Thoát Toàn Màn Hình', musicToggle: 'Nhạc Nền', sfxToggle: 'Âm Thanh', touchJump: 'Nhảy', touchTool: 'Chiêu', touchAct: 'Tác Động', touchPurr: 'Gừ', touchCrouch: 'Rón Rén', touchNextTool: 'Đổi' },
    controlsModal: {
      title: 'Phím & Chuột Điều Khiển',
      subtitle: 'Nhấp vào hành động rồi nhấn phím hoặc nút chuột để đổi.',
      pressAnyKey: 'Nhấn phím bất kỳ…',
      mouseHint: 'Esc để hủy · Hỗ trợ chuột Trái / Giữa / Phải',
      resetDefaults: 'Mặc Định',
      close: 'Xong',
      actions: {
        moveForward: 'Tiến', moveBackward: 'Lùi', moveLeft: 'Trái', moveRight: 'Phải',
        jump: 'Nhảy / Lượn', sprint: 'Chạy Nhanh', crouch: 'Đi Khẽ', purr: 'Gừ / Ẩn Thân',
        dash: 'Lướt Bóng', sense: 'Cảm Nhận', useTool: 'Dùng Công Cụ', interact: 'Tương Tác / Ngủ',
        dropBait: 'Thả Mồi', pause: 'Tạm Dừng', reset: 'Chơi Lại', toggleHud: 'Ẩn/Hiện HUD',
      },
    },
  }),
  fa: makeVariant({
    subtitle: 'بندر غرق‌شده · داستان گربه نارنجی · زنگ طنین‌انداز',
    startBtn: 'شروع ماجراجویی',
    difficultyLabel: 'سطح دشواری',
    graphicsLabel: 'کیفیت تصویر',
    catLabel: 'انتخاب گربه',
    languageLabel: 'زبان',
    rightClickLabel: 'کلیک راست',
    rcJump: 'پرش',
    rcTool: 'استفاده از سلاح',
    touchControlsToggle: 'دکمه‌های لمسی',
    difficultyNames: { relaxed: 'گردش آرام', standard: 'نگهبانی بندر', challenger: 'سایه ساعت‌ساز' },
    graphicsNames: { low: 'پایین (اکو)', medium: 'متوسط', high: 'بالا', ultra: 'فوق‌العاده' },
    catNames: { ginger: 'نارنجی', tuxedo: 'تاکسیدو', siamese: 'سیامی', calico: 'سه‌رنگ', russian_blue: 'آبی خاکستری', void: 'پلنگ سیاه' },
    tools: {
      bell: { name: 'زنگ طنین‌انداز', effect: 'پل‌های شبحی و آسیاب‌ها را بیدار می‌کند' },
      fish_sling: { name: 'طعمه ماهی نعنایی', effect: 'حواس سگ‌های بندر را پرت می‌کند' },
      sonic_claw: { name: 'پنجه طوفان', effect: 'سگ‌ها را عقب می‌راند و مرغان را می‌پراند' },
      lantern_flare: { name: 'شعله سحر', effect: 'نورافکن جغدها را کور می‌کند' },
    },
    stats: { fish: 'ماهی', affection: 'نوازش', evaded: 'فرار', letters: 'نامه‌ها', rank: 'لقب', chimes: 'زنگ‌ها', wheelsGulls: 'آسیاب / مرغ دریایی' },
    titleHeroHint: 'روی پیپ کلیک کنید تا میو کند و بپرد',
    actions: { pause: 'توقف', resume: 'ادامه', restart: 'شروع مجدد', exitMenu: 'منوی اصلی', continueWalk: 'ادامه گشت‌وگذار', controls: 'تنظیم کلیدها', fullscreenEnter: 'تمام‌صفحه', fullscreenExit: 'خروج از تمام‌صفحه', musicToggle: 'موسیقی', sfxToggle: 'صداها', touchJump: 'پرش', touchTool: 'سلاح', touchAct: 'کنش', touchPurr: 'خرخر', touchCrouch: 'خزیدن', touchNextTool: 'بعدی' },
    controlsModal: {
      title: 'تنظیمات صفحه‌کلید و ماوس',
      subtitle: 'روی یک عمل کلیک کنید و کلید یا دکمه ماوس را فشار دهید.',
      pressAnyKey: 'کلیدی را فشار دهید…',
      mouseHint: 'Esc برای لغو · پشتیبانی از کلیک چپ / وسط / راست',
      resetDefaults: 'بازنشانی پیش‌فرض',
      close: 'تأیید',
      actions: {
        moveForward: 'حرکت به جلو', moveBackward: 'حرکت به عقب', moveLeft: 'چپ', moveRight: 'راست',
        jump: 'پرش / پرواز', sprint: 'دویدن سریع', crouch: 'خزیدن', purr: 'خرخر / پنهان‌کاری',
        dash: 'جهش سایه', sense: 'حس گربه', useTool: 'استفاده از ابزار', interact: 'تعامل / دزدی / چرت',
        dropBait: 'انداختن طعمه', pause: 'توقف', reset: 'شروع مجدد', toggleHud: 'حالت عکاسی HUD',
      },
    },
  }),
  qya: makeVariant({
    subtitle: 'Londe Undómë · Quenta Varo-Miwë · Nyellë Lómin',
    startBtn: 'Yesta Lindë',
    difficultyLabel: 'Nwalmë',
    graphicsLabel: 'Cenda-Calma',
    catLabel: 'Miwë',
    languageLabel: 'Lambë',
    rightClickLabel: 'Forya Tamë',
    rcJump: 'Hlapë (Jump)',
    rcTool: 'Mahta (Use Tool)',
    touchControlsToggle: 'Mára Palpa',
    difficultyNames: { relaxed: 'Lissë Vanda', standard: 'Ciryamo Tirë', challenger: 'Mordo Corma' },
    graphicsNames: { low: 'Pitya (Eco)', medium: 'Endë', high: 'Tára', ultra: 'Ankalima' },
    catNames: { ginger: 'Carnë Pip', tuxedo: 'Morifánë', siamese: 'Elen-Miwë', calico: 'Nelmë', russian_blue: 'Luin-Sinda', void: 'Morco' },
    tools: {
      bell: { name: 'Nyellë Calima', effect: 'Panta yanwë-lómin & quera nánor' },
      fish_sling: { name: 'Lingwë-Laitë', effect: 'Hatë lingwë huorun rucë' },
      sonic_claw: { name: 'Súlimo Ráca', effect: 'Palan-caita huor & aiwë' },
      lantern_flare: { name: 'Anar-Calma', effect: 'Ú-cenda calar morco-cú' },
    },
    musicZones: { title: 'Hísiel Ambaróna', rooftops: 'Súlë Oronti', waterfront: 'Lindë Falassë', swimming: 'Nén-Círa', stealth: 'Mordo-Tirë', chase: 'Noro Huo', dam_summit: 'Calima Corma' },
    chapters: {
      1: { title: 'I · Óma Londëo', objective: 'Undu i falassë & anta nilmë [Q] hya muru [F]' },
      2: { title: 'II · Lingwë-Camo', objective: 'Mapa 3 lingwi [Q], rucë huor [Scroll+E] & nurta [F]' },
      3: { title: 'III · Nyellë Lómin', objective: 'Quera i nánor nyellenen [E] ar orta oron!' },
      4: { title: 'IV · Ambaróna Calma', objective: 'Hira 5 tengwar Marco, tirë aiwë & lorna!' },
    },
    stats: { fish: 'Lingwi', affection: 'Melmë', evaded: 'Huor', letters: 'Tengwar', rank: 'Esë', chimes: 'Nyelli', wheelsGulls: 'Nánor / Aiwë' },
    titleHeroHint: 'Tamë i Miwë Pip lindëo',
    actions: { pause: 'Pusta', resume: 'Lelya', restart: 'En-yesta', exitMenu: 'Mena Menë', continueWalk: 'Vanda', controls: 'Mahta-Tengwar', fullscreenEnter: 'Ilqua Cenda', fullscreenExit: 'Nán-Cenda', musicToggle: 'Lindë', sfxToggle: 'Óma', touchJump: 'Hlapë', touchTool: 'Mahta', touchAct: 'Carë', touchPurr: 'Muru', touchCrouch: 'Nurta', touchNextTool: 'Quera' },
    controlsModal: {
      title: 'Tengwar ar Tamë',
      subtitle: 'Tamë carë ar quetë tengwa hya tamë.',
      pressAnyKey: 'Quetë tengwa…',
      mouseHint: 'Esc pusta · Hyarya / Endë / Forya tamë',
      resetDefaults: 'En-yesta',
      close: 'Mára',
      actions: {
        moveForward: 'Pana', moveBackward: 'Nan', moveLeft: 'Hyarya', moveRight: 'Forya',
        jump: 'Hlapë / Wilë', sprint: 'Noro', crouch: 'Nurta', purr: 'Muru',
        dash: 'Alca-Noro', sense: 'Tira-Óma', useTool: 'Mahta', interact: 'Carë / Lorna',
        dropBait: 'Hatë Lingwë', pause: 'Pusta', reset: 'En-yesta', toggleHud: 'Cenda-Nurtë',
      },
    },
    modals: { pauseTitle: 'Pusta', epilogueKicker: 'Quenta Metta', epilogueTitle: 'Ambaróna Nyellion', epilogueBody: 'Nyellë Pipo envinyantë i corma ciryalondëo ar antanë essë:' },
    ranks: { guardian: 'Tirno Nyellion', kitten: 'Miwë Coivëa', thief: 'Lingwë-Heru', shadow: 'Lómin-Dú', sweetheart: 'Meldo Londëo', bellmaster: 'Ingolmo Nyellë' },
  }),
  ork: makeVariant({
    subtitle: 'Drowned Harbor · Da Red Squig-Cat · Big Brass Bell!',
    startBtn: 'WAAAGH! Start',
    difficultyLabel: 'Tuffness',
    graphicsLabel: 'Eye-Candy',
    catLabel: 'Pick Squig-Cat',
    languageLabel: 'Talk',
    rightClickLabel: 'Right-Klump',
    rcJump: 'Leap!',
    rcTool: 'Krump wiv Gear',
    touchControlsToggle: 'Touch Pad',
    difficultyNames: { relaxed: 'Snotling Walk', standard: 'Proper Scrap', challenger: 'Warboss Stealth' },
    graphicsNames: { low: 'Eco-Squig', medium: 'Propa', high: 'Shiny', ultra: 'Mega-Flashy!' },
    catNames: { ginger: 'Red One', tuxedo: 'Posh Git', siamese: 'Creamy', calico: 'Patchy', russian_blue: 'Steel Fur', void: 'Sneaky Black' },
    tools: {
      bell: { name: 'Loud Brass Ding-Dong', effect: 'Shows sneaky bridges & spins big wheels!' },
      fish_sling: { name: 'Stinky Fish Chukka', effect: 'Frows fish at da yard-hounds!' },
      sonic_claw: { name: 'Gale Choppa-Claw', effect: 'Bash hounds back & scatter squawkers!' },
      lantern_flare: { name: 'Boom-Sun Flare', effect: 'Blinds da beak-eye spotters!' },
    },
    musicZones: { title: 'Misty Harbor', rooftops: 'High Roofs', waterfront: 'Fish Docks', swimming: 'Wet Canal', stealth: 'Sneaky Time', chase: 'Hound Scrap!', dam_summit: 'Big Clockwork Smash!' },
    chapters: {
      1: { title: 'Part I · Dock Noise', objective: 'Drop down ta da docks & rub tall humies [Q] or purr [F]' },
      2: { title: 'Part II · Fish Loota', objective: 'Loot 3 fishes [Q], frow bait at hounds [Wheel+E] & hide [F]' },
      3: { title: 'Part III · Big Bell Krump', objective: 'Spin da big water-wheels wiv Bell [E] & ring on top!' },
      4: { title: 'Part IV · Dawn WAAAGH!', objective: 'Loot all 5 Marco scraps, pounce gulls & snooze by chimneys!' },
    },
    stats: { fish: 'Loot Fish', affection: 'Humies', evaded: 'Dumped Hounds', letters: 'Scraps', rank: 'Boss Title', chimes: 'Dings', wheelsGulls: 'Wheels / Birds' },
    titleHeroHint: 'Poke da Squig-Cat for a loud meow!',
    actions: { pause: 'Hold Up', resume: 'Keep Goin', restart: 'Again!', exitMenu: 'Back ta Camp', continueWalk: 'Keep Lootin', controls: 'Buttonz', fullscreenEnter: 'Big Screen', fullscreenExit: 'Small Screen', musicToggle: 'War Drums', sfxToggle: 'Boom Noise', touchJump: 'Leap', touchTool: 'Krump', touchAct: 'Grab', touchPurr: 'Purr', touchCrouch: 'Sneak', touchNextTool: 'Swap' },
    controlsModal: {
      title: 'Klack & Click Buttonz',
      subtitle: 'Poke a fing den smash a key or mouse button ta swap it!',
      pressAnyKey: 'Smash a key…',
      mouseHint: 'Esc cancels · Left / Middle / Right clicks work!',
      resetDefaults: 'Back ta Propa',
      close: 'WAAAGH!',
      actions: {
        moveForward: 'Charge Front', moveBackward: 'Back Off', moveLeft: 'Stomp Left', moveRight: 'Stomp Right',
        jump: 'Big Leap / Glide', sprint: 'Run Fast', crouch: 'Sneaky Time', purr: 'Loud Purr',
        dash: 'Zoom Dash', sense: 'Sniff Loot', useTool: 'Krump wiv Gear', interact: 'Grab / Snooze',
        dropBait: 'Chuk Bait', pause: 'Hold Up', reset: 'Again!', toggleHud: 'Hide Junk',
      },
    },
    modals: { pauseTitle: 'Hold Up!', epilogueKicker: 'Proper Looted!', epilogueTitle: 'Dawn of da Big Clock!', epilogueBody: 'Da ginger beast smashed da silent clock gears awake! Every dock humie calls ya:' },
    ranks: { guardian: 'Boss of da Big Bell', kitten: 'Scrap-Kitten', thief: 'Fish-Loota Boss', shadow: 'Sneaky Git', sweetheart: 'Humie-Friend', bellmaster: 'Brass Krumpa' },
  }),
};

export function getLocale(lang: LanguageCode): UiLocaleBundle {
  return LOCALES[lang] ?? LOCALES.en;
}

export function isRtlLanguage(lang: LanguageCode): boolean {
  return lang === 'ar' || lang === 'fa';
}

export function getSavedLanguage(): LanguageCode {
  try {
    const raw = window.localStorage.getItem('sunken_chime_lang');
    if (raw && raw in LOCALES) return raw as LanguageCode;
  } catch {
    // ignore
  }
  return 'en';
}

export function saveLanguage(lang: LanguageCode): void {
  try {
    window.localStorage.setItem('sunken_chime_lang', lang);
  } catch {
    // ignore
  }
}

const EN_DIALOGUES: Record<string, { speaker: string; text: string }> = {
  intro_thought: {
    speaker: 'Pip (Cat Thoughts)',
    text: 'Dawn breaks over the flooded harbor. Head down to the docks — rub a citizen’s legs [Q] or purr [F]!',
  },
  drop_bait: {
    speaker: 'Pip',
    text: 'Plop! Pip tossed tasty bait onto the planks — harbor dogs will dash right for it!',
  },
  echo_bridge: {
    speaker: 'Bell Resonance',
    text: 'Your chime awakened ghostly glass bridges in the mist! Sprint across before they fade.',
  },
  mill_reversed: {
    speaker: 'Waterwheel Mill',
    text: 'Your chime reversed the giant waterwheel gears! Hop onto a paddle to ride up to the dam.',
  },
  owl_alarm: {
    speaker: 'Watch-Owl Lantern',
    text: 'Hoo-hoo! The owl spotlight spotted Pip! Hold [F] to phase-purr with the clockwork or fire Dawn Flare!',
  },
  dog_distracted: {
    speaker: 'Harbor Dog',
    text: 'Chomp-chomp! The guard dog smelled free fish, abandoned chase, and dug into the feast!',
  },
  dog_tired: {
    speaker: 'Harbor Dog',
    text: 'Huff-puff… The dog ran out of stamina chasing agile Pip and trudged back to patrol!',
  },
  dog_escaped: {
    speaker: 'Pip',
    text: 'The dog is stuck barking below! High rooftops and canal swims always shake pursuit.',
  },
  gull_pounced: {
    speaker: 'Greedy Gull',
    text: 'Squawk! White feathers everywhere — Pip ambushed the startled gull like a true rooftop hunter!',
  },
  caught_fish: {
    speaker: 'Harbor Dog',
    text: 'Woof! The dog startled Pip and knocked the fish loose! Leap [Space / RMB] or stun with Gale Claw!',
  },
  caught_empty: {
    speaker: 'Harbor Dog',
    text: 'Bark-bark! Sprint [Shift], climb a skiff or rooftop — dogs soon lose their breath!',
  },
  stole_fish: {
    speaker: 'Pip (Fish in Jaws!)',
    text: 'Snatched fresh catch right off the dock! Dash away [Shift] or toss bait [G] to distract guards!',
  },
  stole_enough: {
    speaker: 'Pip (Well-Fed Trickster)',
    text: 'Glorious haul! Now wake the waterwheels with your Bell [E] and climb to the Sunken Chimes summit!',
  },
  tip_pail: {
    speaker: 'Minnow Pail',
    text: 'Clatter! Tiny silvery fish spilled across the cobbles — any nearby dog will race over to feast!',
  },
  cozy_sleep: {
    speaker: 'Cozy Catnap',
    text: 'Pip curled into a warm ball beside the chimney… (+16% speed boost for 25s! Move [WASD] to wake)',
  },
  epilogue_chimes: {
    speaker: 'The Sunken Chimes',
    text: 'Warm bronze chimes echo across the water — the great dam awakens and Venice’s dawn sings again!',
  },
  letter_1: {
    speaker: "Marco's Letter #1 · The High Tide",
    text: '"When autumn tides drowned Venice’s lower arches, the city fell silent. Yet my brass pendulum still remembers the chime…"',
  },
  letter_2: {
    speaker: "Marco's Letter #2 · Bridge Resonance",
    text: '"Ringing your Brass Bell [E] reveals crystal echo skyways in the mist and reverses the mill wheels!"',
  },
  letter_3: {
    speaker: "Marco's Letter #3 · Outsmarting Owls",
    text: '"The Watch-Owl beams track motion sharply — purr softly [F] in rhythm with the clockwork to vanish in plain sight."',
  },
  letter_4: {
    speaker: "Marco's Letter #4 · Guard Hounds",
    text: '"Dock dogs bark loud, yet tire quickly and adore free fish. Drop bait [G] or use Peppermint Lure / Gale Claw!"',
  },
  letter_5: {
    speaker: "Marco's Letter #5 · Heart of the Dam",
    text: '"You reached the summit of the Sunken Chimes, little ginger guardian! Every pier hears your sunrise song."',
  },
  npc_shipwright_arsenal_0: {
    speaker: 'Shipwright Matteo (East Arsenal)',
    text: 'Oho, a ginger surveyor inspecting the East Arsenal? Mind the guard hound by the timber barges, little friend.',
  },
  npc_shipwright_arsenal_1: {
    speaker: 'Shipwright Matteo (East Arsenal)',
    text: 'Good lad! With you chasing gulls off the rigging, the shipyard crew can finally finish caulking the hull.',
  },
  npc_baker_lagoon_0: {
    speaker: 'Nonna Chiara (West Lagoon)',
    text: 'Always welcome on our quiet lagoon terrace, kitty! There’s a warm chimney nest upstairs if you need a breeze boost.',
  },
  npc_keeper_lighthouse_0: {
    speaker: 'Lighthouse Keeper Pietro',
    text: 'All the way out to the southern breakwater! Even the sea wind carries a hint of bronze bells today.',
  },
  npc_foundry_master_0: {
    speaker: 'Bellfounder Bernardo (East Foundry)',
    text: 'You swam all the way out to the Far East Foundry! The great bronze bells of Sunken Chime were cast right in these kilns.',
  },
  npc_cloister_weaver_0: {
    speaker: 'Weaver Ornella (West Cloister)',
    text: 'The sunken basilica cloister keeps the quiet of old frescoes… yet a warm purring cat is always welcome!',
  },
  npc_bastion_angler_0: {
    speaker: 'Angler Salvatore (South Bastion)',
    text: 'What a traveler! Beyond this southern sea-wall lies only the open Adriatic — help yourself to fresh dockside mackerel.',
  },
  npc_viaduct_tinker_0: {
    speaker: 'Mechanist Lucrezia (North Viaduct)',
    text: 'The northern sluice feeds the entire clockwork dam. Mind the currents and explore the Grand Conduit rooftop!',
  },
  secret_fork: {
    speaker: 'Tuning Fork Resonance',
    text: 'A hidden brass fork hums cleanly across the canals! Awaken all three to open the high Echo Vault.',
  },
  secret_vault: {
    speaker: 'Secret · Four-Winds Resonance',
    text: 'All three tuning forks sing in unison! A golden Echo Vault sky-bridge has appeared above the Dam Crest (+6 🐟)!',
  },
  secret_silent_feat: {
    speaker: 'Order of the Silent Paw',
    text: 'A silent feat whispered to the wind — complete beam-sync, gull ambush, and catnap with zero owl alarms!',
  },
  secret_silent_reset: {
    speaker: 'Owl Alarm Sounded!',
    text: 'The Order of the Silent Paw demands stillness — your silent streak reset.',
  },
  secret_silent_done: {
    speaker: 'Secret · Order of the Silent Paw',
    text: 'Unseen by owls, swift among gulls, serene by the hearth. The Order honors Pip (+5 🐟)!',
  },
  secret_salvatore_start: {
    speaker: 'Angler Salvatore (South Bastion)',
    text: 'Watch-hounds stole my gilded Clockwork Mackerel to the East Arsenal pier! Bring it back safe without getting caught!',
  },
  secret_mackerel_take: {
    speaker: 'Clockwork Golden Mackerel',
    text: 'Got the gleaming Clockwork Mackerel! Sprint back to Old Salvatore at South Bastion without taking a hit!',
  },
  secret_mackerel_drop: {
    speaker: 'Clockwork Mackerel Dropped!',
    text: 'Ouch! The hit knocked the Golden Mackerel loose back to the Arsenal dock.',
  },
  secret_mackerel_done: {
    speaker: 'Angler Salvatore (South Bastion)',
    text: 'My treasured Clockwork Mackerel! Not a scratch on her brass scales — take this whole creel of golden fish (+10 🐟)!',
  },
};

export function getLocalizedDialogue(
  lang: LanguageCode,
  dialogue: { id?: string; speaker: string; text: string } | null
): { speaker: string; text: string } | null {
  if (!dialogue) return null;
  if (lang === 'ru' || lang === 'uk') {
    return { speaker: dialogue.speaker, text: dialogue.text };
  }
  if (dialogue.id && EN_DIALOGUES[dialogue.id]) {
    return EN_DIALOGUES[dialogue.id];
  }
  if (dialogue.id?.startsWith('npc_')) {
    return {
      speaker: 'Harbor Folk',
      text: 'Warm little ginger rascal… Your purring brings life back to the flooded quays! Keep ringing the Bell on the summit.',
    };
  }
  return { speaker: dialogue.speaker, text: dialogue.text };
}
