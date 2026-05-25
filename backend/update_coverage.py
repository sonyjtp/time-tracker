#!/usr/bin/env python3

"""
Pre-commit hook to update test coverage data.
This script runs pytest with coverage and updates the coverage.json file.
"""

import subprocess
import sys


def run_coverage_update():
    """Run pytest with coverage and update coverage.json."""
    print("🔄 Updating backend coverage...")

    try:
        # Run pytest with coverage
        result = subprocess.run(
            [
                sys.executable,
                "-m",
                "pytest",
                "--cov=src",
                "--cov-report=json",
                "--cov-report=html",
                "-v",
            ],
            cwd="/Users/sonyjacobthomas/PycharmProjects/timetracker/backend",
            capture_output=False,
        )

        if result.returncode == 0:
            print("\n✅ Coverage update completed successfully")
            return True
        else:
            print("\n❌ Coverage update failed")
            return False

    except Exception as e:
        print(f"\n❌ Error running coverage update: {e}")
        return False


if __name__ == "__main__":
    success = run_coverage_update()
    sys.exit(0 if success else 1)
