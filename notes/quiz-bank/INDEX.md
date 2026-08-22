# 문제은행 홈

- [[00-plan|생산 계획]] — 규모·난이도 정의·치환 규칙·유일성 관리
- [[writing-guidelines|문제 작성 가이드라인]] — 윤문 기준 (원본: `docs/writing-guidelines.md`)
- [[pool-02-과학]] — 소재 아이디어 뱅크 (의무 아님, 배정 표시 불필요 — 유일성은 세트 전수 스캔으로 관리)

## 세트

| 세트 | 상태 |
|---|---|
| [[set-001]] | 확정 (품질 기준선) |
| [[set-002]] | 윤문대기 (Claude) |
| [[set-003]] | 윤문대기 (Claude) |
| [[set-004]] | 윤문대기 (Claude) |
| [[set-005]] | 윤문대기 (Claude) |
| [[set-006]] | 윤문대기 (Claude) |
| [[set-007]] | 윤문대기 (Claude) |
| [[set-008]] | 윤문대기 (Claude) |
| [[set-009]] | 윤문대기 (Claude) |
| [[set-010]] | 윤문대기 (Claude) |
| [[set-011]] | 윤문대기 (Claude) |
| [[set-012]] | 윤문대기 (Claude) |
| [[set-013]] | 윤문대기 (Claude) |
| [[set-014]] | 윤문대기 (Claude) |
| [[set-015]] | 윤문대기 (Claude) |
| [[set-016]] | 윤문대기 (Claude) |
| [[set-017]] | 윤문대기 (Claude) |
| [[set-018]] | 윤문대기 (Claude) |
| [[set-019]] | 윤문대기 (Claude) |
| [[set-020]] | 윤문대기 (Claude) |
| [[set-021]] | 윤문대기 (Claude) |
| [[set-022]] | 윤문대기 (Claude) |
| [[set-023]] | 윤문대기 (Claude) |
| [[set-024]] | 윤문대기 (Claude) |
| [[set-025]] | 윤문대기 (Claude) |
| [[set-026]] | 윤문대기 (Claude) |
| [[set-027]] | 윤문대기 (Claude) |
| [[set-028]] | 윤문대기 (Claude) |
| [[set-029]] | 윤문대기 (Claude) |
| [[set-030]] | 윤문대기 (Claude) |
| [[set-031]] | 윤문대기 (Claude) |
| [[set-032]] | 윤문대기 (Claude) |
| [[set-033]] | 윤문대기 (Claude) |
| [[set-034]] | 윤문대기 (Claude) |
| [[set-035]] | 윤문대기 (Claude) |
| [[set-036]] | 윤문대기 (Claude) |
| [[set-037]] | 윤문대기 (Claude) |
| [[set-038]] | 윤문대기 (Claude) |
| [[set-039]] | 윤문대기 (Claude) |
| [[set-040]] | 윤문대기 (Claude) |
| [[set-041]] | 윤문대기 (Claude) |
| [[set-042]] | 윤문대기 (Claude) |
| [[set-043]] | 윤문대기 (Claude) |
| [[set-044]] | 윤문대기 (Claude) |
| [[set-045]] | 윤문대기 (Claude) |
| [[set-046]] | 윤문대기 (Claude) |
| [[set-047]] | 윤문대기 (Claude) |
| [[set-048]] | 윤문대기 (Claude) |
| [[set-049]] | 윤문대기 (Claude) |
| [[set-050]] | 윤문대기 (Claude) |
| [[set-051]] | 윤문대기 (Claude) |
| [[set-052]] | 윤문대기 (Claude) |
| [[set-053]] | 윤문대기 (Claude) |
| [[set-054]] | 윤문대기 (Claude) |
| [[set-055]] | 윤문대기 (Claude) |
| [[set-056]] | 윤문대기 (Claude) |
| [[set-057]] | 윤문대기 (Claude) |
| [[set-058]] | 윤문대기 (Claude) |
| [[set-059]] | 윤문대기 (Claude) |
| [[set-060]] | 윤문대기 (Claude) |
| [[set-061]] | 윤문대기 (Claude) |
| [[set-062]] | 윤문대기 (Claude) |
| [[set-501]] | 윤문대기 (Codex) |
| [[set-502]] | 윤문대기 (Codex) |

## 윤문 워크플로

1. 세트 파일을 열어 문제를 직접 고친다. **번호와 `- A:` 줄 구조는 유지** (DB 임포트 스크립트가 파싱).
2. 끝나면 프런트매터 `status`를 `윤문완료`로 바꾼다.
3. 상태별 세트 목록은 Dataview 플러그인 설치 시 아래 쿼리로 자동 집계 가능:

```
TABLE status, 기본, 관심, 마이너
FROM "quiz-bank"
WHERE set
SORT set
```
