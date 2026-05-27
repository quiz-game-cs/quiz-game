-- baseline: existing schema captured via `drizzle-kit introspect`.
-- The DB already has these tables, so this migration is intentionally a no-op.
-- Its journal entry exists so the next diff migration (0001+) applies cleanly.
SELECT 1;
