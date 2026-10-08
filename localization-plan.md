# Plán lokalizace FE (`eng-task-grading-react-fe`)

Prompt/plán pro implementaci. Rozsah: **pouze FE**. Jazyky: **cs (výchozí/zdrojový) + en**, architektura musí umožnit přidat další jazyk bez zásahu do komponent.

## 1. Rozhodnutí (již potvrzeno)

- Jazyky: `cs`, `en`. Fallback jazyk: `cs`.
- Volba jazyka: přepínač v UI + uložení do `localStorage`; při prvním načtení detekce z `navigator.language` (cs* → `cs`, jinak `en`).
- BE se nemění. Chybové hlášky z BE se překládají na FE podle `ErrorKey`. Lokalizace e-mailů z BE = případná následná fáze (mimo tento plán).

## 2. Výchozí stav (zjištěno z kódu)

- Všechny UI texty jsou natvrdo česky v ~79 souborech `src/**/*.tsx|ts` (stovky řetězců): routy, modály, editory (`src/ui/editors`), `src/ui/*`, `top-menu*`.
- `src/hooks/use-toast.ts` má `ErrorKeyMessages: Record<ErrorKey, string>` s českými texty a placeholderem `%%` (např. `COURSE_DUPLICATE_CODE`). Toto je připravený vzor pro překlad chyb.
- `src/types/validations.ts` – bez textů (OK).
- Formátování dat/čísel je roztříštěné a natvrdo `'cs-CZ'` nebo bez locale (`toLocaleString()`), místa např.:
  `components/tasks/EditGradeModal.tsx`, `components/attendanceDays/SelfSignTab.tsx`, `components/appLog/AppLogDetailModal.tsx`, `routes/tasks/$id.tsx`, `routes/admin/logs.tsx`, `routes/studentView/**`, `routes/courses/$id/grades.tsx`, `studentView/login-management/index.tsx`.
- `index.html` má `<lang="en">`; `title` je pravděpodobně statický.
- Žádná i18n knihovna není v `package.json`.

## 3. Technické řešení

**Knihovna: `i18next` + `react-i18next` + `i18next-browser-languagedetector`** (de facto standard, typově bezpečné klíče, plurály přes ICU-like pravidla `_one/_few/_many/_other` – čeština má 3 plurální tvary, což je důvod nepoužít vlastní řešení).

Struktura:

```
src/i18n/
  index.ts              // init i18next, detektor, fallbackLng: 'cs'
  resources.d.ts        // augmentace CustomTypeOptions -> typované klíče t('...')
  locales/
    cs/
      common.json       // tlačítka (Uložit, Zrušit, Smazat…), obecné popisky
      errors.json       // ErrorKey -> text
      auth.json         // login, register, reset hesla
      courses.json
      tasks.json
      attendances.json
      students.json
      studentView.json
      admin.json
    en/                 // stejná struktura
  format.ts             // useFormatters(): formatDate, formatDateTime, formatNumber
src/components/global/LanguageSwitcher.tsx
```

- Namespace = doména (odpovídá členění `components/<domain>/`), načítané staticky (bundle je malý; lazy loading není potřeba).
- Klíče: `namespace:section.element`, např. `courses:create.title`. Žádné klíče typu věta-jako-klíč.
- Interpolace: `{{code}}` místo `%%` (u `ErrorKeyMessages` převést a upravit místo volání v `use-toast.ts`).
- Plurály: `count` + `_one/_few/_many/_other` (cs), `_one/_other` (en).
- Typové klíče: `cs` je zdroj pravdy → `declare module 'i18next' { interface CustomTypeOptions { resources: typeof cs } }`. Chybějící klíč = chyba `tsc -b`.
- Texty s JSX uvnitř (odkazy, tučné) řešit přes `<Trans>`.

## 4. Kroky implementace

1. **Setup**: `npm i i18next react-i18next i18next-browser-languagedetector`; vytvořit `src/i18n/*`; import `./i18n` v `main.tsx` před renderem. Detektor: `order: ['localStorage', 'navigator']`, `caches: ['localStorage']`, klíč např. `app.lang`; `supportedLngs: ['cs','en']`, `load: 'languageOnly'`.
2. **`<html lang>`**: v `i18n.on('languageChanged')` nastavit `document.documentElement.lang`. Nastavit i `document.title`, pokud je lokalizovatelný.
3. **LanguageSwitcher**: komponenta (CS | EN) v `top-menu.tsx` a také na stránkách bez menu (login, register, resetování hesla, studentView login/verify, self-sign) – tyto stránky jsou dostupné i nepřihlášeným studentům.
4. **Formátovací hook** `useFormatters()`: jediné místo pro `Intl.DateTimeFormat`/`Intl.NumberFormat` s `i18n.language` jako locale. Nahradit všechna místa z části 2 (`toLocaleString('cs-CZ')`, `toLocaleDateString()` apod.). Číselné formáty (např. `maximumFractionDigits: 2`) zachovat.
5. **Chyby**: `ErrorKeyMessages` → `errors.json` (cs/en); `use-toast.ts` použije `i18n.t('errors:' + key, { code })`. Ověřit, že toasty se překládají v okamžiku zobrazení (ne při importu modulu). Neznámý klíč/ BE text → fallback na obecnou chybu.
6. **Migrace textů po doménách** (každá doména = samostatný commit, aby šla zrevidovat):
   1. `global` (menu, `DeleteModal`, `AppDialog`, `loading`, `loadingError`) + `common.json`
   2. auth routy (`login`, `register`, `teacherPasswordReset/*`)
   3. `courses` (komponenty + routy `courses/**`)
   4. `tasks` + `grades`
   5. `attendances`, `attendanceDays`, `attendanceSelfSign`, `ui/editors/Attendance*`
   6. `studentView` (+ `studentView/**` routy)
   7. `admin` (logy; technické texty logů nechat případně neprložené – viz níže)
   8. `ui/*`, `turnstille.tsx`, `ui/editors/*`, `form/*`
   V každé komponentě: `const { t } = useTranslation('<ns>')`; texty včetně `placeholder`, `title`, `aria-label`, `alt` a validačních hlášek formulářů (TanStack Form).
7. **Data z BE, která jsou uživatelsky viditelná**: ověřit, zda BE posílá texty, které se zobrazují (např. názvy hodnot docházky `AttendanceValueDto.title`, stavy). Pokud jde o uživatelská data (zadává učitel) → **nepřekládat**. Pokud jde o pevné enumy/kódy → mapovat na FE klíče.
8. **Dokumentace**: doplnit `CLAUDE.md` (sekce Frontend: konvence i18n, kde jsou překlady, jak přidat jazyk), a bump `version` v `package.json` (minor).

## 5. Pravidla pro implementaci

- Nepřekládat: logy (`use-logger`, `log-service`, `console.*`), technické identifikátory, názvy routes, texty v `AppLog` detailech (admin, technické), klíče a hodnoty DTO.
- Nepřepisovat české texty při přesunu – `cs` překlad musí být slovo od slova shodný s dnešním UI (nulová regrese v češtině). Komentáře v kódu neměnit.
- Žádné skládání vět z fragmentů (`t('a') + x + t('b')`) – vždy jedna věta s interpolací (kvůli pořadí slov a skloňování).
- Neupravovat ručně `src/routeTree.gen.ts`.
- Anglické texty psát přirozeně (ne doslovně); terminologie: *course, task, grade, attendance (day), student group, self-sign*. Slovníček sepsat na začátek práce a držet konzistenci.

## 6. Ověření

- `npm run build` (`tsc -b`) prochází, `npm run lint` bez nových chyb.
- Skript/kontrola parity klíčů `cs` ↔ `en` (např. jednoduchý node skript nebo `i18next-parser`/`i18next-cli` v `npm run i18n:check`): žádný chybějící/přebytečný klíč.
- Grep na zbytek natvrdo českých znaků v `src/**/*.tsx` (`[áčďéěíňóřšťúůýž]`) – výsledek má být jen v komentářích a `locales/cs`.
- Ruční průchod v obou jazycích: login → kurzy → úkoly/známky → docházka → import studentů → studentský pohled (self-sign, verify) → admin logy. Zkontrolovat: toasty a chyby (např. duplicitní kód kurzu), plurály (počty studentů/dní), datumy a desetinná čárka/tečka, přeponutí po refreshi (localStorage), `<html lang>`, přetečení dlouhých anglických/českých textů v tlačítkách a tabulkách.

## 7. Otevřené body / návrhy

- Doporučeno: po dokončení přidat do CI/pre-commit kontrolu parity klíčů (CI zatím neexistuje).
- Následná fáze (mimo rozsah): lokalizace e-mailů z BE (poslat jazyk v požadavku, resp. uložit do profilu učitele) a překlad textů `Controllers/_Endpoints.md`.
- Případné další jazyky: přidat složku `locales/<lng>`, položku do `supportedLngs` a do `LanguageSwitcher`.
