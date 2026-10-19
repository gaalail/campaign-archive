function normalizeCategory(value) {
  const normalized = String(value).trim().toLocaleLowerCase("en-US")
  if (normalized === "staves") return "staff"
  return normalized.endsWith("s") ? normalized.slice(0, -1) : normalized
}

export function validateCountTable(markdown, entries, options) {
  const lines = markdown.split(/\r?\n/)
  let headerIndex = -1
  let categoryIndex = -1
  let countIndex = -1

  for (let index = 0; index < lines.length; index++) {
    const cells = lines[index]
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().toLocaleLowerCase("en-US"))
    const category = cells.indexOf(options.categoryHeader.toLocaleLowerCase("en-US"))
    const count = cells.indexOf(options.countHeader.toLocaleLowerCase("en-US"))
    if (category !== -1 && count !== -1) {
      headerIndex = index
      categoryIndex = category
      countIndex = count
      break
    }
  }

  if (headerIndex === -1) {
    return {
      errors: [
        `Count table with "${options.categoryHeader}" and "${options.countHeader}" columns not found`,
      ],
      categories: [],
      displayedTotal: 0,
      metadataTotal: 0,
    }
  }

  const expected = new Map()
  const errors = []
  for (let index = headerIndex + 1; index < lines.length; index++) {
    const line = lines[index].trim()
    if (!line.startsWith("|")) break
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim())
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue
    const category = cells[categoryIndex]
    const count = cells[countIndex]
    if (!category || !/^\d+$/.test(count ?? "")) {
      errors.push(`Invalid count row: ${line}`)
      continue
    }
    const key = options.categoryKey ? options.categoryKey(category) : normalizeCategory(category)
    if (expected.has(key)) {
      errors.push(`Duplicate count category "${category}"`)
      continue
    }
    expected.set(key, { label: category, count: Number(count) })
  }

  const actual = new Map()
  for (const entry of entries) {
    const key = options.entryCategory(entry)
    if (key === undefined || key === null || key === "") continue
    const normalized = options.categoryKey ? options.categoryKey(key) : normalizeCategory(key)
    actual.set(normalized, (actual.get(normalized) ?? 0) + 1)
  }

  for (const [key, { label, count }] of expected) {
    const actualCount = actual.get(key) ?? 0
    if (actualCount !== count) {
      errors.push(`"${label}" displays ${count}, but metadata contains ${actualCount}`)
    }
  }
  for (const key of actual.keys()) {
    if (!expected.has(key)) {
      errors.push(`Metadata category "${key}" is missing from the count table`)
    }
  }

  return {
    errors,
    categories: [...expected.keys()],
    displayedTotal: [...expected.values()].reduce((total, category) => total + category.count, 0),
    metadataTotal: [...actual.values()].reduce((total, count) => total + count, 0),
  }
}

export function validateSpellCounts(markdown, spells) {
  const levelByLabel = new Map([
    ["cantrips", "0"],
    ...Array.from({ length: 9 }, (_, index) => [
      `${["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"][index]}-level`,
      String(index + 1),
    ]),
  ])
  const result = validateCountTable(markdown, spells, {
    categoryHeader: "Level",
    countHeader: "Count",
    categoryKey: (value) =>
      levelByLabel.get(String(value).toLocaleLowerCase("en-US")) ?? String(value),
    entryCategory: (spell) => String(spell.level),
  })
  for (const level of levelByLabel.values()) {
    if (!result.categories.includes(level)) {
      result.errors.push(
        `Spell level "${level === "0" ? "Cantrips" : level}" is missing from the count table`,
      )
    }
  }
  return result
}

export function validateItemCounts(markdown, items) {
  const result = validateCountTable(markdown, items, {
    categoryHeader: "Type",
    countHeader: "Count",
    entryCategory: (item) => item.item_type,
  })
  for (const category of [
    "ammunition",
    "armor",
    "potion",
    "ring",
    "rod",
    "scroll",
    "staff",
    "wand",
    "weapon",
    "wondrous item",
  ]) {
    if (!result.categories.includes(category)) {
      result.errors.push(`Item type "${category}" is missing from the count table`)
    }
  }
  return result
}
