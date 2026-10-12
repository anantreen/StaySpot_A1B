#!/usr/bin/env python3
"""Report missing member contributions before building the merged StaySpot app.

The initial repository intentionally contains only Member 1. This read-only check
uses the handover manifest to confirm every expected file is present after merges.
It does not copy implementations, contact GitHub or connect to either database.
"""

import json
from pathlib import Path


def check_members(project_root):
    """Return missing paths per member; teammates may edit file contents freely."""
    manifest_path = project_root / "docs/member_handover_manifest.json"
    manifest = json.loads(manifest_path.read_text())
    missing = {}
    for member, files in manifest["members"].items():
        missing[member] = []
        for name in files:
            relative = Path(name)
            # Only inspect the member paths described by this repository manifest.
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError(f"Invalid member path in manifest: {name}")
            if relative.parts[:2] != ("members", member):
                raise ValueError(f"Path does not belong to {member}: {name}")
            if not (project_root / relative).is_file():
                missing[member].append(name)
    return missing


def main():
    """Exit 1 for an incomplete handover, or 0 once every member file exists."""
    project_root = Path(__file__).resolve().parents[1]
    missing = check_members(project_root)
    print("StaySpot member contributions:")
    for member, files in missing.items():
        if files:
            print(f"  {member}: missing {len(files)} files")
            for file in files:
                print(f"    {file}")
        else:
            print(f"  {member}: complete")
    if any(missing.values()):
        print("\nMerge the missing member folders before setup, build or full tests.")
        print("This is expected for the initial Member 1 repository.")
        return 1
    print("\nAll expected files are present. Continue with the README setup steps.")
    print("This checks file presence; build and database tests still verify behavior.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
