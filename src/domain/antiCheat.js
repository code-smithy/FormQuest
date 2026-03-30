export function validateSchema(event) {
  const required = ["source_event_id", "type", "duration_minutes", "calories", "occurred_at", "source"];
  for (const field of required) {
    if (event[field] === undefined || event[field] === null || event[field] === "") {
      return { valid: false, reason: `missing_${field}` };
    }
  }

  const nonNegative = ["duration_minutes", "calories", "steps", "heart_rate_avg"];
  for (const field of nonNegative) {
    if (event[field] !== undefined && event[field] !== null && Number(event[field]) < 0) {
      return { valid: false, reason: `negative_${field}` };
    }
  }

  return { valid: true };
}

export function detectQuarantineReason(event) {
  if ((event.type === "walking" || event.type === "running") && event.steps) {
    const minutes = Math.max(1, Number(event.duration_minutes));
    const stepsPerMinute = event.steps / minutes;
    if (stepsPerMinute > 260) return "pace_unrealistic";
  }

  if (Number(event.calories) / Math.max(1, Number(event.duration_minutes)) > 30) {
    return "calories_unrealistic";
  }

  return null;
}
