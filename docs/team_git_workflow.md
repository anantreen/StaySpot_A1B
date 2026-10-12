# Member branches and final integration

The local base is **StaySpot_A1B**, copied from **StaySpotAI**. The product remains **StaySpot**. The shared files and `members/member1/` are present; `members/member2/`, `members/member3/` and `members/member4/` are intentionally absent. They must arrive through the teammates' branches before the whole application can run.

The source `StaySpotAI` folder remains the full reference copy. Share each teammate's corresponding member folder from that source. Do not copy the source `.git` directory into this new project: this base has no old repository history, so other members' implementations are not present in its earlier commits.

## Member 1: publish the initial base manually

Run from the workspace parent:

```bash
cd StaySpot_A1B
git init -b main
git add .
git status --short
git diff --cached --stat
git commit -m "Add shared StaySpot project and Member 1 section"
git remote add origin https://github.com/anantreen/StaySpot_A1B.git
git push -u origin main
```

The copy includes `.env.example`, not the source's local `.env`. Dependencies, virtual environments, caches, `dist/` and old Git history are omitted. Install dependencies and create local settings after cloning; the existing `.gitignore` keeps them out of commits.

If Git requests identity, each person should configure their own name and email. Teammates need repository write access to push branches directly; otherwise they can push a branch to their fork and open a pull request against this repository. The commands below assume direct write access.

## Members 2, 3 and 4: add your own folder from your own device

Each teammate should clone the **new repository** after Member 1 pushes the base. Branch from its current `main`; do not reuse the old `StaySpotAI` repository or commit other members' folders.

Member 2 example (replace the shared-folder path with its actual location):

```bash
git clone https://github.com/anantreen/StaySpot_A1B.git
cd StaySpot_A1B
git switch -c member2-booking

# Copy the received folder to the exact integration path.
cp -R /path/to/shared/member2 members/member2

# Review and commit only this member's folder.
git add members/member2
git diff --cached --stat
git commit -m "Add Member 2 booking, status and wallet audit section"
git push -u origin member2-booking
```

Use these exact branch/folder pairs for the other contributions:

| Member | Branch | Received folder → repository path | Work |
|---|---|---|---|
| 2 | `member2-booking` | `member2/` → `members/member2/` | Booking, status, audit, SQL procedure/index/trigger and PostgreSQL seeder |
| 3 | `member3-analytics` | `member3/` → `members/member3/` | Analytics, chart, window SQL and materialized totals |
| 4 | `member4-mongo` | `member4/` → `members/member4/` | Map, reviews, MongoDB builders/scripts and MongoDB seeder |

For example, Member 3 substitutes `member3-analytics` and `members/member3` in the commands; Member 4 substitutes `member4-mongo` and `members/member4`. Keep the received folder's entire internal structure, including its README, tests, database scripts and seeders. Avoid an extra nesting level such as `members/member2/member2/`.

Each person should review their assigned implementation, make any needed changes and verify their commit diff before pushing. Shared integration files are already in the base. Coordinate changes to those files with Member 1 so teammates' branches do not independently replace the application shell, route registration or stylesheet.

Open a pull request from the member branch to `main`, with a short description of the section and validation performed. Folder completeness is checked by:

```bash
python3 scripts/check_members.py
```

On a branch with only one new member folder, the checker will still report the other missing folders. Full setup, build and integration tests become available after all three contributions are merged.

## Member 1: review and merge the contributions

Review each pull request's file list and diff. For the first additions, changes should be under the corresponding `members/memberN/` path unless a shared change was explicitly coordinated. Merge the reviewed pull requests into `main`, then update your local clone:

```bash
git switch main
git pull --ff-only origin main
python3 scripts/check_members.py
```

Alternatively, if you prefer to merge the pushed branches locally, use the following after reviewing their diffs. Choose this route instead of merging the same branches through GitHub:

```bash
git switch main
git pull --ff-only origin main
git fetch origin
git diff main...origin/member2-booking --stat
git diff main...origin/member3-analytics --stat
git diff main...origin/member4-mongo --stat
git merge --no-ff origin/member2-booking
git merge --no-ff origin/member3-analytics
git merge --no-ff origin/member4-mongo
python3 scripts/check_members.py
```

Once all files are present, follow the [README](../README.md) prerequisites and first-time setup using your own local `.env` and fresh database volumes. Build and test before pushing any local merge commits:

```bash
npm run build
npm test

# Python checks require the activated venv and exported database settings.
set -a
source .env
set +a
python tests/database_checks.py

git push origin main
```

No service code is stubbed or removed for the initial partial copy. `App.jsx`, `api/app.js`, root SQL/Mongo adapters, seeders and tests keep the original paths and will connect to the teammates' modules after their folders are merged. Historical screenshots, performance logs and reports describe the complete reference project; they are not test results for the initial partial base.
