# Campaign Archive setup

1. Create a free GitHub account, then a new public repository named `campaign-archive`.
2. Install GitHub Desktop (free). Choose File, Add local repository, pick this folder, then Publish repository. (The GitHub website only accepts 100 files per upload, and this project has over 300.)
3. In the repository, open Settings, then Pages, and set Source to "GitHub Actions".
4. In `quartz.config.yaml`, replace `YOUR-USERNAME` in `baseUrl` with your GitHub username.
5. After the first build finishes (Actions tab), the site is at `https://YOUR-USERNAME.github.io/campaign-archive`.

Adding an entry: in GitHub, open the `content` folder, choose Add file, Create new file, paste your text, and commit.
Name spell files the way you want them to read in the tables, for example `Fireball.md` or `Shadow Step.md`.
Copy `content/templates/entry-template.md` for the starting layout.

## Things to know before you add content

- **A free GitHub account needs a public repository for the site to publish.** Everything you commit is readable by anyone, in the repository and on the site.
- **Click-to-reveal spoilers only hide text on screen.** The text is still in the page source and in the site's search. Don't put real DM secrets in them.
- **DM-only notes:** put them in `content/private/`. That folder is skipped by both the site build and git, so it never leaves your computer.
- **"Backlinks"** (the list of pages that link to the current one) appears on entry pages, not on campaign hub pages.
- **Spell files** need level, school, and classes filled in, or they land under "Uncategorized" or miss a class tab. Name each file the way you want the spell to read in the tables.
- The repository must be named `campaign-archive`, or change the name in `baseUrl` in `quartz.config.yaml` to match.
