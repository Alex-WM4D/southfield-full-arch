# Uploading this source to GitHub

Target repository: `https://github.com/Alex-WM4D/southfield-full-arch-v2`.

This October 26, 2026 export contains the latest approved per-arch prices: $14,990 PMMA and $17,990 zirconia, with a computed $3,000 upgrade. TypeScript, production build, and all eight browser regression tests passed. The portable development tooling was also patched to Vite 7.3.7; `npm audit` reported no known vulnerabilities at export time.

## Allow Manus to finish the upload

The current GitHub connection returned HTTP 403 when pushing this repository. Reconnect or update the Manus GitHub authorization so it can write repository contents in `Alex-WM4D/southfield-full-arch-v2`. If the GitHub app uses selected-repository access, include this new repository. The account being an administrator does not by itself grant the app permission to write.

Once access is fixed, ask Manus to push the prepared source. Do not provide access tokens in chat.

## Upload it yourself in GitHub

1. Extract the source ZIP on your computer.
2. Open the target GitHub repository. If it is still empty, select **uploading an existing file**. If it already has files, use **Add file → Upload files** and review for conflicts before replacing anything.
3. Open the extracted `southfield-full-arch-v2` folder. Upload its contents, not the enclosing folder or ZIP. The root should contain `package.json`, `package-lock.json`, `vite.config.ts`, `netlify.toml`, and the `client`, `docs`, `scripts`, and `tests` folders.
4. Commit the upload to `main` with a message such as “Import approved Southfield Full Arch landing page.”

Keep `.gitignore`, `.prettierrc`, and `.prettierignore` when uploading. Some file pickers hide files beginning with a dot; using Git locally avoids that problem. Never upload `.env` files, credentials, `node_modules`, build output, or test reports.

## Or upload using Git locally

Use this only if the target repository is still empty. Run these commands inside the extracted folder with your own configured Git identity and authenticated GitHub access:

```bash
git init -b main
git add .
git commit -m "Import approved Southfield Full Arch landing page"
git remote add origin https://github.com/Alex-WM4D/southfield-full-arch-v2.git
git push -u origin main
```

If GitHub already has commits, clone it first, transfer the approved files into that clone, review the differences, and make a normal commit. Do not force-push or overwrite the earlier `southfield-full-arch` repository.

## Hosting and future edits

GitHub stores source. This upload alone does not publish a new site; use the supplied Netlify settings when connecting hosting. For routine edits, follow `UPDATING-THE-SITE.md`. Campaign prices are controlled by `client/src/lib/offerPricing.ts`; page metadata in `client/index.html` is updated separately.

The appointment popup still has no delivery backend. It must retain its “No request has been sent” warning until an approved server-side CRM/form adapter is connected. The call CTA remains available.
