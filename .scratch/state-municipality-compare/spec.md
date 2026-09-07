# Spec: State-level Municipality Comparison via Calculations Modal

Status: ready-for-agent

## Problem Statement

A user analyzing municipal finance data can only build calculations against parcels within a single
municipality's map. They cannot compare financial data *across* municipalities — for example, ranking
all municipalities in a state by debt per capita or revenue per square mile — even though the
state-level map already shows every municipal boundary. Building these comparisons manually is
tedious or impossible.

## Solution

When a state is selected in a Map Frame and its municipal boundaries are displayed, a **Compare**
button opens the existing Calculations Modal. The user builds a Calculation from **Municipal
Finances** and **Municipality** data points, choosing a Year Mode (latest per municipality, or the
latest shared year). On apply, the backend evaluates the calculation for every municipality in the
state and returns a Compare Result (one value per municipality). The map re-renders the municipal
boundaries as a choropleth colored by value, with per-municipality tooltips; municipalities with no
finance data are left unstyled with a "No data" tooltip. A Clear button (or applying an empty
calculation) restores the base map.

## User Stories

1. As a municipal finance analyst, I want a Compare button on a state-level Map Frame, so that I can start a cross-municipality comparison from the map I'm already looking at.
2. As an analyst, I want the Compare button to appear only when a state is selected and municipal boundaries are showing, so that the toolbar is not cluttered at the US level.
3. As an analyst, I want to open the same Calculations Modal used for parcel analysis, so that I don't have to learn a new interaction pattern.
4. As an analyst, I want to use municipal finance fields (assets, debt, revenues, taxes, employees, and so on) in a Calculation, so that I can compare fiscal characteristics across municipalities.
5. As an analyst, I want to use municipality boundary properties (population by census year, area in square miles) in a Calculation, so that I can compute normalized metrics like debt per capita.
6. As an analyst, I want arithmetic operators and parentheses in calculations, so that I can build expressions such as `(debt / population)`.
7. As an analyst, I want the map's municipal boundaries recolored as a choropleth by the calculated value, so that geographic patterns in the data become visible.
8. As an analyst, I want the color scale computed from quantiles of the actual returned values, so that colors stay meaningful when some municipalities are omitted.
9. As an analyst, I want a tooltip on each colored municipality showing its calculated value, so that I can read exact numbers.
10. As an analyst, I want municipalities without a finance record to keep the default boundary style with a "No data" tooltip, so that absence of data is never misread as a low value.
11. As an analyst, I want to choose between "latest per municipality" and "latest shared year" Year Modes, so that I can trade coverage for strict comparability.
12. As an analyst, I want "latest per municipality" as the default Year Mode, so that I get maximum coverage without extra clicks.
13. As an analyst, I want the shared-year mode to use the newest year for which every data-having municipality in the state has a record, so that the comparison is apples-to-apples.
14. As an analyst, I want the compare response to include the year used per municipality, so that I know what period each value describes.
15. As an analyst, I want a Clear button while a comparison is active, showing the active Year Mode, so that I can return to the base map in one click.
16. As an analyst, I want applying an empty calculation to clear the comparison, so that clearing never requires hunting for a button.
17. As an analyst, I want selecting a different state to reset any active comparison, so that stale coloring from the previous state never misleads me.
18. As an analyst, I want an active comparison to survive map pan/zoom/resize, so that exploring the map doesn't wipe my analysis.
19. As an analyst, I want the modal's field lists derived from real data (one municipality's finances and the boundary properties), so that I only ever see fields that actually exist.
20. As an analyst, I want the finance fields fetched once and cached, so that reopening Compare in the same session is fast.
21. As an analyst, I want malformed or unsafe calculations rejected with a visible error message, so that I'm not left staring at an unresponsive map.
22. As an analyst, I want a division by zero to omit only that municipality rather than failing the whole comparison, so that one bad record doesn't ruin the map.
23. As an analyst, I want the whole comparison fetched in a single request, so that comparing across hundreds of municipalities is fast.
24. As an API consumer, I want the calculation to be transmitted as query parameters, so that compare requests are simple and cacheable.
25. As a security-conscious operator, I want calculation evaluation to happen only in a backend evaluator that accepts arithmetic and parentheses and nothing else, so that user input can never execute arbitrary code.
26. As a developer, I want the compare endpoint to require authentication like every other financial endpoint, so that finance data stays protected.
27. As a developer, I want the Calculations Modal component left unchanged, so that the existing parcel-analysis flow is not put at risk.
28. As a maintainer, I want the comparison state kept local to the Map Frame, so that closing the frame cleans up all of its state with no store bookkeeping.
29. As a maintainer, I want the glossary terms (Calculation, Compare Mode, Year Mode) captured in CONTEXT.md, so that future specs and code use the project's canonical vocabulary.

## Implementation Decisions

- **Backend evaluates calculations** (recorded as ADR-0001): the compare endpoint receives the
  Calculation as tokens, substitutes per-municipality values, and evaluates with a restricted
  Python `ast`-based evaluator permitting only arithmetic operators, unary minus, and parentheses —
  never `eval`/`exec`. Invalid expressions produce a 400 with an error message; non-numeric or
  undefined results (including division by zero) omit that municipality rather than erroring.
- **API contract**: `GET /financial/state/municipalities/compare` with query params `state_abbr`,
  `calc` (comma-separated token string; data points as `source:field`, operators and parens as bare
  tokens), and `year_mode` (`latest` | `shared`, default `latest`). Response: a list of
  `{ mid, value, year }`. Municipalities with no finance record are omitted.
- **Year Mode semantics**: `latest` = most recent finance record per municipality (consistent with
  the existing parcel-calc behavior); `shared` = the newest year for which every municipality that
  has any finance data in the state has a record; municipalities missing that year are omitted.
- **Municipality property resolution**: boundary feature properties (population, area) are resolved
  from the existing state municipal-boundaries lookup, keyed by `mid`.
- **Map Frame UI**: a bottom-left toolbar in the state-level Map Frame following the reka-ui toolbar
  pattern already used in the Municipal Map Frame, with a **Compare** button (visible when a state
  is selected and the municipal layer is showing) and a **Clear** button (visible only while a
  comparison is active, showing the active Year Mode).
- **Datasets for the modal**: Municipal Finances fields derived from a single fetched municipality's
  finances via the existing numeric-field helper (cached in the existing finances-by-municipality
  store state); Municipality fields derived from the first boundary feature's properties. No Parcels
  dataset at state level.
- **Rendering**: on apply, the frontend joins Compare Results onto boundary features by `mid` and
  restyles the existing municipal layer as a choropleth using the same chroma quantile palette
  approach as the parcel analysis, with `Value: x` tooltips and "No data" tooltips for omitted mids.
  An empty applied calculation clears. The active comparison re-applies after layer rebuilds and
  resets on state change; state is component-local.
- **Calculations Modal unchanged**: the component already accepts arbitrary datasets and emits
  Calculation Items; no modifications.
- **No new store state**: compare results and styling live in the Map Frame component; the store's
  existing finances cache is reused for field derivation.
- **Delivery mechanics**: work happens on branch `calc-modal-dev` in a worktree at the workspace
  `worktrees/` directory (directory name `calc-modal-dev`). The domain docs (`CONTEXT.md` glossary:
  Calculation, Calculation Item, Dataset, Data Point, Compare Mode, Compare Result, Year Mode, Map
  Frame vs Municipal Map Frame; and ADR-0001) are created in the worktree as part of the work.

## Testing Decisions

- **No automated tests.** Backend tests were initially written (HTTP-seam tests against the compare
  endpoint), then removed: they were run with bare pytest without pytest-django, so Django's
  test-database isolation never activated and the tests operated on the live
  `municipal_finance_viewer` database — destroying its contents. The test infrastructure
  (backend test module and conftest, frontend vitest suite) has been removed entirely.
- **Backend verification is manual**: the compare endpoint is exercised via authenticated requests
  against the running dev server — token string parsing, both Year Modes, omission of
  municipalities with no finance record, malformed calc → 400, and auth required.
- **Frontend verification is manual**: the Compare flow is walked in the dev environment —
  Compare button visibility, modal open/apply, choropleth rendering and tooltips, Clear, and
  reset on state change.
- **Risk accepted**: the restricted calculation evaluator (backend/finance_viewer/lib/calculation.py)
  is the security-sensitive piece and now has no regression net. If it is ever refactored,
  re-verify manually that only arithmetic, parentheses, and numeric constants evaluate, and that
  calls/attribute access/names are rejected.
- **Prior art**: none. Automated tests were removed by decision of the maintainer; any future
  automated testing should use the dedicated `mfv_test` database (see `copy_tables.sh` at the
  workspace root) and never the live aliases.

## Out of Scope

- Any change to the Calculations Modal component.
- A Parcels dataset in the state-level comparison.
- Multi-year/time-series comparisons beyond the two Year Modes.
- Charts, tables, or export of Compare Results.
- Persisting a comparison across page reloads.
- Migrating the existing parcel calculation in the Municipal Map Frame to backend evaluation — it
  keeps its frontend mathjs flow; unification is a possible follow-up.
- Server-side caching of compare responses.

## Further Notes

- Year-mode selector UX, shared-year definition, and Clear button were resolved in the grilling
  session; the shared-year mode intentionally excludes data-less municipalities from the "all"
  quantifier.
- Boundary features can carry a null `mid` (municipality present in GIS but absent from the finance
  DB); those features are treated identically to omitted municipalities.
- The backend `municipalities.state` column stores the two-letter state abbreviation in uppercase;
  the `state_abbr` param follows that convention.