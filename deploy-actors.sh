#!/bin/bash
# Deploy all Apify actors. Builds everything first, then pushes in parallel.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
PACKAGES="greenhouse-jobs lever-jobs ashby-jobs smartrecruiters-jobs workable-jobs breezyhr-jobs personio-jobs recruitee-jobs hn-jobs teamtailor-jobs pinpoint-jobs dover-jobs bamboohr-jobs jazzhr-jobs jobvite-jobs"

echo "=== Phase 1: Build ==="

# Build job-ingest (normalizers need compiled JS)
echo "  Building job-ingest..."
cd "${ROOT}/packages/job-ingest" && pnpm build 2>/dev/null
echo "  job-ingest: OK"

# Build all scraper packages
for pkg in $PACKAGES; do
  cd "${ROOT}/packages/${pkg}" && pnpm build 2>/dev/null
  echo "  ${pkg}: OK"
done

# Build all actors
for pkg in $PACKAGES; do
  cd "${ROOT}/packages/${pkg}/actor" && npx tsc 2>/dev/null
  echo "  ${pkg}/actor: OK"
done

echo ""
echo "=== Phase 2: Deploy (parallel) ==="

deploy_actor() {
  local pkg=$1
  local actor_dir="${ROOT}/packages/${pkg}/actor"

  # Pack scraper + job-ingest as tarballs
  cd "${ROOT}/packages/${pkg}" && pnpm pack --pack-destination "${actor_dir}/" 2>/dev/null
  cd "${ROOT}/packages/job-ingest" && pnpm pack --pack-destination "${actor_dir}/" 2>/dev/null

  cd "${actor_dir}"

  local scraper_tgz=$(ls *.tgz 2>/dev/null | grep -v jobsearch | head -1)
  local ingest_tgz=$(ls jobsearch-job-ingest*.tgz 2>/dev/null | head -1)

  # Swap workspace:* to file: refs
  node -e '
    const fs = require("fs");
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));
    for (const [name] of Object.entries(pkg.dependencies)) {
      if (name === "apify") continue;
      if (name === "@jobsearch/job-ingest") {
        pkg.dependencies[name] = "file:./" + process.argv[2];
      } else {
        pkg.dependencies[name] = "file:./" + process.argv[1];
      }
    }
    fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
  ' "${scraper_tgz}" "${ingest_tgz}"

  # Push without waiting for remote build to finish
  local result
  result=$(apify push --force --wait-for-finish=0 2>&1) || true
  local status=$?

  # Restore and clean
  cd "${ROOT}"
  git checkout "packages/${pkg}/actor/package.json" 2>/dev/null || true
  rm -f "${actor_dir}"/*.tgz

  if echo "$result" | grep -q "Success"; then
    echo "  ${pkg}: DEPLOYED"
  else
    echo "  ${pkg}: FAILED — $(echo "$result" | grep -E 'Error|error' | tail -1)"
  fi
}

# Deploy 2 at a time to stay within Apify memory limits
count=0
for pkg in $PACKAGES; do
  deploy_actor "$pkg" &
  count=$((count + 1))
  if [ $((count % 2)) -eq 0 ]; then
    wait
  fi
done
wait

echo ""
echo "=== Done ==="
