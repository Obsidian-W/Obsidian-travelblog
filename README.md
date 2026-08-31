This shouldn't really be public, but yeah, that's my travel blog.
If you found it, yay, you can work on it and propose changes.
But don't expect earnings or anything, it's just something I built to help fellow travelers


https://obsidiantravels.netlify.app/

## Photo light and colour audit

The blog includes a conservative batch enhancer for unusually dark or muted
photos. Its default mode is read-only:

```sh
npm run images:audit
```

Create enhanced copies for review without changing the source images:

```sh
npm run images:enhance
```

The copies are written to `site/assets/images/blog-enhanced`. After reviewing
the audit, an in-place run can be requested explicitly; it creates timestamped
backups under `site/assets/images/blog/.enhance-backup` first:

```sh
node site/scripts/enhance-blog-images.mjs --write --in-place
```

Run the script with `--help` to change the input/output folders, caps, JPEG
quality, or save the complete analysis as JSON.
