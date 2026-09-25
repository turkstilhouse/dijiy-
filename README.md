# DİJİY — Dijital İpek Yolu

DİJİY is designed as a modular, global digital ecosystem rather than a single-purpose website.

Core principle: one identity, one address, one data backbone, many interoperable domains.

The platform may grow across commerce, social, media, education, culture, tourism, public services, communities, AI, business, logistics, digital worlds and future capabilities without replacing its core.

## Architecture principles

- DİJİY owns the core identity, authorization, orchestration, data model, connector abstraction and business logic.
- External providers are adapters, not architectural dependencies.
- Critical systems must be portable and replaceable.
- Build the smallest useful first version while preserving clean module boundaries.
- Do not create unnecessary microservices early; evolve from a modular core into services when scale requires it.
- Security, privacy, auditability, observability and data portability are first-class requirements.
- New capabilities are registered through a capability/module registry rather than hard-coded into the platform shell.

## Core layers

Identity & Access → Organizations & Workspaces → Core Domain → DİJİY Connect → Data Platform → ARAS Orchestration → Applications → Digital Worlds

See docs/ for the initial architecture specifications.


## First application surface

The first web surface is being built in `apps/web` as a single modular application foundation. The initial routes are `/` and `/technology-watch`. This is a foundation layer, not a separate microservice. The web surface does not become the canonical source of truth; DİJİJY Core remains authoritative.
