export const SITE_ORIGIN = 'https://buzzer-app.fr';

export const SEO_LOCALES = ['fr', 'en', 'es', 'de', 'zh', 'ru'];

export const SEO_PATH_LOCALES = ['en', 'es', 'de', 'zh', 'ru'];

export const OG_LOCALE = {
  fr: 'fr_FR',
  en: 'en_US',
  es: 'es_ES',
  de: 'de_DE',
  zh: 'zh_CN',
  ru: 'ru_RU',
};

export const HTML_LANG = {
  fr: 'fr',
  en: 'en',
  es: 'es',
  de: 'de',
  zh: 'zh-CN',
  ru: 'ru',
};

export const HREFLANG = {
  fr: 'fr',
  en: 'en',
  es: 'es',
  de: 'de',
  zh: 'zh-CN',
  ru: 'ru',
};

export function localePath(lang) {
  return lang === 'fr' ? '/' : `/${lang}`;
}

export function localeUrl(lang) {
  return lang === 'fr' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${lang}`;
}

export function isSeoPathLocale(code) {
  return SEO_PATH_LOCALES.includes(code);
}

/** @type {Record<string, {
 *   title: string,
 *   description: string,
 *   keywords: string,
 *   ogTitle: string,
 *   ogDescription: string,
 *   ogImageAlt: string,
 *   twitterTitle: string,
 *   twitterDescription: string,
 *   jsonLdDescription: string,
 *   jsonLdKeywords: string,
 *   alternateNames: string[],
 *   featureList: string[],
 *   h1: string,
 *   lead: string,
 *   cta: string,
 *   howTitle: string,
 *   steps: string[],
 *   whyTitle: string,
 *   whyP1: string,
 *   whyP2: string,
 *   bullets: string[],
 * }>} */
export const seoByLang = {
  fr: {
    title: 'Buzzer App : application buzzer en ligne gratuite pour blind-test et quiz',
    description:
      "Buzzer App, l'application buzzer en ligne gratuite pour blind-test, quiz et soirées jeux. Buzzer virtuel multijoueur sur téléphone : crée un salon, invite tes amis et vois qui buzz en premier.",
    keywords:
      'buzzer app, application buzzer, appli buzzer, buzzer en ligne, buzzer en ligne gratuit, buzzer virtuel, buzzer blind test, buzzer quiz, jeu buzzer en ligne, buzzer multijoueur, site buzzer, buzzer téléphone, buzzer web',
    ogTitle: 'Buzzer App : application buzzer en ligne gratuite pour blind-test et quiz',
    ogDescription:
      'Buzzer virtuel en ligne, gratuit et multijoueur. Idéal pour blind-test et quiz sur téléphone, sans installation.',
    ogImageAlt: 'Logo Buzzer App, application buzzer en ligne',
    twitterTitle: 'Buzzer App : application buzzer en ligne gratuite',
    twitterDescription:
      'Buzzer web pour blind-test et quiz. Multijoueur, gratuit, sur téléphone ou ordinateur.',
    jsonLdDescription:
      'Application buzzer en ligne gratuite pour blind-test, quiz et soirées jeux. Buzzer virtuel multijoueur utilisable sur téléphone, tablette ou ordinateur, sans installation.',
    jsonLdKeywords:
      'buzzer app, application buzzer, buzzer en ligne gratuit, buzzer blind test, buzzer quiz, jeu buzzer en ligne, buzzer multijoueur, buzzer virtuel, site buzzer',
    alternateNames: [
      'BuzzerApp',
      'application buzzer',
      'appli buzzer',
      'buzzer en ligne',
      'buzzer virtuel',
    ],
    featureList: [
      'Buzzer en temps réel',
      'Blind-test et quiz multijoueur',
      'Invitation par code, lien ou QR',
      'Scores personnalisables',
      'Jouable sur téléphone avec Wi-Fi, 4G ou 5G',
      'Gratuit, sans compte et sans installation',
    ],
    h1: 'Buzzer App : application buzzer en ligne pour blind-test et quiz',
    lead:
      'Buzzer App est une appli buzzer gratuite dans le navigateur. Anime un blind-test ou un quiz en live : crée un salon, invite tes amis sur téléphone, et vois qui appuie en premier.',
    cta: 'Jouer au buzzer en ligne maintenant',
    howTitle: 'Comment marche ce buzzer virtuel',
    steps: [
      'Crée un salon avec un nom, un blason et les règles de score.',
      'Invite tes amis avec un code, un lien ou un QR, même sur des réseaux différents.',
      'Lance la manche : le plus rapide apparaît en direct, tu valides ou refuses la réponse.',
    ],
    whyTitle: 'Pourquoi choisir cette application buzzer',
    whyP1:
      'Cherches-tu un buzzer en ligne gratuit, un site buzzer pour soirée, ou une application buzzer pour blind test ? Buzzer App couvre le jeu buzzer en ligne multijoueur sans matériel ni installation.',
    whyP2:
      'Chacun joue depuis son téléphone (Wi-Fi, 4G ou 5G). Idéal pour quiz, culture G et blind-test entre amis.',
    bullets: [
      'Buzzer temps réel et buzzer virtuel synchronisé',
      'Scores sur mesure (points, bonus, pénalité)',
      'Invitation par code, lien et QR',
      'Salons publics et historique',
      'Profil, avatar et thème',
      'Buzzer gratuit, sans compte à créer',
      'Utilisable comme buzzer web sur téléphone, tablette ou ordinateur',
    ],
  },
  en: {
    title: 'Buzzer App: free online buzzer app for music quizzes and trivia',
    description:
      'Buzzer App is a free online buzzer for music quizzes, trivia nights and party games. Create a room, invite friends on their phones, and see who buzzes first.',
    keywords:
      'buzzer app, online buzzer, free online buzzer, virtual buzzer, music quiz buzzer, trivia buzzer, multiplayer buzzer game, web buzzer, phone buzzer',
    ogTitle: 'Buzzer App: free online buzzer for quizzes and trivia',
    ogDescription:
      'Free multiplayer online buzzer. Perfect for music quizzes and trivia on your phone, no install needed.',
    ogImageAlt: 'Buzzer App logo, online buzzer application',
    twitterTitle: 'Buzzer App: free online buzzer',
    twitterDescription:
      'Web buzzer for music quizzes and trivia. Multiplayer, free, on phone or computer.',
    jsonLdDescription:
      'Free online buzzer app for music quizzes, trivia and game nights. Multiplayer virtual buzzer on phone, tablet or computer, no install required.',
    jsonLdKeywords:
      'buzzer app, online buzzer, free online buzzer, music quiz buzzer, trivia buzzer, multiplayer buzzer, virtual buzzer',
    alternateNames: [
      'BuzzerApp',
      'online buzzer',
      'virtual buzzer',
      'quiz buzzer',
      'web buzzer',
    ],
    featureList: [
      'Real-time buzzer',
      'Multiplayer music quizzes and trivia',
      'Invite with code, link or QR',
      'Customizable scores',
      'Play on phone over Wi-Fi, 4G or 5G',
      'Free, no account and no install',
    ],
    h1: 'Buzzer App: online buzzer for music quizzes and trivia',
    lead:
      'Buzzer App is a free browser buzzer. Host a live music quiz or trivia night: create a room, invite friends on their phones, and see who hits first.',
    cta: 'Play the online buzzer now',
    howTitle: 'How this virtual buzzer works',
    steps: [
      'Create a room with a name, badge and scoring rules.',
      'Invite friends with a code, link or QR, even on different networks.',
      'Start the round: the fastest player appears live, you accept or reject the answer.',
    ],
    whyTitle: 'Why choose this buzzer app',
    whyP1:
      'Looking for a free online buzzer, a party buzzer site, or a music-quiz buzzer app? Buzzer App covers multiplayer online buzzer games with no gear and no install.',
    whyP2:
      'Everyone plays from their phone (Wi-Fi, 4G or 5G). Ideal for trivia, general knowledge and music quizzes with friends.',
    bullets: [
      'Real-time synced virtual buzzer',
      'Custom scores (points, bonus, penalty)',
      'Invite with code, link and QR',
      'Public rooms and history',
      'Profile, avatar and theme',
      'Free buzzer, no account needed',
      'Works as a web buzzer on phone, tablet or computer',
    ],
  },
  es: {
    title: 'Buzzer App: aplicación buzzer online gratis para blind test y quiz',
    description:
      'Buzzer App es una aplicación buzzer online gratis para blind test, quiz y fiestas. Crea una sala, invita a tus amigos por teléfono y mira quién pulsa primero.',
    keywords:
      'buzzer app, aplicación buzzer, buzzer online, buzzer online gratis, buzzer virtual, buzzer blind test, buzzer quiz, juego buzzer multijugador, buzzer web, buzzer móvil',
    ogTitle: 'Buzzer App: buzzer online gratis para quiz y blind test',
    ogDescription:
      'Buzzer virtual online, gratis y multijugador. Ideal para blind test y quiz en el móvil, sin instalación.',
    ogImageAlt: 'Logo de Buzzer App, aplicación buzzer online',
    twitterTitle: 'Buzzer App: buzzer online gratis',
    twitterDescription:
      'Buzzer web para blind test y quiz. Multijugador, gratis, en móvil u ordenador.',
    jsonLdDescription:
      'Aplicación buzzer online gratis para blind test, quiz y noches de juegos. Buzzer virtual multijugador en móvil, tablet u ordenador, sin instalación.',
    jsonLdKeywords:
      'buzzer app, aplicación buzzer, buzzer online gratis, buzzer blind test, buzzer quiz, buzzer multijugador, buzzer virtual',
    alternateNames: [
      'BuzzerApp',
      'aplicación buzzer',
      'buzzer online',
      'buzzer virtual',
      'buzzer quiz',
    ],
    featureList: [
      'Buzzer en tiempo real',
      'Blind test y quiz multijugador',
      'Invitación por código, enlace o QR',
      'Puntuaciones personalizables',
      'Juega en el móvil con Wi-Fi, 4G o 5G',
      'Gratis, sin cuenta y sin instalación',
    ],
    h1: 'Buzzer App: aplicación buzzer online para blind test y quiz',
    lead:
      'Buzzer App es una app buzzer gratis en el navegador. Anima un blind test o un quiz en directo: crea una sala, invita a tus amigos por teléfono y mira quién pulsa primero.',
    cta: 'Jugar al buzzer online ahora',
    howTitle: 'Cómo funciona este buzzer virtual',
    steps: [
      'Crea una sala con nombre, emblema y reglas de puntuación.',
      'Invita a tus amigos con un código, enlace o QR, incluso en redes distintas.',
      'Lanza la ronda: el más rápido aparece en directo, tú validas o rechazas la respuesta.',
    ],
    whyTitle: 'Por qué elegir esta aplicación buzzer',
    whyP1:
      '¿Buscas un buzzer online gratis, un sitio buzzer para fiestas o una app buzzer para blind test? Buzzer App cubre el juego buzzer online multijugador sin material ni instalación.',
    whyP2:
      'Cada uno juega desde su teléfono (Wi-Fi, 4G o 5G). Ideal para quiz, cultura general y blind test entre amigos.',
    bullets: [
      'Buzzer en tiempo real y buzzer virtual sincronizado',
      'Puntuaciones a medida (puntos, bonus, penalización)',
      'Invitación por código, enlace y QR',
      'Salas públicas e historial',
      'Perfil, avatar y tema',
      'Buzzer gratis, sin crear cuenta',
      'Úsalo como buzzer web en móvil, tablet u ordenador',
    ],
  },
  de: {
    title: 'Buzzer App: kostenlose Online-Buzzer-App für Quiz und Musikquiz',
    description:
      'Buzzer App ist eine kostenlose Online-Buzzer-App für Musikquiz, Trivia und Spieleabende. Erstelle einen Raum, lade Freunde per Handy ein und sieh, wer zuerst buzzert.',
    keywords:
      'buzzer app, online buzzer, kostenloser online buzzer, virtueller buzzer, musikquiz buzzer, quiz buzzer, multiplayer buzzer spiel, web buzzer, handy buzzer',
    ogTitle: 'Buzzer App: kostenloser Online-Buzzer für Quiz',
    ogDescription:
      'Kostenloser Multiplayer-Online-Buzzer. Ideal für Musikquiz und Trivia auf dem Handy, ohne Installation.',
    ogImageAlt: 'Buzzer App Logo, Online-Buzzer-Anwendung',
    twitterTitle: 'Buzzer App: kostenloser Online-Buzzer',
    twitterDescription:
      'Web-Buzzer für Musikquiz und Trivia. Multiplayer, kostenlos, auf Handy oder Computer.',
    jsonLdDescription:
      'Kostenlose Online-Buzzer-App für Musikquiz, Trivia und Spieleabende. Multiplayer-Virtuellbuzzer auf Handy, Tablet oder Computer, ohne Installation.',
    jsonLdKeywords:
      'buzzer app, online buzzer, kostenloser online buzzer, musikquiz buzzer, quiz buzzer, multiplayer buzzer, virtueller buzzer',
    alternateNames: [
      'BuzzerApp',
      'Online-Buzzer',
      'virtueller Buzzer',
      'Quiz-Buzzer',
      'Web-Buzzer',
    ],
    featureList: [
      'Echtzeit-Buzzer',
      'Multiplayer-Musikquiz und Trivia',
      'Einladung per Code, Link oder QR',
      'Anpassbare Punkte',
      'Spielbar am Handy über WLAN, 4G oder 5G',
      'Kostenlos, ohne Konto und ohne Installation',
    ],
    h1: 'Buzzer App: Online-Buzzer für Musikquiz und Trivia',
    lead:
      'Buzzer App ist ein kostenloser Browser-Buzzer. Moderiere ein Live-Musikquiz oder Trivia: erstelle einen Raum, lade Freunde per Handy ein und sieh, wer zuerst drückt.',
    cta: 'Jetzt den Online-Buzzer spielen',
    howTitle: 'So funktioniert dieser virtuelle Buzzer',
    steps: [
      'Erstelle einen Raum mit Name, Wappen und Punktregeln.',
      'Lade Freunde mit Code, Link oder QR ein, auch in anderen Netzen.',
      'Starte die Runde: der Schnellste erscheint live, du akzeptierst oder lehnst die Antwort ab.',
    ],
    whyTitle: 'Warum diese Buzzer-App',
    whyP1:
      'Suchst du einen kostenlosen Online-Buzzer, eine Party-Buzzer-Seite oder eine Musikquiz-Buzzer-App? Buzzer App deckt Multiplayer-Online-Buzzerspiele ohne Gerät und ohne Installation ab.',
    whyP2:
      'Alle spielen vom Handy (WLAN, 4G oder 5G). Ideal für Trivia, Allgemeinwissen und Musikquiz mit Freunden.',
    bullets: [
      'Echtzeit-synchronisierter virtueller Buzzer',
      'Individuelle Punkte (Bonus, Strafe)',
      'Einladung per Code, Link und QR',
      'Öffentliche Räume und Verlauf',
      'Profil, Avatar und Theme',
      'Kostenloser Buzzer, kein Konto nötig',
      'Als Web-Buzzer auf Handy, Tablet oder Computer nutzbar',
    ],
  },
  zh: {
    title: 'Buzzer App：免费在线抢答器，适合盲听与知识问答',
    description:
      'Buzzer App 是免费的在线抢答应用，适合盲听、问答和聚会游戏。创建房间，用手机邀请好友，看谁先抢答。',
    keywords:
      'buzzer app, 在线抢答器, 免费在线抢答, 虚拟抢答器, 盲听抢答, 知识问答抢答, 多人抢答游戏, 网页抢答, 手机抢答',
    ogTitle: 'Buzzer App：免费在线抢答器',
    ogDescription: '免费多人在线抢答。适合手机上的盲听与问答，无需安装。',
    ogImageAlt: 'Buzzer App 标志，在线抢答应用',
    twitterTitle: 'Buzzer App：免费在线抢答',
    twitterDescription: '网页抢答器，用于盲听与问答。多人、免费，手机或电脑可用。',
    jsonLdDescription:
      '免费在线抢答应用，适合盲听、问答与聚会。可在手机、平板或电脑上多人使用，无需安装。',
    jsonLdKeywords:
      'buzzer app, 在线抢答器, 免费在线抢答, 盲听抢答, 知识问答, 多人抢答, 虚拟抢答器',
    alternateNames: [
      'BuzzerApp',
      '在线抢答器',
      '虚拟抢答器',
      '问答抢答',
      '网页抢答',
    ],
    featureList: [
      '实时抢答',
      '多人盲听与问答',
      '通过代码、链接或二维码邀请',
      '可自定义计分',
      '手机可通过 Wi-Fi、4G 或 5G 游玩',
      '免费，无需账号，无需安装',
    ],
    h1: 'Buzzer App：在线抢答器，适合盲听与知识问答',
    lead:
      'Buzzer App 是浏览器里的免费抢答应用。主持现场盲听或问答：创建房间，用手机邀请好友，看谁先按下。',
    cta: '立即开始在线抢答',
    howTitle: '这个虚拟抢答器如何运作',
    steps: [
      '创建房间，设置名称、徽章和计分规则。',
      '用代码、链接或二维码邀请好友，即使不在同一网络。',
      '开始回合：最快的玩家实时出现，你判定对错。',
    ],
    whyTitle: '为什么选择这款抢答应用',
    whyP1:
      '在找免费在线抢答、聚会抢答网站，或盲听抢答应用？Buzzer App 提供多人在线抢答，无需设备、无需安装。',
    whyP2:
      '每个人用自己的手机玩（Wi-Fi、4G 或 5G）。适合问答、常识与朋友间的盲听。',
    bullets: [
      '实时同步的虚拟抢答',
      '自定义计分（分数、奖励、惩罚）',
      '通过代码、链接和二维码邀请',
      '公开房间与历史记录',
      '个人资料、头像与主题',
      '免费抢答，无需注册',
      '可在手机、平板或电脑上作为网页抢答使用',
    ],
  },
  ru: {
    title: 'Buzzer App: бесплатное онлайн-приложение-баззер для блайнд-теста и викторин',
    description:
      'Buzzer App — бесплатный онлайн-баззер для блайнд-тестов, викторин и вечеринок. Создайте комнату, пригласите друзей с телефона и узнайте, кто нажмёт первым.',
    keywords:
      'buzzer app, онлайн баззер, бесплатный онлайн баззер, виртуальный баззер, баззер блайнд тест, баззер викторина, мультиплеер баззер, веб баззер, баззер на телефоне',
    ogTitle: 'Buzzer App: бесплатный онлайн-баззер для викторин',
    ogDescription:
      'Бесплатный мультиплеерный онлайн-баззер. Для блайнд-тестов и викторин на телефоне, без установки.',
    ogImageAlt: 'Логотип Buzzer App, онлайн-приложение-баззер',
    twitterTitle: 'Buzzer App: бесплатный онлайн-баззер',
    twitterDescription:
      'Веб-баззер для блайнд-тестов и викторин. Мультиплеер, бесплатно, на телефоне или ПК.',
    jsonLdDescription:
      'Бесплатное онлайн-приложение-баззер для блайнд-тестов, викторин и игровых вечеров. Мультиплеерный виртуальный баззер на телефоне, планшете или ПК, без установки.',
    jsonLdKeywords:
      'buzzer app, онлайн баззер, бесплатный онлайн баззер, блайнд тест баззер, викторина, мультиплеер баззер, виртуальный баззер',
    alternateNames: [
      'BuzzerApp',
      'онлайн-баззер',
      'виртуальный баззер',
      'баззер для викторин',
      'веб-баззер',
    ],
    featureList: [
      'Баззер в реальном времени',
      'Мультиплеерные блайнд-тесты и викторины',
      'Приглашение по коду, ссылке или QR',
      'Настраиваемые очки',
      'Игра на телефоне через Wi-Fi, 4G или 5G',
      'Бесплатно, без аккаунта и без установки',
    ],
    h1: 'Buzzer App: онлайн-баззер для блайнд-теста и викторин',
    lead:
      'Buzzer App — бесплатный баззер в браузере. Ведите блайнд-тест или викторину вживую: создайте комнату, пригласите друзей с телефона и узнайте, кто нажмёт первым.',
    cta: 'Играть в онлайн-баззер сейчас',
    howTitle: 'Как работает этот виртуальный баззер',
    steps: [
      'Создайте комнату с названием, гербом и правилами очков.',
      'Пригласите друзей кодом, ссылкой или QR, даже в разных сетях.',
      'Запустите раунд: самый быстрый появляется в прямом эфире, вы принимаете или отклоняете ответ.',
    ],
    whyTitle: 'Почему выбрать это приложение-баззер',
    whyP1:
      'Ищете бесплатный онлайн-баззер, сайт-баззер для вечеринки или приложение для блайнд-теста? Buzzer App закрывает мультиплеерные онлайн-игры с баззером без оборудования и установки.',
    whyP2:
      'Каждый играет со своего телефона (Wi-Fi, 4G или 5G). Идеально для викторин, общих знаний и блайнд-тестов с друзьями.',
    bullets: [
      'Синхронизированный виртуальный баззер в реальном времени',
      'Свои очки (бонус, штраф)',
      'Приглашение по коду, ссылке и QR',
      'Публичные комнаты и история',
      'Профиль, аватар и тема',
      'Бесплатный баззер, аккаунт не нужен',
      'Работает как веб-баззер на телефоне, планшете или ПК',
    ],
  },
};
