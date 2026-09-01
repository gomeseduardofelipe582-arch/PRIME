import { isWithinInterval, startOfDay, endOfDay, startOfMonth, subDays, format, eachDayOfInterval } from "date-fns";

export function getPeriodRange(preset, custom = {}) {
  const now = new Date();
  switch (preset) {
    case "hoje":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "7dias":
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case "30dias":
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case "mes":
      return { start: startOfMonth(now), end: endOfDay(now) };
    case "personalizado":
      return { start: startOfDay(custom.start || now), end: endOfDay(custom.end || now) };
    default:
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
  }
}

export function filterByRange(list, range) {
  return list.filter((item) => isWithinInterval(new Date(item.createdAt), range));
}

export function sumField(list, field) {
  return list.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
}

export function groupCount(list, keyFn) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyFn(item) || "Outro";
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function groupSum(list, keyFn, valueFn) {
  const map = new Map();
  list.forEach((item) => {
    const key = keyFn(item) || "Outro";
    map.set(key, (map.get(key) || 0) + (Number(valueFn(item)) || 0));
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function dailySeries(list, range) {
  const days = eachDayOfInterval({ start: range.start, end: range.end });
  return days.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const value = list.filter((item) => format(new Date(item.createdAt), "yyyy-MM-dd") === key).length;
    return { name: format(day, "dd/MM"), value };
  });
}
