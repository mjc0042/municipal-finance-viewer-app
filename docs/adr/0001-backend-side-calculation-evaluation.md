# Backend-side evaluation of user-built calculations

User-built Calculations (arbitrary arithmetic over municipal data) are evaluated on the
backend, not in the browser. The compare endpoint receives the Calculation as tokens,
substitutes per-municipality values, and evaluates the expression with a restricted Python
ast walker that permits only arithmetic operators, unary minus, and parentheses — never
eval/exec. We chose this over the frontend mathjs evaluation used by the existing parcel
analysis because it gives a single source of truth for evaluation semantics and keeps
user-supplied expressions out of the browser's JS runtime; the cost is a new API contract
(token string grammar) and that the parcel flow remains a deliberate frontend exception
until it is migrated.

## Considered Options

- Frontend evaluation (mathjs, as the parcel flow does): no new endpoint, but the evaluation
  logic would be duplicated across two surfaces and untrusted expressions would run client-side.
- Backend evaluation with a restricted ast evaluator (chosen): one evaluator, safe by
  construction, reusable for future table/chart surfaces.

## Consequences

Malformed Calculations are rejected server-side with a 400; per-municipality evaluation
failures (missing data, division by zero) omit that municipality from the response rather
than failing the request.