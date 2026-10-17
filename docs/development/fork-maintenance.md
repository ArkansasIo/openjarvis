# ArkansasIo OpenJarvis — Fork Maintenance Notes

This document describes the current fork's verified project shape and provides a repeatable, local-first validation sequence for contributors. It intentionally does not claim that a build has passed unless the corresponding command is executed against the checkout.

## Project scope

This repository is a fork of [OpenJarvis](https://github.com/open-jarvis/OpenJarvis), a local-first personal AI framework. The existing tree includes:

- Python package and command-line tools under `src/openjarvis/`
- Rust/PyO3 extension under `rust/`
- Browser UI and Tauri desktop application under `frontend/`
- Configuration presets under `configs/openjarvis/`
- Documentation under `docs/`
- CI workflows under `.github/workflows/`

Before implementing a new feature, inspect the applicable registry, existing implementation, and matching test directory. Prefer extending established registries and interfaces over adding parallel implementations.

## Supported development baseline

The package metadata declares Python `>=3.10,<3.14`. CI currently configures Python 3.12 for the main Linux checks and tests Python 3.12/3.13 on Windows. The frontend manifest declares Node.js `>=22.22` and npm `>=11.19.0 <12`.

Install the required platform toolchains before running the commands below: Python, `uv`, Node.js/npm for frontend work, and stable Rust for PyO3 or Rust components.

## Validation commands

Run from the repository root:

```bash
# Install baseline Python development dependencies
uv sync --extra dev --extra framework-comparison --extra server

# Python lint and formatting checks
uv run ruff check src/ tests/
uv run ruff format --check src/ tests/

# Build the Python/Rust extension, then run the non-live test suite
uv run maturin develop --manifest-path rust/crates/openjarvis-python/Cargo.toml
uv run pytest tests/ -n auto -q --tb=short -m "not live and not cloud and not hub"

# Rust workspace checks
cargo clippy --manifest-path rust/Cargo.toml --workspace --all-targets -- -D warnings
cargo test --manifest-path rust/Cargo.toml --workspace

# Frontend validation
npm --prefix frontend ci
npm --prefix frontend test
npm --prefix frontend exec -- tsc --noEmit
npm --prefix frontend run build
```

The CI workflow applies a coverage threshold and includes platform-specific tests beyond this abbreviated contributor checklist. Consult `.github/workflows/ci.yml`, `.github/workflows/frontend.yml`, and `.github/workflows/desktop.yml` for the authoritative commands and release prerequisites.

## Local-first and security checklist

- Keep provider credentials in environment variables or ignored local configuration; never commit secrets.
- Treat tool execution, shell access, filesystem access, and external connectors as privileged boundaries.
- Keep API server exposure explicit; follow the server's binding safety checks and configure authentication before binding beyond loopback.
- Do not upload private prompts, memory stores, traces, or user data to external services unless the configured workflow expressly requires it.
- Add regression tests for behavior changes and use mocks for network/provider calls in ordinary tests.
- Document hardware-, OS-, and optional-dependency requirements for new features.

## Reporting validation

When reporting results, include the exact command, Python/Node/Rust versions, platform, and relevant failure output. Distinguish tests actually executed from checks that are only configured in CI. A successful frontend build does not prove that the Python backend, native extension, or desktop packaging works.
