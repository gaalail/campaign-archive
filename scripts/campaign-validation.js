export function validateMapCoordinates(metadata) {
  const { map_x: x, map_y: y } = metadata
  const errors = []
  if ((x === undefined) !== (y === undefined))
    errors.push("map_x and map_y must be provided together")
  for (const [field, value] of [
    ["map_x", x],
    ["map_y", y],
  ]) {
    if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > 100)) {
      errors.push(`${field} must be an integer from 0 to 100`)
    }
  }
  return errors
}
