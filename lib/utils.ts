import { TYPE_USER } from "@/constants/constants";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const getMenuDays = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { timeZone: "Africa/Tunis" };
  const tunisTime = new Date(now.toLocaleString("en-US", options));

  let dayOfWeek = tunisTime.getDay(); // 0 (Sunday) to 6 (Saturday)
  let hours = tunisTime.getHours();

  // Get the most recent Monday
  let monday = new Date(tunisTime);
  monday.setDate(monday.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust for Monday

  // If it's Friday after 17:00, move to next week's Monday
  if ((dayOfWeek === 4 && hours >= 17)|| (dayOfWeek > 4)|| dayOfWeek === 0) {
    monday.setDate(monday.getDate() + 7);
  }

  // Generate the menu days
  const days = [];
  for (let i = 0; i < 5; i++) {
    let date = new Date(monday);
    date.setDate(monday.getDate() + i);
    let formattedDate = date.toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "2-digit", year: "2-digit" });
    days.push(formattedDate);
  }
  return days;

};

export const getFormattedDate = (day: string) => {
    const parts = day.split(" ") // ["vendredi", "14/02"]
    if (parts.length < 2) return ""
    const datePart = parts[1] // "14/02"
    return `20${datePart.split("/").reverse().join("-")}` // Convert to "YYYY-MM-DD"
  }


  /**
 * Gets all Mondays (week start dates) in a given month
 */
export function getMondaysInMonth(date: Date): string[] {
  const year = date.getFullYear()
  const month = date.getMonth()

  // Create a date for the first day of the month
  const firstDay = new Date(year, month, 1)

  // Create a date for the last day of the month
  const lastDay = new Date(year, month + 1, 0)

  const mondays: string[] = []

  // Find the first Monday that's either in this month or the last Monday of the previous month
  // if the month starts in the middle of a week
  const currentDay = new Date(firstDay)

  // Go back to the previous Monday if the month doesn't start on Monday
  while (currentDay.getDay() !== 1) {
    // 1 is Monday
    currentDay.setDate(currentDay.getDate() - 1)
  }

  // Collect all Mondays until we pass the end of the month
  while (
    currentDay <= lastDay ||
    (currentDay.getDay() === 1 && new Date(currentDay).setDate(currentDay.getDate() + 4) <= lastDay.getTime())
  ) {
    // Format the date as YYYY-MM-DD
    const formattedDate = currentDay.toISOString().split("T")[0]
    mondays.push(formattedDate)

    // Move to the next Monday
    currentDay.setDate(currentDay.getDate() + 7)
  }

  return mondays
}

/**
 * Fetches all menu weeks for a given month
 */




export const getActiviteSportif = (typeUser: string) => {
  if ((typeUser===TYPE_USER[0]) ||(typeUser===TYPE_USER[2])||(typeUser===TYPE_USER[4])) return "Avec sport"
  return "Sans sport"
}
