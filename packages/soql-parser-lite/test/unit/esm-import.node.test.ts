import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const require = createRequire(import.meta.url)
const pkgRoot = resolve(__dirname, '../..')

describe('compiled output in plain Node ESM', () => {
    it('can be imported without a bundler and parses a query', () => {
        const out = mkdtempSync(join(tmpdir(), 'soql-esm-'))
        try {
            execFileSync(
                process.execPath,
                [
                    require.resolve('typescript/bin/tsc'),
                    '-p',
                    join(pkgRoot, 'tsconfig.prod.json'),
                    '--outDir',
                    out,
                    '--incremental',
                    'false',
                    '--declaration',
                    'false',
                    '--declarationMap',
                    'false',
                    '--sourceMap',
                    'false',
                ],
                { cwd: pkgRoot, stdio: 'pipe' },
            )
            writeFileSync(join(out, 'package.json'), '{"type":"module"}')
            const script = `import { parseSoqlQuery } from ${JSON.stringify(
                join(out, 'index.js'),
            )}
const q = parseSoqlQuery('SELECT Id FROM Account')
console.log(q.from.objects[0].name)`
            const result = execFileSync(
                process.execPath,
                ['--input-type=module', '-e', script],
                { encoding: 'utf8' },
            )
            expect(result.trim()).toBe('Account')
        } finally {
            rmSync(out, { recursive: true, force: true })
        }
    }, 120_000)
})
