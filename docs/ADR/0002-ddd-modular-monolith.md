# ADR-0002: Domain-Driven Design as a modular monolith

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

The project must be easy to maintain and ready for a CMS or other data sources later.
The owner wants DDD and service-oriented thinking. The deliverable is a static site:
at runtime there are no services to split.

## Decision

- Organise code into **bounded contexts** under `src/contexts/`: `seasonality`, `catalog`,
  `geography`, `farms`, `advertising`, plus a **shared kernel** in `src/shared/`.
- Each context has `domain/` (pure TypeScript), `application/` (use cases) and
  `infrastructure/` (adapters such as Astro content collections), and exposes a single
  public `index.ts`.
- Repository interfaces live in `domain/`; implementations in `infrastructure/`
  (content collections) and `tests/fixtures/` (in memory).
- Do **not** build runtime microservices now. Any context can be extracted into a
  separate service (e.g. a Cloudflare Worker for farm submissions or ad serving) by
  replacing its infrastructure adapter, without changes to other contexts.

## Consequences

- Domain logic is testable without Astro.
- Swapping YAML files for a CMS or API touches only `infrastructure/`.
- Slightly more files than a flat structure; mitigated by the folder map in `AGENTS.md`.
