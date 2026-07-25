# ContextCommit

**Git stores what changed. ContextCommit stores the context that made it
change.**

AI Agents can finish a document, analysis, plan, spreadsheet, or presentation.
But the decisions and corrections that made the result useful often disappear
with the session.

ContextCommit turns that small, reusable part of the work into visible Markdown
and gives the relevant parts to the next Agent session.

```bash
npm install -g github:junghoonwoo-stack/context-commit
cd my-work
context-commit init
```

Open Codex or Claude Code and work normally. The first time the Agent asks about
project hooks, open `/hooks` and approve the exact project commands.

No separate LLM API, database, or model configuration is required.

## Why ContextCommit exists

Suppose an Agent writes a customer-care proposal. The first draft is technically
correct, but you add two important corrections:

- lead with the customer's installation anxiety, not smart features
- propose a 90-day field pilot before a full rollout

The final file contains the result, but it may not explain why those choices
were made. The chat contains the explanation, but the next Agent may not see
that chat. Saving the entire transcript creates noise and makes important
context harder to find.

ContextCommit saves the smaller unit that should survive:

- what meaningfully changed
- which facts, decisions, constraints, and user corrections changed the result
- how the result was validated
- when that context should be reused

Together, these form a **Prompt Commit**.

The memory is not hidden inside a service. It is plain Markdown that people and
Agents can read, edit, search, diff, move, or delete.

## A first try

Create or open a normal work folder:

```bash
mkdir customer-care-work
cd customer-care-work
context-commit init
```

Start Codex or Claude Code in that folder and ask:

```text
Create a one-page proposal for improving subscription-appliance onboarding.
```

While reviewing the draft, add:

```text
Do not lead with smart features. The real problem is the customer's anxiety
about installation and ongoing care. Recommend a 90-day pilot first.
```

The Agent works on the document and keeps only the outcome-changing context in
`.context-commit/SESSION.md`. When meaningful work finishes, the session becomes
a dated Prompt Commit under `context-memory/`.

In a later Agent session, ask only:

```text
Draft an email to field teams explaining the onboarding pilot.
```

ContextCommit prepares a small `.context-commit/CURRENT_CONTEXT.md` containing
the relevant prior decision. You do not have to repeat the installation-anxiety
or 90-day-pilot direction.

Hooks normally handle the lifecycle. Manual commands remain available:

```bash
context-commit start --goal "Improve subscription onboarding"
context-commit end --summary "Reframed onboarding around installation anxiety"
```

See [Lifecycle hooks](docs/HOOKS.md) for the optional manual and troubleshooting
details.

## What appears in the folder

```text
customer-care-work/
├── AGENTS.md
├── CLAUDE.md
├── proposal.md
├── context-memory/
│   ├── INDEX.md
│   └── 2026-07-25/
│       └── 10-42-18-reframed-onboarding-around-installation-anxiety.md
├── .context-commit/
│   ├── config.json
│   ├── CURRENT_CONTEXT.md
│   └── SESSION.md
├── .codex/
│   └── hooks.json
└── .claude/
    └── settings.json
```

- `AGENTS.md` and `CLAUDE.md` contain the visible, editable memory rules.
- `SESSION.md` is the working note for the current Agent session.
- `context-memory/` contains durable, dated Prompt Commits.
- `CURRENT_CONTEXT.md` is a compact, goal-relevant view prepared for the next
  session.

## The rules the Agent sees

`context-commit init` adds a managed Markdown block to both `AGENTS.md` and
`CLAUDE.md`. Existing content is preserved. The installed rule explicitly
applies to every Skill and workflow used in the folder.

A shortened example:

```markdown
## ContextCommit

These workspace-wide memory rules apply to every Skill and workflow.

### Start meaningful work

1. Read `.context-commit/CURRENT_CONTEXT.md` first.
2. Open a full Prompt Commit only when its details are needed.
3. Load its file diff only when exact evidence matters.

### During the session

Keep only outcome-changing context in `.context-commit/SESSION.md`:

- decisions and constraints
- current facts that materially changed the work
- meaningful user corrections
- validation results
- when the context will be useful again

Do not record raw conversations, credentials, or unnecessary personal data.

### Finish meaningful work

After validation, save a Prompt Commit. Do not create one for a trivial
exchange or work with no reusable outcome.
```

This is the harness. A team can inspect and adapt these rules directly instead
of depending on an opaque memory system. Because the rule is workspace-wide,
an email-writing Skill, a spreadsheet Skill, and a research Skill all use the
same memory lifecycle.

## What `SESSION.md` looks like

The Agent maintains a structured draft during the work:

```markdown
# Active ContextCommit Session

Goal: Improve subscription-appliance onboarding

## Summary

Reframed onboarding around installation anxiety and a 90-day pilot.

## Context That Mattered

- Customers need confidence that someone will manage installation and follow-up.

## Decisions

- Lead with continuity of care, not smart-feature adoption.
- Validate the operating model through a 90-day field pilot.

## Prompt Trajectory

- The user redirected the proposal from product features to customer anxiety.

## Validation

- Checked that the executive summary, pilot plan, and field message use the same
  value proposition.

## Reuse When

- Creating customer-care proposals or field communications.

## Metadata

Topics: customer-onboarding, subscription-care
Entities: 90-day onboarding pilot
Sensitivity: internal
Confidence: confirmed
Status: active
```

This is not a transcript. It is a small working memory of what changed the
outcome.

## What `CURRENT_CONTEXT.md` looks like

At the start of the next task, ContextCommit selects relevant Prompt Commits and
creates lightweight cards:

```markdown
# Current Context

Goal: Draft an email to field teams explaining the onboarding pilot

## Reframed onboarding around installation anxiety

- Source: `local:2026-07-25/10-42-18-reframed-onboarding.md`
- Metadata: topics: customer-onboarding, subscription-care ·
  confidence: confirmed · sensitivity: internal
- Reuse when: Creating customer-care proposals or field communications.
- Details: `context-commit show "local:2026-07-25/10-42-18-reframed-onboarding.md"`
- Artifact diff: `context-commit show "local:2026-07-25/10-42-18-reframed-onboarding.md" --section diff`

### Decisions

- Lead with continuity of care, not smart-feature adoption.
- Validate the operating model through a 90-day field pilot.
```

Only the compact card enters the active context first. The complete Prompt
Commit and exact file diff stay on disk and are opened only when needed:

```text
CURRENT_CONTEXT.md
    → context-commit show "<source>"
        → context-commit show "<source>" --section diff
```

This is **progressive disclosure**: save the durable record without loss, but
spend context-window space only on what the current task needs.

## A session pattern that compounds

ContextCommit follows the spirit of Andrej Karpathy's
[LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f):
use LLMs to build persistent, inspectable Markdown knowledge that becomes more
useful over time, instead of rediscovering the same knowledge from raw material
for every question.

ContextCommit is not a full wiki implementation. It applies the same pattern to
AI work sessions:

| LLM Wiki idea | ContextCommit |
| --- | --- |
| Raw sources and work | The files and materials in the work folder |
| Persistent Markdown knowledge | Dated Prompt Commits in `context-memory/` |
| Schema that guides the LLM | Visible rules in `AGENTS.md` and `CLAUDE.md` |
| Index before deeper reading | `INDEX.md` and the goal-specific `CURRENT_CONTEXT.md` |
| Knowledge improves through use | Each meaningful session adds a new, reusable delta |

The compaction approach also borrows from
[OpenClaw's distinction between memory and active context](https://docs.openclaw.ai/concepts/context)
and its
[pre-compaction memory flush](https://docs.openclaw.ai/concepts/memory):
write important state to durable files before a session disappears, keep the
original record inspectable, and load a compact working set into the model.

In practice:

1. `SESSION.md` collects the useful delta while the work is fresh.
2. A Prompt Commit preserves that delta as durable Markdown.
3. `CURRENT_CONTEXT.md` compiles only relevant summaries and decisions for the
   new goal.
4. Full details and diffs are progressively disclosed.
5. Newer Prompt Commits can correct or supersede older context without deleting
   the history.

The result grows like a work wiki, while the active context stays small.

## It works for office work, not only code

ContextCommit works wherever an Agent produces or changes meaningful work in a
folder:

- strategy documents and executive briefs
- meeting decisions and follow-up actions
- customer research, interview synthesis, and proposals
- budgets, spreadsheet assumptions, and recurring analyses
- policies, operating procedures, and compliance reviews
- presentations and narrative revisions
- project plans, handoffs, and status reports
- recruiting, onboarding, and internal communications
- competitive research and due diligence

The work product can change from one session to the next. The reusable unit is
the context that made the work correct.

## Share memory with a team

Point ContextCommit to one network or synchronized folder:

```powershell
context-commit init --shared "Z:\Company Context"
```

```bash
context-commit init --shared "/Volumes/Company Context"
```

The path can be a network drive, synchronized SharePoint folder, or checked-out
private Git directory. ContextCommit saves locally first and then copies the
Prompt Commit to the shared folder. Other users pointing to the same location
can retrieve the relevant team context.

Add team and member names only when needed:

```bash
context-commit init --shared "/path/to/context" \
  --team "customer-care" --member "alex"
```

See [Organization memory](docs/ORGANIZATION_MEMORY.md) for access control,
folder layout, and synchronization notes.

## Privacy and license

ContextCommit does not upload data or call an LLM. Automated redaction is not a
complete security boundary, so review Markdown before sharing it.

ContextCommit is licensed under [Apache 2.0](LICENSE). Individuals and companies
may use, modify, and distribute it, including internally and commercially.
Required license and notices must remain when redistributing. Prompt Commits and
company memory created with ContextCommit do not have to be published.

More details:
[Prompt Commit format](docs/PROMPT_COMMIT_FORMAT.md) ·
[Lifecycle hooks](docs/HOOKS.md) ·
[Organization memory](docs/ORGANIZATION_MEMORY.md)

---

## 왜 ContextCommit인가

**Git이 무엇이 바뀌었는지를 저장한다면, ContextCommit은 왜 그렇게
바뀌었는지를 저장합니다.**

AI Agent는 문서, 분석, 기획안, 스프레드시트, 프레젠테이션을 완성할 수
있습니다. 하지만 그 결과를 유용하게 만든 판단과 사용자 교정은 세션이
끝나면 사라지기 쉽습니다.

ContextCommit은 다음 업무에도 필요한 부분만 눈에 보이는 Markdown으로
남기고, 다음 Agent 세션에 관련된 내용만 전달합니다.

```bash
npm install -g github:junghoonwoo-stack/context-commit
cd my-work
context-commit init
```

Codex 또는 Claude Code를 열고 평소처럼 일하면 됩니다. 처음 프로젝트
Hook 승인이 필요할 때 `/hooks`를 열어 정확한 명령을 한 번 확인하고
승인합니다.

별도의 LLM API, 데이터베이스, 모델 설정은 필요하지 않습니다.

## 왜 만들었는가

Agent에게 고객 케어 제안서를 작성시켰다고 가정해 보겠습니다. 첫 초안을
본 뒤 사용자가 두 가지 중요한 교정을 합니다.

- 스마트 기능보다 고객의 설치 불안을 먼저 다룰 것
- 전면 도입 전에 90일 현장 파일럿을 제안할 것

최종 문서에는 결과가 있지만 왜 그런 선택을 했는지는 남지 않을 수
있습니다. 대화에는 이유가 있지만 다음 Agent가 그 대화를 본다는 보장은
없습니다. 전체 대화를 모두 저장하면 잡음이 커져 정작 중요한 맥락을
찾기 어려워집니다.

ContextCommit은 다음 세션까지 살아남아야 할 작은 단위만 저장합니다.

- 의미 있게 바뀐 결과
- 결과를 바꾼 사실, 결정, 제약조건, 사용자 교정
- 검증 방법
- 미래에 다시 활용할 조건

이 한 단위를 **Prompt Commit**이라고 합니다.

Memory는 보이지 않는 서비스 안에 갇히지 않습니다. 사람과 Agent가 직접
읽고, 고치고, 검색하고, 비교하고, 옮기고, 지울 수 있는 Markdown입니다.

## 처음 사용해 보기

일반 업무 폴더를 만들거나 기존 폴더를 엽니다.

```bash
mkdir customer-care-work
cd customer-care-work
context-commit init
```

해당 폴더에서 Codex 또는 Claude Code를 시작하고 요청합니다.

```text
구독 가전 온보딩을 개선하는 1페이지 제안서를 작성해줘.
```

초안을 검토하며 다음과 같이 교정합니다.

```text
스마트 기능을 앞세우지 마. 실제 문제는 설치와 지속적인 관리에 대한
고객의 불안이야. 먼저 90일 파일럿을 제안해줘.
```

Agent는 문서를 작성하면서 결과를 바꾼 맥락만
`.context-commit/SESSION.md`에 유지합니다. 의미 있는 작업이 끝나면
세션은 `context-memory/` 아래 날짜별 Prompt Commit으로 저장됩니다.

새로운 Agent 세션에서는 다음과 같이만 요청합니다.

```text
온보딩 파일럿을 현장 조직에 설명하는 이메일을 작성해줘.
```

ContextCommit은 이전 결정을 담은 작은
`.context-commit/CURRENT_CONTEXT.md`를 준비합니다. 사용자는 설치 불안과
90일 파일럿 방향을 다시 설명하지 않아도 됩니다.

Hook이 일반적인 시작과 종료를 처리합니다. 필요하면 직접 실행할 수도
있습니다.

```bash
context-commit start --goal "구독 온보딩 개선"
context-commit end --summary "설치 불안 중심으로 온보딩 방향 전환"
```

Hook의 수동 사용과 문제 해결은 [Lifecycle hooks](docs/HOOKS.md)에서
확인할 수 있습니다.

## 생성되는 폴더와 파일

```text
customer-care-work/
├── AGENTS.md
├── CLAUDE.md
├── proposal.md
├── context-memory/
│   ├── INDEX.md
│   └── 2026-07-25/
│       └── 10-42-18-설치-불안-중심으로-온보딩-방향-전환.md
├── .context-commit/
│   ├── config.json
│   ├── CURRENT_CONTEXT.md
│   └── SESSION.md
├── .codex/
│   └── hooks.json
└── .claude/
    └── settings.json
```

- `AGENTS.md`, `CLAUDE.md`: 사람이 직접 확인하고 수정할 수 있는 규칙
- `SESSION.md`: 현재 Agent 세션의 작업 Memory
- `context-memory/`: 날짜별로 누적되는 Prompt Commit
- `CURRENT_CONTEXT.md`: 다음 업무 목표에 맞게 작게 취합한 현재 Context

## `AGENTS.md`와 `CLAUDE.md`에 들어가는 규칙

`context-commit init`은 두 파일에 관리 가능한 Markdown 블록을
추가합니다. 기존 내용은 보존되며, 이 규칙은 해당 폴더에서 사용하는 모든
Skill과 업무 흐름에 공통으로 적용됩니다.

축약된 예시는 다음과 같습니다.

```markdown
## ContextCommit

이 Workspace의 Memory 규칙은 모든 Skill과 업무에 적용한다.

### 의미 있는 작업 시작

1. 먼저 `.context-commit/CURRENT_CONTEXT.md`만 읽는다.
2. 세부 내용이 필요할 때만 전체 Prompt Commit을 연다.
3. 정확한 근거가 필요할 때만 파일 Diff를 읽는다.

### 세션 진행 중

결과를 바꾸는 내용만 `.context-commit/SESSION.md`에 유지한다.

- 결정과 제약조건
- 결과에 영향을 준 최신 사실
- 의미 있는 사용자 교정
- 검증 결과
- 미래에 다시 활용할 조건

전체 대화, 인증정보, 불필요한 개인정보는 기록하지 않는다.

### 의미 있는 작업 종료

검증 후 Prompt Commit을 저장한다. 단순 질의나 재사용할 결과가 없는
작업은 저장하지 않는다.
```

이 규칙 자체가 ContextCommit의 Harness입니다. 보이지 않는 Memory
시스템에 의존하지 않고 조직이 직접 읽고 고칠 수 있습니다. Workspace
전체에 적용되므로 이메일 작성 Skill, 스프레드시트 Skill, 리서치 Skill이
모두 같은 Memory 흐름을 따릅니다.

## `SESSION.md` 사례

Agent는 작업 중 구조화된 초안을 유지합니다.

```markdown
# Active ContextCommit Session

Goal: 구독 가전 온보딩 개선

## Summary

설치 불안과 90일 파일럿을 중심으로 온보딩 방향을 전환함.

## Context That Mattered

- 고객은 설치부터 사후관리까지 누군가 책임진다는 확신이 필요함.

## Decisions

- 스마트 기능 이용보다 관리의 연속성을 핵심 가치로 제안함.
- 전면 도입 전에 90일 현장 파일럿으로 운영 모델을 검증함.

## Prompt Trajectory

- 사용자가 제품 기능 중심 초안을 고객 불안 중심으로 교정함.

## Validation

- 임원 요약, 파일럿 계획, 현장 메시지의 가치 제안이 일치하는지 확인함.

## Reuse When

- 고객 케어 제안서 또는 현장 커뮤니케이션을 작성할 때.

## Metadata

Topics: customer-onboarding, subscription-care
Entities: 90-day onboarding pilot
Sensitivity: internal
Confidence: confirmed
Status: active
```

이는 녹취록이나 전체 대화 요약이 아닙니다. 결과를 바꾼 것만 남기는 작은
작업 Memory입니다.

## `CURRENT_CONTEXT.md` 사례

다음 업무가 시작되면 ContextCommit은 관련 Prompt Commit을 찾아 작은
카드로 취합합니다.

```markdown
# Current Context

Goal: 온보딩 파일럿을 현장 조직에 설명하는 이메일 작성

## 설치 불안 중심으로 온보딩 방향 전환

- Source: `local:2026-07-25/10-42-18-온보딩-방향-전환.md`
- Metadata: topics: customer-onboarding, subscription-care ·
  confidence: confirmed · sensitivity: internal
- Reuse when: 고객 케어 제안서 또는 현장 커뮤니케이션을 작성할 때
- Details: `context-commit show "local:2026-07-25/10-42-18-온보딩-방향-전환.md"`
- Artifact diff: `context-commit show "local:2026-07-25/10-42-18-온보딩-방향-전환.md" --section diff`

### Decisions

- 스마트 기능 이용보다 관리의 연속성을 핵심 가치로 제안함.
- 전면 도입 전에 90일 현장 파일럿으로 운영 모델을 검증함.
```

처음에는 이 작은 카드만 Agent의 활성 Context에 들어갑니다. 전체 Prompt
Commit과 실제 파일 Diff는 디스크에 보존되며 필요할 때만 엽니다.

```text
CURRENT_CONTEXT.md
    → context-commit show "<source>"
        → context-commit show "<source>" --section diff
```

즉, 원본 기록은 손실 없이 남기되 현재 업무에 필요한 만큼만 Context
Window를 사용하는 **Progressive Disclosure** 방식입니다.

## 세션이 쌓여 지식이 되는 패턴

ContextCommit은 Andrej Karpathy의
[LLM Wiki 패턴](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)이
제시한 정신을 따릅니다. 매 질문마다 원본 자료에서 지식을 다시
찾아 조립하는 대신, LLM이 지속적이고 검토 가능한 Markdown 지식을
만들어 시간이 갈수록 더 유용해지게 하는 방식입니다.

ContextCommit은 완전한 Wiki 구현체는 아닙니다. 같은 원칙을 AI 업무
세션에 적용합니다.

| LLM Wiki의 개념 | ContextCommit |
| --- | --- |
| 원본 자료와 실제 작업 | 업무 폴더의 파일과 자료 |
| 지속적으로 쌓이는 Markdown 지식 | `context-memory/`의 날짜별 Prompt Commit |
| LLM을 안내하는 Schema | `AGENTS.md`, `CLAUDE.md`의 가시적 규칙 |
| Index를 먼저 읽고 필요한 문서로 이동 | `INDEX.md`, 목표별 `CURRENT_CONTEXT.md` |
| 사용할수록 지식이 개선됨 | 의미 있는 세션마다 새로운 Delta가 추가됨 |

Context를 효율적으로 취합하는 방식은
[OpenClaw가 Memory와 활성 Context를 구분하는 구조](https://docs.openclaw.ai/concepts/context)와
[Compaction 전에 중요한 내용을 Memory 파일에 쓰는 방식](https://docs.openclaw.ai/concepts/memory)도
참고합니다. 세션이 사라지기 전에 중요한 상태를 지속 가능한 파일에
기록하고, 원본은 사람이 검토할 수 있게 보존하며, 모델에는 작게 취합된
현재 작업 Context만 제공합니다.

실제 흐름은 다음과 같습니다.

1. `SESSION.md`가 업무 중 새롭게 생긴 Delta를 모음
2. Prompt Commit이 이를 지속 가능한 Markdown으로 보존
3. `CURRENT_CONTEXT.md`가 새 목표에 맞는 요약과 결정만 취합
4. 세부 내용과 Diff는 필요한 경우에만 단계적으로 공개
5. 새로운 Prompt Commit이 과거 Context를 교정하거나 대체하더라도 이력은
   삭제하지 않음

따라서 지식은 업무 Wiki처럼 계속 쌓이지만 활성 Context는 작게 유지됩니다.

## 코딩이 아닌 모든 사무 업무에 적용

Agent가 폴더 안에서 의미 있는 결과를 만들거나 수정하는 업무라면 적용할
수 있습니다.

- 전략 문서와 임원 보고
- 회의 결정사항과 후속 조치
- 고객 조사, 인터뷰 분석, 제안서
- 예산, 스프레드시트 가정, 반복 분석
- 정책, 업무 절차, 컴플라이언스 검토
- 프레젠테이션과 스토리라인 수정
- 프로젝트 계획, 인수인계, 현황 보고
- 채용, 온보딩, 사내 커뮤니케이션
- 경쟁사 분석과 Due Diligence

매번 만드는 산출물은 달라도 됩니다. 다음 업무에 재사용되는 것은 그
산출물을 정확하게 만든 Context입니다.

## 조직이 함께 사용하기

네트워크 또는 동기화 폴더 경로 하나만 지정합니다.

```powershell
context-commit init --shared "Z:\Company Context"
```

```bash
context-commit init --shared "/Volumes/Company Context"
```

네트워크 드라이브, 동기화된 SharePoint 폴더, 체크아웃한 Private Git
디렉터리를 사용할 수 있습니다. ContextCommit은 개인 폴더에 먼저 저장한
뒤 공유 폴더에 Prompt Commit을 복사합니다. 같은 위치를 지정한 다른
사용자는 관련된 조직 Context를 다음 세션에서 불러올 수 있습니다.

필요한 경우에만 팀과 구성원 이름을 추가합니다.

```bash
context-commit init --shared "/path/to/context" \
  --team "customer-care" --member "junghoon"
```

권한, 폴더 구조, 동기화 방식은
[Organization memory](docs/ORGANIZATION_MEMORY.md)에서 확인할 수
있습니다.

## 개인정보와 라이선스

ContextCommit은 데이터를 업로드하거나 LLM을 호출하지 않습니다. 자동
비밀정보 제거는 완전한 보안 장치가 아니므로 공유 전 Markdown을
확인해야 합니다.

[Apache 2.0](LICENSE) 라이선스로 제공됩니다. 개인과 기업 모두 내부 및
상업적 사용, 수정, 재배포가 가능합니다. 재배포 시 필요한 라이선스와
고지를 유지해야 합니다. ContextCommit으로 만든 Prompt Commit이나 회사
Memory를 공개할 의무는 없습니다.

더 보기:
[Prompt Commit format](docs/PROMPT_COMMIT_FORMAT.md) ·
[Lifecycle hooks](docs/HOOKS.md) ·
[Organization memory](docs/ORGANIZATION_MEMORY.md)
