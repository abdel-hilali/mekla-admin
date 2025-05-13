import type { MenuJourDto, WeekMenu } from "@/types/types"
import { fetchWithAuth } from "./api"

/**
 * Fetches a menu week by its start date
 */
export async function getMenuWeekByDate(dateDebut: string): Promise<WeekMenu[]> {
  try {
    const response = await fetchWithAuth(`/api/menu-week/by-date?dateDebut=${dateDebut}`)

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
    // Format the date as YYYY-MM-DD in local timezone
    const year = currentDay.getFullYear()
    const month = String(currentDay.getMonth() + 1).padStart(2, "0")
    const day = String(currentDay.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

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
    console.log("ffffffffffffffffffffffffffffffffffff: ",mondays)

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

/**
 * Updates the status of a menu week
 * @param id The ID of the menu week
 * @param newStatus The new status to set (e.g., "PUBLIÉ", "ARCHIVÉ")
 * @returns The updated menu week
 */
export async function updateMenuWeekStatus(id: number, newStatus: string): Promise<WeekMenu> {
  try {
    const response = await fetchWithAuth(
      `/api/menu-week/${id}/status?newStatus=${encodeURIComponent(newStatus)}`,
      {
        method: "PUT",
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to update menu status: ${response.statusText}`)
    }

    const updatedMenu = await response.json()

    // The API returns the status as "PUBLIÉ" or "ARCHIVÉ"
    // We need to correctly map this to the isPublied boolean
    return updatedMenu
  } catch (error) {
    console.error(`Failed to update status for menu ${id}:`, error)
    throw error
  }
}

// Add this to menu_api.ts
export async function createOrUpdateMenuWeek(menuData: {
  dateDebut: string;
  dateFin: string;
  status: string;
  menuJours: MenuJourDto[];
}): Promise<WeekMenu> {
  try {
    console.log("Sending data:", menuData);

    const response = await fetchWithAuth(`/api/menu-week/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menuData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(errorData.message || "Failed to create/update menu");
    }

    return await response.json();
  } catch (error) {
    console.error("Request Error:", error);
    throw error;
  }
}