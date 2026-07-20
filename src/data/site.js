// Shared site data — single source of truth for repeated content.
export const PLAY_URL =
  'https://play.google.com/store/apps/details?id=com.grahachara.app&pcampaignid=web_share';

export const navLinks = [
  { label: 'Home', href: 'index.html', active: true },
  { label: 'Birth Chart', href: 'features/birth-chart.html' },
  { label: 'Compatibility', href: 'features/compatibility.html' },
  { label: 'Daily Horoscope', href: 'features/daily-horoscope.html' },
  { label: 'Panchanga', href: 'features/zodiac-signs.html' },
  { label: 'Learn', href: 'blog/what-is-vedic-astrology.html' },
  { label: 'About', href: 'about.html' },
];

// Quick feature cards (top of page)
export const featureCards = [
  { icon: 'f_birthchart', title: 'Birth Chart', desc: 'Discover your unique cosmic blueprint.' },
  { icon: 'f_compat', title: 'Compatibility', desc: 'Understand relationships through cosmic harmony.' },
  { icon: 'f_horoscope', title: 'Daily Horoscope', desc: 'Daily insights for better decisions.' },
  { icon: 'f_report', title: 'Life Report', desc: "Deep insights for your life's journey." },
];

// The 12 signs
export const zodiac = [
  { slug: 'aries', name: 'Aries', key: 'Bold beginnings and courage.' },
  { slug: 'taurus', name: 'Taurus', key: 'Steady strength and patience.' },
  { slug: 'gemini', name: 'Gemini', key: 'Curious minds and connection.' },
  { slug: 'cancer', name: 'Cancer', key: 'Deep emotions and intuition.' },
  { slug: 'leo', name: 'Leo', key: 'Radiant confidence and creativity.' },
  { slug: 'virgo', name: 'Virgo', key: 'Thoughtful wisdom and clarity.' },
  { slug: 'libra', name: 'Libra', key: 'Harmony, balance and beauty.' },
  { slug: 'scorpio', name: 'Scorpio', key: 'Transformation and power.' },
  { slug: 'sagittarius', name: 'Sagittarius', key: 'Adventure, truth and freedom.' },
  { slug: 'capricorn', name: 'Capricorn', key: 'Discipline, ambition and legacy.' },
  { slug: 'aquarius', name: 'Aquarius', key: 'Innovation and humanity.' },
  { slug: 'pisces', name: 'Pisces', key: 'Compassion and spiritual depth.' },
];

// The big app-feature walkthrough sections (relit tarot art)
export const featureSections = [
  {
    id: 'feature-today', side: 'right', art: 'art_daily', num: 'I', label: 'Daily Guidance',
    badge: 'Daily Nakath', title: 'Daily nakath &<br>rahu kalaya.',
    desc: 'Start every day knowing your subha nakath — calculated live for your exact city, not copied from a printed litha.',
    list: ['Subha nakath — your lucky times', 'Rahu kalaya, live for your city', 'Best hours to travel or sign contracts', 'From your own chart, never generic'],
  },
  {
    id: 'feature-chart', side: 'left', art: 'art_chart', num: 'II', label: 'Birth Chart',
    badge: 'Kendara', title: 'Your complete<br>kendara.',
    desc: 'Birth date, time and place — your full kendara appears in seconds, explained in plain language you can actually read.',
    list: ['Lagna & planetary positions', 'Dasha periods mapped', 'Navamsha chart included', 'Plain-language explanations'],
  },
  {
    id: 'feature-match', side: 'right', art: 'art_match', num: 'III', label: 'Compatibility',
    badge: 'Porondam', title: 'Porondam & marriage<br>compatibility.',
    desc: 'Compare both horoscopes before the big step — with honest, practical guidance, ideal before engagements and weddings.',
    list: ['Clear score across 7 key factors', 'Strengths & what to work on', 'Honest, practical guidance', 'Both horoscopes, side by side'],
  },
  {
    id: 'feature-report', side: 'left', art: 'art_report', num: 'IV', label: 'Life Report',
    badge: 'Life Reports', title: 'Career, love,<br>health & money.',
    desc: 'A detailed personal report built from your own kendara — written in simple words, not confusing jargon.',
    list: ['Career direction', 'Relationship patterns', 'Health tendencies', 'Financial timing'],
  },
  {
    id: 'feature-oracle', side: 'right', art: 'art_oracle', num: 'V', label: 'Oracle & Guide',
    badge: 'Ask Anytime', title: 'Ask your astrologer<br>— anytime.',
    desc: 'A burning question at midnight? Your personal astrologer chat already knows your birth chart — a wise guide in your pocket.',
    list: ['Knows your kendara already', 'Thoughtful, personalized answers', 'Available 24/7', 'Dream interpretation too'],
  },
  {
    id: 'feature-baby', side: 'left', art: 'art_baby', num: 'VI', label: 'Baby Kendara',
    badge: 'Baby Kendara', title: 'A blessed<br>beginning.',
    desc: 'Welcome your little one with a keepsake baby kendara — their very first chart, beautifully explained.',
    list: ['Keepsake baby kendara', 'Lagna & nakshatra at birth', 'Explained in plain language', 'A gift to treasure forever'],
  },
  {
    id: 'feature-muhurtha', side: 'right', art: 'art_muhurtha', num: 'VII', label: 'Wedding Nakath',
    badge: 'Muhurtha', title: 'The right time,<br>for everything.',
    desc: 'A wedding, a new home, a new venture — we give you the best time and date, with clear advice for every plan.',
    list: ['Wedding nakath for both partners', 'Auspicious dates for any plan', 'Best hours, tuned to your city', 'Practical advice with every muhurtha'],
  },
];

export const elements = [
  { icon: 'i-fire', label: 'Fire' }, { icon: 'i-earth', label: 'Earth' },
  { icon: 'i-air', label: 'Air' }, { icon: 'i-water', label: 'Water' },
];
export const modalities = [
  { icon: 'i-cardinal', label: 'Cardinal', sub: 'Initiates' },
  { icon: 'i-fixed', label: 'Fixed', sub: 'Stabilizes' },
  { icon: 'i-mutable', label: 'Mutable', sub: 'Adapts' },
];
export const planets = [
  { icon: 'i-sun', label: 'Sun' }, { icon: 'i-moon', label: 'Moon' },
  { icon: 'i-orbit', label: 'Mercury' }, { icon: 'i-orbit', label: 'Venus' },
  { icon: 'i-orbit', label: 'Mars' }, { icon: 'i-orbit', label: 'Jupiter' },
  { icon: 'i-orbit', label: 'Saturn' }, { icon: 'i-star', label: 'Rahu' },
  { icon: 'i-star', label: 'Ketu' },
];

export const trustBand = [
  { icon: 'i-star', t: 'Real Calculations', d: 'Not recycled horoscopes' },
  { icon: 'i-orbit', t: 'Works Worldwide', d: 'Tuned to your exact city' },
  { icon: 'i-sun', t: 'Fully Bilingual', d: 'Sinhala & English' },
  { icon: 'i-shield', t: 'Private by Design', d: 'Encrypted birth details' },
  { icon: 'i-lotus', t: 'Start Free', d: 'Go Pro anytime' },
];

/* ══════════════════════════════════════════════════════════════════════
   SINHALA (සිංහල) — mirrors the arrays above for /si.html
   ══════════════════════════════════════════════════════════════════════ */
export const navLinksSi = [
  { label: 'මුල් පිටුව', href: 'si.html', active: true },
  { label: 'කේන්දරය', href: 'features/birth-chart-si.html' },
  { label: 'පොරොන්දම්', href: 'features/compatibility-si.html' },
  { label: 'දෛනික නැකත', href: 'features/daily-horoscope.html' },
  { label: 'පංචාංගය', href: 'features/zodiac-signs.html' },
  { label: 'දැනගන්න', href: 'blog/what-is-vedic-astrology.html' },
  { label: 'අප ගැන', href: 'about-si.html' },
];

export const featureCardsSi = [
  { icon: 'f_birthchart', title: 'කේන්දරය', desc: 'ඔබේ අනන්‍ය ග්‍රහ සැලැස්ම සොයාගන්න.' },
  { icon: 'f_compat', title: 'පොරොන්දම්', desc: 'ග්‍රහ එකඟතාව හරහා සබඳතා තේරුම් ගන්න.' },
  { icon: 'f_horoscope', title: 'දෛනික නැකත', desc: 'හොඳ තීරණ සඳහා දිනපතා විවරණ.' },
  { icon: 'f_report', title: 'ජීවිත වාර්තාව', desc: 'ඔබේ ජීවිත ගමනට ගැඹුරු විවරණ.' },
];

export const zodiacSi = [
  { slug: 'aries', name: 'මේෂ', key: 'නිර්භීත ආරම්භ සහ ධෛර්යය.' },
  { slug: 'taurus', name: 'වෘෂභ', key: 'ස්ථාවර ශක්තිය සහ ඉවසීම.' },
  { slug: 'gemini', name: 'මිථුන', key: 'කුතුහලය සහ සම්බන්ධතා.' },
  { slug: 'cancer', name: 'කටක', key: 'ගැඹුරු හැඟීම් සහ බුද්ධිය.' },
  { slug: 'leo', name: 'සිංහ', key: 'දීප්තිමත් විශ්වාසය සහ නිර්මාණශීලීත්වය.' },
  { slug: 'virgo', name: 'කන්‍යා', key: 'කල්පනාකාරී ඥානය සහ පැහැදිලිකම.' },
  { slug: 'libra', name: 'තුලා', key: 'සමගිය, තුලනය සහ අලංකාරය.' },
  { slug: 'scorpio', name: 'වෘශ්චික', key: 'පරිවර්තනය සහ බලය.' },
  { slug: 'sagittarius', name: 'ධනු', key: 'වික්‍රමය, සත්‍යය සහ නිදහස.' },
  { slug: 'capricorn', name: 'මකර', key: 'විනය, අභිලාෂය සහ උරුමය.' },
  { slug: 'aquarius', name: 'කුම්භ', key: 'නවෝත්පාදනය සහ මානවත්වය.' },
  { slug: 'pisces', name: 'මීන', key: 'කරුණාව සහ අධ්‍යාත්මික ගැඹුර.' },
];

export const featureSectionsSi = [
  {
    id: 'feature-today', side: 'right', art: 'art_daily', num: 'I', label: 'දෛනික මඟපෙන්වීම',
    badge: 'දෛනික නැකත', title: 'දෛනික නැකත සහ<br>රාහු කාලය.',
    desc: 'මුද්‍රිත ලිතකින් පිටපත් නොකර, ඔබේ නිශ්චිත නගරයට ජීවත්ව ගණනය කළ ඔබේ සුබ නැකත දැනගෙන සෑම දිනක්ම අරඹන්න.',
    list: ['සුබ නැකත — ඔබේ වාසනාවන්ත වේලාවන්', 'රාහු කාලය, ඔබේ නගරයට ජීවත්ව', 'ගමන් හෝ ගිවිසුම් සඳහා හොඳම පැය', 'ඔබේම කේන්දරයෙන්, කිසිදා පොදු නොවේ'],
  },
  {
    id: 'feature-chart', side: 'left', art: 'art_chart', num: 'II', label: 'කේන්දරය',
    badge: 'කේන්දරය', title: 'ඔබේ සම්පූර්ණ<br>කේන්දරය.',
    desc: 'උපන් දිනය, වේලාව සහ ස්ථානය — ඔබට කියවිය හැකි සරල භාෂාවෙන් පැහැදිලි කළ ඔබේ සම්පූර්ණ කේන්දරය තත්පර කිහිපයකින්.',
    list: ['ලග්නය සහ ග්‍රහ පිහිටීම්', 'දශා කාල සිතියම්ගත', 'නවාංශක කේන්දරය ඇතුළත්', 'සරල භාෂාවෙන් පැහැදිලි කිරීම්'],
  },
  {
    id: 'feature-match', side: 'right', art: 'art_match', num: 'III', label: 'පොරොන්දම්',
    badge: 'පොරොන්දම්', title: 'පොරොන්දම් සහ විවාහ<br>ගැළපීම.',
    desc: 'විශාල පියවරට පෙර කේන්දර දෙකම සසඳන්න — එංගේජ්මන්ට් සහ විවාහයන්ට පෙර වඩාත් සුදුසු, අවංක ප්‍රායෝගික මඟපෙන්වීම සමඟ.',
    list: ['ප්‍රධාන සාධක 7ක පැහැදිලි ලකුණු', 'ශක්තීන් සහ වැඩිදියුණු කළ යුතු දේ', 'අවංක, ප්‍රායෝගික මඟපෙන්වීම', 'කේන්දර දෙකම, එකට'],
  },
  {
    id: 'feature-report', side: 'left', art: 'art_report', num: 'IV', label: 'ජීවිත වාර්තාව',
    badge: 'ජීවිත වාර්තා', title: 'රැකියාව, ආදරය,<br>සෞඛ්‍යය සහ මුදල්.',
    desc: 'ව්‍යාකූල වචන නොව සරල වචනවලින් ලියූ, ඔබේම කේන්දරයෙන් සකස් කළ විස්තරාත්මක පෞද්ගලික වාර්තාවක්.',
    list: ['රැකියා දිශාව', 'සබඳතා රටා', 'සෞඛ්‍ය ප්‍රවණතා', 'මූල්‍ය කාලසටහන්'],
  },
  {
    id: 'feature-oracle', side: 'right', art: 'art_oracle', num: 'V', label: 'ප්‍රශ්න සහ මඟපෙන්වීම',
    badge: 'ඕනෑම වේලාවක අසන්න', title: 'ඔබේ ජ්‍යොතිෂවේදියාගෙන්<br>ඕනෑම විටෙක අසන්න.',
    desc: 'මධ්‍යම රාත්‍රියේ පැනයක්ද? ඔබේ පෞද්ගලික ජ්‍යොතිෂ කතාබහ දැනටමත් ඔබේ කේන්දරය දනී — ඔබේ සාක්කුවේ නැණවත් මඟපෙන්වන්නෙක්.',
    list: ['ඔබේ කේන්දරය දැනටමත් දනී', 'කල්පනාකාරී, පෞද්ගලික පිළිතුරු', 'දිනපතා පැය 24ම', 'සිහින විග්‍රහයද'],
  },
  {
    id: 'feature-baby', side: 'left', art: 'art_baby', num: 'VI', label: 'දරු කේන්දරය',
    badge: 'දරු කේන්දරය', title: 'ආශිර්වාද ලත්<br>ආරම්භයක්.',
    desc: 'ලස්සනට පැහැදිලි කළ ඔවුන්ගේ පළමු කේන්දරය — සිහිවටනයක් වන දරු කේන්දරයකින් ඔබේ පුංචි දරුවා පිළිගන්න.',
    list: ['සිහිවටන දරු කේන්දරය', 'උපතේදී ලග්නය සහ නක්ෂත්‍රය', 'සරල භාෂාවෙන් පැහැදිලි', 'සදාකාලික තෑග්ගක්'],
  },
  {
    id: 'feature-muhurtha', side: 'right', art: 'art_muhurtha', num: 'VII', label: 'මංගල නැකත',
    badge: 'මුහුර්ත', title: 'හැම දෙයකටම<br>නියම වේලාව.',
    desc: 'විවාහයක්, නව නිවසක්, නව ව්‍යාපාරයක් — සෑම සැලැස්මකටම පැහැදිලි උපදෙස් සමඟ හොඳම වේලාව සහ දිනය අපි දෙන්නෙමු.',
    list: ['යුවළ දෙදෙනාටම මංගල නැකත', 'ඕනෑම සැලැස්මකට සුබ දින', 'ඔබේ නගරයට ගැළපෙන හොඳම පැය', 'සෑම මුහුර්තයක් සමඟම ප්‍රායෝගික උපදෙස්'],
  },
];

export const elementsSi = [
  { icon: 'i-fire', label: 'ගිනි' }, { icon: 'i-earth', label: 'පොළොව' },
  { icon: 'i-air', label: 'වාතය' }, { icon: 'i-water', label: 'ජලය' },
];
export const modalitiesSi = [
  { icon: 'i-cardinal', label: 'චර', sub: 'අරඹයි' },
  { icon: 'i-fixed', label: 'ස්ථිර', sub: 'ස්ථාවර කරයි' },
  { icon: 'i-mutable', label: 'ද්විස්වභාව', sub: 'අනුවර්තනය' },
];
export const planetsSi = [
  { icon: 'i-sun', label: 'රවි' }, { icon: 'i-moon', label: 'චන්ද්‍ර' },
  { icon: 'i-orbit', label: 'බුධ' }, { icon: 'i-orbit', label: 'සිකුරු' },
  { icon: 'i-orbit', label: 'කුජ' }, { icon: 'i-orbit', label: 'ගුරු' },
  { icon: 'i-orbit', label: 'ශනි' }, { icon: 'i-star', label: 'රාහු' },
  { icon: 'i-star', label: 'කේතු' },
];

export const trustBandSi = [
  { icon: 'i-star', t: 'නියම ගණනය කිරීම්', d: 'නැවත භාවිත පලාපල නොවේ' },
  { icon: 'i-orbit', t: 'ලොව පුරා ක්‍රියාත්මක', d: 'ඔබේ නිශ්චිත නගරයට ගැළපේ' },
  { icon: 'i-sun', t: 'භාෂා දෙකෙන්ම', d: 'සිංහල සහ ඉංග්‍රීසි' },
  { icon: 'i-shield', t: 'පෞද්ගලිකත්වය සුරැකේ', d: 'සංකේතගත උපත් තොරතුරු' },
  { icon: 'i-lotus', t: 'නොමිලේ අරඹන්න', d: 'ඕනෑම විටෙක Pro වෙන්න' },
];
