# Research: Gitea + Woodpecker CI

## Gitea
- Lightweight, self-hosted Git service written in Go
- Forked from Gogs in 2016
- Features: Git hosting, code review, team collaboration, package registry, CI/CD
- Gitea Actions: near GitHub Actions compatibility
- Runs on a Raspberry Pi 3 (2 CPU, 1GB RAM sufficient for small teams)
- Can reuse thousands of GitHub Actions

## Woodpecker CI
- 6.4K GitHub stars
- Forked from Drone CI
- Docker-native pipeline execution
- Simple YAML-based configuration (.woodpecker.yml)
- SSO via Gitea
- Integrates with GitHub, GitLab, Gitea
- Minimal resource requirements
- v3.13.0 latest

## Combined Stack
- Gitea for code hosting + Woodpecker for CI/CD
- SSO integration between the two
- Auto webhook creation on repo activation

## Trade-offs
- Ecosystem smaller than GitHub/GitLab
- Migration effort from GitHub Actions
- Limited marketplace for Woodpecker plugins vs GitHub

## Sources
- https://about.gitea.com/
- https://docs.gitea.com/
- https://github.com/woodpecker-ci/woodpecker
- https://woodpecker-ci.org/
