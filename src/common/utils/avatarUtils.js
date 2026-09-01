// A varied, professional palette — deliberately not the app's primary/gold
// so avatars don't all blur into the same color. Each name deterministically
// hashes to the same color every time (not random per render), so a given
// person always shows up looking the same across the app.
export const AVATAR_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#F59E0B", // amber
  "#84CC16", // lime
  "#10B981", // emerald
  "#14B8A6", // teal
  "#06B6D4", // cyan
  "#3B82F6", // blue
  "#6366F1", // indigo
  "#8B5CF6", // violet
  "#D946EF", // fuchsia
  "#EC4899", // pink
];

// "Sarah Whitfield" -> "SW", "cheran" -> "C", "" -> "?"
export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic hash so the same name always lands on the same color.
export function getAvatarColor(seed = "") {
  const hash = String(seed)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/**
 * InitialsAvatar
 * Shared avatar component — a solid deterministic color per name, not a
 * gradient, so it exactly matches how the same person's initials look
 * everywhere else in the app (ProfileDropdown, tables, leaderboards).
 *
 * Props:
 * - name (string)
 * - size (string)      : Tailwind width/height classes, e.g. "w-8 h-8"
 * - textSize (string)  : Tailwind font-size class, e.g. "text-xs"
 * - ring (bool)         : show the primary ring outline (default true)
 */
export function InitialsAvatar({
  name,
  size = "w-8 h-8",
  textSize = "text-xs",
  ring = true,
}) {
  const color = getAvatarColor(name);
  return (
    <div
      className={`${size} rounded-full flex items-center justify-center shrink-0 ${
        ring ? "ring-2 ring-primary/20 ring-offset-1 ring-offset-base-100" : ""
      }`}
      style={{ backgroundColor: color }}
    >
      <span className={`${textSize} font-bold text-white tracking-wide`}>
        {getInitials(name)}
      </span>
    </div>
  );
}
