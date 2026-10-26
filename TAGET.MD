# TAGET.MD — AZES Business Platform Roadmap & Engineering Rules

**Status:** Implementation roadmap  
**Approach:** Audit → Harden → Tenant Core → Module Registry → Business Modules  
**Current priority:** M1.6–M4 ERP Authz batch — qəbul gözlənilir  
**Next milestone:** M5+ ERP business modules (post-accept)  
**Scope:** Existing AZES monorepo, Account, Admin, API and design system  
**M1.5:** ACCEPTED (2026-10-26) — ERP Authz roadmap unlocked

---

## 1. Məqsəd

AZES-in mövcud texniki təməli üzərində çox təşkilatlı (multi-tenant), modulyar biznes idarəetmə platforması qurmaq.

Platforma gələcəkdə CRM, Sales, Inventory, Finance və digər biznes modullarını dəstəkləməlidir. Bunun üçün əvvəlcə autentifikasiya, təşkilat modeli, icazələr, API kontraktları və məlumat izoliyasiyası etibarlı şəkildə qurulmalıdır.

Bu sənəd icra ardıcıllığını, arxitektura məhdudiyyətlərini, təhlükəsizlik tələblərini və hər mərhələnin qəbul meyarlarını müəyyən edir.

### Əsas ardıcıllıq

1. M0 — Foundation Freeze & Hardening
2. M1 — Tenant Core
3. M1.5 — Menu and Role Authorization
4. M1.6 — Session Bootstrap & Live Authz
5. M2 — Module Registry
6. M2.5 — Organization Hierarchy & orgMulti
7. M3 — User Access Profiles & CRUD
8. M3.5 — Data Scope & Dashboard Authz
9. M4 — Audit Log & CRM
10. M5+ — Sales, Inventory, Finance və digər biznes modulları

**Məcburi qayda:** Cari mərhələnin qəbul meyarları yerinə yetirilmədən növbəti mərhələyə keçmə.

## 2. Dəyişməz arxitektura prinsipləri

### 2.1. Mövcud sistemi qorumaq

- Mövcud monorepo, paketlər, tətbiqlər və işə salınma qaydaları əsas götürülür.
- Mövcud funksionallıq yoxlanmadan yenidən yazılmır.
- Yeni abstraksiya yalnız konkret ehtiyac və əsaslandırma olduqda əlavə edilir.
- Mövcud işlək mexanizmlər sırf daha fərqli yanaşma seçmək üçün əvəz edilmir.
- Dəyişikliklər mümkün qədər kiçik, yoxlanıla bilən və geri qaytarıla bilən olmalıdır.

### 2.2. Frontend və backend sərhədi

- Frontend biznes məlumatlarına mövcud `@azes/api` qatından çıxış etməlidir.
- Frontend D1 verilənlər bazasına birbaşa qoşulmamalıdır.
- API sorğuları və cavabları OpenAPI kontraktına uyğun saxlanmalıdır.
- API kontraktındakı dəyişikliklərdən sonra Orval generasiyası və drift yoxlaması aparılmalıdır.
- Autentifikasiya, icazə və tenant izoliyasiyası yalnız frontend qərarlarına əsaslana bilməz.

### 2.3. Dizayn sistemi

- Mövcud Admin L-shell və `@azes/ui-web` qorunur.
- Mövcud AZES dizayn tokenləri və `AzesUiProvider` istifadə edilir.
- MUI əsaslı mövcud stil arxitekturası ilə paralel ikinci dizayn sistemi yaradılmır.
- Səhifələr üçün yeni vizual sistem və ya shell redesign bu roadmap-ın tərkibinə daxil deyil.
- Yeni səhifələr mövcud komponentlər, layout və navigation qaydaları ilə qurulur.
- Yeni mətnlər və interfeys elementləri mövcud i18n arxitekturasına uyğun olaraq az/en/ru dillərini dəstəkləməlidir.

### 2.4. Scope intizamı

M0-da yeni təşkilat, istifadəçi və biznes funksiyaları yaradılmır.

M1-də Module Registry, CRM, Sales, Inventory və Finance hazırlan mır.

M2 tamamlanmadan CRM-i modullar üçün yekun arxitektura kimi qəbul etmək olmaz.

Landing ayrıca məhsul işi olaraq qalır və M0 qəbul meyarlarına daxil deyil.

## 3. Mövcud sistemin təsdiqi

Agent əvvəlcə repository-ni araşdırmalı və faktiki vəziyyəti sənədləşdirməlidir.

İlkin məlum kontekst:

- `apps/account` — port 100
- `apps/admin` — port 200
- `apps/azes-ui` — port 700
- `apps/api-server` / faktiki API tətbiqi — port 8787
- Backend: Hono + Cloudflare Workers + D1, R2 istifadəsi mövcud konfiqurasiyadan yoxlanmalıdır.
- API kontraktı: OpenAPI → Orval → `@azes/api`
- Admin: mövcud L-shell və AZES UI komponentləri
- LMS route və cədvəlləri mövcud API-də qala bilər.

Bu məlumatlar başlanğıc kontekstidir, avtomatik olaraq təsdiqlənmiş cari vəziyyət hesab edilməməlidir.

### Audit qaydası

Agent aşağıdakıları yoxlamalıdır:

1. Həqiqi tətbiq və paket yolları.
2. `package.json`, workspace və task konfiqurasiyası.
3. Faktiki dev portları və API base URL.
4. Mövcud auth, permission, organization və LMS implementasiyası.
5. D1 konfiqurasiyası, miqrasiya faylları və cədvəllər.
6. OpenAPI və Orval konfiqurasiyası.
7. Mövcud testlər və build komandaları.
8. Git vəziyyəti, branch, dəyişdirilmiş və izlənməyən fayllar.

Məlumat sənədlə uyğun gəlmirsə, agent real kodu əsas götürməli, fərqi hesabatda göstərməli və təsdiqlənmiş arxitektura qərarlarını səssizcə dəyişməməlidir.

## 4. Tenant və istifadəçi idarəetməsi üçün arxitektura qərarları

### 4.1. İdarəetmə iyerarxiyası

AZES platformasının idarəetmə modeli:

- **SuperAdmin:** platforma səviyyəsində təşkilatları və ümumi parametrləri idarə edir.
- **Organization:** ayrıca şirkət və ya təşkilat.
- **OrgAdmin:** öz təşkilatının üzvlərini, rollarını və parametrlərini idarə edir.
- **Organization Member:** təşkilat daxilində verilmiş icazələrlə işləyən istifadəçi.

SuperAdmin təşkilat yarada və ilk OrgAdmin üçün dəvət başlada bilər. İstifadəçinin daimi parolunu SuperAdmin müəyyən etməməli və görə bilməməlidir.

Dəvət prosesi mövcud auth arxitekturasına uyğun audit edildikdən sonra layihələndirilməlidir. Mövcud sistemdə təhlükəsiz dəvət mexanizmi yoxdursa, bu, M1-in konkret işi olacaq.

### 4.2. User və Organization fərqi

Qlobal istifadəçi hesabı ilə təşkilatdakı üzvlük ayrı anlayışlardır.

Hədəf məlumat modeli ən azı bu anlayışları dəstəkləməlidir:

- `users` — qlobal istifadəçi hesabları;
- `organizations` — təşkilatlar;
- `memberships` — istifadəçinin təşkilata üzvlüyü;
- `roles` — rol tərifləri;
- `permissions` — icazələr;
- `invitations` — dəvətlər;
- `audit_logs` — vacib əməliyyatların tarixçəsi.

Bunlar ilkin model anlayışlarıdır, hazırkı cədvəl adları və strukturu barədə fərziyyə deyil. Agent mövcud sxemi yoxlamadan paralel və ya təkrarlanan cədvəllər yaratmamalıdır.

### 4.3. Multi-organization membership

Eyni istifadəçi bir neçə təşkilatın üzvü ola bilməlidir.

Həmin istifadəçinin hər təşkilatda fərqli rolu və icazələri ola bilər. Bir təşkilatdakı admin rolu digər təşkilatda avtomatik admin səlahiyyəti verməməlidir.

İstifadəçinin cari təşkilatı dəyişdirilə bilər, lakin bu seçim təhlükəsizlik sərhədi hesab edilmir.

### 4.4. Aktiv təşkilat və server-side yoxlama

Frontend aktiv təşkilatın identifikatorunu API-yə ötürə bilər, amma backend bunu təsdiqləməlidir.

Hər tenant-scoped sorğuda backend:

1. Sorğunun autentifikasiya olunmuş istifadəçidən gəldiyini yoxlayır.
2. Tələb edilən təşkilatın identifikatorunu müəyyən edir.
3. İstifadəçinin həmin təşkilata üzvlüyünü yoxlayır.
4. Tələb olunan əməliyyata icazəsini yoxlayır.
5. Məlumatı yalnız həmin təşkilatın scope-u daxilində oxuyur və ya dəyişir.

Frontend-dən gələn organization ID etibarlı icazə sübutu deyil.

Başqa təşkilatın resurs ID-sini birbaşa göndərməklə həmin məlumatı oxumaq və ya dəyişmək mümkün olmamalıdır.

## 5. M0 — Foundation Freeze & Hardening

### Məqsəd

Yeni biznes funksiyaları əlavə etmədən mövcud texniki təməlin təhlükəsizliyini, təkrarlana bilənliyini və qəbul edilə bilən vəziyyətini təsdiqləmək.

### M0.1 — SSO və auth axınının yoxlanması

Yoxlanacaq əsas axın:

`Account → Login → Auth Handoff → Admin → Home`

Yoxlanacaq hallar:

- Düzgün məlumatlarla login.
- Yanlış məlumatlarla login.
- Handoff payload-unun Admin tərəfindən qəbul edilməsi.
- Handoff istifadə edildikdən sonra URL fragmentinin təmizlənməsi.
- Logout və Account-a yönləndirmə.
- Access token vaxtı bitdikdə refresh.
- Paralel 401 cavablarında refresh əməliyyatının təkrarlanmaması.
- Refresh uğursuz olduqda sessiyanın etibarsızlaşdırılması.
- İcazəsiz sorğuda düzgün 401/403 davranışı.
- Brauzer yeniləndikdə sessiyanın gözlənilən davranışı.

Test nəticələri yalnız kodun mövcudluğuna deyil, faktiki işləməsinə əsaslanmalıdır.

### M0.2 — Auth və SSO təhlükəsizlik auditi

Agent mövcud kodu yoxlamalıdır:

- Access və refresh tokenlərin harada saxlanması.
- Cookie `HttpOnly`, `Secure`, `SameSite`, domain və path parametrləri.
- Tokenlərin URL, browser history, log və xəta mesajlarında qalma ehtimalı.
- Handoff payload-unun imzalanması, müddəti və təkrar istifadə riski.
- Device ID və fingerprint yoxlamasının real davranışı.
- User-Agent, platforma və language məlumatlarının hansı tərəfdə formalaşması və yoxlanması.
- Refresh token rotation və köhnə refresh tokenin rədd edilməsi.
- Paralel refresh və sessiyanın ləğvi.
- Logout zamanı server-side sessiyanın və refresh tokenin ləğvi.
- Open redirect və `returnUrl` allowlist yoxlaması.

Base64 ilə kodlaşdırılmış payload şifrələmə və ya etibarlılıq sübutu sayılmamalıdır. Hash fragmentin serverə avtomatik göndərilməməsi onun brauzerdə təhlükəsiz saxlandığına zəmanət vermir.

Agent yalnız real implementasiyanı yoxladıqdan sonra risk nəticəsi çıxarmalıdır.

Hər tapıntı üçün aşağıdakılar yazılmalıdır:

- Risk və təsiri.
- Təsirlənən fayl və ya komponent.
- Təkrarlama ssenarisi.
- Təklif edilən düzəliş.
- Düzəlişin test nəticəsi.
- M0 daxilində həll olunub-olunmaması.

Təhlükəsizlik üçün zəruri düzəlişlər M0-a daxildir. Yeni biznes funksiyaları bu bəhanə ilə əlavə edilmir.

### M0.3 — D1 və miqrasiyalar

- Mövcud D1 sxemi və miqrasiya ardıcıllığı yoxlanmalıdır.
- Lokal miqrasiyalar təmiz və ya sənədləşdirilmiş test mühitində təkrar icra ilə yoxlanmalıdır.
- Miqrasiya vəziyyətinin təkrar icrada düzgün idarə olunması təsdiqlənməlidir.
- Mövcud məlumatları silən və ya dəyişən əməliyyatlar ayrıca nəzərdən keçirilməlidir.
- Seed tələb olunursa, onun məqsədi və lokal istifadə qaydası sənədləşdirilməlidir.
- Real istifadəçi parolları, tokenlər və digər sirrlər seed və repository-yə yerləşdirilməməlidir.
- Mövcud məlumatların itirilmə riski olan dəyişikliklər avtomatik icra edilməməlidir.

### M0.4 — OpenAPI və Orval

- Mövcud OpenAPI mənbəyi müəyyənləşdirilməlidir.
- API kontraktı ilə generated client arasında drift yoxlanmalıdır.
- `pnpm api:generate` və `pnpm generate:check` komandaları mövcuddursa, onların real davranışı yoxlanmalıdır.
- Generated fayllar əl ilə dəyişdirilməməlidir; generatorun mənbə kontraktı düzəldilməlidir.
- İcra komandaları mövcud deyilsə, agent onların olmadığını qeyd etməli və uyğun əlavə təklif etməlidir.

### M0.5 — Repository və quality gates

Mövcud layihə konfiqurasiyasına əsasən:

- Lint.
- Typecheck.
- Unit testlər.
- Integration testlər, mövcud olduqda.
- Production build.
- Architecture verification, mövcud olduqda.
- API generation/drift check.

Yalnız uğurlu build kifayət deyil. Uğursuz testlər və ya əvvəldən mövcud problemlər hesabatda ayrıca göstərilməlidir.

Agent əvvəlki baseline ilə yeni dəyişiklikdən yaranan problemləri fərqləndirməlidir.

### M0.6 — Portlar və lokal işə salınma

Account `:100`, Admin `:200`, AZES UI `:700` və API `:8787` portları faktiki konfiqurasiya ilə yoxlanmalıdır.

Hər tətbiqin:

- İşə salınma komandası.
- Tələb olunan environment dəyişənləri.
- API əlaqəsi.
- Uğurlu açılma və əsas smoke nəticəsi

qısa sənədləşdirilməlidir.

Portların mövcudluğu tətbiqin funksional işlədiyini sübut etmir.

### M0.7 — Git və sirrlər

- Mövcud Git statusu yoxlanmalıdır.
- İstifadəçinin dəyişdirdiyi fayllar qorunmalıdır.
- `.env`, tokenlər, parollar və digər sirrlər commit edilməməlidir.
- `.git` yoxdursa, repository yaratmaq və remote qoşmaq üçün istifadəçi təsdiqi alınmalıdır.
- İstifadəçi təsdiqi olmadan commit, push, remote dəyişiklik və ya dağıdıcı Git əməliyyatı aparılmamalıdır.

### M0.8 — LMS inventory

Mövcud LMS route-ları, cədvəlləri və frontend/API əlaqələri inventarlaşdırılmalıdır.

Məqsəd LMS-i silmək və ya yenidən qurmaq deyil. Məqsəd gələcək tenant modelinin mövcud LMS kodundan asılılıqlarını anlamaqdır.

Nəticə sənədində:

- Route siyahısı.
- Cədvəl siyahısı.
- Mövcud organization/user əlaqələri.
- Mümkün tenant izoliyası riskləri.
- Gələcək uyğunlaşdırma ehtiyacları

qeyd edilməlidir.

M1 tenant core LMS-ə xüsusi məcburi asılılıq yaratmamalıdır.

### M0 DONE meyarları

- [x] SSO və əsas auth ssenariləri yoxlanıb. _(unit + api-server auth/rbac tests; ports smoke)_
- [x] Refresh, logout, 401 və 403 davranışı sınaqdan keçirilib. _(api-server auth + rateLimit tests)_
- [x] Auth təhlükəsizlik auditi yazılıb. → `docs/ops/M0-AUDIT-REPORT.md`
- [x] Kritik risklər düzəldilib və ya açıq şəkildə bloklayıcı kimi sənədləşdirilib. _(handoff TTL; HttpOnly/git açıq)_
- [x] D1 və miqrasiya davranışı yoxlanıb. _(migration inventory; local D1 bindings in wrangler)_
- [ ] OpenAPI/Orval drift vəziyyəti təsdiqlənib. **BLOCKED:** `generate:check` requires `.git`
- [x] Quality gates nəticələri qeydə alınıb. _(account/admin/api-server tests + scoped build PASS)_
- [x] Portlar və lokal işə salınma sənədləşdirilib. _(100/200/700/8787 LISTEN)_
- [x] Git və sirrlər üzrə yoxlama tamamlanıb. _(`.git` yoxdur — init user təsdiqi gözləyir)_
- [x] LMS inventory hazırlanıb. → `docs/ops/M0-LMS-INVENTORY.md`
- [x] M0 nəticə hesabatı təqdim edilib. → `docs/ops/M0-AUDIT-REPORT.md`

**M0 status:** PARTIAL — git yoxdur → Orval drift check + commit/deploy mümkün deyil.  
**STOP:** M1-ə keçmə. Əvvəl user: (1) `git init` icazəsi və/və ya (2) M0 PARTIAL qəbulu.

**STOP:** M0 DONE təsdiqi olmadan M1 implementasiyasına başlama.

## 6. M1 — Tenant Core

### Məqsəd

Bütün gələcək modulların istifadə edəcəyi təşkilat, üzvlük, rol, dəvət və server-side tenant izoliyasiyası təməlini qurmaq.

### M1.1 — Mövcud implementasiyanın auditi

- Mövcud organization və permission kodunu araşdır.
- Mövcud API və D1 sxemini nəzərdən keçir.
- Təkrarlanan modellər və endpoint-lər yaratma.
- Mövcud kodu uyğunlaşdırmaq mümkündürsə, yenidən yazmaq əvəzinə uyğunlaşdır.
- Dəyişiklikdən əvvəl qısa backend və frontend planı təqdim et.

### M1.2 — Organization və membership

Tələb olunan imkanlar:

- Təşkilat yaratmaq.
- Təşkilat məlumatlarını oxumaq və dəyişmək.
- Təşkilat statusunu idarə etmək.
- İstifadəçiləri təşkilata bağlamaq.
- İstifadəçinin təşkilat üzvlüyünü yoxlamaq.
- Bir istifadəçinin bir neçə təşkilatda üzv olmasını dəstəkləmək.
- Təşkilatdan ayrılma və üzvlüyün ləğvi qaydalarını müəyyənləşdirmək.

Təşkilat yaratmaq səlahiyyəti SuperAdmin və ya açıq şəkildə icazə verilmiş platforma roluna aid olmalıdır. OrgAdmin yalnız öz təşkilatı daxilində idarəetmə edə bilməlidir.

### M1.3 — Dəvətlər və hesabın aktivləşdirilməsi

- SuperAdmin təşkilat yarada və ilkin OrgAdmin-i dəvət edə bilməlidir.
- OrgAdmin öz təşkilatına yeni üzvlər dəvət edə bilməlidir.
- Dəvət müəyyən istifadəçiyə və təşkilata bağlı olmalıdır.
- Dəvət tokenləri təxmin edilə bilməyən, müddətli və təkrar istifadəyə qarşı qorunan olmalıdır.
- Dəvət qəbul edilərkən server tokenin etibarlılığını, müddətini və vəziyyətini yoxlamalıdır.
- Parol istifadəçi tərəfindən təhlükəsiz qeydiyyat və ya bərpa prosesi ilə müəyyən edilməlidir.
- Admin başqa istifadəçinin cari parolunu görməməli və bilməməlidir.
- Mövcud auth sistemində çatışmayan imkanlar ayrıca müəyyənləşdirilməli və mövcud sistemə uyğun əlavə edilməlidir.

### M1.4 — Roles və permissions

- Platforma səviyyəli səlahiyyətlər təşkilat səviyyəli səlahiyyətlərdən ayrılmalıdır.
- OrgAdmin yalnız öz təşkilatının üzvlərinə və idarəetmə əməliyyatlarına səlahiyyət verməlidir.
- Bir təşkilatda verilmiş rol digər təşkilata avtomatik ötürülməməlidir.
- API hər əməliyyat üçün icazəni server tərəfində yoxlamalıdır.
- İstifadəçinin yalnız frontend-də gizlədilmiş menyuya əsasən qorunduğu fərz edilməməlidir.
- Xüsusi rollar üçün genişləndirilə bilən model nəzərdə tutula bilər, lakin M1-də lazımsız kompleks permission engine yaradılmamalıdır.

### M1.5 — Active organization

Admin interfeysində istifadəçi mövcud olduğu təşkilatlar arasında keçid edə bilməlidir.

Təşkilat dəyişdirilərkən:

1. Aktiv təşkilat UI-da yenilənir.
2. API sorğularında təşkilat konteksti ötürülür.
3. Backend üzvlüyü və səlahiyyəti yoxlayır.
4. Tenant-a bağlı cache məlumatları əvvəlki təşkilatdan yeni təşkilata təhlükəsiz şəkildə ayrılır.
5. Əvvəlki təşkilata aid məlumatlar yeni təşkilat seçildikdən sonra göstərilmir.

Redux və ya shell state yalnız UI vəziyyətini idarə edir; server-side icazə qərarını əvəz etmir.

### M1.6 — Tenant data isolation

Tenant-a bağlı hər resurs üçün backend təşkilat scope-unu tətbiq etməlidir.

Tələb olunan testlər:

- Təşkilat A üzvü A-nın resurslarını görə bilir.
- Təşkilat A üzvü B-nin resurslarını görə bilmir.
- Başqa təşkilatın resurs ID-sini birbaşa göndərmək məlumatı açmır.
- Başqa təşkilatın resursunu dəyişmək və silmək mümkün deyil.
- OrgAdmin öz təşkilatından kənarda üzv və rol idarə edə bilmir.
- Təşkilat konteksti olmayan sorğu üçün müəyyən edilmiş təhlükəsiz davranış tətbiq edilir.
- İstifadəçi üzvlüyünü itirdikdən sonra əvvəlki icazələrdən istifadə edə bilmir.

Uyğun olmayan sorğular üçün API kontraktına uyğun 401, 403 və ya resursun mövcudluğunu açıqlamayan təhlükəsiz cavab seçilə bilər. Dəqiq davranış resursun və təhlükəsizlik tələbinin xüsusiyyətinə uyğun sənədləşdirilməlidir.

### M1.7 — Admin UI

Mövcud L-shell və AZES UI əsasında:

- Organizations siyahısı.
- Organization yaratma və redaktə.
- Organization üzvlərinin siyahısı.
- İstifadəçi dəvəti.
- Rol və icazə idarəetməsi.
- Aktiv təşkilat seçicisi.
- Dəvət və üzvlük statusları.
- Loading, empty, success və error vəziyyətləri.

Səhifələr mövcud routing, PATHS, lazy loading və i18n qaydalarına uyğun qurulmalıdır.

Yeni shell və ya paralel dizayn sistemi yaratma.

### M1.8 — API kontraktı və testlər

- Yeni və dəyişdirilmiş endpoint-lər OpenAPI-də təsvir edilməlidir.
- Orval vasitəsilə `@azes/api` yenilənməlidir.
- Generated client əl ilə redaktə edilməməlidir.
- Tenant izoliyası və icazə yoxlamaları üçün integration testlər əlavə edilməlidir.
- Frontend yalnız API qatından istifadə etməlidir.
- Yeni API imkanları üçün uğurlu və uğursuz ssenarilər yoxlanmalıdır.

### M1 DONE meyarları

- [x] Təşkilat yaratmaq və idarə etmək mümkündür.
- [x] İlkin OrgAdmin dəvəti və qəbul prosesi işləyir.
- [x] OrgAdmin öz təşkilatına istifadəçi dəvət edə bilir.
- [x] Bir istifadəçi bir neçə təşkilatda üzv ola bilir.
- [x] Təşkilat daxilində rollar və icazələr server tərəfində yoxlanılır.
- [x] Aktiv təşkilat seçimi API sorğularında düzgün tətbiq edilir.
- [x] Başqa təşkilatın məlumatlarına birbaşa ID ilə giriş testləri uğursuz nəticə verir.
- [~] Tenant-a bağlı cache və UI məlumatları təşkilatlar arasında qarışmır. (invalidate + JWT; brauzer E2E yox)
- [x] OpenAPI, Orval və `@azes/api` sinxron vəziyyətdədir.
- [x] Unit və integration testlər keçirilib.
- [~] Lint, typecheck və production build nəticələri yoxlanıb. (scoped api+admin typecheck; full build Coordinator)
- [x] M1 qəbul hesabatı təqdim edilib.

**STOP:** M1 qəbul edilmədən Module Registry və CRM implementasiyasına keçmə.

## 6b. M1.5 — Menu and Role Authorization

### Məqsəd

Admin shell menyularını hardcoded primaryNav əvəzinə `GET /api/v1/me.nav` ilə backenddən gətirmək. SuperAdmin menyunu rola bağlaya bilməlidir; bağlama ilə menyunun permission kodları rola UNION olunur və mövcud `requirePermission` 403 mexanizmi avtomatik qalır.

### Scope

- Daxil: `menus` / `menu_permissions` / `role_menus`; getMe nav+permissions; SuperAdmin role-menus UI; AdminShell map; OpenAPI 0.15; testlər.
- Xaric: M2 Module Registry; CRM; Academy invent; Casbin; kodsuz yeni səhifə inventi.
- Fərziyyə: unassign zamanı shared permission digər bağlı menyularda lazımdırsa silinmir. `superAdmin` platform istisnası saxlanılır.

### Data model

- `menus`: app `admin`, code, path, i18n_key, icon_key, sort_order, status
- `menu_permissions`: menu_id, permission_code
- `role_menus`: role_name, menu_id
- Seed: home (`/`); organizations (`/organizations`) `org.manage`|`org.create`; users (`/users`) `org.manage`; role-menus (`/role-menus`) `org.manage_all`

### API

- `GET /api/v1/me` — nav + permissions DB UNION
- `GET /api/v1/menus` — `org.manage_all`
- `GET/PUT /api/v1/roles/{role}/menus` — `org.manage_all`; body `{ menuIds }`
- `GET /api/v1/roles` — `org.manage_all`
- 403: mövcud `requirePermission`; mənbə DB (yeni middleware yox)

### Admin UI

- AdminShell: `useGetApiV1Me` nav → `AzesNavConfig` (icon map). Nav-da olmayan path → Home.
- Feature `roleMenus` + `PATHS.roleMenus` + i18n en/az/ru.

### M1.5 DONE meyarları

- [x] Migration `0007_menu_rbac` local D1-ə tətbiq olunub.
- [x] `GET /me` Admin nav + effective permissions DB UNION ilə qayıdır.
- [x] SuperAdmin role↔menu bağlaya bilir; unassign → nav itir + API 403.
- [x] AdminShell hardcoded primaryNav əvəzinə `me.nav` istifadə edir.
- [x] OpenAPI **0.15** + Orval `@azes/api` sinxron.
- [x] `menuRoleRbac` + scoped admin/api typecheck PASS.
- [x] Canlı hesabat: `docs/ops/CURRENT.md`.

**M1.5 status:** ACCEPTED (2026-10-26).

## 6c. M1.6 — Session Bootstrap & Live Authz

### Məqsəd

`GET /api/v1/me` session bootstrap kimi qalır (yeni rəqib user-nav endpoint yox). Admin Query cache ilə route başına təkrar `/me` yox. `requirePermission` JWT snapshot əvəzinə DB `effectiveCan` (menu UNION) istifadə edir.

### Scope

- Daxil: Admin `staleTime`/invalidate; `requirePermission` → menuRepo; test (unassign + eyni JWT → 403); OpenAPI `/me` bootstrap qeydi.
- Xaric: child org, modules, user menu, HttpOnly cookie köçürməsi.

### M1.6 DONE

- [x] Admin shell `/me` uzun cache; invalidate org-switch / role-menus / logout.
- [x] `requirePermission` live DB authz.
- [x] menuRoleRbac: unassign → eyni access token ilə 403.
- [x] `docs/ops/CURRENT.md` yenilənib.

**M1.6 status:** implementasiya tamam (batch ilə M2–M4 birlikdə).

## 7. M2 — Module Registry

### Məqsəd

Platform modul kataloqu (`platform_modules` — LMS curriculum `modules` cədvəlinə toxunma). Org-a modul açılması + `module_menus` / `organization_menus`. Modul açılınca menyular əlçatan olur; avtomatik user grant yox.

### Data

- `platform_modules` (id, code, name, version, status)
- `module_menus` (module_id, menu_id)
- `organization_modules` (org_id, module_id, status)
- `organization_menus` (org_id, menu_id) — optional override; default = enabled modules’ menus

### API

- `GET/PUT /api/v1/orgs/{orgId}/modules` — `org.manage_all`
- Effective nav/perm: org modul aktiv + menu əlçatan + role/user assign + permission

### M2 DONE

- [x] Migration + seed (`admin-core`, `crm`)
- [~] OpenAPI 0.16 bump (path inventory / Orval regen follow-up)
- [~] SuperAdmin org modules UI (API hazır; UI follow-up)
- [x] Smoke: `GET /api/v1/modules`

**M2 status:** API + migration tamam.

## 7b. M2.5 — Organization Hierarchy & orgMulti

### Məqsəd

Root org yalnız SuperAdmin; Admin `org_multi=true` membership ilə yalnız öz ağacında child yaradır.

### Data

- `organizations.parent_organization_id` nullable
- `organization_memberships.org_multi` integer 0/1 default 0

### Qaydalar

- Cross-tenant oxu/yazı 403
- Child create: actor org_multi + parent = aktiv org (və ya icazəli əcdad)

### M2.5 DONE

- [x] Migration + API create child (`parentOrganizationId`)
- [~] Admin Orgs hierarchy UI (API field hazır)
- [x] Root create: yalnız SuperAdmin; orgAdmin root 403

**M2.5 status:** API + migration tamam.

## 7c. M3 — User Access Profiles & CRUD

### Məqsəd

Default permission profiles + user menu assignment + per-menu read/create/update/delete. Default-deny. Admin yalnız öz grant subset-ini ötürə bilir.

### Data

- `permission_profiles`, `permission_profile_items`
- `user_menus`, `user_menu_permissions` (actions → `{resource}.{action}` kodları)
- Seed: OrgAdmin, Accountant, Salesperson, WarehouseOperator, ReadOnly (yalnız aktiv org modulları)

### M3 DONE

- [x] Migration + API assign (`permission-profiles`, `users/:id/access`)
- [~] Admin Users access UI (API hazır)
- [x] Smoke: orgAdmin profiles 200
- [~] Effective access user override wiring (cədvəl + API; getMe UNION follow-up)

**M3 status:** schema + API tamam.

## 7d. M3.5 — Data Scope & Dashboard Authz

### Məqsəd

`data_scope`: `org` | `own` | `subtree`. Dashboard widget-lər permission + scope ilə; filter serverdə.

### M3.5 DONE

- [x] Membership `data_scope` column
- [x] Scope helper + test
- [x] CRM list scope filter (`own` / `org` / `subtree`)

**M3.5 status:** tamam.

## 8. M4 — Audit Log & CRM

### Audit

- `audit_logs` (actor_user_id, org_id, action, target_type, target_id, meta_json, created_at)
- SuperAdmin `GET /api/v1/audit-logs`
- Permission/org dəyişikliklərində yaz

### CRM (ilk biznes modul)

İlkin scope: Customers (tenant-scoped CRUD). Contacts/Leads sonrakı iterasiya.

- [x] `crm_customers` + API `crm.customers.*` permissions
- [x] Tenant + permission server yoxlaması
- [x] Admin minimal Customers səhifəsi
- [x] `audit_logs` + `GET /api/v1/audit-logs`

**M4 status:** implementasiya tamam — batch qəbul gözlənilir.  
**STOP:** M4 qəbulundan sonra M5+ ERP.

## 9. M5+ — ERP və digər modullar

Gələcək modullar: Sales, Inventory, Finance, Procurement, HRM, Projects, Automation.

Hər modul ayrıca mərhələ; bir batch-də hamısını yaratma.

## 10. Agent iş qaydaları

### İcra ardıcıllığı

1. Mövcud kodu araşdır.
2. Faktiki vəziyyəti və riskləri sənədləşdir.
3. Cari mərhələnin dəyişiklik planını təqdim et.
4. Scope-a uyğun implementasiya et.
5. Test və quality gates icra et.
6. Dəyişdirilmiş faylları və nəticələri hesabatda göstər.
7. Mərhələnin DONE meyarlarını yoxla.
8. STOP et və istifadəçinin təsdiqini gözlə.

### Qadağan olunmuş davranışlar

- Mərhələnin scope-undan kənar funksiyalar əlavə etmək.
- Audit etmədən mövcud auth və permission sistemini yenidən yazmaq.
- D1-ə frontend-dən birbaşa giriş əlavə etmək.
- Generated API kodunu əl ilə dəyişmək.
- Tenant təhlükəsizliyini yalnız UI-da təmin etməyə çalışmaq.
- Mövcud istifadəçi məlumatlarını və ya miqrasiya tarixçəsini əsassız silmək.
- İstifadəçinin dəyişdirdiyi faylları xəbərsiz geri qaytarmaq.
- İcazəsiz commit, push, remote dəyişiklik və dağıdıcı əməliyyat aparmaq.
- Uğursuz testləri gizlətmək və ya yoxlanmamış işi DONE kimi təqdim etmək.
- İstifadəçi təsdiqi tələb olunan mərhələdən sonra avtomatik növbəti mərhələyə keçmək.

### Agent rolları

- **Memar:** dəyişiklik sərhədlərini və texniki planı müəyyənləşdirir.
- **Worker / İcraçı:** təsdiqlənmiş scope daxilində implementasiya edir.
- **Dizayner:** mövcud AZES UI sisteminə uyğun interfeys detallarını işləyir.
- **Coordinator:** test, build, inteqrasiya və yekun nəticələri yoxlayır.

Bir neçə agent işləyirsə, eyni fayl və ya eyni arxitektura qərarı üzərində paralel, koordinasiyasız dəyişikliklər edilməməlidir.

## 11. Hər mərhələnin hesabat formatı

Hər mərhələnin sonunda təqdim et:

1. **Status:** DONE / PARTIAL / BLOCKED.
2. **Dəyişdirilmiş fayllar:** fayl və dəyişiklik səbəbi.
3. **Arxitektura qərarları:** edilən və təxirə salınan qərarlar.
4. **Test nəticələri:** faktiki komandalar və nəticələr.
5. **Təhlükəsizlik:** tapıntılar və həll vəziyyəti.
6. **Açıq problemlər:** risk, təsir və növbəti addım.
7. **Qəbul checklist-i:** hər meyar üçün sübut.
8. **Növbəti addım:** yalnız təklif; avtomatik icra deyil.

## 12. Cari icra əmri

**Hazırkı mərhələ: M0 — Foundation Freeze & Hardening.**

İlk addım mövcud repository-ni audit etmək və M0 checklist-i üzrə faktiki vəziyyəti müəyyənləşdirməkdir.

Əvvəlcə audit və risk hesabatı hazırla. Sonra M0 scope daxilində təhlükəsiz düzəlişləri et, testləri icra et və nəticəni təqdim et.

M1 implementasiyasına başlama. Təşkilat, istifadəçi, dəvət və biznes UI funksiyalarını M0-a daxil etmə.

M0 qəbul meyarları tam təsdiqlənəndən sonra STOP et və istifadəçinin M1 üçün təsdiqini gözlə.

## BACK END

## Backend Technology Stack — Architecture Decision

AZES backend-i mövcud monorepo daxilində **TypeScript + Hono + Cloudflare Workers** texnologiyaları ilə inkişaf etdirilir.

### Məcburi texnoloji istiqamət

- **Language:** TypeScript
- **HTTP framework:** Hono
- **Runtime / deployment:** Cloudflare Workers
- **Primary database:** Cloudflare D1 (SQLite)
- **Object storage:** Cloudflare R2 — fayl saxlama ehtiyacı olduqda
- **API contract:** OpenAPI
- **API client generation:** Orval → `@azes/api`
- **Database migrations:** mövcud D1/Wrangler miqrasiya mexanizmi

### Arxitektura qaydaları

1. Yeni backend endpoint-ləri mövcud Hono API tətbiqində, repository-nin arxitekturasına uyğun qurulmalıdır.
2. Frontend D1-ə birbaşa qoşulmamalıdır; məlumatlara API vasitəsilə çıxış etməlidir.
3. Autentifikasiya, RBAC və tenant izoliyasiyası server tərəfində tətbiq edilməlidir.
4. API dəyişiklikləri OpenAPI kontraktına və Orval generasiyasına uyğun aparılmalıdır.
5. Backend framework-ü, runtime-ı və ya verilənlər bazasını dəyişmək üçün əvvəlcə texniki əsaslandırma və istifadəçi təsdiqi tələb olunur.
6. Mövcud tətbiq və konfiqurasiya audit edilmədən ikinci backend serveri və ya paralel API arxitekturası yaradılmamalıdır.

Bu texnoloji istiqamət M0 və M1 boyunca qorunur. Cloudflare Workers məhdudiyyətlərinə görə xüsusi texniki problem aşkar edilərsə, alternativ təklif kod dəyişdirilməzdən əvvəl əsaslandırılmalıdır.
