import { PrismaClient, RipeningTime, BerryColor, GrapeUsage } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type L = { lt: string; en: string; ru: string; pl: string };

const categories: { slug: string; sortOrder: number; name: L; description: L }[] = [
  {
    slug: "valgomosios",
    sortOrder: 1,
    name: {
      lt: "Valgomosios veislės",
      en: "Table grape varieties",
      ru: "Столовые сорта",
      pl: "Odmiany deserowe",
    },
    description: {
      lt: "Stambiauogės, saldžios veislės, skirtos valgyti šviežias. Puikiai tinka auginti Lietuvos klimate.",
      en: "Large-berried, sweet varieties for fresh eating. Well suited for the Baltic climate.",
      ru: "Крупноплодные сладкие сорта для употребления в свежем виде. Отлично подходят для балтийского климата.",
      pl: "Wielkoowocowe, słodkie odmiany do spożycia na świeżo. Doskonale nadają się do klimatu bałtyckiego.",
    },
  },
  {
    slug: "vynines",
    sortOrder: 2,
    name: {
      lt: "Vyninės veislės",
      en: "Wine grape varieties",
      ru: "Винные сорта",
      pl: "Odmiany winiarskie",
    },
    description: {
      lt: "Veislės, skirtos vyno gamybai – aukštas cukringumas, išraiškingas aromatas, atsparumas ligoms.",
      en: "Varieties bred for winemaking – high sugar content, expressive aroma, disease resistance.",
      ru: "Сорта для виноделия – высокая сахаристость, выразительный аромат, устойчивость к болезням.",
      pl: "Odmiany przeznaczone do produkcji wina – wysoka zawartość cukru, wyrazisty aromat, odporność na choroby.",
    },
  },
  {
    slug: "besekles",
    sortOrder: 3,
    name: {
      lt: "Besėklės veislės",
      en: "Seedless varieties",
      ru: "Бессемянные сорта",
      pl: "Odmiany bezpestkowe",
    },
    description: {
      lt: "Kišmišo tipo veislės be sėklų – mėgstamiausios vaikų, tinka džiovinimui ir šviežiam vartojimui.",
      en: "Kishmish-type seedless varieties – kids' favourites, great for raisins and fresh eating.",
      ru: "Бессемянные сорта типа кишмиш – любимцы детей, подходят для сушки и свежего употребления.",
      pl: "Bezpestkowe odmiany typu kiszmisz – ulubione przez dzieci, idealne na rodzynki i do spożycia na świeżo.",
    },
  },
];

type SeedProduct = {
  slug: string;
  category: string;
  name: L;
  description: L;
  growingInfo: L;
  priceCents: number;
  salePriceCents?: number;
  stock: number;
  featured?: boolean;
  ripening: RipeningTime;
  frostResistance: number;
  berryColor: BerryColor;
  usage: GrapeUsage;
  seedless?: boolean;
};

const products: SeedProduct[] = [
  {
    slug: "solaris",
    category: "vynines",
    name: { lt: "Solaris", en: "Solaris", ru: "Солярис", pl: "Solaris" },
    description: {
      lt: "Viena populiariausių baltojo vyno veislių šiaurės Europoje. Ankstyva, atspari grybinėms ligoms, sukaupia daug cukraus net vėsesnę vasarą. Iš 'Solaris' gaminami aromatingi, tropinių vaisių natomis pasižymintys baltieji vynai.",
      en: "One of the most popular white wine varieties in Northern Europe. Early ripening, resistant to fungal diseases, accumulates high sugar levels even in cooler summers. Produces aromatic white wines with tropical fruit notes.",
      ru: "Один из самых популярных сортов для белого вина в Северной Европе. Ранний, устойчивый к грибковым болезням, набирает высокий сахар даже прохладным летом. Даёт ароматные белые вина с нотами тропических фруктов.",
      pl: "Jedna z najpopularniejszych odmian na białe wino w Europie Północnej. Wczesna, odporna na choroby grzybowe, gromadzi dużo cukru nawet w chłodniejsze lata. Daje aromatyczne białe wina o nutach owoców tropikalnych.",
    },
    growingInfo: {
      lt: "Sodinti saulėtoje, nuo vėjo apsaugotoje vietoje. Rekomenduojamas atstumas tarp krūmų – 1,5–2 m. Genėti pavasarį, paliekant 6–8 akis. Dera 2–3 metais po pasodinimo.",
      en: "Plant in a sunny spot sheltered from wind. Recommended spacing 1.5–2 m. Prune in spring leaving 6–8 buds. Fruits in the 2nd–3rd year after planting.",
      ru: "Сажать на солнечном, защищённом от ветра месте. Рекомендуемое расстояние между кустами 1,5–2 м. Обрезать весной, оставляя 6–8 глазков. Плодоносит на 2–3 год после посадки.",
      pl: "Sadzić w słonecznym, osłoniętym od wiatru miejscu. Zalecany rozstaw 1,5–2 m. Ciąć wiosną, pozostawiając 6–8 oczek. Owocuje w 2–3 roku po posadzeniu.",
    },
    priceCents: 1200,
    stock: 25,
    featured: true,
    ripening: RipeningTime.EARLY,
    frostResistance: -24,
    berryColor: BerryColor.YELLOW,
    usage: GrapeUsage.WINE,
  },
  {
    slug: "rondo",
    category: "vynines",
    name: { lt: "Rondo", en: "Rondo", ru: "Рондо", pl: "Rondo" },
    description: {
      lt: "Ankstyva raudonojo vyno veislė, plačiai auginama Baltijos šalyse ir Lenkijoje. Uogos tamsiai mėlynos, vynas – sodrios rubino spalvos, primenantis pietietiškus raudonuosius vynus.",
      en: "An early red wine variety widely grown in the Baltics and Poland. Dark blue berries yield deep ruby wines reminiscent of southern reds.",
      ru: "Ранний сорт для красного вина, широко выращиваемый в Балтии и Польше. Тёмно-синие ягоды дают насыщенное рубиновое вино, напоминающее южные красные вина.",
      pl: "Wczesna odmiana na czerwone wino, szeroko uprawiana w krajach bałtyckich i w Polsce. Ciemnoniebieskie jagody dają głęboko rubinowe wina przypominające południowe czerwone.",
    },
    growingInfo: {
      lt: "Nereikli dirvožemiui, gerai auga ir sunkesnėje žemėje. Genėti vidutinio ilgio – 5–7 akys. Žiemai jaunus krūmus rekomenduojama pridengti.",
      en: "Undemanding about soil, grows well even in heavier ground. Medium pruning – 5–7 buds. Cover young plants for winter.",
      ru: "Нетребователен к почве, хорошо растёт и на тяжёлых грунтах. Обрезка средняя – 5–7 глазков. Молодые кусты на зиму рекомендуется укрывать.",
      pl: "Mało wymagająca co do gleby, rośnie dobrze nawet na cięższych glebach. Cięcie średnie – 5–7 oczek. Młode krzewy zaleca się okrywać na zimę.",
    },
    priceCents: 1100,
    stock: 30,
    ripening: RipeningTime.EARLY,
    frostResistance: -24,
    berryColor: BerryColor.BLUE,
    usage: GrapeUsage.WINE,
  },
  {
    slug: "regent",
    category: "vynines",
    name: { lt: "Regent", en: "Regent", ru: "Регент", pl: "Regent" },
    description: {
      lt: "Vokiška atspari veislė, duodanti tamsius, taniningus raudonuosius vynus. Puikus pasirinkimas pradedantiesiems vyndariams – mažai serga, stabiliai dera.",
      en: "A resilient German variety producing dark, tannic red wines. A great choice for beginner winemakers – rarely diseased, reliable cropper.",
      ru: "Устойчивый немецкий сорт, дающий тёмные танинные красные вина. Отличный выбор для начинающих виноделов – редко болеет, стабильно плодоносит.",
      pl: "Odporna niemiecka odmiana dająca ciemne, taniczne wina czerwone. Świetny wybór dla początkujących winiarzy – rzadko choruje, plonuje niezawodnie.",
    },
    growingInfo: {
      lt: "Mėgsta šiltas, saulėtas pietines šlaitų vietas. Genėjimas – 6–8 akys. Derlius nuimamas spalio pradžioje.",
      en: "Prefers warm, sunny south-facing spots. Prune to 6–8 buds. Harvest in early October.",
      ru: "Предпочитает тёплые, солнечные южные склоны. Обрезка на 6–8 глазков. Урожай собирают в начале октября.",
      pl: "Preferuje ciepłe, słoneczne stanowiska południowe. Cięcie na 6–8 oczek. Zbiór na początku października.",
    },
    priceCents: 1150,
    stock: 20,
    ripening: RipeningTime.MEDIUM,
    frostResistance: -23,
    berryColor: BerryColor.BLUE,
    usage: GrapeUsage.WINE,
  },
  {
    slug: "marquette",
    category: "vynines",
    name: { lt: "Marquette", en: "Marquette", ru: "Маркетт", pl: "Marquette" },
    description: {
      lt: "Amerikietiška hibridinė veislė, išsiskirianti išskirtiniu atsparumu šalčiui – iki -35 °C. Vynas sodrus, su vyšnių ir juodųjų pipirų natomis. Ideali veislė šaltesnėms Lietuvos vietovėms.",
      en: "An American hybrid famous for exceptional cold hardiness down to -35 °C. Wines are rich with cherry and black pepper notes. Ideal for the coldest sites.",
      ru: "Американский гибрид с исключительной морозостойкостью до -35 °C. Вино насыщенное, с нотами вишни и чёрного перца. Идеален для самых холодных участков.",
      pl: "Amerykańska hybryda o wyjątkowej mrozoodporności do -35 °C. Wina bogate, z nutami wiśni i czarnego pieprzu. Idealna na najzimniejsze stanowiska.",
    },
    growingInfo: {
      lt: "Nereikalauja žiemos dangos. Vengti žemų, šalnų pažeidžiamų vietų dėl ankstyvo pumpurų sprogimo. Genėti 5–7 akis.",
      en: "Needs no winter cover. Avoid frost pockets due to early bud break. Prune to 5–7 buds.",
      ru: "Не требует зимнего укрытия. Избегать низин из-за раннего распускания почек. Обрезка на 5–7 глазков.",
      pl: "Nie wymaga okrywania na zimę. Unikać zmrozowisk ze względu na wczesne pękanie pąków. Cięcie na 5–7 oczek.",
    },
    priceCents: 1400,
    stock: 15,
    featured: true,
    ripening: RipeningTime.EARLY,
    frostResistance: -35,
    berryColor: BerryColor.BLUE,
    usage: GrapeUsage.WINE,
  },
  {
    slug: "zilga",
    category: "valgomosios",
    name: { lt: "Zilga", en: "Zilga", ru: "Зилга", pl: "Zilga" },
    description: {
      lt: "Legendinė latviška veislė, tobulai prisitaikiusi prie Baltijos klimato. Labai ankstyva, itin atspari šalčiui (-32 °C), dera net prasčiausiais metais. Uogos mėlynos, saldžios, su lengvu muskato poskoniu.",
      en: "A legendary Latvian variety perfectly adapted to the Baltic climate. Very early, extremely hardy (-32 °C), crops even in the worst years. Blue, sweet berries with a light muscat flavour.",
      ru: "Легендарный латвийский сорт, идеально приспособленный к балтийскому климату. Очень ранний, исключительно морозостойкий (-32 °C), плодоносит даже в худшие годы. Ягоды синие, сладкие, с лёгким мускатным привкусом.",
      pl: "Legendarna łotewska odmiana doskonale przystosowana do klimatu bałtyckiego. Bardzo wczesna, wyjątkowo mrozoodporna (-32 °C), plonuje nawet w najgorsze lata. Jagody niebieskie, słodkie, z lekkim posmakiem muszkatu.",
    },
    growingInfo: {
      lt: "Viena nereikliausių veislių – tinka pradedantiesiems. Gali augti be žiemos dangos visoje Lietuvoje. Genėti trumpai – 4–6 akys.",
      en: "One of the least demanding varieties – perfect for beginners. Grows without winter cover across the whole region. Prune short – 4–6 buds.",
      ru: "Один из самых неприхотливых сортов – подходит начинающим. Растёт без зимнего укрытия во всём регионе. Обрезка короткая – 4–6 глазков.",
      pl: "Jedna z najmniej wymagających odmian – idealna dla początkujących. Rośnie bez okrywania zimowego w całym regionie. Cięcie krótkie – 4–6 oczek.",
    },
    priceCents: 900,
    stock: 40,
    featured: true,
    ripening: RipeningTime.VERY_EARLY,
    frostResistance: -32,
    berryColor: BerryColor.BLUE,
    usage: GrapeUsage.UNIVERSAL,
  },
  {
    slug: "supaga",
    category: "valgomosios",
    name: { lt: "Supaga", en: "Supaga", ru: "Супага", pl: "Supaga" },
    description: {
      lt: "Latviška valgomoji veislė gelsvai žaliomis, stambiomis uogomis. Kekės didelės, tvirtos, uogos saldžios ir sultingos. Atspari ligoms ir šalčiui iki -25 °C.",
      en: "A Latvian table variety with large yellow-green berries. Big firm clusters, sweet juicy fruit. Disease resistant and hardy to -25 °C.",
      ru: "Латвийский столовый сорт с крупными жёлто-зелёными ягодами. Грозди большие, плотные, ягоды сладкие и сочные. Устойчив к болезням и морозу до -25 °C.",
      pl: "Łotewska odmiana deserowa o dużych żółtozielonych jagodach. Grona duże, zwarte, owoce słodkie i soczyste. Odporna na choroby i mróz do -25 °C.",
    },
    growingInfo: {
      lt: "Auginti prie pietinės sienos arba atviroje saulėtoje vietoje. Dera gausiai, todėl rekomenduojamas kekių normavimas. Genėti 6–8 akis.",
      en: "Grow against a south wall or in an open sunny spot. Crops heavily, so cluster thinning is recommended. Prune to 6–8 buds.",
      ru: "Выращивать у южной стены или на открытом солнечном месте. Плодоносит обильно, рекомендуется нормировка гроздей. Обрезка на 6–8 глазков.",
      pl: "Uprawiać przy południowej ścianie lub na otwartym słonecznym stanowisku. Plonuje obficie, zalecane przerzedzanie gron. Cięcie na 6–8 oczek.",
    },
    priceCents: 950,
    stock: 35,
    ripening: RipeningTime.EARLY,
    frostResistance: -25,
    berryColor: BerryColor.YELLOW,
    usage: GrapeUsage.TABLE,
  },
  {
    slug: "guna",
    category: "valgomosios",
    name: { lt: "Guna", en: "Guna", ru: "Гуна", pl: "Guna" },
    description: {
      lt: "Labai ankstyva latviška veislė rausvai raudonomis uogomis. Sunoksta jau rugpjūčio pabaigoje. Skonis harmoningas, saldus, su vaisiniu aromatu.",
      en: "A very early Latvian variety with pinkish-red berries ripening by late August. Harmonious sweet taste with a fruity aroma.",
      ru: "Очень ранний латвийский сорт с розово-красными ягодами, созревающими уже в конце августа. Вкус гармоничный, сладкий, с фруктовым ароматом.",
      pl: "Bardzo wczesna łotewska odmiana o różowoczerwonych jagodach dojrzewających już pod koniec sierpnia. Smak harmonijny, słodki, o owocowym aromacie.",
    },
    growingInfo: {
      lt: "Krūmas vidutinio augumo. Žiemoja be dangos iki -28 °C. Tinka auginti ir šiaurinėje Lietuvoje. Genėti 5–7 akis.",
      en: "Medium vigour. Overwinters without cover down to -28 °C. Suitable even for northern sites. Prune to 5–7 buds.",
      ru: "Куст средней силы роста. Зимует без укрытия до -28 °C. Подходит и для северных участков. Обрезка на 5–7 глазков.",
      pl: "Krzew o średniej sile wzrostu. Zimuje bez okrycia do -28 °C. Nadaje się także na północne stanowiska. Cięcie na 5–7 oczek.",
    },
    priceCents: 1000,
    stock: 22,
    ripening: RipeningTime.VERY_EARLY,
    frostResistance: -28,
    berryColor: BerryColor.RED,
    usage: GrapeUsage.TABLE,
  },
  {
    slug: "arkadia",
    category: "valgomosios",
    name: { lt: "Arkadija", en: "Arcadia", ru: "Аркадия", pl: "Arkadia" },
    description: {
      lt: "Viena stambiauogiškiausių valgomųjų veislių – kekės gali siekti 2 kg! Uogos gintaro spalvos, traškios, saldžios. Reikalauja šiltesnės vietos arba šiltnamio.",
      en: "One of the largest-berried table varieties – clusters can reach 2 kg! Amber, crisp, sweet berries. Needs a warm spot or a greenhouse.",
      ru: "Один из самых крупноплодных столовых сортов – грозди достигают 2 кг! Ягоды янтарные, хрустящие, сладкие. Требует тёплого места или теплицы.",
      pl: "Jedna z najbardziej wielkoowocowych odmian deserowych – grona mogą osiągać 2 kg! Jagody bursztynowe, chrupiące, słodkie. Wymaga ciepłego stanowiska lub szklarni.",
    },
    growingInfo: {
      lt: "Lietuvoje geriausiai dera šiltnamyje arba prie pietinės sienos. Žiemai būtina pridengti. Genėti 8–10 akių.",
      en: "Crops best in a greenhouse or against a south wall. Winter cover required. Prune to 8–10 buds.",
      ru: "Лучше всего плодоносит в теплице или у южной стены. Обязательно зимнее укрытие. Обрезка на 8–10 глазков.",
      pl: "Najlepiej plonuje w szklarni lub przy południowej ścianie. Wymagane okrycie zimowe. Cięcie na 8–10 oczek.",
    },
    priceCents: 1300,
    salePriceCents: 1100,
    stock: 18,
    ripening: RipeningTime.EARLY,
    frostResistance: -21,
    berryColor: BerryColor.GREEN,
    usage: GrapeUsage.TABLE,
  },
  {
    slug: "somerset-seedless",
    category: "besekles",
    name: {
      lt: "Somerset Seedless",
      en: "Somerset Seedless",
      ru: "Сомерсет Сидлис",
      pl: "Somerset Seedless",
    },
    description: {
      lt: "Geriausia besėklė veislė šaltam klimatui – atlaiko iki -30 °C. Uogos rausvos, nedidelės, bet nepaprastai skanios, su braškių poskoniu. Vaikų favoritas!",
      en: "The best seedless variety for cold climates – hardy to -30 °C. Small pink berries with an exceptional strawberry-like flavour. A kids' favourite!",
      ru: "Лучший бессемянный сорт для холодного климата – выдерживает до -30 °C. Ягоды розовые, некрупные, но исключительно вкусные, с земляничным привкусом. Любимец детей!",
      pl: "Najlepsza bezpestkowa odmiana do zimnego klimatu – wytrzymuje do -30 °C. Jagody różowe, niewielkie, ale wyjątkowo smaczne, o truskawkowym posmaku. Ulubieniec dzieci!",
    },
    growingInfo: {
      lt: "Auga be žiemos dangos. Krūmas vidutinio augumo, genėti 4–6 akis. Dera gausiai ir stabiliai kasmet.",
      en: "Grows without winter cover. Medium vigour, prune to 4–6 buds. Heavy, reliable annual crops.",
      ru: "Растёт без зимнего укрытия. Куст средней силы роста, обрезка на 4–6 глазков. Плодоносит обильно и стабильно каждый год.",
      pl: "Rośnie bez okrycia zimowego. Średnia siła wzrostu, cięcie na 4–6 oczek. Plonuje obficie i niezawodnie co roku.",
    },
    priceCents: 1500,
    stock: 12,
    featured: true,
    ripening: RipeningTime.EARLY,
    frostResistance: -30,
    berryColor: BerryColor.PINK,
    usage: GrapeUsage.TABLE,
    seedless: true,
  },
  {
    slug: "reliance",
    category: "besekles",
    name: { lt: "Reliance", en: "Reliance", ru: "Рилайнс", pl: "Reliance" },
    description: {
      lt: "Amerikietiška besėklė veislė rausvomis uogomis. Švelnus, saldus skonis su muskato natomis. Atspari šalčiui iki -27 °C, tinka džiovinti razinoms.",
      en: "An American seedless variety with pink berries. Mild sweet flavour with muscat notes. Hardy to -27 °C, great for raisins.",
      ru: "Американский бессемянный сорт с розовыми ягодами. Мягкий сладкий вкус с мускатными нотами. Морозостойкость до -27 °C, подходит для изюма.",
      pl: "Amerykańska odmiana bezpestkowa o różowych jagodach. Łagodny, słodki smak z nutami muszkatu. Mrozoodporność do -27 °C, idealna na rodzynki.",
    },
    growingInfo: {
      lt: "Sodinti saulėtoje vietoje, derlingoje dirvoje. Jaunus augalus pirmą žiemą pridengti. Genėti 6–8 akis.",
      en: "Plant in full sun in fertile soil. Cover young plants the first winter. Prune to 6–8 buds.",
      ru: "Сажать на солнце в плодородную почву. Молодые растения укрывать первую зиму. Обрезка на 6–8 глазков.",
      pl: "Sadzić w pełnym słońcu, w żyznej glebie. Młode rośliny okrywać pierwszej zimy. Cięcie na 6–8 oczek.",
    },
    priceCents: 1350,
    stock: 16,
    ripening: RipeningTime.EARLY,
    frostResistance: -27,
    berryColor: BerryColor.PINK,
    usage: GrapeUsage.TABLE,
    seedless: true,
  },
  {
    slug: "kismis-zaporozskij",
    category: "besekles",
    name: {
      lt: "Kišmiš Zaporožskij",
      en: "Kishmish Zaporozhskiy",
      ru: "Кишмиш запорожский",
      pl: "Kiszmisz Zaporoski",
    },
    description: {
      lt: "Ankstyva besėklė veislė tamsiai violetinėmis uogomis. Kekės didelės, uogos mėsingos ir saldžios. Derlinga ir nereikli priežiūrai.",
      en: "An early seedless variety with dark violet berries. Large clusters, fleshy sweet fruit. Productive and low-maintenance.",
      ru: "Ранний бессемянный сорт с тёмно-фиолетовыми ягодами. Грозди крупные, ягоды мясистые и сладкие. Урожайный и неприхотливый.",
      pl: "Wczesna odmiana bezpestkowa o ciemnofioletowych jagodach. Grona duże, owoce mięsiste i słodkie. Plenna i mało wymagająca.",
    },
    growingInfo: {
      lt: "Gali derėti jau antrais metais. Žiemai rekomenduojama pridengti. Genėti 6–8 akis, normuoti derlių.",
      en: "May fruit in its second year. Winter cover recommended. Prune to 6–8 buds, thin the crop.",
      ru: "Может плодоносить уже на второй год. Рекомендуется зимнее укрытие. Обрезка на 6–8 глазков, нормировать урожай.",
      pl: "Może owocować już w drugim roku. Zalecane okrycie zimowe. Cięcie na 6–8 oczek, przerzedzać plon.",
    },
    priceCents: 1250,
    stock: 20,
    ripening: RipeningTime.EARLY,
    frostResistance: -26,
    berryColor: BerryColor.BLUE,
    usage: GrapeUsage.TABLE,
    seedless: true,
  },
  {
    slug: "muscat-bleu",
    category: "valgomosios",
    name: { lt: "Muscat Bleu", en: "Muscat Bleu", ru: "Мускат Блю", pl: "Muscat Bleu" },
    description: {
      lt: "Šveicariška veislė tamsiai mėlynomis uogomis su ryškiu muskato aromatu. Universali – skani šviežia ir tinkama sultims. Labai atspari ligoms.",
      en: "A Swiss variety with dark blue berries and a pronounced muscat aroma. Versatile – delicious fresh and great for juice. Highly disease resistant.",
      ru: "Швейцарский сорт с тёмно-синими ягодами и ярким мускатным ароматом. Универсален – вкусен свежим и подходит для сока. Очень устойчив к болезням.",
      pl: "Szwajcarska odmiana o ciemnoniebieskich jagodach i wyraźnym muszkatowym aromacie. Uniwersalna – smaczna na świeżo i na sok. Bardzo odporna na choroby.",
    },
    growingInfo: {
      lt: "Mėgsta šiltą, saulėtą vietą. Žiemai jaunus krūmus pridengti. Genėti 6–8 akis. Sunoksta rugsėjo viduryje.",
      en: "Prefers a warm sunny site. Cover young vines in winter. Prune to 6–8 buds. Ripens mid-September.",
      ru: "Предпочитает тёплое солнечное место. Молодые кусты укрывать на зиму. Обрезка на 6–8 глазков. Созревает в середине сентября.",
      pl: "Preferuje ciepłe, słoneczne stanowisko. Młode krzewy okrywać na zimę. Cięcie na 6–8 oczek. Dojrzewa w połowie września.",
    },
    priceCents: 1450,
    stock: 14,
    ripening: RipeningTime.MEDIUM,
    frostResistance: -22,
    berryColor: BerryColor.BLUE,
    usage: GrapeUsage.UNIVERSAL,
  },
];

async function main() {
  // Store settings singleton
  await prisma.storeSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", contactEmail: "info@example.com", contactPhone: "+370 600 00000" },
  });

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Administratorius",
    },
  });

  // Categories
  const categoryIds: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, sortOrder: c.sortOrder },
      create: { slug: c.slug, name: c.name, description: c.description, sortOrder: c.sortOrder },
    });
    categoryIds[c.slug] = row.id;
  }

  // Products
  for (const p of products) {
    const { category, ...data } = p;
    const row = await prisma.product.upsert({
      where: { slug: p.slug },
      update: { ...data, categoryId: categoryIds[category] },
      create: { ...data, categoryId: categoryIds[category] },
    });
    const imageUrl = `/products/${p.slug}.svg`;
    const existing = await prisma.productImage.findFirst({ where: { productId: row.id } });
    if (!existing) {
      await prisma.productImage.create({
        data: { productId: row.id, url: imageUrl, alt: p.name.lt, sortOrder: 0 },
      });
    }
  }

  console.log(
    `Seeded ${categories.length} categories, ${products.length} products, admin ${adminEmail}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
