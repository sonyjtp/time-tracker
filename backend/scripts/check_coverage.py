#!/usr/bin/env python3
"""
Pre-commit hook to check test coverage meets minimum threshold.
This script runs tests and verifies coverage is at least 85%.
"""

import subprocess
import sys


def run_coverage_check():
    """Run tests with coverage and check if threshold is met."""
    print("🔍 Checking test coverage...")

    # Run pytest with coverage
    result = subprocess.run(
        [
            "python",
            "-m",
            "pytest",
            "--cov=app",
            "--cov-report=term-missing",
            "--cov-fail-under=85",
            "-q",
        ],
        capture_output=True,
        text=True,
    )

    print(result.stdout)

    if result.returncode != 0:
        print(result.stderr)
        print("\n❌ Coverage check failed!")
        print("   Coverage must be at least 85%")
        return False

    print("✅ Coverage check passed (≥ 85%)")
    return True


if __name__ == "__main__":
    success = run_coverage_check()
    sys.exit(0 if success else 1)
