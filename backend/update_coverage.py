#!/usr/bin/env python3
"""
Generate coverage reports and update coverage information.
This script is run as part of pre-commit to ensure coverage is current.
"""

import json
import re
import subprocess
from pathlib import Path


def run_coverage():
    """Run tests with coverage and capture results."""
    print("📊 Generating backend coverage report...")

    result = subprocess.run(
        [
            "pytest",
            "--cov=.",
            "--cov-report=term-missing",
            "--cov-report=json",
            "--cov-report=html",
            "--cov-fail-under=85",
            "-q",
        ],
        capture_output=True,
        text=True,
    )

    return result.stdout, result.stderr, result.returncode


def extract_coverage_percentage():
    """Extract coverage percentage from JSON report."""
    try:
        coverage_file = Path(".coverage.json") or Path("coverage.json")
        if coverage_file.exists():
            with open(coverage_file) as f:
                data = json.load(f)
                # Extract overall percentage
                total = data.get("totals", {})
                coverage = total.get("percent_covered", 0)
                return round(coverage, 1)
    except Exception:
        pass

    # Fallback: parse from output
    return None


def update_readme_badge(coverage_percent):
    """Update coverage badge in README.md."""
    readme_path = Path("../README.md")

    if not readme_path.exists():
        return

    with open(readme_path) as f:
        content = f.read()

    # Update coverage badge
    old_badge = (
        r"!\[Coverage\]\(https://img\.shields\.io/badge/Coverage-\d+(\.\d+)?%25-success\.svg\)"
    )
    new_badge = (
        f"![Coverage](https://img.shields.io/badge/Coverage-{coverage_percent}%25-success.svg)"
    )

    updated = re.sub(old_badge, new_badge, content)

    if updated != content:
        with open(readme_path, "w") as f:
            f.write(updated)
        print(f"✅ Updated README.md coverage badge to {coverage_percent}%")
        return True

    return False


def generate_reports():
    """Generate and print coverage summary."""
    stdout, stderr, returncode = run_coverage()

    # Print summary
    if stdout:
        print(stdout)

    if stderr and "FAILED" in stderr:
        print("❌ Coverage check failed!")
        print(stderr)
        return False

    # Extract coverage
    coverage = extract_coverage_percentage()
    if coverage:
        print(f"\n✅ Coverage: {coverage}% (≥ 85% required)")

        # Update badge
        update_readme_badge(coverage)

        return returncode == 0

    return returncode == 0


if __name__ == "__main__":
    import sys

    success = generate_reports()
    sys.exit(0 if success else 1)
