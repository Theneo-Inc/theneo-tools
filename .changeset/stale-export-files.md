---
"@theneo/cli": patch
---

Export now removes the pages a previous export left behind. Exporting into a directory only ever wrote files, so a page renamed or deleted in Theneo stayed on disk, was picked back up by the next import, and `theneo audit` reported it as a folder nothing declares. Only files an export produces (`index.md`, `section.json`, `theneo.json`) are removed, so a README, assets or a hand-written page in the same directory are left alone, as is a directory that still holds one. Pass `--no-clean` to keep the old behaviour. A `--tab` export covers part of the project, so it never prunes.
