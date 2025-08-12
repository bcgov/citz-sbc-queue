/**
 * Copyright 2025 Province of British Columbia
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// @ts-ignore - license-checker doesn't have type definitions
import licenseChecker from "license-checker"

type LicenseInfo = {
  licenses: string | string[]
  repository?: string
  publisher?: string
  url?: string
  licenseFile?: string
  noticeFile?: string
}

type PackageInfo = {
  name: string
  licenses: string[]
  repository?: string
  publisher?: string
  url?: string
}

type LicenseResults = {
  compatible: PackageInfo[]
  problematic: PackageInfo[]
  unknown: PackageInfo[]
  exceptions: PackageInfo[]
  total: number
}

/**
 * Script to check all dependencies for Apache 2.0 license compatibility
 *
 * This script scans all project dependencies and validates that they use
 * licenses compatible with Apache 2.0 for government use.
 *
 * @author Veenu Punyani
 * @version 1.0.1
 */
async function checkLicenses(): Promise<LicenseResults> {
  console.log("🔍 Checking license compatibility for all dependencies...\n")

  try {
    return new Promise<LicenseResults>((resolve, reject) => {
      // Type assertion for the untyped license-checker module
      const typedLicenseChecker = licenseChecker as {
        init: (
          options: {
            start: string
            production?: boolean
            json?: boolean
            excludePrivatePackages?: boolean
          },
          callback: (err: Error | null, packages: Record<string, LicenseInfo>) => void
        ) => void
      }

      typedLicenseChecker.init(
        {
          start: process.cwd(),
          production: false, // Check all dependencies including dev
          json: true,
          excludePrivatePackages: true,
        },
        (err: Error | null, packages: Record<string, LicenseInfo>) => {
          if (err) {
            reject(err)
            return
          }

          // Apache 2.0 compatible licenses
          const compatibleLicenses = new Set([
            "Apache-2.0",
            "MIT",
            "BSD-2-Clause",
            "BSD-3-Clause",
            "ISC",
            "CC0-1.0",
            "Unlicense",
            "WTFPL",
            "Public Domain",
            "0BSD",
            "Python-2.0",
            "MPL-2.0",
          ])

          // Potentially problematic licenses
          const problematicLicenses = new Set([
            "GPL-2.0",
            "GPL-3.0",
            "LGPL-2.1",
            "LGPL-3.0",
            "AGPL-3.0",
            "EPL-1.0",
            "EPL-2.0",
            "CDDL-1.0",
            "CDDL-1.1",
          ])

          // Known exceptions
          const knownExceptions = new Set([
            "lightningcss",
            "lightningcss-darwin-arm64",
            "lightningcss-darwin-x64",
            "lightningcss-linux-arm64-gnu",
            "lightningcss-linux-arm64-musl",
            "lightningcss-linux-x64-gnu",
            "lightningcss-linux-x64-musl",
            "lightningcss-win32-x64-msvc",
          ])

          const results: LicenseResults = {
            compatible: [],
            problematic: [],
            unknown: [],
            exceptions: [],
            total: 0,
          }

          for (const [packageName, info] of Object.entries(packages)) {
            results.total++
            const licenses = Array.isArray(info.licenses) ? info.licenses : [info.licenses]
            const packageBaseName = packageName.split("@")[0] // Remove version

            let isCompatible = false
            let isProblematic = false
            let isException = false

            // Check if it's a known exception first
            if (knownExceptions.has(packageBaseName)) {
              isException = true
            } else {
              for (const license of licenses) {
                if (compatibleLicenses.has(license)) {
                  isCompatible = true
                  break
                }
                if (problematicLicenses.has(license)) {
                  isProblematic = true
                }
              }
            }

            const packageInfo: PackageInfo = {
              name: packageName,
              licenses: licenses,
              repository: info.repository,
              publisher: info.publisher,
              url: info.url,
            }

            if (isException) {
              results.exceptions.push(packageInfo)
            } else if (isCompatible) {
              results.compatible.push(packageInfo)
            } else if (isProblematic) {
              results.problematic.push(packageInfo)
            } else {
              results.unknown.push(packageInfo)
            }
          }

          console.log("📊 LICENSE COMPATIBILITY REPORT")
          console.log("================================\n")

          console.log(`✅ Compatible licenses: ${results.compatible.length}`)
          console.log(`⚖️  Known exceptions: ${results.exceptions.length}`)
          console.log(`⚠️  Potentially problematic: ${results.problematic.length}`)
          console.log(`❓ Unknown/Custom licenses: ${results.unknown.length}`)
          console.log(`📦 Total packages: ${results.total}\n`)

          if (results.exceptions.length > 0) {
            console.log("⚖️  KNOWN EXCEPTIONS (Approved):")
            console.log("===============================")
            results.exceptions.forEach((pkg) => {
              console.log(`- ${pkg.name}: ${pkg.licenses.join(", ")} (Approved exception)`)
            })
            console.log("")
          }

          if (results.problematic.length > 0) {
            console.log("⚠️  POTENTIALLY PROBLEMATIC LICENSES:")
            console.log("=====================================")
            results.problematic.forEach((pkg) => {
              console.log(`- ${pkg.name}: ${pkg.licenses.join(", ")}`)
            })
            console.log("")
          }

          if (results.unknown.length > 0) {
            console.log("❓ UNKNOWN/CUSTOM LICENSES (Review Required):")
            console.log("===========================================")
            results.unknown.forEach((pkg) => {
              console.log(`- ${pkg.name}: ${pkg.licenses.join(", ")}`)
              if (pkg.repository) console.log(`  Repository: ${pkg.repository}`)
            })
            console.log("")
          }

          if (results.problematic.length === 0 && results.unknown.length === 0) {
            if (results.exceptions.length > 0) {
              console.log(
                `🎉 All dependencies are Apache 2.0 compatible (with ${results.exceptions.length} approved exceptions)!`
              )
            } else {
              console.log("🎉 All dependencies are Apache 2.0 compatible!")
            }
          } else {
            console.log("⚠️  Some dependencies require review. Check the report above.")
          }

          resolve(results)
        }
      )
    })
  } catch (error) {
    console.error(
      "❌ Error checking licenses:",
      error instanceof Error ? error.message : String(error)
    )
    throw error
  }
}

// Run the check if this module is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkLicenses().catch(console.error)
}

export { checkLicenses, type LicenseResults, type PackageInfo, type LicenseInfo }
