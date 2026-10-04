# Campaign Archive

Live site: https://gaalail.github.io/campaign-archive

## Adding content with the editor (Pages CMS)

1. Go to https://app.pagescms.org and sign in with GitHub.
2. When asked, install the GitHub App on your account and give it access to the `campaign-archive` repository.
3. Open `campaign-archive`. The left menu lists Ra Gol'vek, Vyrun, Curse of Strahd, Spells, Items, Rules, and Character options (set up in `.pages.yml`).
4. Choose a section, click Add, fill in the form, and save. Each save is committed to the repository and the site rebuilds in 2 to 4 minutes.

Notes:
- The text box is plain Markdown on purpose, so `[[links]]` and spoiler blocks survive. Pasting from Word gives plain text; add headings with `##`.
- Link to another entry with its name: `[[Shadow Step]]`. The name has to match the entry's file name (a title typed as "Shadow Step" is saved as `shadow-step`, which works). A link written with a different title than the file name will be broken.
- Spoiler block (click to reveal): start a line with `> [!spoiler]- Title`, then put the hidden text on the lines after it, each starting with `> `.
- Each campaign page lists its entries in tables on its own. Don't write the list by hand.
- Class and school lists in the spell form come from `.pages.yml`. Edit them there.
- Images go in the media folder through the editor. The upload path in `.pages.yml` assumes the repository is named `campaign-archive`.

## Things to know

- A free GitHub account needs a public repository for the site to publish. Everything you commit is readable by anyone.
- Spoiler blocks only hide text on screen. The text is still in the page source and in search. Keep real DM secrets out.
- DM-only notes: put them in `content/private/`. That folder is skipped by both the site build and git, so it never leaves your computer.
- Spell files need level, school, and classes filled in, or they land under "Uncategorized" or miss a class tab. Add a class tab by copying a view block in `content/lists/spells.base`.
- The list files in `content/lists/` build the tables. You normally never need to open them.
- "Backlinks" (pages that link to the current page) appears on entry pages, not on campaign hub pages.

## Editing locally instead

Put new files in the `content` folder, then commit and push with GitHub Desktop.
