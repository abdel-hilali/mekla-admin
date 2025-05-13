import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateDebut = searchParams.get("dateDebut");
    
    if (!dateDebut) {
      return NextResponse.json(
        { error: "dateDebut parameter is required" }, 
        { status: 400 }
      );
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-week/by-date?dateDebut=${dateDebut}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      }
    });

    // If the response is 500, it likely means the menu week doesn't exist
    // Just return an empty array instead of throwing an error
    if (response.status === 500) {
      console.log(`No menu week found for date: ${dateDebut}`);
      return NextResponse.json([]);
    }

    if (!response.ok) {
      console.log(`No menu week found for date: ${dateDebut}`);
      return NextResponse.json([]);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Failed to fetch menu week:`, error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}