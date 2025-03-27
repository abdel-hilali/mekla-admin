import type { WeekMenu } from "@/types/types"
import { fetchWithAuth } from "./api"

// Base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/**
 * Fetches a menu week by its start date
 */
export async function getMenuWeekByDate(dateDebut: string): Promise<WeekMenu[]> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/menu-week/by-date?dateDebut=${dateDebut}`)

    // If the response is 500, it likely means the menu week doesn't exist
    // Just return an empty array instead of throwing an error
    if (response.status === 500) {
      console.log(`No menu week found for date: ${dateDebut}`)
      return []
    }

    if (!response.ok) {
      console.log(`No menu week found for date: ${dateDebut}`)
    }

    return await response.json()
  } catch (error) {
    // Log the error but don't let it break the entire month fetch
    console.error(`Failed to fetch menu week for ${dateDebut}:`, error)
    return []
  }
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


export async function getMenuWeeksForMonth(date: Date): Promise<WeekMenu[]> {
  try {
    // Get all Mondays in the month
    const mondays = getMondaysInMonth(date)

    // Fetch menu weeks for each Monday
    const menuWeeksPromises = mondays.map((monday) => getMenuWeekByDate(monday))
    const menuWeeksArrays = await Promise.all(menuWeeksPromises)

    // Flatten the array of arrays and filter out empty results
    const menuWeeks = menuWeeksArrays.flat().filter(Boolean)

    return menuWeeks
  } catch (error) {
    console.error("Failed to fetch menu weeks for month:", error)
    return []
  }
}

