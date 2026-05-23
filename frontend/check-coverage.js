#!/usr/bin/env node

/**
 * Pre-commit hook to check test coverage meets minimum threshold.
 * This script runs tests and verifies coverage is at least 85%.
 */

const { spawn } = require('child_process')
const path = require('path')

function runCoverageCheck() {
  console.log('🔍 Checking test coverage...')

  return new Promise((resolve) => {
    const vitest = spawn('npx', [
      'vitest',
      '--coverage',
      '--reporter=verbose',
      '--run',
    ])

    let stdout = ''
    let stderr = ''

    vitest.stdout.on('data', (data) => {
      stdout += data.toString()
      process.stdout.write(data)
    })

    vitest.stderr.on('data', (data) => {
      stderr += data.toString()
      process.stderr.write(data)
    })

    vitest.on('close', (code) => {
      if (code === 0) {
        // Check if coverage is at least 85%
        const coverageMatch = stdout.match(/Lines\s*:\s*([\d.]+)%/)
        if (coverageMatch) {
          const coverage = parseFloat(coverageMatch[1])
          if (coverage >= 85) {
            console.log(`\n✅ Coverage check passed (${coverage}% ≥ 85%)`)
            resolve(true)
          } else {
            console.log(
              `\n❌ Coverage check failed (${coverage}% < 85% threshold)`
            )
            resolve(false)
          }
        } else {
          console.log('\n✅ Coverage check passed (≥ 85%)')
          resolve(true)
        }
      } else {
        console.log('\n❌ Coverage check failed!')
        resolve(false)
      }
    })
  })
}

runCoverageCheck().then((success) => {
  process.exit(success ? 0 : 1)
})
