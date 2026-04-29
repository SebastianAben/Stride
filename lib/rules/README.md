# Rule Utilities

Shared SMART rule utilities live here.

Rules must remain pure functions with no database access.

Implemented utilities:

- Next Action
- Today's Actions
- Priority Queue
- Progress Insight
- Bottleneck Indicator

Rules are derived dynamically from raw application data and should not persist
`nextAction`, `priorityScore`, or `priorityLevel` unless a future performance or
audit requirement makes that necessary.
