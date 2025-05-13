import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const menuData = await request.json();
    
    // Map French day names to English
    const frenchToEnglishDays: Record<string, string> = {
      'LUNDI': 'MONDAY',
      'MARDI': 'TUESDAY',
      'MERCREDI': 'WEDNESDAY',
      'JEUDI': 'THURSDAY',
      'VENDREDI': 'FRIDAY',
      'SAMEDI': 'SATURDAY',
      'DIMANCHE': 'SUNDAY'
    };

    const transformedData = {
      dateDebut: menuData.dateDebut,
      dateFin: menuData.dateFin,
      status: menuData.status,
      menuJours: menuData.menuJours.map((menuJour: any) => ({
        jour: frenchToEnglishDays[menuJour.jour] || menuJour.jour,
        date: menuJour.date,
        platDejeunerId: menuJour.platDejeunerId || null,
        platDinerId: menuJour.platDinerId || null,
        alternativesDejeunerIds: menuJour.alternativesDejeunerIds || [],
        alternativesDinerIds: menuJour.alternativesDinerIds || [],
        entreesJoursIds: menuJour.entreesJoursIds || [],
        dessertsJoursIds: menuJour.dessertsJoursIds || []
      }))
    };
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-week/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to create/update menu" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating/updating menu week:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}