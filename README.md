# ContextCommit

**Visible, editable memory for AI Agents.**

```bash
npm install -g github:junghoonwoo-stack/context-commit
cd my-project
context-commit init
```

Open Codex or Claude Code, run `/hooks` once, and work normally.

[English](#english) · [한국어](#한국어)

---

## English

ContextCommit saves the useful context from one AI work session and gives the
relevant parts to the next session.

- Plain Markdown; no API key, database, or extra LLM call
- Visible rules in `AGENTS.md` and `CLAUDE.md`, applied to every Skill
- Automatic start, context loading, and save through project hooks

### Start

```bash
npm install -g github:junghoonwoo-stack/context-commit
cd my-project
context-commit init
```

Run `/hooks` once to review and trust the hooks. That is all.

```text
context-memory/                         saved Prompt Commits
.context-commit/CURRENT_CONTEXT.md     relevant context
.context-commit/SESSION.md             current session
AGENTS.md                              visible, editable rules
```

### Use more only when needed

```bash
context-commit status
context-commit show "<source>"                  # details
context-commit show "<source>" --section diff   # exact changes
```

Context is loaded progressively:

```text
summary → details → file diff
```

Hooks are automatic. Manual control is also available:

```bash
context-commit start --goal "Improve onboarding"
context-commit note --type decision "Focus on setup anxiety"
context-commit end --summary "Reframed the proposal"
```

### Share with a team

Point to one network or synchronized folder:

```powershell
context-commit init --shared "Z:\Company Context"
```

```bash
context-commit init --shared "/Volumes/Company Context"
```

It can be a network drive, synchronized SharePoint folder, or Git working
directory. ContextCommit saves locally first, then copies to the shared folder.

Add `--team` and `--member` only when you need separation:

```bash
context-commit init --shared "/path/to/context" \
  --team "customer-care" --member "alex"
```

More: [Prompt Commit format](docs/PROMPT_COMMIT_FORMAT.md) ·
[hooks](docs/HOOKS.md) ·
[organization memory](docs/ORGANIZATION_MEMORY.md)

### Privacy and license

ContextCommit does not upload data or call an LLM. Review Markdown before
sharing; automated redaction is not a complete security boundary.

Licensed under [Apache 2.0](LICENSE). Individuals and companies may use, modify,
and distribute it, including internally and commercially. Required license and
notices must remain when redistributing. Your Prompt Commits and company memory
do not have to be published.

---

## 한국어

ContextCommit은 AI와 일하며 생긴 중요한 맥락을 저장하고, 다음 작업에
필요한 부분만 다시 전달합니다.

- API Key, 데이터베이스, 추가 LLM 호출 없이 Markdown으로 저장
- 모든 Skill에 적용되는 규칙을 `AGENTS.md`와 `CLAUDE.md`에서 직접 확인
- 프로젝트 Hook으로 시작, Context 불러오기, 저장을 자동 처리

### 시작

```bash
npm install -g github:junghoonwoo-stack/context-commit
cd my-project
context-commit init
```

Codex 또는 Claude Code에서 `/hooks`를 한 번 실행해 Hook을 확인하고
신뢰하면 끝입니다. 이후에는 평소처럼 Agent와 일하면 됩니다.

```text
context-memory/                         저장된 Prompt Commit
.context-commit/CURRENT_CONTEXT.md     필요한 과거 Context
.context-commit/SESSION.md             현재 작업 내용
AGENTS.md                              직접 보고 고치는 규칙
```

### 필요할 때만 더 보기

```bash
context-commit status
context-commit show "<source>"                  # 상세 내용
context-commit show "<source>" --section diff   # 실제 변경
```

Context는 필요한 만큼만 단계적으로 불러옵니다.

```text
요약 → 상세 내용 → 파일 Diff
```

Hook이 자동 처리하지만 직접 시작하고 종료할 수도 있습니다.

```bash
context-commit start --goal "고객 온보딩 개선"
context-commit note --type decision "설치 불안을 중심으로 작성"
context-commit end --summary "제안서 방향 수정"
```

### 회사에서 함께 쓰기

공용 폴더 경로 하나만 지정합니다.

```powershell
context-commit init --shared "Z:\Company Context"
```

```bash
context-commit init --shared "/Volumes/Company Context"
```

네트워크 드라이브, 동기화된 SharePoint 폴더, Git 작업 폴더를 사용할 수
있습니다. 개인 폴더에 먼저 저장한 뒤 공용 폴더로 복사합니다.

팀을 나눌 때만 옵션을 추가합니다.

```bash
context-commit init --shared "/path/to/context" \
  --team "customer-care" --member "junghoon"
```

더 보기: [Prompt Commit 형식](docs/PROMPT_COMMIT_FORMAT.md) ·
[Hook](docs/HOOKS.md) ·
[조직 Memory](docs/ORGANIZATION_MEMORY.md)

### 개인정보·라이선스

ContextCommit은 데이터를 업로드하거나 LLM을 호출하지 않습니다. 자동
비밀정보 제거는 완전한 보안 장치가 아니므로 공유 전 Markdown을 확인해야
합니다.

[Apache 2.0](LICENSE) 라이선스로 제공됩니다. 개인과 기업 모두 내부 및
상업적 사용, 수정, 재배포가 가능합니다. 재배포 시 필요한 라이선스와
고지를 유지해야 합니다. 사용자가 만든 Prompt Commit이나 회사 Memory를
공개할 의무는 없습니다.
