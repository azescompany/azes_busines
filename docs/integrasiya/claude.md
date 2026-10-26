# AZES Academy: Moodle Memarlığına Əsaslanan Böyük Arxitektura

> **Status:** Memarlıq layihəsi (v1). Mövcud RBAC + Org + Track planını və İcra Planını (v2) **genişləndirir və bəzi yerlərdə dəqiqləşdirir** (bax §2.3 və §30).
> **Mənbə:** Moodle rəsmi sənədləri (`docs.moodle.org`, 5.3 versiyası baxılıb). Sənəddə "Moodle-də belədir" deyilən yerlər həmin sənədlərə və Moodle-in ümumi memarlığına əsaslanır.
> **Texnologiya:** React + TypeScript (frontend), Node/TypeScript (backend), mövcud `apps/api` + `@azes/api` (OpenAPI/Orval), mövcud layout shell və dizayn sistemi (MUI, token-lər).

---

## İçindəkilər

1. Məqsəd və yanaşma
2. Moodle → AZES konsept xəritəsi
3. Ümumi laylı arxitektura
4. Monorepo və "plugin" sistemi
5. Context sistemi
6. Rollar, capability-lər və icazə həlli
7. Autentifikasiya və sessiya
8. İstifadəçilər, cohort və qruplar
9. Org, Track və kurs kateqoriyaları
10. Kurs strukturu (section, activity, resource)
11. Activity modulları
12. Enrolment (kursa yazılma)
13. Conditional availability (şərti əlçatanlıq)
14. Completion (tamamlanma) və progress
15. Gradebook (qiymət jurnalı)
16. Question bank və Quiz mühərriki
17. Assignment
18. Event API və observer-lər
19. Task API (zamanlanmış və arxa plan işləri)
20. Message və Notification API
21. File API
22. Config, Settings və Cache API
23. External API (web services) və OpenAPI
24. Verilənlər bazası sxemi
25. API endpoint xəritəsi
26. Frontend arxitekturası və menyu
27. Hesabatlar, log, analitika
28. Privacy, backup, badge, certificate, competency
29. Təhlükəsizlik, performans, i18n, accessibility
30. Mərhələ xəritəsi və əvvəlki planlara təsir
31. Açıq qərarlar və risklər
32. Əlavə: lüğət və mənbələr

---

## 1. Məqsəd və yanaşma

### 1.1 Məqsəd

AZES Academy-ni Moodle-in **memarlıq modelini** izləyən, lakin AZES-in texnologiyası (React, Node, TypeScript, D1/SQL, OpenAPI) və mövcud dizaynı ilə qurulan LMS etmək.

### 1.2 "Moodle-i izləmək" nə deməkdir

| İzləyirik                                                                               | İzləmirik                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Konseptual model: context, role, capability, enrolment, activity, gradebook, completion | Moodle-in PHP kodunu köçürmək                                 |
| Plugin əsaslı bölgü (hər funksiya öz komponentidir)                                     | Moodle-in UI-ı və Boost teması (AZES-in mövcud shell-i qalır) |
| Event/observer, Task, File, Cache, Config API pattern-ləri                              | Server-rendered səhifələr (bizdə SPA + API var)               |
| Capability-əsaslı icazə yoxlaması                                                       | Sabit "rol adı" yoxlamaları                                   |
| Kurs → section → activity iyerarxiyası                                                  | Moodle DB cədvəl adlarını eynən təkrarlamaq                   |

### 1.3 Lisenziya xəbərdarlığı

Moodle sənədləri qeyd edir ki, məzmun GNU General Public License altındadır. Moodle-in koduna GPL tətbiq olunur. **Biz konsepsiyaları və memarlığı yenidən TypeScript-də yazırıq, kod köçürmürük.** Moodle koduna baxıb birbaşa kopyalamaq AZES-i GPL altına sala bilər. Bu məsələ hüquqi baxımdan ayrıca yoxlanmalıdır, mən hüquqşünas deyiləm.

### 1.4 Realist gözlənti

Moodle 20 ildən artıq inkişaf edib və yüzlərlə plugin-i var. **Bütün funksiyaların tam paritetinə nail olmaq real deyil.** Bizim hədəf:

1. **Memarlığı tam izləmək** (konseptlər, API-lər, plugin sərhədləri) ki, sonradan funksiya əlavə etmək asan olsun.
2. **Funksiyaları mərhələ-mərhələ** doldurmaq (§30).

---

## 2. Moodle → AZES konsept xəritəsi

### 2.1 Əsas konseptlər

Moodle sənədlərinə görə Moodle **kurslar** ətrafında qurulub: kurs müəllimin resurs və activity-ləri tələbələrə təqdim etdiyi sahədir, kurslar kateqoriyalara bölünür, istifadəçi rolları isə admin tərəfindən **konkret kontekstlərdə** təyin olunur.

| Moodle konsepti        | Qısa izah                                        | AZES qarşılığı                                              |
| ---------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Site                   | Bütün Moodle quraşdırması                        | Platforma (`superAdmin` idarə edir)                         |
| Site administrator     | Capability yoxlamasından keçən xüsusi istifadəçi | `users.is_site_admin = 1` → `superAdmin`                    |
| Course category        | Kursların iyerarxik qrupu                        | `Org` (kök kateqoriya) + alt kateqoriyalar                  |
| Course                 | Əsas tədris vahidi                               | `Course`                                                    |
| Course section         | Kurs daxilində bölmə (Topic/Week)                | `Section` (köhnə plandakı "Module" buna çevrilir, bax §2.3) |
| Activity / Resource    | Kursdakı fəaliyyət və ya material                | `CourseModule` (instance) + `mod_*` komponenti              |
| Block                  | Yan panel elementi                               | `Widget` (dashboard, kurs yan paneli)                       |
| Role                   | Capability-lər toplusu                           | `Role`                                                      |
| Capability             | Tək bir icazə (`mod/quiz:attempt`)               | `Capability`                                                |
| Context                | İcazənin tətbiq olunduğu sahə                    | `Context`                                                   |
| Enrolment method       | Kursa yazılma yolu (manual, self, cohort)        | `enrol_*` plugin-ləri                                       |
| Cohort                 | Site/kateqoriya səviyyəsində user qrupu          | `Cohort`                                                    |
| Group / Grouping       | Kurs daxilində qrup                              | `Group` / `Grouping`                                        |
| Gradebook              | Mərkəzi qiymət jurnalı                           | `grade_*` cədvəlləri + Grade API                            |
| Activity completion    | Activity tamamlanma izləmə                       | `Completion API`                                            |
| Restrict access        | Şərti əlçatanlıq                                 | `Availability` ağacı                                        |
| Question bank          | Quiz sualları anbarı                             | `Question bank`                                             |
| Badges / Competencies  | Nailiyyət və səriştə                             | `Badge`, `Competency` (gec mərhələ)                         |
| Event / Observer       | Hadisə sistemi                                   | `Event bus`                                                 |
| Scheduled / Adhoc task | Arxa plan işləri                                 | `Task API` (Cron + Queue)                                   |
| Web services           | Xarici API                                       | `External functions` + OpenAPI                              |
| Plugin                 | Genişlənmə vahidi                                | `Module` (build-time registry)                              |
| Theme                  | Görünüş                                          | **Mövcud shell və token-lər dəyişmir**                      |
| Dashboard / My courses | Şəxsi başlanğıc səhifə                           | `İcmal` / `Mənim kurslarım`                                 |

### 2.2 Moodle-in əsas prinsipi: heç kim "teacher" kimi daxil olmur

Moodle sənədi açıq yazır: istifadəçi "teacher" və ya "student" rolu ilə daxil olmur. Hamı admin tərəfindən fərdi kurslarda və ya kontekstlərdə rol təyin olunana qədər xüsusi imtiyazsızdır.

**Bu AZES üçün vacib nəticədir.** Əvvəlki planda `users.role` tək sütun idi. Moodle modelində rol **istifadəçinin xassəsi deyil, təyinatdır** (`role_assignments`). Eyni insan bir kursda instructor, digərində student ola bilər.

### 2.3 Əvvəlki planla fərqlər (dürüst qeyd)

| Mövzu              | Əvvəlki plan                                | Moodle-uyğun yeni təklif                                                                                            | Səbəb                                                                                                         |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Rol saxlanması     | `users.role` tək sütun                      | `role_assignments(user, role, context)`                                                                             | Eyni user fərqli yerdə fərqli rol daşıyır                                                                     |
| `orgAdmin`         | Sabit rol                                   | `orgmanager` rolu, Org context-də təyin                                                                             | Moodle-dəki "Manager at category" modeli                                                                      |
| `instructor`       | Sabit rol                                   | `instructor` rolu (Course creator + Teacher arxetipi). Kurs yaradanda həmin kursda avtomatik `teacher` təyin olunur | "Yalnız öz kursunu redaktə edir" qaydası təbii alınır                                                         |
| Track + enrollment | Track = giriş, Enrollment = progress (ayrı) | Track assign → **enrolment yaradır** (`enrol_track`). Giriş mənbəyi yalnız enrolment-dir                            | Moodle-də kursa giriş yalnız enrolment + role ilə müəyyən olunur; iki paralel giriş mənbəyi ziddiyyət yaradar |
| "Module" adı       | Kursun bölməsi                              | `Section`. "Module" Moodle-də activity deməkdir                                                                     | Terminoloji qarışıqlığın qarşısı                                                                              |
| JWT-də rol         | `role` + `orgId`                            | `sub`, `sid`, `isSiteAdmin`, `orgId` (yalnız default). İcazələr serverdə context-dən həll olunur                    | Rol artıq tək dəyər deyil                                                                                     |
| Menyu              | `permissions[]`                             | `GET /me/navigation` serverdə hesablanır                                                                            | Capability context-dən asılıdır                                                                               |

---

## 3. Ümumi laylı arxitektura

```text
┌──────────────────────────────────────────────────────────────┐
│  Frontend (React + TS + MUI, mövcud shell və token-lər)      │
│  Route guard · Menu config · Orval client · Widget-lər       │
└───────────────▲──────────────────────────────────────────────┘
                │ OpenAPI (generated client)
┌───────────────┴──────────────────────────────────────────────┐
│  API layı (apps/api)                                         │
│  Auth middleware → Context resolver → Capability guard       │
│  External functions (Moodle "web services" analoqu)          │
└───────────────▲──────────────────────────────────────────────┘
                │
┌───────────────┴──────────────────────────────────────────────┐
│  CORE (Moodle "lib" analoqu)                                 │
│  context · access · user · course · enrol · grade ·          │
│  completion · availability · files · event · task ·          │
│  message · cache · config · privacy · backup · question      │
└───────────────▲──────────────────────────────────────────────┘
                │ manifest ilə qeydiyyat
┌───────────────┴──────────────────────────────────────────────┐
│  MODUL-lar (Moodle plugin analoqu)                           │
│  mod_* · enrol_* · auth_* · qtype_* · format_* · report_* ·  │
│  availability_* · gradingform_* · block_* · local_*          │
└───────────────▲──────────────────────────────────────────────┘
                │
┌───────────────┴──────────────────────────────────────────────┐
│  İnfrastruktur: SQL/D1 · R2/obyekt saxlama · Queue · Cron ·  │
│  Cache (KV/memory) · Email/SMS provider                      │
└──────────────────────────────────────────────────────────────┘
```

### 3.1 Qaydalar

1. **Core modulları tanımır.** Core yalnız interfeys və registry bilir. `mod_quiz` core-a asılıdır, əksinə yox.
2. **Hər endpoint** context resolver və capability guard-dan keçir.
3. **Modul özünü manifest ilə qeydiyyatdan keçirir**: capability-lər, event observer-lər, external function-lar, task-lar, menyu elementləri, lang string-ləri.
4. **Frontend D1-ə və ya DB-yə birbaşa çıxış etmir.** Yalnız `@azes/api`.
5. **Server həqiqət mənbəyidir.** Menyu və guard-lar yalnız UX-dir.

### 3.2 Platforma fərziyyəsi

Mövcud sənədlərdə `apps/api`, D1, R2 və Cloudflare qeyd olunub. Bu memarlıq **o fərziyyəni qəbul edir**, lakin storage, queue və cache interfeyslər arxasında saxlanılır ki, lazım olsa Node + PostgreSQL/SQLite variantına keçmək mümkün olsun.

| Moodle xüsusiyyəti                 | Cloudflare/Workers reallığı           | Həll                                                                                |
| ---------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| Plugin-lər runtime-da quraşdırılır | Workers-də runtime kod yükləmə yoxdur | **Build-time registry**: modullar kodla əlavə olunur, `enabled` flag ilə aktivləşir |
| Cron hər dəqiqə işləyir            | Cron Triggers var                     | Scheduled task runner + Queue                                                       |
| Ağır hesabat sorğuları             | D1 limitləri                          | Aqreqasiya cədvəlləri, indekslər, Queue ilə qabaqcadan hesablama                    |
| Böyük fayllar                      | Worker body limitləri                 | R2-ə imzalı URL ilə birbaşa yükləmə                                                 |

---

## 4. Monorepo və "plugin" sistemi

### 4.1 Qovluq strukturu

```text
apps/
  api/src/
    core/
      context/        # context yaradılması, path, cache
      access/         # capability həlli, has_capability
      user/ course/ enrol/ grade/ completion/ availability/
      files/ event/ task/ message/ cache/ config/ privacy/ backup/
      question/       # question bank API (core hissə)
    modules/
      mod/            # page, file, url, folder, label, quiz, assign, lesson, ...
      enrol/          # manual, self, cohort, track, guest
      auth/           # manual, oauth2 (sonra), ldap (sonra)
      qtype/          # multichoice, truefalse, shortanswer, numerical, essay, matching
      qbehaviour/     # deferredfeedback, immediatefeedback, interactive
      format/         # topics, singleactivity
      availability/   # date, grade, completion, group
      gradingform/    # rubric, guide (gec)
      report/         # progress, log, completion, quizstats
      block/          # dashboard/kurs widget-ləri
      local/          # AZES-ə xas əlavələr (org, track idarəsi)
    registry.generated.ts   # build-time modul reyestri
    http/             # route-lar, middleware, external functions
  web/src/            # React tətbiqi (mövcud shell)
packages/
  api/                # OpenAPI + Orval generated client (@azes/api)
  shared/             # ortaq tiplər, capability adları, event adları
```

### 4.2 Modul tipləri (Moodle plugin tipləri ilə uyğunluq)

| Tip prefiksi    | Məqsəd                                        | Nümunə                                      |
| --------------- | --------------------------------------------- | ------------------------------------------- |
| `mod_`          | Activity və resource                          | `mod_quiz`, `mod_assign`, `mod_page`        |
| `enrol_`        | Kursa yazılma metodu                          | `enrol_manual`, `enrol_self`, `enrol_track` |
| `auth_`         | Giriş metodu                                  | `auth_manual`, `auth_oauth2`                |
| `qtype_`        | Sual tipi                                     | `qtype_multichoice`                         |
| `qbehaviour_`   | Sual davranışı (necə cavablanır, qiymətlənir) | `qbehaviour_deferredfeedback`               |
| `format_`       | Kurs formatı                                  | `format_topics`                             |
| `availability_` | Giriş şərti                                   | `availability_date`                         |
| `gradingform_`  | Qabaqcıl qiymətləndirmə                       | `gradingform_rubric`                        |
| `report_`       | Kurs/site hesabatı                            | `report_progress`                           |
| `block_`        | Widget                                        | `block_mycourses`                           |
| `local_`        | Xüsusi əlavələr                               | `local_orgtrack`                            |

### 4.3 Modul manifesti

Moodle plugin-ində `version.php`, `db/access.php`, `db/events.php`, `db/services.php`, `db/tasks.php` və lang faylları olur. TypeScript-də bunların hamısı **bir manifestdə** cəmləşir:

```ts
// modules/mod/quiz/manifest.ts
export default defineModule({
  component: 'mod_quiz',
  type: 'mod',
  version: 2026102000,

  capabilities: [
    { name: 'mod_quiz:view', archetypes: { student: 'allow', teacher: 'allow' }, riskBitmask: 0 },
    { name: 'mod_quiz:attempt', archetypes: { student: 'allow' } },
    { name: 'mod_quiz:addinstance', archetypes: { teacher: 'allow', manager: 'allow' } },
    { name: 'mod_quiz:viewreports', archetypes: { teacher: 'allow', manager: 'allow' } },
    { name: 'mod_quiz:grade', archetypes: { teacher: 'allow' } },
  ],

  observers: [{ event: 'course_module.deleted', handler: onCmDeleted }],

  externalFunctions: [startAttempt, saveAttempt, submitAttempt, getAttemptReview],
  tasks: [{ name: 'quiz.close_overdue_attempts', schedule: '*/5 * * * *', handler: closeOverdue }],

  migrations: ['./migrations/0001_quiz.sql'],
  lang: { az: azStrings, en: enStrings },
  navigation: { courseNode: true },
});
```

### 4.4 Modul həyat dövrü

1. **Build:** manifestlər toplanır, `registry.generated.ts` yaranır.
2. **Deploy/migrate:** hər modulun migration-ları versiya ilə işləyir (`config_plugins.version`).
3. **Install/upgrade hook:** capability-lər `capabilities` cədvəlinə sinxronlanır, arxetip rolları yenilənir.
4. **Enable/disable:** `config_plugins.enabled`. Söndürülmüş modul menyuda və activity chooser-də görünmür, data silinmir.

---

## 5. Context sistemi

Moodle-də **context** icazənin tətbiq olunduğu sahədir. Rol təyinatı və override-lar context-ə bağlanır.

### 5.1 Context səviyyələri

| Səviyyə        | Moodle               | AZES-də məna                                   |
| -------------- | -------------------- | ---------------------------------------------- |
| 10 `SYSTEM`    | Bütün sayt           | Platforma                                      |
| 30 `USER`      | Konkret user profili | İstifadəçi profili (mentor/valideyn gələcəkdə) |
| 40 `COURSECAT` | Kurs kateqoriyası    | **Org** və alt kateqoriyalar                   |
| 50 `COURSE`    | Kurs                 | Kurs                                           |
| 70 `MODULE`    | Activity             | Activity instance (quiz, assign...)            |
| 80 `BLOCK`     | Block                | Widget (yalnız lazım olsa)                     |

Context ağacı:

```text
SYSTEM (platforma)
 └── COURSECAT: Org "AZES Məktəb"
      ├── COURSECAT: alt kateqoriya (məs. "Orta məktəb")
      │    └── COURSE: Riyaziyyat 5
      │         ├── MODULE: Quiz "Fəsil 1 testi"
      │         └── MODULE: Assign "Ev tapşırığı"
      └── COURSE: İş hazırlığı: CV yazmaq
```

### 5.2 Context cədvəli

`context(id, level, instance_id, path, depth)` burada `path` ata context id-lərindən ibarətdir: `/1/12/45/77`.

- Org scope yoxlaması = `path LIKE '/1/12/%'` (prefix).
- **Cross-org sızmasının qarşısı:** istənilən obyektin context-i tapılır, user-in həmin context üzərində capability-si yoxlanılır. Ayrıca `WHERE org_id = ?` helper-i əlavə müdafiə kimi qalır (defense in depth).

### 5.3 Context resolver

Hər request-də:

```ts
const ctx = await contexts.forCourse(courseId); // yaxud forModule(cmId), forOrg(orgId)
await access.require(user, 'moodle/course:update', ctx);
```

Context obyektləri cache olunur, path-lər dəyişdikdə (kurs başqa kateqoriyaya köçəndə) alt ağac yenidən qurulur.

---

## 6. Rollar, capability-lər və icazə həlli

### 6.1 Moodle modeli

Sənədə görə rol sistem üzrə təyin olunmuş icazələr toplusudur və konkret kontekstlərdə istifadəçilərə təyin olunur. Rol + context birləşməsi istifadəçinin hər səhifədə nə edə biləcəyini müəyyən edir.

Moodle capability üçün 4 dəyər istifadə edir:

| Dəyər             | Məna                                                                        |
| ----------------- | --------------------------------------------------------------------------- |
| Not set (inherit) | Üst context-dən miras alır                                                  |
| Allow             | İcazə verir                                                                 |
| Prevent           | Bu rol üçün üst icazəni ləğv edir, alt context-də yenidən Allow oluna bilər |
| Prohibit          | Mütləq qadağa, alt context-də ləğv edilə bilməz                             |

### 6.2 Standart rollar və AZES qarşılığı

| Moodle rolu                 | AZES rolu                                | Təyin olunduğu context               | Qeyd                                                |
| --------------------------- | ---------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| Site administrator (xüsusi) | `superAdmin`                             | SYSTEM (flag)                        | Capability yoxlamasını keçir. `users.is_site_admin` |
| Manager                     | `orgmanager` (**orgAdmin**)              | COURSECAT (Org)                      | Org daxilində hər şey                               |
| Course creator              | `instructor` (1-ci hissə)                | COURSECAT (Org və ya alt kateqoriya) | `moodle/course:create`                              |
| Teacher (editing)           | `teacher` (instructor-un kurs səviyyəsi) | COURSE                               | Kurs yaradanda avtomatik təyin olunur               |
| Non-editing teacher         | `assistant`                              | COURSE                               | Gələcək (köməkçi/mentor)                            |
| Student                     | `student`                                | COURSE (enrolment ilə)               | Enrolment yaradanda təyin olunur                    |
| Guest                       | `guest`                                  | SYSTEM                               | Girişsiz, yalnız ictimai kataloq                    |
| Authenticated user          | `user`                                   | SYSTEM                               | Hər giriş etmiş user                                |

> **İstifadəçiyə görə:** product dilində "instructor" bir roldur. Texniki olaraq o iki təyinatın birləşməsidir: Org səviyyəsində `coursecreator` (kurs yarada bilir) + yaratdığı hər kursda `teacher`.

### 6.3 Capability adlandırması

Moodle formatı: `komponent/sahə:əməl` (məs. `mod/quiz:attempt`, `moodle/course:update`). AZES-də eyni format saxlanılır ki, Moodle sənədləri ilə paralel oxunsun:

| Capability                       | Mənası                      | Arxetiplər                  |
| -------------------------------- | --------------------------- | --------------------------- |
| `azes/org:manage`                | Org parametrləri            | manager                     |
| `azes/org:createinstructor`      | Instructor yaratmaq         | manager                     |
| `azes/track:manage`              | Track yaratmaq/redaktə      | manager, coursecreator      |
| `azes/track:assign`              | Userə Track açmaq           | manager, coursecreator      |
| `moodle/course:create`           | Kurs yaratmaq               | manager, coursecreator      |
| `moodle/course:update`           | Kurs ayarlarını dəyişmək    | manager, teacher            |
| `moodle/course:view`             | Kursu görmək                | enrolled roles              |
| `moodle/course:manageactivities` | Activity əlavə/dəyiş        | manager, teacher            |
| `moodle/course:publish`          | Draft → published           | manager, teacher            |
| `moodle/user:create`             | User yaratmaq               | manager, coursecreator      |
| `moodle/course:enrolreview`      | Enrolment-lərə baxmaq       | manager, teacher            |
| `moodle/course:enrolconfig`      | Enrolment metodlarını idarə | manager, teacher            |
| `moodle/grade:viewall`           | Hamının qiymətini görmək    | manager, teacher            |
| `moodle/grade:view`              | Öz qiymətini görmək         | student                     |
| `moodle/grade:edit`              | Qiyməti dəyişmək            | manager, teacher            |
| `mod/quiz:attempt`               | Quiz həll etmək             | student                     |
| `mod/assign:submit`              | Tapşırıq göndərmək          | student                     |
| `mod/assign:grade`               | Tapşırığı qiymətləndirmək   | teacher                     |
| `moodle/site:config`             | Platforma parametrləri      | yalnız site admin           |
| `moodle/analytics:view`          | Analitika                   | manager, teacher (öz kursu) |

Tam siyahı hər modulun manifestindən gəlir, burada başlanğıc dəstdir.

### 6.4 Rol təyinatı və override

- `role_assignments(role_id, user_id, context_id, component, item_id)`: `component` və `item_id` təyinatın mənbəyini göstərir (məs. `enrol_track` tərəfindən yaradılıb). Mənbə silinəndə təyinat da silinir.
- `role_capabilities(role_id, capability, context_id, permission)`: `context_id = SYSTEM` standart təyinat, alt context-lərdə **override**.
- **Override (permission override)** ilk versiyada yalnız kurs və activity səviyyəsində, yalnız `manager` və `teacher` üçün. Mürəkkəb UI sonraya qalır, lakin cədvəl hazır olur.

### 6.5 İcazə həlli alqoritmi

```ts
async function hasCapability(user, cap, ctx): Promise<boolean> {
  if (user.isSiteAdmin) return true; // site admin bypass
  if (!(await contextAllowsUser(user, ctx))) return false; // login/suspended/enrol yoxlamaları

  // 1) user-in bu context-də və ÜST context-lərdə rol təyinatları
  const roles = await roleAssignmentsFor(user.id, ctx.path);

  // 2) hər rol üçün capability dəyəri: ən spesifik (ən dərin) context qalib
  //    amma Prohibit hər zaman qalib gəlir
  let allowed = false;
  for (const role of roles) {
    const perm = await resolvePermission(role, cap, ctx); // inherit/allow/prevent/prohibit
    if (perm === 'prohibit') return false;
    if (perm === 'allow') allowed = true;
  }
  return allowed;
}
```

Detallar:

- Rol təyinatı üst context-dən aşağı **miras qalır** (Org-da `manager` → bütün kurslarda).
- Hər rolun capability dəyəri ən yaxın context-dən götürülür.
- Bir neçə rol varsa: hər hansı biri `allow` + heç biri `prohibit` deyilsə → icazə var.
- **Cache:** `(userId, contextId)` üçün həll edilmiş capability dəsti qısa müddətə cache olunur. Rol təyinatı və ya override dəyişəndə həmin user/context cache-i ləğv olunur.

### 6.6 Risk bitmask

Moodle capability-lərə risk işarəsi qoyur (`RISK_XSS`, `RISK_PERSONAL`, `RISK_DATALOSS`, ...). AZES-də admin UI-da rolu redaktə edəndə bu işarələr xəbərdarlıq kimi göstərilir. İlk versiyada sahə modeldə olur, UI sonra.

### 6.7 Qaydalar (kodda məcburi)

1. `if (role === 'teacher')` **qadağandır**. Yalnız `requireCapability(...)`.
2. Hər external function manifestdə **tələb etdiyi capability-ni və context tipini** elan edir.
3. Resource cavablarında server `permissions` obyekti qaytarır: `{ canEdit, canDelete, canEnrol }`. Frontend düymələri buna görə göstərir.
4. Cross-org və cross-owner testləri hər mərhələdə məcburidir.

---

## 7. Autentifikasiya və sessiya

### 7.1 Auth plugin-ləri

Moodle-də authentication plugin-ləri var (manual, email-əsaslı, OAuth 2, LDAP və s.). AZES:

| Plugin            | Mərhələ     | Qeyd                                                                  |
| ----------------- | ----------- | --------------------------------------------------------------------- |
| `auth_manual`     | M1          | Username/email + parol, instructor student üçün müvəqqəti parol verir |
| `auth_oauth2`     | Sonra       | Google/Microsoft                                                      |
| `auth_selfreg`    | Sonra       | Öz-özünə qeydiyyat (aktivləşdirilə bilən)                             |
| `auth_ldap` / SSO | İstəyə görə | Böyük təşkilatlar                                                     |

### 7.2 İstifadəçi vəziyyətləri

`active` · `suspended` · `deleted` · `must_change_password`. İlk giriş və admin yaratdığı müvəqqəti parolda **parol dəyişdirmə məcburidir**.

### 7.3 Token modeli

```json
{ "sub": "usr_123", "sid": "ses_456", "isSiteAdmin": false, "orgId": "org_9", "exp": 900 }
```

- Access token qısa ömürlü (məs. 15 dəq), refresh token və `sessions` cədvəli.
- JWT-də **rol yoxdur**. `orgId` yalnız default org kimi ipucudur.
- İcazələr hər sorğuda context-dən həll olunur (cache ilə), buna görə rol dəyişikliyi dərhal təsir edir. Köhnəlmiş token problemi yoxdur.
- Parol sıfırlama, sessiyanın ləğvi, cihaz siyahısı M1-də planlanır.

### 7.4 Login sonrası yönləndirmə

Server `/me/navigation` cavabında `landing` qaytarır (§26).

---

## 8. İstifadəçilər, cohort və qruplar

### 8.1 İstifadəçi

`users`: id, username, email, password_hash, first_name, last_name, status, auth, org_id (əsas org), lang, timezone, is_site_admin, last_login_at.

- Əlavə profil sahələri (`user_info_field`, `user_info_data`) Moodle-dəki "custom profile fields" kimi (sinif, məktəb, telefon).
- **Bir user bir org-a aiddir** (ilk versiya qərarı), amma modelin özü bunu məhdudlaşdırmır (rol təyinatı context-ə bağlıdır).

### 8.2 Cohort

Moodle-də cohort site və ya kateqoriya səviyyəsində user qruplarıdır, kurslara toplu yazmaq üçün istifadə olunur.

- `cohorts(id, context_id, name, idnumber, visible)` · `cohort_members(cohort_id, user_id)`.
- **Track assign-in əsası cohort-dur** (§9.3).

### 8.3 Group və Grouping

Kurs daxilində qruplar (məs. "5A sinfi") fəaliyyətləri fərqləndirmək və nəticələri süzmək üçün.

- `groups(course_id, name)` · `group_members` · `groupings` · `grouping_groups`.
- Activity-lərdə `group_mode` (yox / ayrı qruplar / görünən qruplar).
- İlk versiyada cədvəllər və kurs səviyyəsi API var, activity daxili tətbiq M5+.

---

## 9. Org, Track və kurs kateqoriyaları

### 9.1 Org = kök kateqoriya

`organizations` cədvəli + hər Org üçün bir `COURSECAT` context-i. Org adı, status, limitlər (maks instructor/student sayı).

- `orgAdmin` = Org context-də `orgmanager` təyinatı.
- Kateqoriya ağacı Org daxilində alt bölmələr üçün istifadə oluna bilər (məs. "Orta məktəb", "Peşə kursları").

> **Qeyd:** Moodle-in açıq mənbə versiyası çoxkirayəçilik (multi-tenant) üçün hazır model vermir; bu adətən kateqoriya + rol təyinatları ilə həll edilir. Moodle Workplace məhsulunda "tenant" anlayışı olduğunu bilirəm, lakin onun detallarını bu sənəd üçün yoxlamadım. Buna görə Org modelini kateqoriya əsasında qururuq.

### 9.2 Track nədir

Moodle-də **birbaşa Track qarşılığı yoxdur**. Ona ən yaxın konseptlər: **Cohort + Course category + kursları qruplaşdırmaq üçün proqram/learning plan** anlayışlarıdır. AZES-in tələbi:

> Müəllim "5-ci sinif", "6-cı sinif", "İş hazırlığı" kimi adlı bölmələr yaradır. Bölməyə kurslar aid edir. Userə bir və ya bir neçə bölmə açır.

Buna görə **Track AZES-ə xas konseptdir** (`local_orgtrack` modulunda), lakin Moodle mexanizmləri üzərində qurulur:

```text
Track "5-ci sinif"
  ├── track_courses      → hansı kurslar (bir kurs bir neçə Track-də ola bilər)
  ├── track cohort       → bu Track-ə təyin olunmuş userlər (gizli cohort)
  └── enrol_track        → cohort üzvlərini Track-in kurslarına avtomatik yazır
```

### 9.3 Track assign necə işləyir (`enrol_track`)

Moodle-dəki **cohort sync** enrolment metodunun analoqu:

1. Instructor userə Track açır → `user_tracks` + track cohort-a üzv əlavə olunur.
2. `enrol_track` hər Track kursunda bir enrolment instance saxlayır.
3. Event observer user-i bütün Track kurslarına `user_enrolments` ilə yazır, `student` rolunu təyin edir (`component = 'enrol_track'`, `item_id = track_id`).
4. Track-ə sonradan kurs əlavə olunsa → task bütün üzvləri həmin kursa yazır.
5. User Track-dən çıxarılsa → yalnız bu Track-in yaratdığı enrolment-lər `suspended` olur. Başqa Track-lərdən və ya manual yazılmalar toxunulmaz qalır, progress silinmir.

**Üstünlük:** kursa giriş mənbəyi tək yerdədir (enrolment). Progress, qiymət, tamamlanma hamısı enrolment-ə bağlıdır.

### 9.4 Dinamik adlandırma

UI-da "Track" sözü müəllimə göstərilmir. Org parametrində **etiket** (`track_label`: "Bölmə", "Proqram", "Sinif") ayarlanır. Kod və API-də `track` qalır.

### 9.5 Görünürlük qaydaları

| Kim          | Nəyi görür                                                    |
| ------------ | ------------------------------------------------------------- |
| `guest`      | `published` + `access_type = free` + ictimai kurslar          |
| `student`    | Ona açılmış Track-lərin kursları + ictimai kataloq            |
| `instructor` | Öz yaratdığı Track-lər və kurslar (kurs context-də `teacher`) |
| `orgmanager` | Org-dakı hamısı                                               |
| `superAdmin` | Hamısı                                                        |

---

## 10. Kurs strukturu (section, activity, resource)

Moodle sənədinə görə kurslar mərkəzi bölmələrdən (material göstərilir) və yan bloklardan ibarətdir. Kurs kateqoriyalarda təşkil olunur.

### 10.1 İyerarxiya

```text
Course
 ├── Section 1 ("Giriş")
 │     ├── CourseModule → mod_page   (resource)
 │     ├── CourseModule → mod_url    (resource, video link)
 │     └── CourseModule → mod_quiz   (activity)
 ├── Section 2 ("Fəsil 1")
 │     └── ...
 └── Section N
```

- **Section:** kursun bölməsi (köhnə planda "Module"). Ad, xülasə, görünürlük, sıra.
- **CourseModule (cm):** activity və ya resource-un kursdakı **yeri**. `mod_*` cədvəlində isə **instance** (məzmun) saxlanılır.
- Bu ayrılıq vacibdir: `course_modules` ümumi məlumatı (görünürlük, sıra, completion, availability), `mod_quiz` isə quiz-ə xas məlumatı saxlayır.

### 10.2 Course format

Kursun necə göstərilməsi `format_*` plugin-i ilə müəyyən olunur.

| Format                  | Mərhələ     | Təsvir                                       |
| ----------------------- | ----------- | -------------------------------------------- |
| `format_topics`         | M2          | Section-lar mövzu kimi (default)             |
| `format_singleactivity` | Sonra       | Kurs yalnız bir activity-dir (məs. tək quiz) |
| `format_weeks`          | İstəyə görə | Həftəlik cədvəl                              |

### 10.3 Kurs sahələri

`courses`: id, category_id (Org/alt kateqoriya), full_name, short_name, slug, id_number, summary, level, cover_file_id, **visible** (admin gizlətməsi), **status** (`draft`/`published`/`archived`), **access_type** (`free`/`invite`/`paid`-rezerv), format, start_date, end_date, completion_enabled, lang, created_by, created_at, updated_at, published_at.

> Moodle-də kurs `visible` flag-ı ilə gizlədilir. AZES-in `status` sahəsi əlavə publish axınını təmin edir. İkisi birlikdə işləyir: kurs yalnız `status = published AND visible = 1` olanda tələbəyə görünür.

### 10.4 Görünürlük və soft delete

- `course_modules.visible`, `visible_old`, `deletion_in_progress` (Moodle kimi).
- Tələbə progress-i olan activity silinmir, `archived` olur (köhnə planın §3 qərarı qalır). Silmə asinxron `adhoc task` ilə gedir (§19).

### 10.5 Block / Widget

Moodle-də bloklar yan panel elementləridir. AZES-də onların qarşılığı **mövcud shell daxilində widget-lərdir**: dashboard kartları ("Davam et", "Yaxınlaşan tapşırıqlar"), kurs səhifəsində yan panel ("Progress", "Tamamlanma").

- Yeni shell, sidebar və ya dizayn sistemi yaradılmır.
- Widget manifestdə qeydiyyatdan keçir, hansı səhifədə, hansı capability ilə görünəcəyini elan edir.

---

## 11. Activity modulları

Moodle-də activity-lər tələbənin iştirak etdiyi fəaliyyətlər (assignment, quiz, forum, workshop və s.), resource-lar isə material növləridir (page, file, folder, URL, label). Aktual siyahı Moodle sənədlərinin **Activities** səhifəsində izlənir (5.x-də tərkib dəyişə bilər).

### 11.1 Ortaq activity müqaviləsi

Hər `mod_*` aşağıdakıları təmin etməlidir (Moodle-dəki `lib.php` funksiyalarının analoqu):

```ts
interface ActivityModule {
  component: string; // 'mod_quiz'
  supports: {
    // Moodle FEATURE_* analoqu
    grade: boolean;
    completion: boolean;
    groups: boolean;
    backup: boolean;
    availability: boolean;
    showDescription: boolean;
  };
  addInstance(data): Promise<InstanceId>;
  updateInstance(id, data): Promise<void>;
  deleteInstance(id): Promise<void>;
  viewData(cm, user): Promise<ViewPayload>; // tələbə görünüşü
  completionRules?: CompletionRule[]; // "izlənib", "göndərilib", "keçid balı"
  gradeItems?(instance): GradeItemDef[]; // gradebook-a nə yazır
  exportPrivacy?(user): Promise<Export>; // GDPR
}
```

### 11.2 Prioritetli modul siyahısı

| Modul                                                   | Tip      | Mərhələ             | Qeyd                                                                                                          |
| ------------------------------------------------------- | -------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `mod_page`                                              | Resource | M2                  | Sanitize edilmiş rich text                                                                                    |
| `mod_url`                                               | Resource | M2                  | Xarici link, embed video (video qərarı bağlı)                                                                 |
| `mod_file`                                              | Resource | M2                  | R2 + imzalı URL                                                                                               |
| `mod_folder`                                            | Resource | M2                  | Bir neçə fayl                                                                                                 |
| `mod_label`                                             | Resource | M2                  | Section daxilində mətn bloku                                                                                  |
| `mod_quiz`                                              | Activity | M6                  | Bax §16                                                                                                       |
| `mod_assign`                                            | Activity | M6                  | Bax §17                                                                                                       |
| `mod_lesson`                                            | Activity | M8+                 | Budaqlanan dərs axını                                                                                         |
| `mod_choice`, `mod_feedback`                            | Activity | M8+                 | Sorğu və rəy                                                                                                  |
| `mod_scorm`, `mod_h5p`                                  | Activity | M9+                 | Standartlar (SCORM, LTI)                                                                                      |
| `mod_forum`, `mod_glossary`, `mod_workshop`, `mod_wiki` | Activity | **Scope-dan kənar** | İcra Planı v2-yə görə forum/komment sistemi kənardadır. Arxitektura bunları sonradan əlavə etməyə imkan verir |
| `mod_bigbluebutton` / canlı dərs                        | Activity | **Scope-dan kənar** | Planda live dərslər kənardadır                                                                                |

> Öz dərs tipimiz (`text/video/file`) Moodle-də ayrı activity deyil, `mod_page` + `mod_url` + `mod_file` kombinasiyasıdır. Sadə "Dərs" UI-ı bu üç modula **adapter** kimi qurula bilər (müəllim "Dərs əlavə et" deyir, sistem uyğun modulu yaradır).

---

## 12. Enrolment (kursa yazılma)

Moodle sənədinə görə tələbələr müəssisədən asılı olaraq özləri yazıla, müəllim tərəfindən manual yazıla və ya admin tərəfindən avtomatik yazıla bilər. Moodle 50-dən çox autentifikasiya və enrolment variantı təklif edir.

### 12.1 Cədvəllər

| Cədvəl            | Məqsəd                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- |
| `enrol_instances` | Kursa əlavə edilmiş yazılma metodu (course_id, enrol_type, status, config, role_id) |
| `user_enrolments` | User-in həmin metod ilə yazılması (status, time_start, time_end, enrol_instance_id) |

> Köhnə planın `Enrollment` cədvəli bu iki cədvəlin birləşməsinə çevrilir. `progress` (completion) isə ayrı cədvəldə qalır (§14).

### 12.2 Enrolment plugin-ləri

| Plugin          | Mərhələ    | İş                                                                              |
| --------------- | ---------- | ------------------------------------------------------------------------------- |
| `enrol_manual`  | M1         | Instructor/manager kursa userləri əlavə edir                                    |
| `enrol_track`   | M2.5       | Track assign (bax §9.3)                                                         |
| `enrol_self`    | M3         | Tələbə ictimai kursa özü yazılır (`access_type = free`), istəyə görə parol/açar |
| `enrol_guest`   | M3         | Qonaq baxışı (yalnız ictimai kataloq məzmunu)                                   |
| `enrol_cohort`  | M3+        | Cohort əsaslı (Track-in ümumi variantı)                                         |
| `enrol_payment` | **Rezerv** | `access_type = paid`, ödəniş scope-dan kənardır                                 |

### 12.3 Qaydalar

1. Kursun məzmununa giriş = **aktiv enrolment + `student` rolu** (və ya teacher/manager capability-si).
2. Eyni kursa eyni metod ilə təkrar yazılma dublikat yaratmır (unique `(enrol_instance_id, user_id)`).
3. Eyni user bir neçə metod ilə (Track + manual) yazıla bilər, bu zaman progress **bir yerdədir** (course + user üzrə), enrolment-lər ayrı idarə olunur.
4. `time_start` / `time_end` / `status` (`active`, `suspended`) dəstəklənir. Müddəti bitən enrolment tasklə yenilənir.
5. Enrolment dəyişəndə event atılır: `user_enrolment.created/updated/deleted`.

---

## 13. Conditional availability (şərti əlçatanlıq)

Moodle-də "Restrict access" activity və section-ı şərtlərə görə açır.

### 13.1 Model

Hər `course_module` və `section` üçün `availability` JSON ağacı:

```json
{
  "op": "&",
  "c": [
    { "type": "completion", "cm": "cm_12", "e": "complete" },
    { "type": "date", "d": ">=", "t": 1790000000 },
    { "type": "grade", "id": "gi_5", "min": 60 }
  ],
  "showc": [true, true, false]
}
```

### 13.2 Plugin-lər

| Plugin                    | Şərt                           |
| ------------------------- | ------------------------------ |
| `availability_date`       | Tarixdən əvvəl/sonra           |
| `availability_completion` | Başqa activity tamamlanıb      |
| `availability_grade`      | Başqa activity-dən minimum bal |
| `availability_group`      | Müəyyən qrupa üzvlük           |
| `availability_profile`    | Profil sahəsi (sinif və s.)    |

### 13.3 Tətbiq qaydaları

- Server `is_available(cm, user)` hesablayır, **API cavabında kilidli elementin məzmunu göndərilmir**, yalnız başlıq və kilid səbəbi.
- Frontend yalnız göstərir, qərar verməz.
- Şərt dəyişəndə tələbələrin keşlənmiş availability nəticələri ləğv olunur.

---

## 14. Completion (tamamlanma) və progress

Moodle sənədləri tamamlanmanı activity/resource səviyyəsində və kurs səviyyəsində izləməyi təsvir edir.

### 14.1 Activity completion

`course_modules_completion(cm_id, user_id, state, viewed, time_modified, grade_passed)`

| Qayda    | Nümunə                       |
| -------- | ---------------------------- |
| Manual   | Tələbə "Dərsi tamamla" basır |
| Baxış    | Resource açılıb              |
| Qiymət   | Quiz-də keçid balı           |
| Göndərmə | Tapşırıq göndərilib          |

Modul `completionRules` elan edir, Completion API `evaluate(cm, user)` işlədir. İdempotentdir: təkrar tamamlama progress artırmır.

### 14.2 Course completion

`course_completions(course_id, user_id, time_completed)` + `course_completion_criteria` (məcburi activity-lər, keçid balı, tarix).

Kurs tamamlandıqda: `course.completed` event → sertifikat/badge observer-i işləyir (§28).

### 14.3 Progress hesablanması

`progress = tamamlanmış məcburi cm sayı / məcburi cm sayı` (arxivlənmiş və gizli elementlər sayılmır). Nəticə `course_progress` cədvəlində cache kimi saxlanılır ki, dashboard sürətli olsun, event ilə yenilənir.

---

## 15. Gradebook (qiymət jurnalı)

Moodle-də qiymətlər **mərkəzi gradebook**-da toplanır, activity-lər qiyməti Grade API ilə ora göndərir.

### 15.1 Cədvəllər

| Cədvəl             | Məqsəd                                                           |
| ------------------ | ---------------------------------------------------------------- |
| `grade_categories` | Qiymət kateqoriyaları, aqreqasiya (orta, cəm, ağırlıqlı)         |
| `grade_items`      | Qiymətlənən vahid (quiz, assign, manual item, kurs total)        |
| `grade_grades`     | User-in həmin item üzrə qiyməti (raw, final, overridden, locked) |
| `grade_history`    | Dəyişiklik tarixçəsi (audit)                                     |
| `scales`           | Keyfiyyət şkalaları (istəyə görə)                                |

### 15.2 Axın

```text
mod_quiz  ──(grade_update)──►  grade_items / grade_grades  ──► kurs total
mod_assign ─(grade_update)──►  ...                            ──► gradebook UI
```

1. Modul `gradeItems()` ilə item elan edir.
2. Qiymət verildikdə `grade_update(item, user, rawGrade)` çağırır.
3. Gradebook aqreqasiya qaydasını tətbiq edir, kurs total yenilənir, `grade.updated` event atılır.
4. Müəllim override edə bilər (`overridden = 1`), bu audit log-a düşür.

### 15.3 Qaydalar

- Tələbə yalnız **öz qiymətini** görür (`moodle/grade:view`), müəllim hamısını (`moodle/grade:viewall`).
- Qiymət dəyişməsi `grade_history`-yə yazılır.
- Qabaqcıl qiymətləndirmə (`gradingform_rubric`, `gradingform_guide`) M9+.

---

## 16. Question bank və Quiz mühərriki

Bu, Moodle-in ən mürəkkəb hissələrindən biridir. İlk versiya sadələşdirilmiş, lakin **arxitekturası Moodle-ə uyğun** olmalıdır ki, sonradan genişlənsin.

### 16.1 Question bank

- `question_categories(context_id, parent_id, name)` — kateqoriyalar context-ə bağlıdır (kurs, org, sistem səviyyəsində paylaşılan bank).
- `question_bank_entries(category_id, owner_id)` — məntiqi sual.
- `question_versions(entry_id, version, status, question_id)` — **versiyalama**: sual dəyişəndə yeni versiya yaranır, köhnə cəhdlər köhnə versiya ilə qalır.
- `questions(qtype, name, text, general_feedback, default_mark, ...)` + `qtype_*` cədvəlləri (variantlar, düzgün cavab).

### 16.2 Sual tipləri (`qtype_*`)

| Tip                           | Mərhələ | Avtomatik qiymət             |
| ----------------------------- | ------- | ---------------------------- |
| `multichoice` (tək/çox seçim) | M6      | Bəli                         |
| `truefalse`                   | M6      | Bəli                         |
| `shortanswer`                 | M6      | Bəli (variantlar siyahısı)   |
| `numerical`                   | M6+     | Bəli (tolerans ilə)          |
| `matching`                    | M6+     | Bəli                         |
| `essay`                       | M6      | Xeyr, müəllim qiymətləndirir |

Hər `qtype` interfeysi: `render(question, state)`, `grade(question, response)`, `summarise(response)`, `validate(question)`.

### 16.3 Sual davranışı (`qbehaviour_*`)

Moodle-də sualın **necə cavablandığı və nə vaxt qiymətləndirildiyi** davranış plugin-i ilə müəyyən olunur.

| Davranış            | Məna                                                                |
| ------------------- | ------------------------------------------------------------------- |
| `deferredfeedback`  | Cavablar yığılır, quiz bitəndə qiymətlənir (default imtahan rejimi) |
| `immediatefeedback` | Hər sualdan sonra dərhal rəy                                        |
| `interactive`       | Bir neçə cəhd, hər cəhddən sonra rəy (gec mərhələ)                  |

### 16.4 Quiz və cəhd məlumat modeli

- `quizzes(course_id, cm_id, time_open, time_close, time_limit_sec, max_attempts, pass_grade, shuffle, review_options)`
- `quiz_slots(quiz_id, slot, question_ref)` — quiz-də sual yeri
- `quiz_attempts(quiz_id, user_id, attempt_no, state, time_start, time_finish, expires_at, sum_grades, idempotency_key)`
- `question_usages` → `question_attempts` → `question_attempt_steps` — hər sualın cavab addımları (Moodle-də tarixçə bu şəkildə saxlanılır)

### 16.5 Cəhd vəziyyət maşını

```text
not_started ─start→ in_progress ─submit→ finished
                         │                  ▲
                         └─ vaxt bitdi ─→ overdue ─(grace/avto bağlama)→ abandoned/finished
```

### 16.6 Server qaydaları (köhnə planın §6 meyarları ilə uyğun)

1. Düzgün cavablar **cəhd zamanı və başlamazdan əvvəl API cavabında yoxdur**, yalnız review icazəsi açılandan sonra (`review_options`).
2. Taymer serverdədir (`expires_at`). Gecikmiş göndərmə qaydaya görə rədd edilir və ya qiymətlənir.
3. `idempotency_key` ilə eyni submit ikinci cəhd yaratmır.
4. Cəhd limiti aşıldıqda `409` qaytarılır.
5. Qiymət `grade_update` ilə gradebook-a yazılır, completion qaydası yenilənir.
6. `mod_quiz:viewreports` olan müəllim nəticələri, statistikanı görür (`report_quizstats` sonra).

---

## 17. Assignment

`mod_assign`: tapşırıq təyin etmə, tələbə göndərməsi, müəllim rəyi və qiyməti.

- `assignments(course_id, cm_id, due_at, cutoff_at, max_grade, submission_types, allow_resubmit)`
- `assign_submissions(assign_id, user_id, attempt_no, status, time_created, time_modified)`
- `assign_submission_files`, `assign_submission_text` (altplugin-lər)
- `assign_grades(assign_id, user_id, grader_id, grade, feedback_text, released_at)`

### 17.1 Status axını

`new → draft → submitted → graded → (released)`

### 17.2 Gələcək genişlənmələr

Marking workflow (bir neçə qiymətləndirici, moderasiya, qiymətin buraxılması), inline annotation, qrup tapşırıqları. Moodle xüsusiyyətlər səhifəsində bunlar assignment modulunun imkanları kimi göstərilir. İlk versiyada yalnız tək müəllim qiyməti və rəy.

---

## 18. Event API və observer-lər

Moodle sistem hadisələrini **event** kimi atır, digər komponentlər **observer** ilə dinləyir. Bu, komponentlərin bir-birindən asılı olmadan əlaqə qurmasını təmin edir.

### 18.1 Event strukturu

```ts
interface DomainEvent {
  name: string;               // 'course_module.completion_updated'
  component: string;          // 'core_completion'
  action: 'created'|'updated'|'deleted'|'viewed'|'submitted'|'graded'|...;
  target: string;             // 'course_module'
  objectId?: string;
  contextId: string;
  userId?: string;            // kim edib
  relatedUserId?: string;     // kimə aiddir
  courseId?: string;
  data?: Record<string, unknown>;
  crud: 'c'|'r'|'u'|'d';
  eduLevel: 'teaching'|'participating'|'other';
  occurredAt: number;
}
```

### 18.2 Çatdırılma

1. **Outbox:** event `events_outbox` cədvəlinə **eyni tranzaksiyada** yazılır.
2. **Sinxron observer-lər** (yüngül, eyni sorğuda): məs. cache ləğvi.
3. **Asinxron observer-lər** (Queue): bildiriş, sertifikat, analitika yenilənməsi.
4. Observer uğursuz olarsa retry və dead-letter. Observer-lər **idempotent** yazılır.

### 18.3 Əsas event-lər

`user.created` · `role.assigned` · `user_enrolment.created` · `course.created/updated/published` · `course_module.created/deleted/viewed` · `course_module.completion_updated` · `course.completed` · `quiz.attempt_started/submitted` · `assign.submission_submitted` · `grade.updated` · `track.user_assigned`

### 18.4 Logstore

Event-lər `logstore` (Moodle `logstore_standard_log` analoqu) cədvəlinə yazılır: hesabat, audit və analitikanın xam mənbəyi. Böyük data üçün partisiya/arxivləmə siyasəti §27-də.

---

## 19. Task API (zamanlanmış və arxa plan işləri)

Moodle-də **scheduled task** (cron üzrə) və **adhoc task** (bir dəfəlik, növbəyə qoyulan) var.

### 19.1 Növlər

| Növ       | Nümunə                                                                      | Mexanizm                   |
| --------- | --------------------------------------------------------------------------- | -------------------------- |
| Scheduled | Müddəti bitən enrolment-ləri yenilə, bildiriş digest, köhnə session təmizlə | Cron Trigger → task runner |
| Adhoc     | Kurs silmə, Track sync, sertifikat generasiyası, toplu import               | Queue mesajı               |

### 19.2 Cədvəllər

`tasks_scheduled(name, schedule, last_run, next_run, disabled, fail_delay)` · `tasks_adhoc(id, name, payload, run_after, attempts, locked_until, status)`

### 19.3 Qaydalar

- Hər task idempotent, qısa və yenidən başlana bilən olmalıdır (Workers limitlərinə görə böyük işlər hissələrə bölünür).
- Uğursuzluq → exponential backoff, `fail_delay`.
- Admin-də task monitor (son icra, xəta) gec mərhələdə.

---

## 20. Message və Notification API

Moodle sənədləri bildirişləri (yeni tapşırıq, son tarix, forum yazısı) və şəxsi mesajlaşmanı təsvir edir. İstifadəçi hansı bildirişi hansı kanalla alacağını seçir.

### 20.1 Provider modeli

Hər modul manifestdə bildiriş növlərini elan edir:

```ts
messageProviders: [
  { name: 'assign_due_soon', defaults: { inapp: 'enabled', email: 'disabled' } },
  { name: 'quiz_graded', defaults: { inapp: 'enabled', email: 'disabled' } },
  { name: 'course_new_lesson', defaults: { inapp: 'enabled' } },
];
```

### 20.2 Kanallar

| Kanal                                               | Mərhələ                          |
| --------------------------------------------------- | -------------------------------- |
| In-app (`notifications` cədvəli, oxunmuş/oxunmamış) | M7                               |
| Email                                               | M7+ (email xidməti qərarı bağlı) |
| Push/SMS                                            | Sonra                            |

### 20.3 Şəxsi mesajlaşma

Moodle Messaging-ə qarşılıq gələn şəxsi çat **scope-dan kənardır** (forum/komment kimi). Notification API ayrıca işləyir.

---

## 21. File API

Moodle fayllar üçün **file area** konsepti işlədir: hər fayl `(context, component, filearea, itemid, filepath, filename)` ilə identifikasiya olunur və icazə həmin context-ə görə yoxlanır.

### 21.1 Cədvəl

`files(id, content_hash, context_id, component, file_area, item_id, file_path, file_name, mime, size, owner_id, storage_key, status, created_at)`

- `storage_key` → R2 obyektinin açarı (content-hash əsaslı, dublikat saxlama azalır).
- `file_area` nümunələri: `mod_page/content`, `mod_assign/submission_files`, `course/overviewfiles`, `user/draft`.

### 21.2 Yükləmə axını

```text
1. POST /files/upload-intent  → capability + tip/ölçü yoxlaması → imzalı R2 URL
2. Client R2-yə yükləyir
3. POST /files/complete       → server hash/MIME yoxlayır, `files` qeydi yaradır
4. Draft area → modul instance-ı saxlananda həqiqi file area-ya köçürülür
```

### 21.3 Çatdırılma

- Çıxış `GET /pluginfile/:contextId/:component/:area/:itemId/:name` kimi **capability yoxlayan** route-dan keçir, sonra qısa müddətli imzalı URL qaytarır.
- Fayl adı təmizlənir, MIME whitelist, ölçü limiti (org səviyyəsində konfiqurasiya olunur).

---

## 22. Config, Settings və Cache API

### 22.1 Config

- `config(name, value)` — platforma səviyyəsi.
- `config_plugins(plugin, name, value)` — modul səviyyəsi (`enabled`, `version` daxil).
- `org_config(org_id, name, value)` — Org səviyyəsi (track etiketi, fayl limiti, qeydiyyat siyasəti). Moodle-də kateqoriya səviyyəsində bunu ayrı mexanizm deyil, context-lə həll edirlər; AZES-də Org config ayrı cədvəldir.

### 22.2 Settings ağacı (Admin UI)

Moodle "Site administration" ağacına oxşar: hər modul özünün parametr səhifəsini manifestlə elan edir, UI `moodle/site:config` və ya Org-un `azes/org:manage` capability-sinə görə göstərir.

### 22.3 Cache API

Moodle-də cache **definition** və **store** ayrılığı var. AZES-də:

| Cache            | Nə saxlayır                                          | Ləğv şərti                      |
| ---------------- | ---------------------------------------------------- | ------------------------------- |
| `access`         | `(userId, contextId)` → capability dəsti             | Rol təyinatı/override dəyişəndə |
| `context_path`   | Context ağacı                                        | Kurs köçürüləndə                |
| `course_modinfo` | Kursun struktur xülasəsi (section, cm, availability) | Kurs strukturu dəyişəndə        |
| `availability`   | `(cmId, userId)` nəticəsi                            | Completion/grade dəyişəndə      |
| `lang`           | Tərcümə string-ləri                                  | Deploy                          |
| `progress`       | Kurs progress-i                                      | Completion event                |

`modinfo` Moodle-in ən vacib performans pattern-lərindən biridir: bütün kurs strukturu bir dəfəlik sorğu ilə və cache-dən oxunur.

---

## 23. External API (web services) və OpenAPI

Moodle xarici sistemlər və mobil tətbiq üçün **web services** təqdim edir. Hər funksiya adı, parametr sxemi, qaytarma sxemi, tələb olunan capability və context ilə elan olunur.

### 23.1 AZES-də "external function"

```ts
export const getCourseContents = defineExternal({
  name: 'core_course_get_contents',
  method: 'GET',
  path: '/courses/:courseId/contents',
  params: z.object({ courseId: z.string() }),
  returns: CourseContentsSchema,
  context: ({ params }) => contexts.forCourse(params.courseId),
  capability: 'moodle/course:view',
  handler: async ({ ctx, user, params }) => courseService.getContents(ctx, user, params.courseId),
});
```

- Zod sxemlərindən **OpenAPI** generasiya olunur → Orval client `@azes/api`.
- Eyni funksiya həm veb UI, həm gələcək mobil, həm üçüncü tərəf inteqrasiyalar üçün istifadə olunur.
- Rate limit, audit və capability yoxlaması wrapper-də mərkəzləşib, handler yazanın unuda bilməyəcəyi şəkildə.

### 23.2 Versiyalama

`/v1/...`. Breaking dəyişiklik yeni versiya. OpenAPI diff CI-də yoxlanır.

---

## 24. Verilənlər bazası sxemi

ID-lər `TEXT` (ULID), vaxtlar `INTEGER` (unix saniyə). Bütün cədvəllərdə `created_at`, `updated_at`. Aşağıda **nüvə sxemin xülasəsidir**, tam migration-lar mərhələ promptlarında verilir.

### 24.1 Nüvə

| Qrup             | Cədvəllər                                                                                                                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sistem           | `config`, `config_plugins`, `org_config`, `capabilities`, `modules`                                                                                                                                     |
| Context və icazə | `context`, `roles`, `role_capabilities`, `role_assignments`, `role_context_levels`                                                                                                                      |
| İstifadəçi       | `users`, `sessions`, `user_info_field`, `user_info_data`, `cohorts`, `cohort_members`                                                                                                                   |
| Org və Track     | `organizations`, `course_categories`, `tracks`, `track_courses`, `user_tracks`                                                                                                                          |
| Kurs             | `courses`, `course_sections`, `course_modules`, `course_completions`, `course_completion_criteria`                                                                                                      |
| Enrolment        | `enrol_instances`, `user_enrolments`                                                                                                                                                                    |
| Qruplar          | `groups`, `group_members`, `groupings`, `grouping_groups`                                                                                                                                               |
| Completion       | `course_modules_completion`, `course_progress`                                                                                                                                                          |
| Gradebook        | `grade_categories`, `grade_items`, `grade_grades`, `grade_history`, `scales`                                                                                                                            |
| Fayl             | `files`                                                                                                                                                                                                 |
| Event, task      | `events_outbox`, `logstore`, `tasks_scheduled`, `tasks_adhoc`                                                                                                                                           |
| Bildiriş         | `notifications`, `notification_prefs`                                                                                                                                                                   |
| Quiz             | `question_categories`, `question_bank_entries`, `question_versions`, `questions`, `qtype_*`, `quizzes`, `quiz_slots`, `quiz_attempts`, `question_usages`, `question_attempts`, `question_attempt_steps` |
| Assign           | `assignments`, `assign_submissions`, `assign_grades`                                                                                                                                                    |
| Resource         | `mod_page`, `mod_url`, `mod_file`, `mod_folder`, `mod_label`                                                                                                                                            |
| Sonrakı          | `certificates`, `badges`, `competencies`, `bookmarks`                                                                                                                                                   |

### 24.2 Əsas cədvəllər (nümunə)

**`context`**

| Sahə                        | Tip     | Qeyd                  |
| --------------------------- | ------- | --------------------- |
| id                          | TEXT PK |                       |
| level                       | INTEGER | 10/30/40/50/70/80     |
| instance_id                 | TEXT    | Həmin obyektin id-si  |
| path                        | TEXT    | `/sys/org/cat/course` |
| depth                       | INTEGER |                       |
| UNIQUE (level, instance_id) |         |                       |
| INDEX (path)                |         | Prefix axtarışı       |

**`role_assignments`**

| Sahə                                                      | Tip     | Qeyd                                     |
| --------------------------------------------------------- | ------- | ---------------------------------------- |
| id                                                        | TEXT PK |                                          |
| role_id                                                   | TEXT FK |                                          |
| user_id                                                   | TEXT FK |                                          |
| context_id                                                | TEXT FK |                                          |
| component                                                 | TEXT    | Mənbə (`''` manual, `enrol_track` və s.) |
| item_id                                                   | TEXT    | Mənbə obyekt                             |
| assigned_by                                               | TEXT    |                                          |
| UNIQUE (role_id, user_id, context_id, component, item_id) |         |                                          |

**`course_modules`**

| Sahə                  | Tip       | Qeyd                         |
| --------------------- | --------- | ---------------------------- |
| id                    | TEXT PK   |                              |
| course_id, section_id | TEXT FK   |                              |
| module                | TEXT      | `mod_quiz` və s.             |
| instance_id           | TEXT      | `mod_*` cədvəlində sətir     |
| position              | INTEGER   |                              |
| visible               | INTEGER   |                              |
| completion            | INTEGER   | 0 yox, 1 manual, 2 avtomatik |
| completion_rules      | TEXT JSON |                              |
| availability          | TEXT JSON | Bax §13                      |
| status                | TEXT      | `active` / `archived`        |

**`user_enrolments`**

| Sahə                                | Tip     | Qeyd                   |
| ----------------------------------- | ------- | ---------------------- |
| id                                  | TEXT PK |                        |
| enrol_instance_id                   | TEXT FK |                        |
| user_id                             | TEXT FK |                        |
| status                              | TEXT    | `active` / `suspended` |
| time_start, time_end                | INTEGER |                        |
| enrolled_by                         | TEXT    |                        |
| UNIQUE (enrol_instance_id, user_id) |         |                        |

### 24.3 İndekslər (məcburi)

`(course_id, position)` · `(user_id, status)` · `(context_id)` · `(path)` · `(quiz_id, user_id)` · `(user_id, course_id)` progress üçün · `logstore (course_id, created_at)`, `(user_id, created_at)`.

### 24.4 Org izolyasiyası

- Hər "kök" cədvəldə (`courses`, `tracks`, `users`) `org_id` saxlanılır (sürətli filtr və əlavə müdafiə).
- Dərin cədvəllər (`course_modules`, `quiz_attempts`) context/course vasitəsilə izolyasiya olunur.
- Bütün sorğular repository helper-lərindən keçir (`scoped(orgId)`).

---

## 25. API endpoint xəritəsi

Bütün endpoint-lər capability guard-dan keçir. Sadələşdirilmiş siyahı:

### 25.1 Auth və profil

| Metod | Yol                                             | Capability |
| ----- | ----------------------------------------------- | ---------- |
| POST  | `/auth/login`, `/auth/refresh`, `/auth/logout`  | —          |
| POST  | `/auth/password/change`, `/auth/password/reset` | — / özü    |
| GET   | `/me`                                           | giriş      |
| GET   | `/me/navigation`                                | giriş      |
| PATCH | `/me/profile`                                   | özü        |

### 25.2 Org, user, rol

| Metod     | Yol                     | Capability                           |
| --------- | ----------------------- | ------------------------------------ |
| GET/POST  | `/orgs`                 | `moodle/site:config`                 |
| GET/PATCH | `/orgs/:id`             | `azes/org:manage`                    |
| GET/POST  | `/orgs/:id/instructors` | `azes/org:createinstructor`          |
| GET/POST  | `/users`                | `moodle/user:create` / `viewdetails` |
| POST      | `/role-assignments`     | `moodle/role:assign` (kontekstdə)    |

### 25.3 Track

| Metod       | Yol                   | Capability          |
| ----------- | --------------------- | ------------------- |
| GET/POST    | `/tracks`             | `azes/track:manage` |
| PUT         | `/tracks/:id/courses` | `azes/track:manage` |
| POST/DELETE | `/tracks/:id/users`   | `azes/track:assign` |
| GET         | `/me/tracks`          | giriş               |

### 25.4 Kurs və məzmun

| Metod             | Yol                          | Capability                         |
| ----------------- | ---------------------------- | ---------------------------------- |
| GET               | `/catalog/courses`           | ictimai (guest)                    |
| GET               | `/courses/:id`               | `moodle/course:view` və ya ictimai |
| GET               | `/courses/:id/contents`      | `moodle/course:view`               |
| POST/PATCH        | `/courses`                   | `moodle/course:create` / `update`  |
| POST              | `/courses/:id/publish`       | `moodle/course:publish`            |
| POST/PATCH/DELETE | `/courses/:id/sections`      | `moodle/course:manageactivities`   |
| POST/PATCH/DELETE | `/courses/:id/modules`       | `moodle/course:manageactivities`   |
| PUT               | `/courses/:id/modules/order` | `moodle/course:manageactivities`   |
| GET               | `/modules/:cmId/view`        | `mod_*:view` + availability        |
| POST              | `/modules/:cmId/complete`    | `moodle/course:view` (özü)         |

### 25.5 Enrolment və progress

| Metod    | Yol                           | Capability                                  |
| -------- | ----------------------------- | ------------------------------------------- |
| POST     | `/courses/:id/enrol/self`     | `enrol/self:enrolself`                      |
| GET/POST | `/courses/:id/enrolments`     | `moodle/course:enrolreview` / `enrolconfig` |
| GET      | `/me/courses`, `/me/progress` | özü                                         |
| GET      | `/courses/:id/participants`   | `moodle/course:viewparticipants`            |

### 25.6 Quiz, assign, grades

| Metod | Yol                               | Capability                      |
| ----- | --------------------------------- | ------------------------------- |
| POST  | `/quizzes/:id/attempts`           | `mod/quiz:attempt`              |
| PUT   | `/attempts/:id/answers`           | cəhdin sahibi                   |
| POST  | `/attempts/:id/submit`            | cəhdin sahibi (idempotency-key) |
| GET   | `/attempts/:id/review`            | sahibi + review_options         |
| POST  | `/assignments/:id/submission`     | `mod/assign:submit`             |
| PUT   | `/assignments/:id/grades/:userId` | `mod/assign:grade`              |
| GET   | `/courses/:id/grades`             | `moodle/grade:viewall`          |
| GET   | `/me/grades`                      | `moodle/grade:view`             |

---

## 26. Frontend arxitekturası və menyu

**Mövcud shell, sidebar, header, theme və token-lər dəyişmir.** Yalnız menyu siyahısı və səhifələrin məzmunu bu memarlıqla qidalanır.

### 26.1 Menyu mənbəyi: `GET /me/navigation`

Capability context-dən asılıdır ("instructor yalnız öz kursunda redaktə edir"), buna görə menyu **serverdə** hesablanır. Moodle-də də naviqasiya capability-lərə görə qurulur.

```json
{
  "landing": "/instructor/courses",
  "primary": [
    { "key": "tracks", "label": "Track-lər", "route": "/tracks" },
    { "key": "courses", "label": "Kurs idarəetməsi", "route": "/instructor/courses" },
    { "key": "students", "label": "Tələbələr", "route": "/students" }
  ],
  "account": [{ "key": "profile", "route": "/profile" }]
}
```

Server hər element üçün "bu user hər hansı uyğun context-də capability-yə malikdir?" yoxlayır (`hasCapabilityInAnyContext`).

### 26.2 Rola görə menyu (əvvəlki cədvəllə uyğun)

| Rol        | Menyu                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| guest      | Kataloq, Giriş                                                                                              |
| student    | İcmal, Kataloq, Mənim kurslarım (Track-lərə görə), Testlər, Sertifikatlar, Seçilmişlər, Bildirişlər, Profil |
| instructor | Track-lər, Kurs idarəetməsi, Tələbələr, Qiymətləndirmə, Analitika, Profil                                   |
| orgAdmin   | Müəllimlər, Track-lər, Kurslar, Tələbələr, Analitika, Org parametrləri                                      |
| superAdmin | Təşkilatlar, orgAdmin-lər, Platforma analitikası, Sistem, Audit                                             |

### 26.3 Frontend qatları

```text
apps/web/src/
  app/            # shell inteqrasiyası (mövcud), router, guard-lar
  features/
    auth/ dashboard/ catalog/ course/ player/ learn/
    quiz/ assignment/ grades/ certificates/ notifications/
    admin-courses/ admin-students/ admin-tracks/ admin-org/ analytics/
  shared/
    permissions/  # useNavigation(), <Can>, resource.permissions oxuyucu
    ui/           # mövcud MUI komponentləri, skeleton/empty/error
    api/          # @azes/api wrapper-ləri
```

### 26.4 Qaydalar

1. Route guard `me/navigation` və resource `permissions` obyektinə baxır, **403** səhifəsi göstərir.
2. Düymələr yalnız `permissions.canEdit` və s. varsa görünür (frontend heç vaxt rol adı yoxlamır).
3. Hər səhifədə skeleton, empty, error, success, disabled vəziyyətləri məcburidir.
4. Server-side pagination və filtr, axtarışda debounce.
5. Kurs preview rejimi tələbə komponentlərini təkrar istifadə edir.
6. Responsive: mobil, tablet, desktop. Klaviatura naviqasiyası və fokus indikatorları.

### 26.5 Moodle UI konseptlərinin shell-ə uyğunlaşdırılması

| Moodle UI                             | AZES-də                                              |
| ------------------------------------- | ---------------------------------------------------- |
| Dashboard                             | `İcmal` səhifəsi (widget-lər)                        |
| My courses                            | `Mənim kurslarım` (Track qruplaşdırması ilə)         |
| Course index drawer                   | Kurs səhifəsində modul/dərs naviqasiyası (accordion) |
| Activity navigation (əvvəlki/növbəti) | Dərs player-i                                        |
| Participants                          | `Tələbələr` / kurs `Participants` tab-ı              |
| Grades                                | `Qiymətlər` tab-ı                                    |
| Site administration                   | `Sistem` / `Org parametrləri`                        |
| Activity chooser                      | "Məzmun əlavə et" dialoqu (aktiv modullardan)        |

---

## 27. Hesabatlar, log, analitika

### 27.1 Hesabat plugin-ləri (`report_*`)

| Hesabat                                                   | Mərhələ | Mənbə                                     |
| --------------------------------------------------------- | ------- | ----------------------------------------- |
| `report_progress` (kurs üzrə activity completion cədvəli) | M7      | `course_modules_completion`               |
| `report_completion`                                       | M7      | `course_completions`                      |
| `report_log` (event jurnalı)                              | M7      | `logstore`                                |
| `report_quizstats`                                        | M8      | `quiz_attempts`, `question_attempt_steps` |
| Org/platforma dashboard                                   | M7      | Aqreqasiya cədvəlləri                     |

### 27.2 Performans

- `logstore` böyüyəcək: tarix üzrə partisiya/arxivləmə, köhnə sətirlərin aqreqata çevrilməsi.
- Dashboard və analitika **aqreqasiya cədvəllərindən** oxuyur (`daily_course_stats`, `daily_org_stats`), Task API ilə yenilənir.
- Rəqəmlər testlərlə DB məlumatı ilə uyğunluğu yoxlanır (saxta rəqəm yoxdur).

### 27.3 Məxfilik

Tələbə nəticələrini yalnız özü, kursun müəllifi (teacher) və `orgmanager`/`superAdmin` görür. Hər hesabat endpoint-i capability + context ilə qorunur.

---

## 28. Privacy, backup, badge, certificate, competency

### 28.1 Privacy API (GDPR)

Moodle-də hər plugin istifadəçi datasının **metadata-sını elan edir, export və silmə** funksiyalarını təmin edir. AZES-də hər modul manifestdə `privacy` bölməsi saxlayır: `exportUserData(user)`, `deleteUserData(user, contexts)`. İlk versiyada interfeys və core hazır olur, tam icra M8-də.

### 28.2 Backup və restore

Moodle kurs backup/restore verir. AZES-də **kurs export/import (JSON + fayllar)** planlanır: kurs strukturu, activity-lər, fayl istinadları. Kurs şablonu (Track üçün kopyalama) buna əsaslanır. Mərhələ: M8+.

### 28.3 Sertifikat

Moodle core-da "certificate" yoxdur (plugin/Workplace xüsusiyyətidir), AZES planında isə sertifikat var. Buna görə `local_certificate` modulu:

- `course.completed` event-i → observer → `certificates` qeydi + PDF generasiya (adhoc task) + yoxlama linki.
- Təkrar verilmir (`UNIQUE(course_id, user_id)`), keçid balı və məcburi activity şərti completion-dan gəlir.

### 28.4 Badge və Competency

Moodle Open Badges və competency əsaslı qiymətləndirməni (personal learning plan) dəstəkləyir. AZES-də **M9+**: `badges`, `badge_issued`, `competencies`, `competency_frameworks`, `competency_user_progress`. Arxitektura buna hazırdır, çünki hamısı event/completion/grade üzərində qurulur.

---

## 29. Təhlükəsizlik, performans, i18n, accessibility

### 29.1 Təhlükəsizlik

| Sahə         | Qayda                                                                        |
| ------------ | ---------------------------------------------------------------------------- |
| İcazə        | Hər endpoint capability + context. Cross-org və cross-owner testləri məcburi |
| Parol        | Güclü hash (argon2/bcrypt), müvəqqəti parolda məcburi dəyişmə, rate limit    |
| Rich text    | Serverdə sanitize, bir format (Markdown və ya sanitized HTML)                |
| Fayl         | Tip/ölçü whitelist, ad təmizləmə, imzalı və müddətli URL                     |
| Quiz         | Server taymer, cavabların gizlədilməsi, idempotency, cəhd limiti             |
| Sui-istifadə | Rate limit: login, quiz submit, fayl upload                                  |
| Audit        | Publish, silmə, rol təyinatı, qiymət dəyişməsi, parol reset                  |
| Site admin   | Az sayda, MFA tövsiyə olunur                                                 |

### 29.2 Performans

- `course_modinfo` cache, `access` cache, progress cache.
- Server-side pagination, lazy loading, indekslər.
- Ağır hesablamalar Queue/Task-a.

### 29.3 i18n

Moodle "language pack" istifadə edir. AZES: string-lər i18n açarları ilə (`az`, `en`, sonra `ru`). Hər modul öz lang paketini manifestlə gətirir. Kurs məzmun dili (`courses.lang`) UI dilindən ayrıdır.

### 29.4 Accessibility

Klaviatura naviqasiyası, fokus, kontrast, ARIA. Moodle accessibility-ni əsas prinsip kimi qeyd edir, AZES də hər mərhələnin "Done" tərifinə daxil edir.

---

## 30. Mərhələ xəritəsi və əvvəlki planlara təsir

### 30.1 Yenilənmiş mərhələlər

| Mərhələ  | Məzmun                                                                                                                                                                                                                                                       | Moodle komponentləri                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| **M0**   | Audit: mövcud auth, user cədvəli, route-lar, API pattern-ləri                                                                                                                                                                                                | —                                                                         |
| **M1**   | **Core çərçivə**: context, roles, capabilities, role_assignments, access cache, `users`/`sessions`, `organizations`, `course_categories`, `config`, event outbox, external function wrapper, `/me`, `/me/navigation`, OpenAPI+Orval, seed, cross-org testlər | `core/context`, `core/access`, `auth_manual`, `core/event`, `core/config` |
| **M2**   | Kurs strukturu: courses, sections, course_modules, `mod_page/url/file/folder/label`, `format_topics`, File API (R2), publish, instructor üçün kurs idarəetməsi                                                                                               | `core/course`, `core/files`, `mod_*` resurslar                            |
| **M2.5** | Org və Track idarəetməsi: orgAdmin/instructor/student yaratma, `tracks`, `track_courses`, `user_tracks`, `enrol_track`, `enrol_manual`, cohort                                                                                                               | `core/enrol`, `core/user`, `local_orgtrack`                               |
| **M3**   | Tələbə kataloqu və kurs detalı, `enrol_self`/`guest`, görünürlük qaydaları                                                                                                                                                                                   | `enrol_self`, katalog                                                     |
| **M4**   | Dərs player-i, completion, progress, availability (date/completion), imzalı fayl                                                                                                                                                                             | `core/completion`, `core/availability`                                    |
| **M5**   | Admin redaktorun genişləndirilməsi: sıralama, preview, archive, təhlükəsiz redaktə, groups                                                                                                                                                                   | `core/course`                                                             |
| **M6**   | Question bank, `mod_quiz`, `mod_assign`, gradebook                                                                                                                                                                                                           | `core/question`, `core/grade`, `qtype_*`, `mod_quiz/assign`               |
| **M7**   | Dashboard, notification, sertifikat, hesabatlar, analitika                                                                                                                                                                                                   | `core/message`, `report_*`, `local_certificate`                           |
| **M8**   | E2E, rate limit, privacy API, backup/export, staging/prod                                                                                                                                                                                                    | `core/privacy`, `core/backup`                                             |
| **M9+**  | Badge, competency, rubric, lesson, SCORM/H5P/LTI, əlavə sual tipləri                                                                                                                                                                                         | İstəyə görə                                                               |

### 30.2 Əvvəlki sənədlərə dəqiqləşdirmələr

| Sənəd                               | Dəyişiklik                                                                                                                                                                    |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| İcra Planı §3, qərar 1 (rol modeli) | `student/instructor/admin` əvəzinə **context + role + capability**. Product rolları: superAdmin, orgAdmin, instructor, student, guest                                         |
| İcra Planı §4 (məlumat modeli)      | `Module` → `Section`; `Lesson` → `course_modules` + `mod_page/url/file`; `Enrollment` → `enrol_instances` + `user_enrolments`; `LessonProgress` → `course_modules_completion` |
| RBAC+Track planı §5                 | Track assign artıq yalnız `user_tracks` deyil, **enrolment yaradır** (`enrol_track`)                                                                                          |
| RBAC+Track planı §6                 | JWT-dən rol çıxarılır, `/me/navigation` əlavə olunur                                                                                                                          |
| RBAC+Track planı §10                | M1 genişlənir: context/capability çərçivəsi də M1-dədir. İdarəetmə UI-ı M2.5-dədir                                                                                            |

### 30.3 Hər mərhələnin "Done" tərifi (dəyişməz)

- Typecheck, lint, build xətasızdır.
- API testləri (icazə matrisi, cross-org, validasiya, əsas iş məntiqi) keçir.
- OpenAPI və generated client yenilənib.
- UI-da skeleton, empty, error, success, disabled var.
- Klaviatura və fokus işləyir.
- Mövcud shell və token-lər dəyişməyib.
- Qısa mərhələ hesabatı.

---

## 31. Açıq qərarlar və risklər

### 31.1 Qərar tələb edənlər

| №   | Qərar                                                                            | Tövsiyə                                                                                      |
| --- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1   | Backend platforma: Cloudflare Workers + D1, yoxsa klassik Node + SQL?            | Mövcud sənədlərdə D1 var, ona görə Workers + D1, interfeyslərlə abstraksiya. Təsdiq lazımdır |
| 2   | Track enrolment yaradır (§9.3)                                                   | Bəli, tək giriş mənbəyi                                                                      |
| 3   | Capability siyahısının Moodle adlandırması (`moodle/course:update`) saxlanılsın? | Bəli, sənədləri paralel oxumaq üçün. `moodle/` prefiksi əvəzinə `core/` seçmək də olar       |
| 4   | Override UI-ı M1-də lazımdırmı?                                                  | Yox, cədvəl hazır olsun, UI sonra                                                            |
| 5   | Video saxlama (Cloudflare Stream və ya embed)                                    | M2-dən əvvəl bağlanmalı                                                                      |
| 6   | Rich text formatı (Markdown və ya sanitized HTML)                                | M2-dən əvvəl bağlanmalı                                                                      |
| 7   | Email xidməti                                                                    | Yoxdursa student üçün username + müvəqqəti parol                                             |
| 8   | İctimai kataloq org-lar arası ümumi, yoxsa hər org-un vitrini                    | Ümumi kataloq daha sadədir                                                                   |
| 9   | Forum, komment, live dərs scope-dan kənar qalır?                                 | Bəli, arxitektura buna imkan verir                                                           |
| 10  | GPL: Moodle-dən kod və ya sənəd mətni köçürülməyəcək                             | Hüquqi məsləhət alınmalıdır                                                                  |

### 31.2 Risklər

| Risk                                  | Təsir                                     | Tədbir                                                                           |
| ------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------- |
| Scope-un Moodle ölçüsünə şişməsi      | Mərhələlər sonsuz uzanır                  | Memarlığı tam, funksiyanı mərhələli. Hər promptda "Etmə" bəndi                   |
| Capability sisteminin mürəkkəbliyi    | Gecikmə, bug                              | M1-də yalnız allow/prohibit və 4 dəyər üçün sadə həll alqoritmi, ətraflı testlər |
| Context cache-in köhnəlməsi           | İcazə sızması və ya yanlış 403            | Ləğv qaydaları event ilə, qısa TTL, testlər                                      |
| Cross-org sızması                     | Ən ciddi təhlükəsizlik problemi           | Context path + repository scope + məcburi testlər                                |
| Workers-də plugin runtime yoxluğu     | Moodle kimi "yüklə-işlət" olmur           | Build-time registry, bunu açıq qəbul etmək                                       |
| D1 limitləri                          | Yavaş analitika                           | Aqreqasiya cədvəlləri, indekslər                                                 |
| Quiz mühərrikinin mürəkkəbliyi        | M6 uzanır                                 | Əvvəl `multichoice/truefalse/shortanswer/essay` + `deferredfeedback`             |
| GPL riski                             | Lisenziya məcburiyyəti                    | Kod köçürməmək, hüquqi yoxlama                                                   |
| Track və Moodle konsepti uyğunsuzluğu | Gələcək Moodle ilə inteqrasiya çətinləşir | Track ayrı `local_` modulunda, enrolment standart qalır                          |

---

## 32. Əlavə: lüğət və mənbələr

### 32.1 Qısa lüğət

| Termin                 | İzah                                                               |
| ---------------------- | ------------------------------------------------------------------ |
| Context                | İcazənin tətbiq olunduğu sahə (sistem, kateqoriya, kurs, activity) |
| Capability             | Tək icazə (`mod/quiz:attempt`)                                     |
| Role                   | Capability-lər toplusu, context-də təyin olunur                    |
| Archetype              | Rolun standart şablonu (manager, teacher, student)                 |
| Override               | Alt context-də capability dəyərinin dəyişdirilməsi                 |
| Enrolment              | User-in kursa yazılması (metod + status + müddət)                  |
| Cohort                 | Toplu əməliyyat üçün user qrupu                                    |
| Course module (cm)     | Activity/resource-un kursdakı yeri                                 |
| Section                | Kursun bölməsi                                                     |
| Activity / Resource    | Fəaliyyət / material                                               |
| Gradebook              | Mərkəzi qiymət jurnalı                                             |
| Completion             | Tamamlanma izləmə                                                  |
| Availability           | Şərti əlçatanlıq (restrict access)                                 |
| Event / Observer       | Hadisə / onu dinləyən handler                                      |
| Task (scheduled/adhoc) | Zamanlanmış / bir dəfəlik arxa plan işi                            |
| External function      | Capability və sxemlə elan olunmuş API funksiyası                   |
| Track                  | AZES-ə xas bölmə/proqram (cohort + track_courses + enrol_track)    |

### 32.2 Mənbələr

Aşağıdakı Moodle sənəd səhifələrinə baxılıb və ya istinad olunub (5.3 sənədləri):

- Ana səhifə: https://docs.moodle.org/503/en/Main_page
- Features: https://docs.moodle.org/503/en/Features
- Moodle site, basic structure: https://docs.moodle.org/503/en/Moodle_site_-_basic_structure
- Roles and permissions: https://docs.moodle.org/503/en/Roles_and_permissions
- Əlavə oxumaq üçün (bu sənəddə birbaşa açılmayıb): Activities, Enrolment, Authentication, Gradebook (Grades), Tracking progress, Restrict access, Groups, Cohorts, Web services, Standards, Moodle developer docs (`moodledev.io`)

> **Dürüstlük qeydi:** Context səviyyələri, capability həlli, plugin tipləri, event/task/file/cache API-ləri və verilənlər bazası cədvəl adları Moodle-in ümumi memarlığı haqqında biliyimə əsaslanır və bu sessiyada hər biri üçün ayrıca developer sənədi yoxlanmayıb. M1 promptundan əvvəl `moodledev.io` üzərindən (Access API, Events API, Task API, File API, Cache API, Plugin types) bu bölmələrin təsdiqlənməsi tövsiyə olunur.

---

## 33. Növbəti addımlar

1. §31.1-dəki qərarları bağlamaq (xüsusilə 1, 2, 3, 5, 6, 7).
2. Mərhələ 0 auditdə mövcud auth/user cədvəlini yoxlamaq (paralel user cədvəli yaradılmır).
3. `moodledev.io` developer sənədləri ilə §5, §6, §18, §19, §21, §22 bölmələrini təsdiqləmək.
4. M1 promptunu hazırlamaq: context/capability çərçivəsi, schema, access cache, `/me/navigation`, cross-org testlər.
5. Menyu cədvəlindəki iki açıq sualı (orgAdmin kurs yaradır? instructor "Tələbələr"də kimi görür?) bağlamaq.
