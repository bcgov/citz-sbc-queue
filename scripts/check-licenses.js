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

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Script to check all dependencies for Apache 2.0 license compatibility
 *
 * This script scans all project dependencies and validates that they use
 * licenses compatible with Apache 2.0 for government use.
 *
 * @author Veenu Punyani
 * @version 1.0.0
 */
async function checkLicenses() {
  console.log('🔍 Checking license compatibility for all dependencies...\n');

  try {
    // Check if license-checker is available
    let licenseChecker;
    try {
      licenseChecker = require('license-checker');
    } catch (e) {
      console.error('❌ license-checker not found. Please install it first:');
      console.error('   npm install --save-dev license-checker');
      process.exit(1);
    }

    return new Promise((resolve, reject) => {
      licenseChecker.init({
        start: process.cwd(),
        production: false, // Check all dependencies including dev
        json: true,
        excludePrivatePackages: true,
      }, (err, packages) => {
        if (err) {
          reject(err);
          return;
        }

        // Apache 2.0 compatible licenses
        const compatibleLicenses = new Set([
          'Apache-2.0',
          'MIT',
          'BSD-2-Clause',
          'BSD-3-Clause',
          'ISC',
          'CC0-1.0',
          'Unlicense',
          'WTFPL',
          'Public Domain',
          '0BSD',
          'Python-2.0'
        ]);

        // Potentially problematic licenses
        const problematicLicenses = new Set([
          'GPL-2.0',
          'GPL-3.0',
          'LGPL-2.1',
          'LGPL-3.0',
          'AGPL-3.0',
          'EPL-1.0',
          'EPL-2.0',
          'MPL-2.0',
          'CDDL-1.0',
          'CDDL-1.1'
        ]);

        const results = {
          compatible: [],
          problematic: [],
          unknown: [],
          total: 0
        };

        for (const [packageName, info] of Object.entries(packages)) {
          results.total++;
          const licenses = Array.isArray(info.licenses) ? info.licenses : [info.licenses];

          let isCompatible = false;
          let isProblematic = false;

          for (const license of licenses) {
            if (compatibleLicenses.has(license)) {
              isCompatible = true;
              break;
            }
            if (problematicLicenses.has(license)) {
              isProblematic = true;
            }
          }

          const packageInfo = {
            name: packageName,
            licenses: licenses,
            repository: info.repository,
            publisher: info.publisher,
            url: info.url
          };

          if (isCompatible) {
            results.compatible.push(packageInfo);
          } else if (isProblematic) {
            results.problematic.push(packageInfo);
          } else {
            results.unknown.push(packageInfo);
          }
        }

        console.log('📊 LICENSE COMPATIBILITY REPORT');
        console.log('================================\n');

        console.log(`✅ Compatible licenses: ${results.compatible.length}`);
        console.log(`⚠️  Potentially problematic: ${results.problematic.length}`);
        console.log(`❓ Unknown/Custom licenses: ${results.unknown.length}`);
        console.log(`📦 Total packages: ${results.total}\n`);

        if (results.problematic.length > 0) {
          console.log('⚠️  POTENTIALLY PROBLEMATIC LICENSES:');
          console.log('=====================================');
          results.problematic.forEach(pkg => {
            console.log(`- ${pkg.name}: ${pkg.licenses.join(', ')}`);
          });
          console.log('');
        }

        if (results.unknown.length > 0) {
          console.log('❓ UNKNOWN/CUSTOM LICENSES (Review Required):');
          console.log('===========================================');
          results.unknown.forEach(pkg => {
            console.log(`- ${pkg.name}: ${pkg.licenses.join(', ')}`);
            if (pkg.repository) console.log(`  Repository: ${pkg.repository}`);
          });
          console.log('');
        }

        if (results.problematic.length === 0 && results.unknown.length === 0) {
          console.log('🎉 All dependencies are Apache 2.0 compatible!');
        } else {
          console.log('⚠️  Some dependencies require review. Check the report above.');
        }

        resolve(results);
      });
    });
  } catch (error) {
    console.error('❌ Error checking licenses:', error.message);
    throw error;
  }
}

// Run the check
if (require.main === module) {
  checkLicenses().catch(console.error);
}

module.exports = { checkLicenses };
