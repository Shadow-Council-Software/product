# Sprint 1 tracking — ENTERPRISE runtime foundation

Maps OpenSpec tasks to GitHub issues for token-cost auditing.

| Task ID | Issue | Project item | Status | Story pts | Token est / actual | PR |
|---------|-------|--------------|--------|-----------|-------------------|-----|
| Epic | [#1](https://github.com/Shadow-Council-Software/product/issues/1) | _pending project scope_ | In Progress | — | — / — | — |
| 1.1 | [#2](https://github.com/Shadow-Council-Software/product/issues/2) | _pending_ | Closed | 1 | — / — | — |
| 1.2 | [#3](https://github.com/Shadow-Council-Software/product/issues/3) | _pending_ | Closed | 1 | — / — | — |
| 1.3 | [#4](https://github.com/Shadow-Council-Software/product/issues/4) | _pending_ | Closed | 1 | — / — | — |
| 1.4 | [#5](https://github.com/Shadow-Council-Software/product/issues/5) | _pending_ | Closed | 1 | — / — | — |
| 1.5 | [#6](https://github.com/Shadow-Council-Software/product/issues/6) | _pending_ | Closed | 1 | — / — | — |
| 2.1 | [#7](https://github.com/Shadow-Council-Software/product/issues/7) | _pending_ | Closed | 1 | — / — | — |
| 2.2 | [#8](https://github.com/Shadow-Council-Software/product/issues/8) | _pending_ | Closed | 1 | — / — | — |
| 2.3 | [#9](https://github.com/Shadow-Council-Software/product/issues/9) | _pending_ | Closed | 1 | — / — | — |
| 3.1 | [#10](https://github.com/Shadow-Council-Software/product/issues/10) | _pending_ | Closed | 1 | — / — | — |
| 3.2 | [#11](https://github.com/Shadow-Council-Software/product/issues/11) | _pending_ | Closed | 1 | — / — | — |
| 3.3 | [#12](https://github.com/Shadow-Council-Software/product/issues/12) | _pending_ | Closed | 1 | — / — | — |
| 3.4 | [#13](https://github.com/Shadow-Council-Software/product/issues/13) | _pending_ | Closed | 1 | — / — | — |
| 3.5 | [#14](https://github.com/Shadow-Council-Software/product/issues/14) | _pending_ | Closed | 1 | — / — | — |
| 3.6 | [#15](https://github.com/Shadow-Council-Software/product/issues/15) | _pending_ | Closed | 1 | — / — | — |
| 4.1 | [#16](https://github.com/Shadow-Council-Software/product/issues/16) | _pending_ | Closed | 1 | — / — | — |
| 4.2 | [#17](https://github.com/Shadow-Council-Software/product/issues/17) | _pending_ | Closed | 1 | — / — | — |
| 4.3 | [#18](https://github.com/Shadow-Council-Software/product/issues/18) | _pending_ | Closed | 1 | — / — | — |
| 4.4 | [#19](https://github.com/Shadow-Council-Software/product/issues/19) | _pending_ | Closed | 1 | — / — | — |
| 4.5 | [#20](https://github.com/Shadow-Council-Software/product/issues/20) | _pending_ | Closed | 1 | — / — | — |
| 5.1 | [#21](https://github.com/Shadow-Council-Software/product/issues/21) | _pending_ | Closed | 1 | — / — | — |
| 5.2 | [#22](https://github.com/Shadow-Council-Software/product/issues/22) | _pending_ | Closed | 1 | — / — | — |
| 5.3 | [#23](https://github.com/Shadow-Council-Software/product/issues/23) | _pending_ | Closed | 1 | — / — | — |
| 5.4 | [#24](https://github.com/Shadow-Council-Software/product/issues/24) | _pending_ | Closed | 1 | — / — | — |
| 5.5 | [#25](https://github.com/Shadow-Council-Software/product/issues/25) | _pending_ | Closed | 1 | — / — | — |
| 6.1 | [#26](https://github.com/Shadow-Council-Software/product/issues/26) | _pending_ | Closed | 1 | — / — | — |
| 6.2 | [#27](https://github.com/Shadow-Council-Software/product/issues/27) | _pending_ | Open | 1 | — / — | — |

**Story point total (tasks 1.1–6.2):** 26  
**Milestone:** [Sprint 1 — Runtime Foundation](https://github.com/Shadow-Council-Software/product/milestone/1)  
**Epic:** [#1](https://github.com/Shadow-Council-Software/product/issues/1)

## GitHub Project

Run after granting `project` scope:

```bash
gh auth refresh -s project,read:project
bash .github/scripts/setup-sprint-1-project.sh
```

Project name: **ENTERPRISE Sprint 1 — Runtime Foundation**

## Files touched (sprint 1)

- `enterprise/runtime/` — monorepo root
- `enterprise/runtime/engine/` — Fastify engine + contract tests
- `enterprise/runtime/lcars-web/` — LCARS sprint 1 UI
- `enterprise/runtime/packages/` — shared types
- `.github/ISSUE_TEMPLATE/` — sprint task form
- `.github/workflows/sprint-1-validate.yml` — CI gate
