# Commentator coverage audit — 17 September 2026

## Decision

The active app requires commentary on at least 98 of its 196 study entries (50%). Exactly 98 qualifies. Shiva Shakti remains the AI editorial guide; Vyāsa and Vivekananda remain the historical commentators.

| Perspective | Sutras with material | Coverage | Chapter I / II / III / IV | Decision |
|---|---:|---:|---|---|
| Shiva Shakti | 196/196 | 100.0% | 51 / 55 / 56 / 34 | Keep |
| Vyāsa | 196/196 | 100.0% | 51 / 55 / 56 / 34 | Keep |
| Vivekananda | 174/196 | 88.8% | 44 / 52 / 47 / 31 | Keep |
| Sidersky | 9/196 | 4.6% | 2 / 2 / 4 / 1 | Remove from active app |
| Taimni | 26/196 | 13.3% | 6 / 14 / 4 / 2 | Remove from active app |
| Satchidananda | 20/196 | 10.2% | 7 / 11 / 2 / 0 | Remove from active app |
| B. K. S. Iyengar | 11/196 | 5.6% | 7 / 3 / 0 / 1 | Remove from active app |
| Edwin Bryant | 22/196 | 11.2% | 12 / 2 / 8 / 0 | Remove from active app |

## Method and limits

Count each study sutra once when nonblank commentary or an attributed summary is stored. Multiple translations/notes do not multiply coverage. Translation-only entries, bibliography, placeholders and empty objects do not count. Thematic notes count generously as available material; even this upper bound is below 50% for every removed author.

- The audit checked all 196 unique study references and all 1,372 stored author/sutra layers. It counted actual text, not status labels, which can predate later research additions.
- Vyāsa: 196 study entries have Rāma Prasāda material; 195 also retain Jha OCR. These are alternative translations, not 391 separate sutras. Study 3.20 and 3.22 are explicitly mapped to prose within neighbouring original entries.
- Vivekananda: 174 separate prose comments qualify. The other 22 study entries include 21 translation-only entries and one passage treated in an editorial footnote; translations alone do not qualify.
- Historical transcription/OCR caveats remain visible. Coverage measures presence, not scholarly accuracy or completeness of every author’s published work.
- Archived research and the original foundation are preserved. The five excluded authors are removed from active avatars, chat recommendations, available-persona controls and the active source list. Requests for an excluded author receive a clear availability message.
- The rule is calculated from stored content, so an author must reach the threshold before appearing in the commentator circle.

## Entry-level audit

The accompanying Commentator-Coverage-Audit.json lists every covered and missing study reference for each author.

## Integrity checks

All 196 Sanskrit/IAST texts and In brief explanations are present. Chapter counts remain 51 / 55 / 56 / 34. Source numbering and the complete collected corpus remain unchanged.

Coverage, content presence, duplicate counting, navigation and attribution checks; not a fresh critical collation or independent verification of every interpretation.

## App validation

Automated checks passed for all 196 sutra pages, 588 active perspective panels, and 980 excluded-author panel attempts. The 97/98-sutra boundary, duplicate-note counting, excluded-author chat responses, active-author chat, source-number mapping and browser-tool persona restrictions passed. The collected corpus is byte-identical to the pre-audit version.
