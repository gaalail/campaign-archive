# Campaign Archive

Live site: https://gaalail.github.io/campaign-archive

## Adding content with the editor (Pages CMS)

1. Go to https://app.pagescms.org and sign in with GitHub, then open `campaign-archive`.
2. The left menu lists Ra Gol'vek, Vyrun, Curse of Strahd, Spells, Items, Character options (Classes, Subclasses, Races, Backgrounds, Feats), Rules, and Monsters. The forms come from `.pages.yml`.
3. Choose a section, click Add, fill in the form, and save. Each save is committed to the repository and the site rebuilds in 2 to 4 minutes.

Every spell, item, character option, and monster has a **Source** field. "SRD 5.1" marks material from the open SRD. Pick "Homebrew" for your own work, or "Corpus Angelus" for material from that book. Anything that isn't SRD shows on that page's Homebrew tab. To add another book or source name, edit the Source list in `.pages.yml`.

## Text format

- The text box is plain Markdown on purpose, so `[[links]]` and dropdowns survive. Headings start with `##`.
- Link to another entry with `[[Entry Name]]`. The name has to match the entry's file name.
- Dropdown (folded until clicked): start a line with `> [!info]- Title`, then put each following line behind `> `. The paste helper builds these for you, and also turns pasted tables into Markdown tables.
- Pictures: most forms have an optional "Picture" field, shown on that section's Gallery tab. To show an image inside the text, upload it in the editor's Media area, then write `!` followed by `[[file-name.png]]`.

## How the site is organized

- Each section's page builds its own tables and tabs from the entries, so you never write lists by hand.
- Spells: tabs for each class, All by level, Search and sort, and Homebrew. A spell needs level, school, and classes filled in to land in the right tab.
- Items: tabs by rarity. Monsters: grouped by creature type. See `content/monsters/Owlbear.md` for the stat block layout.
- Class pages list their own subclasses automatically. A subclass's "Parent class" has to match its class page's name exactly.
- To add a tab, copy a view block in `content/lists/` (for example `spells.base`) and change the name and filter. These files are hidden from the sidebar.

## Class options (invocations, metamagic, and similar choices)

Some class features are choices, not things a class gains automatically. Big lists of them, like Warlock invocations or Sorcerer metamagic, live as separate entries so the class page stays short.

- In the editor, open Character options, then Class options, and add an entry. Pick its Group (like Eldritch Invocation), the Class, the minimum level, and any prerequisite (type None if there isn't one).
- Options can belong to a class or to a subclass: in the form, pick either one under Class or subclass. A subclass page shows its own options the same way a class page does, as the Paragon's Orders do.
- Each class page shows its own options in a table, grouped by type and sorted by level. Only the Warlock, Sorcerer, and Paragon pages and the three Order pages have that table so far. For another class, such as the Artificer, add this line under a heading in its page text: `![[class-options-of.base]]`
- To add a new group name (like Infusion or Maneuver), edit the list under "Group" in `.pages.yml`. To let a new class or subclass own options, add its name to the "Class or subclass" list there too.
- Small choice lists, like Fighting Style and Pact Boon, sit inside their feature's dropdown instead.
- Repeated features, like Ability Score Improvement, appear once with every level listed.
- The Class options tab on the Character options page lists every option from every class.

## SRD content and attribution

Entries marked "SRD 5.1" come from the System Reference Document 5.1 by Wizards of the Coast, released under a Creative Commons license. The required credit is on the page `content/srd-attribution.md` and linked from the footer and the home page. Keep both. The SRD has no Artificer, no Tasha's or Eberron material, and only one subclass per class, so add your own through the editor.

## Things to know

- A free GitHub account needs a public repository for the site to publish. Everything you commit is readable by anyone.
- Dropdowns and spoiler blocks only hide text on screen. The text is still in the page source and in search. Keep real DM secrets out.
- DM-only notes: put them in `content/private/`. That folder is skipped by both the site build and git, so it never leaves your computer.
- The repository must be named `campaign-archive`, or update `baseUrl` in `quartz.config.yaml` and the `output` path under `media` in `.pages.yml`.
- "Backlinks" (pages that link to the current page) appears on entry pages, not on section pages.

## Editing locally instead

Put new files in the `content` folder, then commit and push with GitHub Desktop.
