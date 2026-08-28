# Municipal Finance Viewer

A GIS-backed application for exploring, comparing, and analyzing the financial records of
municipal governments across US states.

## Language

**Frame**:
A floating window in the viewer workspace. Each Frame has a type that determines which
component renders it and what data it owns. Closing a Frame cleans up its store data.
_Avoid_: window, panel, card

**Map Frame**:
A Frame showing a US or state-level map. Starts at the US level; selecting a state swaps in
that state's municipal boundaries.
_Avoid_: state frame, US frame

**Municipal Map Frame**:
A Frame showing a single municipality's boundary and (optionally) its parcels. Opened by
selecting a municipality from a Map Frame or search.
_Avoid_: parcel frame

**Calculation**:
An ordered list of Calculation Items forming an arithmetic expression over Data Points, built
in the Calculations Modal and applied to a map.
_Avoid_: formula, expression (in user-facing language), analysis

**Calculation Item**:
One token of a Calculation: either a Data Point or an operator (including parentheses).

**Data Point**:
A single named value usable in a Calculation, identified by its source and field
(e.g. a municipal finance field, a boundary property, a parcel attribute).
_Avoid_: variable, metric

**Dataset**:
A named group of Data Points sharing one source, offered as a filter tab in the Calculations
Modal (e.g. Municipal Finances, Municipality, Parcels).

**Compare Mode**:
The rendering state of a Map Frame in which municipal boundaries are colored by a
backend-computed Calculation value rather than the default boundary style.
_Avoid_: analysis mode, choropleth mode

**Compare Result**:
The backend-computed value of a Calculation for one municipality, tagged with the finance
year that produced it.

**Year Mode**:
How the finance record is chosen per municipality in a comparison. `latest` uses each
municipality's most recent record; `shared` uses the newest year every data-having
municipality in the state has a record for.
_Avoid_: year strategy, period

**No Data**:
A municipality omitted from a Compare Result (no finance record, missing field, or undefined
result). Rendered with the default boundary style and a "No data" tooltip — never as zero.