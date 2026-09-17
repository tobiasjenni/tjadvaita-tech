# TJ Advaita website update

The live shared website is maintained in https://github.com/tobiasjenni/tjadvaita-tech. Its CNAME is tjadvaita.tech. The separate julia_page repository is Julia’s other website.

## Integrated applications

- `/yoga-sutras/`: copied from `tobiasjenni/shiva-shakti-sutra-companion` at commit `cbff7d7`; all 196 study entries, source files, attribution and editorial notes retained.
- `/daily-mantra/`: copied from `tobiasjenni/daily-mantra-meditation` at commit `8f77e6c`; original timer and audio logic retained.

Each app is served directly under this site and has return links. These are snapshots: later changes in the original app repositories must be copied here deliberately. Preserve the TJ Advaita return links and canonical metadata when updating.

The timer stores progress per browser origin. Existing progress on github.io is not automatically transferred to tjadvaita.tech. The original apps remain available. The reader remains Sanskrit/English and the timer remains English; the homepage describes these languages explicitly.

## Validation

Run the timer regression suite with `cd daily-mantra && npm test` (Node 20+). No build step is required. Serve the repository root with a static HTTP server for local preview. The host must serve folder index.html files and redirect folder paths without a trailing slash.

Keep the source and editorial notes with the Yoga Sutra collection. In particular, its existing GRETIL attribution and CC BY-NC-SA terms are unchanged; the collection does not have a blanket unrestricted license.
