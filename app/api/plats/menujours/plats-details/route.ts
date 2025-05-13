import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const typePlat = searchParams.get("typePlat") || "ALL";
    const isWeekView = searchParams.get("week") === "true";
    
    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" }, 
        { status: 400 }
      );
    }
    
    const weekParam = isWeekView ? "&week=true" : "";
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/plats/menujours/plats-details?date=${date}&typePlat=${typePlat}${weekParam}`;
    
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(null);
      }
      return NextResponse.json(
        { error: "Failed to fetch plat orders for date" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching plat orders by date:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}