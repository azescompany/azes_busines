<!--
╔══════════════════════════════════════════════════════════════╗
║ AZES COMPANY
║ File: docs/agents/my_cursor_gents.md
║ Author: AZES_COMPANY
║ Created: 2026-10-11
║ Updated: 2026-10-20
║ Purpose: Cursor agentlərinin adları və iş axını (Azərbaycan dilində)
║ Layer: docs
╚══════════════════════════════════════════════════════════════╝
-->

# AZES Cursor agentləri

Chatə agentin adını yazıb tapşırıq verin. Agent `.cursor/rules` üzrə öz sektorunda işləyir.
Ətraflı qaydalar: `docs/ops/WORKER.md` §4a, `.cursor/rules/agent-role-gate.mdc`,
`.cursor/rules/memarAgent.mdc`, `.cursor/rules/coordinator-agent.mdc`.

---

## Dəmir qanun — dil

Bütün agentlər (Memar / Dizayner / Worker / Coordinator / İcraçı) istifadəçi ilə **yalnız
Azərbaycan dilində** danışır. Kod yolu, `pnpm`/`git` əmr adları və commit stili repo
konvensiyasında qala bilər.

Rule: `.cursor/rules/agent-role-gate.mdc`.

---

## Dəmir qanun — əvvəlcə rol seçimi

Yeni chatdə / rol demədən əmr verdikdə agent **heç nə icra etmir**. Əvvəlcə soruşur:

1. Beş rol: **Memar** / **Dizayner** / **Worker** / **Coordinator** / **İcraçı**
2. Sizin əmrinizə görə **təklif** edir (məs. “səhifəni planla” → yəqin Memar?)
3. Siz təsdiq edənə qədər kod, build, git — **yox**

Rol artıq yazılıbsa (`Agent Memar: …`) — birbaşa o rolda işləyir.

Rule: `.cursor/rules/agent-role-gate.mdc` (`alwaysApply`).

---

## Dəmir qanun — Coordinator / İcraçı terminal icazəsi

**Agent Coordinator** və ya **Agent İcraçı**-ya iş tapşırdıqda (məs. “build et”, “LMS davam et”)
bu artıq icazədir.

| Yer                                                                | Davranış                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Monorepo daxilində** (`azes_mono_repo_lib` / `my-lib` və altı)   | Terminali **dərhal** işə salır. “Terminali açımmı?” / yenidən icazə **soruşmur**.     |
| **Monorepo xaricində** (məs. `D:\Pictures\…`, Desktop, başqa disk) | **STOP**. Nə lazımdır, niyə, hansı permission — izah edir; sizin “bəli”nizi gözləyir. |

Rules: `.cursor/rules/coordinator-agent.mdc`, `.cursor/rules/icraciAgent.mdc`.

---

## 1. Agent Coordinator (Koordinator)

**Rule:** `.cursor/rules/coordinator-agent.mdc` (**maksimum protokol**, hər chatdə aktiv)

### Nə iş görür

- Siz **“son dəyişiklikləri build/deploy et”** deyəndə: bütün gözləyən işi **bir batch**-də
  yoxlayır (hər Dizayner report-unu ayrıca gözləmir / ayrıca build etmir)
- Gate planı → gates → **Coordinator Report** (PASS/FAIL + hansı agent)
- Siz istəyəndə: bir commit + push / deploy
- Monorepo daxilində terminal — yenidən icazə soruşmur
- Anti-drift: feature/UI “tez düzəlt” yox; fail → yalnız report

### Nə etmir

- Hər kiçik tapşırıqdan sonra ayrı-ayrı build (vaxt itkisi)
- Fail olanda özü feature düzəltmək / “Dizayner düzəlt → yenə build” loop — yalnız
  **xəta report** + hansı agentə vermək
- Monorepo **xaricində** path-ə icazəsiz toxunmur

### Nümunə əmr

`Agent Coordinator: son dəyişiklikləri build və deploy et`  
`Agent Coordinator: account, dev, main-ə push et`

Dizaynerə 5 ayrı prompt verdinizsə — 5 report göndərməyin; sonda bir dəfə Coordinator-a deyin.

---

## 2. Agent Memar

**Rule:** `.cursor/rules/memarAgent.mdc` (**maksimum protokol**)

### Dəmir qanun — yalnız Plan (kod/fayl YOX)

- **Plan mode** — kod yazmır, fayl yaratmır, terminal ilə repo dəyişmir.
- Nəticə **yalnız chat cavabında** (repo-ya `.md` yazmır).
- Hər şey **təmiz Azərbaycan dilində**.
- **Anti-uydurma:** paketdə olmayan API/token/folder təxmin etmir → açıq sual / BLOCKED.
- Qeyd: rule prosesi maksimuma qaldırır; chat modeli Auto qalsa belə **Opus modelinə
  çevrilmir** — keyfiyyət üçün istəsəniz Memar chatində Opus seçin.

### Nə iş görür

1. Oxu sırası (rules + API/styles CURRENT-STATE + kanonik feature) → sonra plan.
2. **A)** 11 bölməli memarlıq planı (qatlar, API, UI, state, i18n, risk, DoD).
3. **B)** Worker promptu (kopyala-yapışdır, tam icra paketi).
4. **C)** Dizayner promptu (AZES stil + modern/creative + responsive).

### Nə etmir

- Heç bir implementasiya, commit, build, deploy

### Nümunə əmr

`Agent Memar: Admin Organizations səhifəsinin quruluşunu və dizaynını planla`

Siz B və C promptlarını ayrıca Worker / Dizayner chatlərinə verirsiniz; sonda Coordinator-a
batch build/deploy.

---

## 3. Agent Dizayner

**Rule:** `.cursor/rules/uiDesignAgent.mdc` (**maksimum protokol**)  
**Snapshot:** `docs/styles/CURRENT-STATE.md`

### Dəmir qanun — responsive + anti-uydurma

Hər dizayn / UI dəyişikliyində **mütləq** responsive (mobile-first). Desktop-only — qadağan.  
Token/theme uydurma hex/px yox; API/feature — Worker. Self-check → Agent Report.

### Nə iş görür

- Design tokens, `ui-web` / `ui-native`, theme, style docs, app shell wiring
- Oxu sırası → responsive plan → icra → CURRENT-STATE → scoped filter → Report

### Nə etmir

- Auth/API/domain feature səhifələri
- Desktop-only layout (responsive olmadan)
- **Tam repo** `pnpm build`, **git**, **deploy** → Coordinator

### Necə işləyir

```text
CURRENT-STATE + scoped files
  → Responsive plan (xs → lg+)
  → UI/style (token-safe)
  → CURRENT-STATE delta
  → Scoped filter → Agent Report (Responsive) → Dayanır
```

### Nümunə əmr

`Agent Dizayner: AzesTable empty state-i token/theme-ə bağla`

---

## 4. Agent Worker

**Rule:** `.cursor/rules/apiMenecerAgent.mdc` (**maksimum protokol**)  
**Snapshot:** `docs/api/CURRENT-STATE.md`

### Dəmir qanun — packages API + i18n + anti-uydurma

Əvvəl `packages/` facade + generated model (read-only). Uydurma endpoint/DTO — qadağan;
yoxdursa STOP. Səhifə ilə birlikdə **en + az + ru**. Self-check → Agent Report + locale path.

### Nə iş görür

- `@azes/api`, Query, auth bridge, feature səhifələri (route, feature, UI compose + i18n)
- Oxu sırası → page-architecture → Query → i18n → scoped filter → Report

### Nə etmir

- Theme/token redesign (Dizayner)
- Paketdə olmayan API/model uydurmaq; `generated/**` əl edit
- Tərcüməsiz / yalnız-ingilis səhifə buraxmaq
- **Tam repo** build, **git**, **deploy** → Coordinator

### Necə işləyir

```text
CURRENT-STATE
  → packages: API ops + models (bu əmr)
  → Səhifə / Query / i18n en/az/ru
  → Scoped filter → Agent Report → Dayanır
```

### Nümunə əmr

`Agent Worker: admin-ə Organizations səhifəsini yaz`

---

## 5. Agent İcraçı

**Rule:** `.cursor/rules/icraciAgent.mdc`  
**Checkpoint:** `docs/ops/WORKER.md` §4b — Academy LMS  
**Sources (prioritet):** `docs/academy/roadmap/CLAUDE_DELTA.MD` + `docs/academy/chat/CHAT_DELTA.MD` → sonra `docs/academy/roadmap/CLAUDE.MD` + `docs/academy/chat/CHAT.MD`

### Nə iş görür

- Academy LMS mərhələlərini **DELTA prioritet** + baza CLAUDE/CHAT üzrə **icra** edir
- Hər session: `docs/ops/WORKER.md` §4b oxu → qaldığı yerdən **bir** step → checkpoint yenilə → STOP
- **Tam səlahiyyət:** Memar + Dizayner + Worker + Coordinator (plan, UI, API, full gates)
- Monorepo daxilində terminal — icazə **soruşmur**
- Git commit/push/deploy — yalnız siz açıq istəyəndə

### Nə etmir

- CLAUDE/CHAT/DELTA scope-undan kənar uydurma
- Mövcud shell/sidebar/header redesign (default qadağa)
- Checkpoint-i atlayıb bir neçə mərhələni səssiz keçmək
- M3 (kataloq) — Org/RBAC/Track foundation olmadan
- Monorepo **xaricində** path-ə icazəsiz toxunmaq

### Nümunə əmr

`Agent İcraçı: davam et`  
`Agent İcraçı: CLAUDE_DELTA üzrə növbəti Academy stepini icra et`

---

## Ümumi axın

```text
A) Klassik:
Memar → Worker/Dizayner promptları → icra → Coordinator batch

B) Academy LMS:
İcraçı → WORKER §4b → DELTA + CLAUDE/CHAT step → checkpoint → STOP
         (növbəti chatdə yenə İcraçı → davam)
```

| Kim         | Kod / fayl  | Scoped `--filter` | Full build / git / deploy            |
| ----------- | ----------- | ----------------- | ------------------------------------ |
| Memar       | **xeyr**    | xeyr              | xeyr                                 |
| Dizayner    | UI kodu     | **bəli** (paket)  | xeyr                                 |
| Worker      | səhifə      | **bəli** (app)    | xeyr                                 |
| Coordinator | adətən xeyr | lazım olsa        | **bəli**                             |
| İcraçı      | **bəli**    | **bəli**          | **bəli** (user istəyəndə git/deploy) |

Memar planı chatdə qalır; klassik icra Worker/Dizaynerdə; Academy LMS üçün birbaşa İcraçı;
git/deploy Coordinator və ya İcraçı (yalnız user istəyəndə).

---

## Agent Report (Dizayner / Worker bitəndə)

```markdown
## Agent Report

- Agent: Dizayner | Worker
- Task: …
- Status: DONE | BLOCKED | NEEDS_COORDINATOR
- Touched: …
- Docs updated: …
- Scoped gates run: (həqiqətən işlədilən filter əmrləri)
- Still needs Coordinator: full monorepo build | git | deploy | none
- Conflict risk: none | …
- Git/deploy: COORDINATOR ONLY — not run
```

Hər report-u Coordinator-a göndərməyin. Bir neçə tapşırıq bitəndə:
`Agent Coordinator: son dəyişiklikləri build və deploy et`.
