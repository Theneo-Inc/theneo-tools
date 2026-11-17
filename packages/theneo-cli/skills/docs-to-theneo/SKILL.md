---
name: docs-to-theneo
description: Convert documentation from another platform or format (GitBook, Mintlify, Docusaurus, MkDocs, ReadMe, Confluence or HTML exports, plain Markdown) into a Theneo CLI project folder that looks polished. Use when asked to convert, migrate, import or move existing docs to Theneo, when started by `theneo migrate`, or to write a converter script for a docs repo. Covers the Theneo folder structure, how to organize tabs and sections, the MDX widgets and when to use each, what Theneo changes on import, local validation, and the optional preview and import afterwards.
---

# Converting docs to Theneo

This skill is the method for turning existing documentation into a Theneo project that
its owner is happy to publish. The docs in the folder you are working in belong to the
user. Your job is to produce a Theneo version of them in a new folder and leave the
originals untouched.

The method comes from a real migration: an 86-page GitBook manual with 473 images,
converted, previewed and imported with the Theneo CLI in November 2026. Statements marked
**(verified)** were observed in that run. Anything marked **(not exercised)** is correct
to the best of our knowledge but was not tested there, so test it before relying on it,
and say so in your report.

## What you produce

| Folder | Contents |
|---|---|
| `converted_for_theneo/` | The Theneo project, and nothing else. This is the folder that gets previewed and imported, and Theneo uploads every file inside it. |
| `theneo_migration/` | Your converter script, `overrides/`, `redirects.csv` and `REPORT.md`. |

Use these names unless the user or the prompt gives others. The conversion is done when
`theneo audit --dir converted_for_theneo` reports 0 errors, the bundled validator prints
"no problems", and `REPORT.md` is written. Then ask the user which Theneo project the
docs should go into and show them a preview there (see "After conversion"). Nothing is
imported or published without the user's yes.

Run the CLI as `theneo`. If that command is not found, use `npx -y @theneo/cli` instead,
or the exact command the user's prompt gives.

## Ground rules

1. **Never change the source.** Do not edit, move or delete any file that was in the
   folder when you started. Write only inside `converted_for_theneo/` and
   `theneo_migration/`. Leave those two folders, hidden folders and `node_modules` out of
   your inventory.
2. **Convert with a script, not by hand.** A script applies the same rule to every page,
   can be re-run when the docs change, and can be fixed in one place. Write it in Node or
   Python, whichever is installed (Node always is when the Theneo CLI runs). Hand work
   goes in a small `overrides/` folder that the script applies on every run. For a
   handful of pages with no special syntax, converting by hand is fine: say so in the
   report.
3. **Theneo decides what is correct, not you.** Run `theneo audit` and the bundled
   validator after every run of the script. Three of the worst bugs in the source
   migration (doubled titles, broken cross-tab links, changed slugs) were invisible on
   disk and only showed up in a preview or an export, which is why the rules in "Rules
   that bite" matter even when the audit passes.
4. **Lose nothing.** Count pages, images, callouts, tables and links in the source and in
   the output. The numbers must match or you must be able to explain the difference.
5. **Improve presentation, not meaning.** Do not rewrite the wording. Fix only clear
   defects (a leftover placeholder, a link whose text is a file name) and log every one in
   the report so the user can review it.
6. **Ask before anything that touches Theneo.** Send nothing to Theneo until the user
   has named the project. A preview goes to a temporary branch and leaves the project's
   content alone, so run it once they have. `theneo import` replaces the project's
   content: run it only after the user says yes to exactly that, and export a backup
   first. Never publish and never pass `--publish` unless the user asked for it.
7. **Leave credentials alone.** The CLI keeps its token in `~/.config/theneo/config`. Do
   not read it. If the CLI is not signed in, ask the user to run `theneo login`.

## Theneo project structure

A Theneo CLI project is a folder. `theneo.json` at the root describes the navigation.
Every sidebar entry is a folder that holds exactly two files.

```plaintext
converted_for_theneo/
├── theneo.json                  navigation, tabs, project name
├── overview/                    a top-level page (first one = landing page)
│   ├── index.md
│   └── section.json
├── getting-started/             a sidebar group (header only, no content of its own)
│   ├── index.md                 holds only the tab marker
│   ├── section.json
│   ├── install-the-app/         a page inside the group
│   │   ├── index.md
│   │   └── section.json
│   └── status-page/             an external link still needs its folder
│       ├── index.md
│       └── section.json
└── api-guides/
    └── ...
```

### theneo.json

```json
{
  "id": "",
  "name": "Acme Docs",
  "baseUrl": "",
  "lastExport": null,
  "isSinglePage": false,
  "sections": [
    { "name": "Overview", "slug": "overview", "children": [], "icon": null,
      "isHeader": false, "externalPageLink": "", "isNewTab": false },
    { "name": "Getting Started", "slug": "getting-started", "icon": null,
      "isHeader": true, "externalPageLink": "", "isNewTab": false,
      "children": [
        { "name": "Install the App", "slug": "getting-started/install-the-app",
          "children": [], "icon": null, "isHeader": false,
          "externalPageLink": "", "isNewTab": false },
        { "name": "Status Page", "slug": "getting-started/status-page",
          "children": [], "icon": null, "isHeader": false,
          "externalPageLink": "https://status.acme.com", "isNewTab": true }
      ] }
  ],
  "tabs": [
    { "title": "Guides", "slug": "guides", "sections": ["overview", "getting-started"],
      "iconUrl": "", "svgCode": "<svg ...>...</svg>" }
  ]
}
```

- `id` can stay empty when you import into an existing project with `--project`.
- `sections` is the sidebar in display order. `children` nests pages under a group.
- `isHeader: true` makes a group label with no page of its own.
- `externalPageLink` turns the entry into a link out. Set `isNewTab: true` with it.
- `tabs[].sections` lists **top-level** section slugs only. Children follow their parent.
  Every top-level section belongs to exactly one tab.
- Give every tab exactly one icon: a non-empty `svgCode` with `"iconUrl": ""` as in the
  example, or the reverse. The audit warns (`tab-icon-xor-svg`) when a tab has both or
  neither. With no icon set at hand, write a simple 24x24 stroke SVG yourself and say in
  the report that the icons are placeholders.
- A tab `slug` is yours to choose. Use `theneo_slug(title)` unless there is a reason not
  to, and keep tab slugs unique.

### section.json

Every folder needs one, including group headers and plain prose pages. For a page that
is not an API endpoint use this as is:

```json
{
  "endpoints": { "method": "GET", "path": "" },
  "request": null,
  "responses": [],
  "showBaseUrl": false,
  "showLanguageBox": false,
  "showRequestDescription": true,
  "showResponseDescription": true,
  "errorCodes": [],
  "statusCodes": [],
  "dataExample": [],
  "endpointSummary": []
}
```

### index.md

```markdown
<!-- tab:guides -->

*One-sentence summary of the page, taken from the source page description.*

## First Section

Plain Markdown prose, then widgets where they help.
```

- Line 1 is the tab marker. Its slug must match a tab in `theneo.json`. Put it in every
  `index.md`, including group headers, where it is the only line.
- Do not write a `#` H1. Start with prose or a `##` heading.
- The italic lead line comes from the source page's description. A page with no
  description gets no lead line. Do not write one yourself.

### Rules that bite (verified)

| Rule | What happens if you miss it |
|---|---|
| Theneo prints the section `name` as the page title. `index.md` must have no H1. | The title shows twice on every page. |
| In `theneo.json`, a nested section's `slug` is its full folder path (`group/page`), not just the last folder name. | `theneo audit` fails with `orphan-declared-missing`. |
| On import Theneo ignores your slugs and derives each one from the section name: `&` becomes ` and `, lowercase, every run of non-alphanumeric characters becomes `-`, leading and trailing `-` removed. | Folder names that follow a different rule get renamed, and every internal link to them breaks. |
| Two sections with the same name anywhere in the project get `-1`, `-2` added, in sidebar order. The first keeps the plain slug. | Same as above, plus ugly URLs such as `open-and-close-polls-1`. Unique page names avoid it. |
| The first tab is served at the site root (`/group/page`). Every other tab is served under its slug (`/tab-slug/group/page`). | A link with the wrong prefix does not 404. It silently shows the landing page. |
| Import replaces the project's content with the folder's content. | Sections that existed only in Theneo are gone. Export a backup first. |
| Markdown images (`![]()`) are turned into Image widgets by Theneo. | You lose control of size. Emit `<Image>` yourself with real dimensions. |
| `theneo audit` warns `mdx-nesting-depth` for any widget inside another, such as an Image inside a Step or a CodeBlock inside Tabs. | For an Image inside a Step, nothing: it renders correctly. Other one-level nesting is expected to work but was **(not exercised)**, so list it in the report. Never nest three widgets deep (Tabs inside a Step): flatten instead. |
| Clicking an internal link inside a `theneo preview` drops the `previewToken`. | You land on a sign-in page. Open each page by its full URL with the token. Published docs are not affected. |

So: name folders with Theneo's slug rule from the start, and build every internal link
from the real served URL. What follows from these rules:

- A nested page is served at `parent-slug/child-slug`, under the tab prefix if its tab
  is not the first.
- Source folder names survive only where they happen to equal the slug of the sidebar
  label. A group labelled "Installation" in a folder named `install` becomes
  `installation/`. Expect URLs to change and record every one in `redirects.csv`.
- The landing page is served at its own slug (`/overview`). The site root showed it too
  in the source migration, so map the old home URL to `/`. Whether a redirect is needed
  there was **(not exercised)**.

```python
def theneo_slug(name: str) -> str:
    text = name.replace("&", " and ").lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")
```

```js
const theneoSlug = name =>
  name.replace(/&/g, ' and ').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
```

## How to structure the docs

Keep the existing information architecture unless it is clearly broken. Its readers
know it, and matching paths keeps redirects simple. Within that:

- **Tabs.** If the source has tabs, keep them. If it has one sidebar and fewer than
  about 15 pages, use one tab. A flat source sidebar with a dozen top-level groups
  becomes 3 to 5 tabs, grouped by audience or task (for example Guides, API Reference,
  Checklists, Reference), by bundling neighbouring groups and keeping the source order.
  Put the tab most readers need first, because it owns the root URL and the landing
  page. A project with no `tabs` at all passes the audit but was **(not exercised)**, so
  always write at least one.
- **A tab with one group of the same name** (tab "Reference" holding only the group
  "Reference") gives URLs such as `/reference/reference/errors`. Keep the source
  structure, and suggest flattening it in the report.
- **Landing page.** The first section of the first tab, and it must be a page, not a
  group header. If the source's home page sits inside a group (common in Mintlify, where
  `index` is the first page of the first group), lift it out to be the first top-level
  section and log the move. It is the first thing a reader sees, so it gets the most
  care (see "Making it look good").
- **Groups.** A sidebar group is a header (`isHeader: true`) with pages under it. Two
  levels (group, page) reads best. Deeper nesting works by nesting folders but makes the
  sidebar hard to scan.
- **Names.** Section names become the sidebar label, the page title and the URL. Keep
  them short, in the source's own wording, and unique across the whole project.
- **One page per source page.** Do not merge or split pages during a migration. It
  breaks redirects and makes the user's review harder. Suggest it in the report instead.
- **Inside a page.** Lead line, then `##` sections, `###` subsections. Prose stays
  prose. Widgets carry the structured parts: procedures, alternatives, warnings,
  reference data.

## MDX widgets

Markdown works between widgets. Inside a widget, write HTML. All widgets below are
**(verified)** in the rendered site except CodeBlock **(not exercised)**. If the Theneo
MCP connector is available, `theneo_get_widget_format` returns the canonical syntax for
any widget type.

**Steps** for anything done in order. Screenshots go inside the step they illustrate.

```
<Steps attributes='{"style":{"width":"100%","minWidth":"100%"}}'>
<Step stepNumber="1" title=""><p>Open the access door</p></Step>
<Step stepNumber="2" title="Clean the scanner"><p>Wipe both glass strips.</p>
<Image url="..." alt="..." caption="" attributes='...'/></Step>
</Steps>
```

**Callout** for notes and warnings. `dataType` is `info`, `success`, `warning` or `error`.

```
<Callout attributes='{"isFitToPage":true,"dataType":"warning","style":{"width":"100%","minWidth":"100%"}}'>
<p>Do not remove the USB drive while the export is running.</p>
</Callout>
```

**Tabs** for parallel alternatives. Each `tabTitle` must equal an entry in `tabs`.

```
<Tabs attributes='{"style":{"width":"100%"},"isFitToPage":true,"tabs":["macOS","Windows"]}'>
<TabPanel tabTitle="macOS">
<p>Open Terminal.</p>
</TabPanel>
<TabPanel tabTitle="Windows">
<p>Open PowerShell.</p>
</TabPanel>
</Tabs>
```

**CardGroup** for 2 to 4 parallel items or link tiles. Four cards make a 2x2 grid. Split
larger sets into several groups. `svgCode` in the card's attributes shows an icon.

```
<CardGroup attributes='{"isFitToPage":true,"style":{"width":"100%","minWidth":"540px"}}'>
<Card attributes='{"isFitToPage":false,"style":{},"svgCode":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\">...</svg>"}'>
  <title>Email Support</title>
  <description><p><a href="mailto:help@acme.com">help@acme.com</a></p></description>
</Card>
</CardGroup>
```

**Accordion** for long reference material the reader scans by title.

```
<Accordion attributes='{"style":{"width":"100%"}}'>
<AccordionItem title="Card Backward" iconUrl=""><p><strong class="slate-bold">What to do</strong></p><p>Flip the card and reinsert it.</p></AccordionItem>
<AccordionItem title="Card Not Recognized" iconUrl=""><p>Try a different card.</p></AccordionItem>
</Accordion>
```

**Table** for short, regular data. Each header needs a unique id.

```
<Table style="width:100%;min-width:100%" colSizes='["initial", "initial"]' isHeaderAdded='true' tableHeader='[{"id":"4b48d8a3-9516-52d9-9ca8-0be9d29ae547","title":"Attribute"},{"id":"e717dfe9-3449-5760-9b9e-db5802746267","title":"Requirement"}]'>
  <table-row>
    <table-cell>Protocol</table-cell>
    <table-cell>3.0 minimum</table-cell>
  </table-row>
</Table>
```

**Image** with the real width and height.

```
<Image url="https://cdn.acme.com/docs/printer-tab.png" alt="Printer tab with the Load Paper button" caption="" attributes='{"isFitToPage":false,"style":{"style":{"width":"100%"},"isFitToPage":true,"width":"658px","height":"370px","aspectRatio":"658 / 370"},"width":"658px","height":"370px"}'/>
```

**CodeBlock** for code, usually inside Tabs when there are several languages.

```
<CodeBlock attributes='{"isFitToPage":true,"style":{},"lang":"bash","label":"Bash"}'>
  <CodeLine>curl https://api.acme.com/v1/customers</CodeLine>
</CodeBlock>
```

CodeBlock rules, all **(not exercised)**, so say in the report that code blocks need a
look in a preview:

- One `<CodeLine>` per source line, with leading spaces kept. An empty line is
  `<CodeLine></CodeLine>`.
- Inside `<CodeLine>` escape only `&`, `<` and `>`. Leave braces, quotes, `*` and `_`
  as they are.
- `lang` is the fence language. `label` is the fence title if it has one (Mintlify
  ` ```bash npm `, Docusaurus `title="..."`), otherwise the language name.
- A code group at the top level is CodeBlocks inside `Tabs`, one panel per block. A code
  group inside a Step is consecutive CodeBlocks with distinct labels, because Tabs
  inside a Step nests three deep.

`Video`, `Divider` and `MermaidDiagram` are also Theneo widgets and pass the audit and
the validator, but their syntax is not documented here. Use them only with the syntax
from `theneo_get_widget_format`.

### Writing inside widgets

- Use HTML: `<p>`, `<strong class="slate-bold">`, `<em>`, `<code>`, `<a href>`, `<ul>`,
  `<ol>`, `<li>`, `<br>`. Do not rely on Markdown being parsed inside a widget. Keep two
  inline renderers in the script, one that emits Markdown for top-level prose and one
  that emits HTML for widget content.
- Escape text: `&`, `<`, `>` as entities, and literal `*`, `_` and backticks as `&#42;`,
  `&#95;`, `&#96;`.
- A literal `{` or `}` inside a widget is written `&#123;` and `&#125;` **(not
  exercised)**. Top-level prose whose inline code holds `<`, `{` or `}` (such as
  `Bearer <key>` or `/shipments/{id}`) is emitted as an HTML paragraph instead of
  Markdown: `<p>Call <code>/shipments/&#123;id&#125;</code>.</p>`. List these paragraphs
  in the report.
- `attributes='...'` and `tableHeader='...'` are single-quoted JSON. An apostrophe inside
  ends the attribute, so write it as `&#39;`.
- In `title="..."` escape `&`, `<`, `>` and `"` (as `&quot;`). Leave `_` as it is.
- No blank lines inside a widget. Join its children with single newlines. A blank line
  between AccordionItems broke the accordion **(verified)**.
- Generate table header ids deterministically (for example a UUID5 of page path plus
  column title) so a re-run produces an identical file.
- A Step `title` holds the source step's own title or bold lead-in. A step that is one
  plain sentence keeps `title=""` and puts the sentence in the body.
- Callouts have no title attribute. An admonition title (`:::info Good to know`) becomes
  a bold first paragraph: `<p><strong class="slate-bold">Good to know</strong></p>`.
- A card has no link attribute. A link card carries its link inside `<description>`, as
  in the CardGroup example.
- Copy the Image `attributes` shape exactly as shown, including the nested `style`, and
  put the real (capped) width and height in each place they appear. It is the shape
  that was verified in the rendered site.

## From source construct to widget

| In the source | In Theneo |
|---|---|
| Hint, admonition, note, tip, info | `Callout` info. Success and check map to success, warning and caution to warning, danger and error to error. The printed label of the source (TIP, NOTE) is not kept. |
| Numbered procedure, task checklist, stepper | `Steps` |
| A list of named phases, each with sub-steps (`1. **Setup**:`) | A `###` heading per phase, each followed by its own `Steps` |
| Content tabs | `Tabs` |
| Code block | `CodeBlock` |
| Code group | CodeBlocks inside `Tabs` at the top level, consecutive labelled CodeBlocks inside a Step |
| Expandable, details, accordion | `Accordion` |
| Card grid, link cards | `CardGroup`, with each card's link inside its description. Icon names from another icon set are replaced with Lucide SVGs. |
| Table with short cells | `Table` |
| Table with long cells, such as error, cause, fix (any cell over about 60 characters or holding more than one sentence) | `Accordion`, one item per row, titled by the first column, with the other column headings as bold labels and category rows as headings |
| Figure or image, with or without caption | `Image` |
| Include, snippet, reusable block, variable | Inlined at the point of use, and counted once per use |
| Component imports (`import Tabs from '@theme/Tabs'`) | Dropped |
| Page description in front matter | Italic lead line. No description, no lead line. |
| Numbered list under a "Warning" heading | One warning `Callout`, not Steps |
| Footnote paragraph after a table | Info `Callout` right after it |
| Link to another page that shows a file name | Link whose text is the target page or heading title |
| Link to another doc site of the same company | Absolute URL on their live site, from a map in the script |
| Video or iframe embed | No tested mapping. Check `theneo_get_widget_format`, otherwise keep a plain link and list it in the report. **(not exercised)** |
| API reference pages generated from OpenAPI or Postman | Do not convert them and do not copy the spec into `converted_for_theneo/`. List each spec file in the report with the command the user can run later: `theneo project import --file openapi.yml --project <slug> --import-type <type>`. Read `--help` first. **(not exercised)** |

Where the navigation and the custom syntax live, by platform. Only the GitBook row was
exercised. Treat the rest as a starting point and trust your own inventory over it.

| Source | Navigation | Syntax to expect |
|---|---|---|
| GitBook | `SUMMARY.md`, `.gitbook.yaml`, assets in `.gitbook/assets` | `{% hint %}`, `{% tabs %}`, `{% stepper %}`, `{% code %}`, `{% include %}`, `{% embed %}`, `{% content-ref %}`, `<figure>`, `<details>`, `<table data-view="cards">`, `"mention"` links |
| Mintlify | `docs.json` (older: `mint.json`) | `<Note>`, `<Warning>`, `<Tip>`, `<Steps>`, `<Tabs>`, `<CodeGroup>`, `<AccordionGroup>`, `<CardGroup>`, `<Frame>`, snippet imports |
| Docusaurus | `sidebars.js`, `_category_.json`, `sidebar_position` | `:::note` blocks, `<Tabs>` and `<TabItem>`, `<details>`, MDX imports |
| MkDocs Material | `nav:` in `mkdocs.yml` | `!!! note`, `??? note`, `=== "Tab"`, `--8<--` snippets |
| ReadMe | Category folders and order files or front matter | `> 📘` callouts, `[block:...]` JSON blocks |
| Confluence or HTML export | Page tree, `index.html` | `ac:structured-macro` (info, note, warning, expand, code), HTML tables |

Notes from trial conversions of small Mintlify and Docusaurus samples. These produced
projects that pass the audit and the validator but were not previewed:

- **Mintlify.** Pages are `.mdx`. Navigation is `navigation.tabs[].groups[].pages[]` in
  `docs.json`, and page ids are paths without the extension. The section name is the
  front matter `title`. Links are root-relative page ids (`/guides/create-shipment`),
  and `index` is `/`. Snippets are `import X from '/snippets/x.mdx'` plus `<X />`.
  `<Frame caption>` wraps an `<img>` and becomes one Image with that caption. Also
  expect `<Info>`, `<Check>`, `<Danger>`, `cols={2}` on card groups, and Font Awesome
  icon names on cards.
- **Docusaurus.** Read the site title, `url` and `routeBasePath` from
  `docusaurus.config.*`: together they give the old URLs. The section name is
  `sidebar_label`, else the front matter `title`, else the H1. Front matter `slug` and
  `id` change the old URL, not the Theneo one. Site-absolute image paths (`/img/x.png`)
  live in `static/img/x.png`. Links point at files with anchors
  (`./configuration.md#deploy`). Admonitions can carry a title (`:::info Good to know`)
  and code fences a `title="..."`.

## Workflow

### 1. Find and pin the source

Locate the folder that holds the navigation file. If the docs are published, open three
or four pages on the live site and confirm they match the repo, since repos often hold
several versions or spaces. If you cannot tell which version or space to convert, ask the
user. Record the repo URL, branch and commit in the report. If the folder is not a git
repo or the site cannot be reached, say that in the report and carry on.

### 2. Inventory before writing code

List every construct the source uses, with counts. These numbers are the acceptance test.
Point `SRC` at the folder that holds the pages, not the repo root, or add
`--exclude-dir` for hidden folders (the skill's own examples live in one),
`node_modules`, `converted_for_theneo` and `theneo_migration`.

```bash
grep -rhoE '\{% *[a-z-]+' SRC --include='*.md*' | sort | uniq -c | sort -rn
```

```bash
grep -rhoE '<[A-Za-z][A-Za-z0-9-]*' SRC --include='*.md*' | sort | uniq -c | sort -rn
```

```bash
grep -rhoE '^(:::|!!!|\?\?\?|===) *[a-z"]*' SRC --include='*.md*' | sort | uniq -c
```

The third command counts closing `:::` fences as well as opening ones. None of the three
catch Markdown images, tables, code fences or `import` lines, so count those too, along
with: pages in the navigation, pages on disk that are not in the navigation, images and
every way they are written, internal links, links to the company's other sites, front
matter fields, includes, and the size of the assets folder.

### 3. Plan the structure

Decide tabs, groups and page names (see "How to structure the docs"). Compute every slug
with `theneo_slug` and de-duplicate across the whole project before writing any file.

### 4. Write the converter

- Three stages: read the navigation into a page tree, parse each page into blocks
  (heading, paragraph, list, figure, table, hint, code, tabs), render blocks to Theneo
  MDX. Do not regex-replace over raw text. The same list is `Steps` at the top level and
  a plain `<ol>` inside a callout, and only a block model knows the difference.
- Resolve includes and variables first, then parse.
- Fail loudly on anything unrecognized. A construct that passes through silently is a
  bug a reader finds on the published site.
- Put project-specific values in constants at the top: asset base URL, tab layout, map of
  cross-site links, copy fixes.
- Apply `overrides/<section path>/index.md` on top of generated pages. The path is the
  Theneo section path. An override replaces the whole body of that page, and the script
  still adds the tab marker. In overrides, write internal links as placeholders such as
  `@/group/page` (a section path) and let the script turn them into real URLs, so they
  survive a slug or tab change. An override does not follow later changes to the source
  page, so keep overrides to the landing page and a few hubs.
- Keep the script and `overrides/` in `theneo_migration/`. Only the Theneo project goes
  in `converted_for_theneo/`.
- Refuse to overwrite an output folder that is not empty and has no `theneo.json`.
- Also write `theneo_migration/redirects.csv` with the columns
  `old_path,theneo_path,changed` for every page. Both paths start with `/` and carry no
  domain. `changed` is `yes` or `no`.

### 5. Check locally

Run both checks after every run of the script and fix the script, not the output, until
the audit has 0 errors and the validator prints "no problems" (see "Validation").

```bash
theneo audit --dir converted_for_theneo
```

```bash
node <this skill's folder>/scripts/validate.mjs converted_for_theneo
```

### 6. Polish what people see first

Hand-write the landing page and the few hub pages as overrides (see "Making it look
good"). Generated pages cover the rest. Re-run the script and both checks.

Polish rearranges what is there. It does not add content. On a small source the landing
page may gain one CardGroup that links to existing pages, using their existing names,
and nothing more. List every added or rearranged element in the report and leave it out
of the counts.

### 7. Report

Write `theneo_migration/REPORT.md` and give the user a short summary of it:

- the source: platform, folder, and repo URL, branch and commit if it is a git repo;
- counts in and out for pages, images, callouts, tables and tabs, with every difference
  explained;
- the tab and group structure you chose, and the mapping from source constructs to
  widgets;
- every content change you made, for review;
- everything you could not convert or verify: API specs left for
  `theneo project import`, embeds kept as links, anything marked **(not exercised)**
  that you relied on, and image hosting;
- how to re-run the converter;
- the commands for audit, preview and import.

If you cannot write the file, give the full report in your final message instead.

### 8. Ask where it goes

The conversion is finished. Now ask the user which Theneo project the docs should go
into, and follow "After conversion". If there is no one to ask (a run with no user
present), stop here.

## After conversion

This part needs `theneo login` and a Theneo project. It was **(not exercised)** as a
whole, so read the CLI's output at each step and tell the user what it said.

1. **Ask which project.** Ask the user which Theneo project the converted docs should go
   into, and offer to stop here instead. `theneo project list --json` gives the projects
   to choose from, with each one's slug (`key`) and workspace. If the CLI is not signed
   in, ask the user to run `theneo login` and wait. Do not pick a project yourself, even
   when there is only one. If they have no project yet, they create one in Theneo first.
2. **Try a preview first.** Run `theneo preview` for that project (see "Commands"). It
   imports the folder into a temporary branch and returns a link that expires. The
   project's own content and the published docs do not change. When it works, give the
   user the preview link and its expiry, and open real pages yourself if you can: the
   landing page, one page per widget type, one page in a non-first tab, and a cross-tab
   link. Fix the script, not the output, and run the preview again. Then stop: publishing
   the preview branch (`theneo branch publish`) or importing is the user's decision.
3. **If preview is not available, ask before importing.** Preview needs the document
   review feature, which is not enabled for every workspace. If `theneo preview` fails
   and the error is not about the folder, the project name or signing in, do not retry
   it. Quote the error to the user, say that preview is not available for that project,
   and ask: "Do you want me to import the converted docs into `<project>` instead? This
   replaces the content in that project's editor. It does not publish." Import only on a
   clear yes. On a no, stop and leave the commands in the report.
4. **Import.** Back up with `theneo export` into a new folder first, then run
   `theneo import` without `--publish`.
5. **Verify from Theneo's side.** Export again into a fresh folder and compare with what
   you sent: section count, every slug, tab membership, the count of each widget, and the
   validator run against the export. Any difference means Theneo changed something. Teach
   the script the rule, re-run and re-import until they match.
6. **Go-live tasks** stay with the user: image hosting, custom domain, redirects from
   `redirects.csv`, and publishing.

## Making it look good

- **Landing page.** Contact details as cards with icons. The product or section overview
  as a CardGroup that links into the docs. Parallel things (products, plans, platforms)
  as Tabs. A short "how to use these docs" as Steps with links to each stage.
- **Procedures.** Always Steps, with each screenshot inside its step. This one change
  does more for the look of a manual than anything else.
- **Dense tables.** If cells hold sentences, turn rows into Accordion items. Carry
  repeated values forward: a cell that says "Same as above" gets the real value.
- **Options.** Two to four parallel choices become a CardGroup.
- **Warnings.** Anything the source calls a warning becomes a Callout, even when it was
  written as a list or a bold paragraph.
- **Icons.** Inline Lucide SVGs with `stroke="currentColor"` follow the theme in cards
  and in tab icons.
- **Restraint.** Keep every callout the source has, but do not add more than one new
  one per section. Do not wrap ordinary prose in widgets. A page that is all widgets is
  as hard to read as a page with none.
- **Consistency.** The same source construct maps to the same widget everywhere.

## Links, slugs and redirects

- Compute each page's served URL: section path, prefixed with the tab slug unless the
  page is in the first tab. Build every internal link as a relative path between two
  served URLs. Relative links keep working across the preview, the theneo.io address and
  a custom domain, which all have different base paths.
- A relative link is resolved from the page's parent path: from `installation/setup`,
  the page `installation/requirements` is `requirements` and `using/commands` is
  `../using/commands`. The validator resolves links the same way.
- Heading anchors were carried over unchanged and not checked on the rendered site.
  Spot-check a few.
- Replace link text that is a file name or a raw path with the target's title.
- `redirects.csv` lists every old path and its new path, with a `changed` column (see
  workflow step 4).

## Images

- Read width and height from the file itself (PNG header, JPEG SOF marker) and apply
  EXIF orientation, or phone photos come out sideways with the wrong aspect ratio.
- Honour a width the source sets. Otherwise cap at the content width (658px was used).
  Show several images in one paragraph at a smaller width (375px).
- Find every way the source writes an image. The source migration had three (`<figure>`,
  `<div align>` wrappers, and paragraphs of Markdown images) and the third was only
  caught because the export had nine more images than the script had counted.
- Where the image file lives. How Theneo treats image files placed inside an imported
  folder is not confirmed **(not exercised)**, so until it is:
  - If the image has a stable public URL (the live docs site, a CDN, or the raw file URL
    of a public repo), use that URL in `<Image url>` and check it returns 200. This is
    the only arrangement that was verified.
  - If it has none (or the site URL is a placeholder, or you have no network), copy
    the file to `converted_for_theneo/assets/`, keeping its path below the source's
    image root (`static/img/a.png` becomes `assets/img/a.png`). In `<Image url>` use
    the path from the page's folder on disk to the file (`../../assets/img/a.png` for a
    page two folders deep). List these images in the report under "image hosting not
    verified". `assets/` is the one thing besides sections allowed in the project
    folder. The audit ignores it, and the validator checks that each file exists.
  - Either way, name image hosting in the report as a task to settle before go-live.
- Keep the alt text. Captions go in `caption`.

## Validation

`theneo audit` checks structure. `scripts/validate.mjs`, next to this file, checks
content. It needs only Node:

```bash
node <this skill's folder>/scripts/validate.mjs converted_for_theneo theneo_migration/image-urls.txt
```

It prints one line per problem or "no problems". The optional second argument receives
every unique `http(s)` image URL, one per line, for the HTTP check. It covers the first
five checks below and the existence of copied image files. The HTTP check and the counts
are yours to add to the converter.

- Every internal link resolves to a real section, using tab-aware URLs.
- No `index.md` has an H1.
- No source syntax is left: template tags, admonition fences, unresolved placeholders,
  raw braces.
- No Markdown inside HTML paragraphs.
- Only known tags appear.
- Every image URL returns 200, and every copied image file exists.
- Counts in equal counts out for pages, images, callouts, tables and tabs.

## Commands

Verified with CLI 0.24. Run `theneo <command> --help` if an option is refused. Replace
`theneo` with `npx -y @theneo/cli` when the binary is not installed.

Local check, no account needed:

```bash
theneo audit --dir converted_for_theneo
```

The rest need `theneo login` and a project the user has named.

Projects the user can choose from:

```bash
theneo project list --json
```

Temporary preview on an existing project (24 hours by default, `--expiresIn` up to 168).
It prints `previewUrl`, `expiresAt` and the preview branch:

```bash
theneo preview --project <project-slug> --workspace <workspace-slug> --dir converted_for_theneo --json
```

Back up, then import into the editor without publishing. Only after the user said yes
to the import:

```bash
theneo export --project <project-slug> --workspace <workspace-slug> --dir theneo_migration/backup
```

```bash
theneo import --project <project-slug> --workspace <workspace-slug> --dir converted_for_theneo
```

Verify what Theneo stored:

```bash
theneo export --project <project-slug> --workspace <workspace-slug> --dir theneo_migration/verify
```

Publish, only when the user says so:

```bash
theneo project publish --project <project-slug> --workspace <workspace-slug>
```

Other useful commands: `theneo branch publish --branch <branch-id>` to publish a preview
branch and `theneo branch delete --branch <branch-id>` to discard it, `theneo create
--dir <dir> --name <name>` for a new project from a folder, `theneo import --tab <tab-slug>` to update one
tab, `theneo import --branch <branch-id>` to import into a branch.

## Traps from the source migration

| Symptom | Cause | Fix |
|---|---|---|
| Title printed twice | H1 in `index.md` | Drop the source H1 |
| Audit: `orphan-declared-missing` | Child slug without its parent path | Use the full folder path |
| Cross-tab links open the landing page | Missing tab prefix in the URL | Tab-aware URL builder |
| 24 sections renamed after import | Theneo re-derives slugs from names | Use `theneo_slug` and de-duplicate |
| Export had more images than were sent | A third image syntax was missed | Inventory all image syntaxes, compare counts |
| A warnings list rendered as Steps | Rule applied without looking at the heading above | Decide by context in the block model |
| Link text read `some-page.md` | Source "mention" links | Substitute the target title |
| Accordion fell apart | Blank lines between items | Join with single newlines |
| Step text read "Smart Cards and User Roles." | A bare page mention used as a sentence | Add a copy fix and log it in the report |
| Photos had the wrong shape | EXIF rotation ignored | Apply orientation before reading size |
