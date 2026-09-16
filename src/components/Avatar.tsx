export function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  if (url) {
    return <img src={url} alt={name ?? "Avatar"} className="h-9 w-9 rounded-full object-cover" />;
  }
  const initials = (name || "NT")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-xs font-bold text-navy">
      {initials}
    </span>
  );
}
