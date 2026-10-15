/** Readable browser-side messages; the API/database remain authoritative. */
export function validateNights(value) {
  return /^\d+$/.test(String(value)) && Number(value) >= 1 && Number(value) <= 365
    ? ""
    : "Enter a whole number of nights from 1 to 365.";
}

export function validateDateRange(from, to, { required = false, maxDays } = {}) {
  if (required && (!from || !to)) return "Choose both a From date and a To date.";
  for (const day of [from, to]) {
    if (
      day &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(day) ||
        !Number.isFinite(Date.parse(day)) ||
        new Date(day).toISOString().slice(0, 10) !== day)
    )
      return "Choose valid calendar dates.";
  }
  if (!from || !to) return ""; // Audit filters may have just one date bound.
  const days = (Date.parse(to) - Date.parse(from)) / 86400000 + 1;
  if (days < 1) return "From date must be on or before To date.";
  if (maxDays && days > maxDays)
    return `Choose an analytics period of ${maxDays} days or fewer.`;
  return "";
}

export function validateCoordinates({ latitude, longitude }) {
  const lat = Number(latitude),
    lon = Number(longitude);
  if (
    String(latitude ?? "").trim() === "" ||
    String(longitude ?? "").trim() === "" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90 ||
    !Number.isFinite(lon) ||
    lon < -180 ||
    lon > 180
  )
    return "Enter a latitude from −90 to 90 and a longitude from −180 to 180.";
  return "";
}
