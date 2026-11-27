# Kidron Capital website

The website's content, design and builder live in this repository, which Maria controls. Builds do not fetch or depend on another person's template repository.

The design follows Maria's selected [v6 reference](https://6ae35454b4d4d039e82c8f36--kidron-capital-demo.netlify.app/v6/), with the current website's wording, legal notice and contact form. No Track record claims from the demo have been added.

## Making a change yourself

1. Open this repository in GitHub. Text, colours, section order and image choices are in `site.json`. Photographs and logos are in `images/`. The layout is in `build.mjs` and `theme/`.
2. When editing, choose a new branch and open a pull request into `main`. Its Netlify preview is where you review the change. Keep further edits on that same branch.
3. Review the preview on your computer and phone. Check the menu, portfolio, biographies and contact fields. A preview does not replace the live website.
4. When you are ready, merge the pull request into `main` once. This publishes the website. If working with Codex, review the preview first and say **approve publish** when you want that exact version to go live.

You can also ask Codex for a change in ordinary language. It can edit these files and prepare the preview with you. No consultant-owned repository or account is needed.

## Contact form and documents

The form keeps its existing name, `fund-ii-materials`, field names and `/thank-you/` destination, so its existing Netlify notification configuration can continue to apply. The hidden `campaign` field reads the `c` query parameter, and the spam honeypot is retained. This redesign does not change notification recipients or email settings. Verify a real test inquiry after publication; visual and local checks do not prove email delivery.

`static/fund-ii-teaser.pdf` remains available at its existing address. `static/_headers` preserves the PDF's noindex and inline-display headers. Existing WordPress redirects remain in `netlify.toml`.

## Build and preview

Requires Node.js 22 or later, with no package installation or external template download.

```sh
node build.mjs
python3 -m http.server 8766 --bind 127.0.0.1 --directory dist
```

The generated `dist/` folder is not committed. Netlify runs `node build.mjs` itself. Non-production builds receive noindex metadata and headers, and a robots exclusion file. Production builds use the real domain's canonical address and permit indexing of the homepage. The thank-you page and teaser document stay excluded.

To verify the production build locally:

```sh
CONTEXT=production node build.mjs
```

Netlify publishes only after the build succeeds; a failed preview leaves the live website in place. To undo a published change, make a new pull request reverting the change, review it and publish it through the same process.
