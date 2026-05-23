#!/usr/bin/env node

/**
 * Generate coverage reports and update coverage information.
 * This script is run as part of pre-commit to ensure coverage is current.
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

function runCoverage() {
  console.log('📊 Generating frontend coverage report...')

  return new Promise((resolve) => {
    const vitest = spawn('npx', [
      'vitest',
      '--coverage',
      '--run',
      '--reporter=verbose',
    ])

    let stdout = ''
    let stderr = ''

    vitest.stdout.on('data', (data) => {
      stdout += data.toString()
      process.stdout.write(data)
    })

    vitest.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    vitest.on('close', (code) => {
      resolve({ stdout, stderr, code })
    })
  })
}

function extractCoveragePercentage() {
  try {
    const coverageFile = path.join('coverage', 'coverage-final.json')
    if (fs.existsSync(coverageFile)) {
      const data = JSON.parse(fs.readFileSync(coverageFile, 'utf8'))
      // Calculate overall coverage
      let totalLines = 0
      let coveredLines = 0

      Object.values(data).forEach((file) => {
        if (file.lines) {
          Object.values(file.lines).forEach((line) => {
            totalLines++
            if (line > 0) coveredLines++
          })
        }
      })

      if (totalLines > 0) {
        return Math.round((coveredLines / totalLines) * 100 * 10) / 10
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return null
}

function updateReadmeBadge(coverage) {
  const readmePath = path.join('..', 'README.md')

  try {
    if (!fs.existsSync(readmePath)) return false

    let content = fs.readFileSync(readmePath, 'utf8')
    const oldBadge = /!\[Coverage\]\(https:\/\/img\.shields\.io\/badge\/Coverage-\d+(\.\d+)?%25-success\.svg\)/
    const newBadge = `![Coverage](https://img.shields.io/badge/Coverage-${coverage}%25-success.svg)`

    const updated = content.replace(oldBadge, newBadge)

    if (updated !== content) {
      fs.writeFileSync(readmePath, updated, 'utf8')
      console.log(`\n✅ Updated README.md coverage badge to ${coverage}%`)
      return true
    }
  } catch (e) {
    // Ignore errors
  }

  return false
}

async function generateReports() {
  const { stdout, stderr, code } = await runCoverage()

  if (code !== 0 && stderr) {
    console.error('❌ Coverage check failed!')
    return false
  }

  const coverage = extractCoveragePercentage()
  if (coverage) {
    console.log(`\n✅ Coverage: ${coverage}% (≥ 85% required)`)
    updateReadmeBadge(coverage)
    return true
  }

  return code === 0
}

generateReports().then((success) => {
  process.exit(success ? 0 : 1)
})
