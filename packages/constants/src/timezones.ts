/**
 * The IANA zones offered in FR-01 and ST-08, grouped by region
 * (v2 handoff §11: "content, supplied at build time, not a decision this
 * document makes").
 *
 * WHY A CURATED LIST RATHER THAN THE FULL SET. `Intl.supportedValuesOf`
 * returns ~600 identifiers including deprecated aliases and pure-offset zones,
 * in an order nobody would choose. A person setting their zone once at first
 * run needs to find their own city, and this list is the cities people live
 * in, in the regions they think in.
 *
 * The stored value is always the IANA id, never the label, so relabelling a
 * row here never migrates anyone's data. A zone missing from this list is
 * still a valid stored value — `TimezoneSelect` shows what it is given.
 *
 * DST is not encoded anywhere: an IANA id carries its own rules, which is the
 * whole reason the product stores zones and not offsets (cross-cutting §7.3).
 */
export interface TimezoneOption {
  id: string;
  label: string;
}

export interface TimezoneRegionGroup {
  region: string;
  zones: readonly TimezoneOption[];
}

export const TIMEZONE_REGIONS: readonly TimezoneRegionGroup[] = [
  {
    region: "North America",
    zones: [
      { id: "America/St_Johns", label: "Newfoundland" },
      { id: "America/Halifax", label: "Halifax" },
      { id: "America/Toronto", label: "Toronto" },
      { id: "America/New_York", label: "New York" },
      { id: "America/Chicago", label: "Chicago" },
      { id: "America/Winnipeg", label: "Winnipeg" },
      { id: "America/Mexico_City", label: "Mexico City" },
      { id: "America/Denver", label: "Denver" },
      { id: "America/Edmonton", label: "Edmonton" },
      { id: "America/Phoenix", label: "Phoenix" },
      { id: "America/Los_Angeles", label: "Los Angeles" },
      { id: "America/Vancouver", label: "Vancouver" },
      { id: "America/Anchorage", label: "Anchorage" },
      { id: "Pacific/Honolulu", label: "Honolulu" },
    ],
  },
  {
    region: "South America",
    zones: [
      { id: "America/Bogota", label: "Bogotá" },
      { id: "America/Lima", label: "Lima" },
      { id: "America/Santiago", label: "Santiago" },
      { id: "America/Sao_Paulo", label: "São Paulo" },
      { id: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
    ],
  },
  {
    region: "Europe",
    zones: [
      { id: "Atlantic/Reykjavik", label: "Reykjavík" },
      { id: "Europe/Dublin", label: "Dublin" },
      { id: "Europe/London", label: "London" },
      { id: "Europe/Lisbon", label: "Lisbon" },
      { id: "Europe/Madrid", label: "Madrid" },
      { id: "Europe/Paris", label: "Paris" },
      { id: "Europe/Brussels", label: "Brussels" },
      { id: "Europe/Amsterdam", label: "Amsterdam" },
      { id: "Europe/Berlin", label: "Berlin" },
      { id: "Europe/Zurich", label: "Zurich" },
      { id: "Europe/Rome", label: "Rome" },
      { id: "Europe/Vienna", label: "Vienna" },
      { id: "Europe/Prague", label: "Prague" },
      { id: "Europe/Stockholm", label: "Stockholm" },
      { id: "Europe/Oslo", label: "Oslo" },
      { id: "Europe/Copenhagen", label: "Copenhagen" },
      { id: "Europe/Helsinki", label: "Helsinki" },
      { id: "Europe/Warsaw", label: "Warsaw" },
      { id: "Europe/Athens", label: "Athens" },
      { id: "Europe/Bucharest", label: "Bucharest" },
      { id: "Europe/Kyiv", label: "Kyiv" },
      { id: "Europe/Istanbul", label: "Istanbul" },
      { id: "Europe/Moscow", label: "Moscow" },
    ],
  },
  {
    region: "Africa",
    zones: [
      { id: "Africa/Casablanca", label: "Casablanca" },
      { id: "Africa/Lagos", label: "Lagos" },
      { id: "Africa/Cairo", label: "Cairo" },
      { id: "Africa/Nairobi", label: "Nairobi" },
      { id: "Africa/Johannesburg", label: "Johannesburg" },
    ],
  },
  {
    region: "Middle East",
    zones: [
      { id: "Asia/Jerusalem", label: "Jerusalem" },
      { id: "Asia/Riyadh", label: "Riyadh" },
      { id: "Asia/Dubai", label: "Dubai" },
      { id: "Asia/Tehran", label: "Tehran" },
    ],
  },
  {
    region: "Asia",
    zones: [
      { id: "Asia/Karachi", label: "Karachi" },
      { id: "Asia/Kolkata", label: "Kolkata" },
      { id: "Asia/Kathmandu", label: "Kathmandu" },
      { id: "Asia/Dhaka", label: "Dhaka" },
      { id: "Asia/Bangkok", label: "Bangkok" },
      { id: "Asia/Jakarta", label: "Jakarta" },
      { id: "Asia/Singapore", label: "Singapore" },
      { id: "Asia/Hong_Kong", label: "Hong Kong" },
      { id: "Asia/Shanghai", label: "Shanghai" },
      { id: "Asia/Taipei", label: "Taipei" },
      { id: "Asia/Seoul", label: "Seoul" },
      { id: "Asia/Tokyo", label: "Tokyo" },
    ],
  },
  {
    region: "Oceania",
    zones: [
      { id: "Australia/Perth", label: "Perth" },
      { id: "Australia/Adelaide", label: "Adelaide" },
      { id: "Australia/Brisbane", label: "Brisbane" },
      { id: "Australia/Sydney", label: "Sydney" },
      { id: "Australia/Melbourne", label: "Melbourne" },
      { id: "Pacific/Auckland", label: "Auckland" },
      { id: "Pacific/Fiji", label: "Fiji" },
    ],
  },
  {
    region: "Other",
    zones: [{ id: "UTC", label: "UTC" }],
  },
];

/** The device's own zone, or UTC where the platform will not say. */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
