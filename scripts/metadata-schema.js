function matchesType(value, type) {
  if (type === "array") return Array.isArray(value)
  if (type === "integer") return Number.isInteger(value)
  if (type === "string") return typeof value === "string"
  return false
}

export function validateMetadata(metadata, schema, definitions) {
  const errors = []
  for (const field of schema.required) {
    if (!Object.hasOwn(metadata, field) || metadata[field] === null || metadata[field] === "") {
      errors.push(`missing required "${field}"`)
    }
  }

  for (const [field, rule] of Object.entries(schema.fields)) {
    const value = metadata[field]
    if (value === undefined || value === null) continue
    if (!matchesType(value, rule.type)) {
      errors.push(`"${field}" must be ${rule.type}`)
      continue
    }
    if (rule.non_empty && !value.trim()) {
      errors.push(`"${field}" must not be empty`)
      continue
    }
    const allowed = rule.enum ?? definitions[rule.enum_from]
    if (allowed && !allowed.includes(value)) {
      errors.push(`"${field}" must be one of: ${allowed.join(", ")}`)
    }
    if (rule.min_items !== undefined && value.length < rule.min_items) {
      errors.push(`"${field}" must contain at least ${rule.min_items} entries`)
    }
    if (rule.max_items !== undefined && value.length > rule.max_items) {
      errors.push(`"${field}" must contain at most ${rule.max_items} entries`)
    }
    if (rule.items) {
      value.forEach((item, index) => {
        if (!matchesType(item, rule.items.type)) {
          errors.push(`"${field}[${index}]" must be ${rule.items.type}`)
        } else if (rule.items.non_empty && !item.trim()) {
          errors.push(`"${field}[${index}]" must not be empty`)
        } else if (rule.items.enum && !rule.items.enum.includes(item)) {
          errors.push(`"${field}[${index}]" must be one of: ${rule.items.enum.join(", ")}`)
        }
      })
    }
    if (rule.minimum !== undefined && value < rule.minimum) {
      errors.push(`"${field}" must be at least ${rule.minimum}`)
    }
    if (rule.maximum !== undefined && value > rule.maximum) {
      errors.push(`"${field}" must be at most ${rule.maximum}`)
    }
  }

  if (
    typeof metadata.source === "string" &&
    metadata.source.trim() &&
    !Object.hasOwn(metadata, "source_type")
  ) {
    errors.push('"source_type" is required when "source" is provided')
  }

  if (
    metadata.content_status === "incomplete" &&
    (!Object.hasOwn(metadata, "incomplete_reason") || !metadata.incomplete_reason?.trim())
  ) {
    errors.push('"incomplete_reason" is required when content_status is "incomplete"')
  }

  return errors
}
