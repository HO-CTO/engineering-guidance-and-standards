#! /usr/bin/env node
/**
 * This reads the current list of searchable pages from https://engineering.homeoffice.gov.uk/, appends a static list
 * of non-searchable pages (about, tags, etc.), and then creates a page for each url that will redirect users accessing
 * a https://ho-cto.github.io/engineering-guidance-and-standards/ url to the same page in
 * https://engineering.homeoffice.gov.uk/.
 */

import { writeFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const pagesExcludedFromSearchJSON = [
    '/about/',
    '/accessibility-statement/',
    '/cookies/',
    '/provide-feedback/',
    '/sitemap/',
    '/tags/',
    '/tags/accessibility/',
    '/tags/alerting/',
    '/tags/artefacts/',
    '/tags/artificial-intelligence-ai/',
    '/tags/build-release-and-deploy/',
    '/tags/ci-cd/',
    '/tags/dependencies/',
    '/tags/deployment/',
    '/tags/documentation/',
    '/tags/encryption/',
    '/tags/generative-ai/',
    '/tags/infrastructure/',
    '/tags/logging/',
    '/tags/maintainability/',
    '/tags/monitoring/',
    '/tags/observability/',
    '/tags/quality/',
    '/tags/reusability/',
    '/tags/secure-development/',
    '/tags/security/',
    '/tags/software-design/',
    '/tags/source-management/',
    '/tags/sre/',
    '/tags/ways-of-working/',
]

async function ensureDir(filepath) {
    const exists = await stat(dirname(filepath)).then(s => s.isDirectory()).catch(() => false);
    if(!exists) {
        await mkdir(dirname(filepath), { recursive: true })
    }
}

async function writeRedirect(url) {
    const filepath = join('.', 'docs', ...url.split('/'), 'index.html');
    await ensureDir(filepath);

    const contents = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Home Office engineering guidance and standards has moved</title>
    <link rel="canonical" href="https://engineering.homeoffice.gov.uk${url}">
    <meta http-equiv="refresh" content="0; url=https://engineering.homeoffice.gov.uk${url}">
</head>
<body>
<h1>Home Office engineering guidance and standards has moved</h1>
<p>
    The Home Office engineering guidance and standards site is available at
    <a href="https://engineering.homeoffice.gov.uk">https://engineering.homeoffice.gov.uk</a>.
</p>
<p>
    Your browser should automatically redirect you to the new URL. If that has not worked, then you can
    <a href="https://engineering.homeoffice.gov.uk${url}">follow this link to this page on the new site the new site.</a>
</p>
</body>
</html>
`

    await writeFile(filepath, contents)
}

const pageUrls =
    await fetch('https://engineering.homeoffice.gov.uk/search.json')
        .then(res => res.json())
        .then(pages => pages.map(page => page.url))

await Promise.all([...pageUrls, ...pagesExcludedFromSearchJSON].map(writeRedirect));
