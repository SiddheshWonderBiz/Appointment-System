/**
 * Convert UTC ISO string to IST Date & Time
 * IST = UTC + 5 hours 30 minutes
 */
export const utcToIST = (utcISOString: string) => {
  const utcDate = new Date(utcISOString);

  // Add IST offset (5h 30m)
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  const date = istDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const time = istDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { date, time };
};
