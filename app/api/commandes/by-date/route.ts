import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateLivraison = searchParams.get("dateLivraison");
    
    if (!dateLivraison) {
      return NextResponse.json(
        { error: "dateLivraison parameter is required" }, 
        { status: 400 }
      );
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/commandes/by-date?dateLivraison=${dateLivraison}`, {
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
        return NextResponse.json([]);
      }
      return NextResponse.json(
        { error: "Failed to fetch commandes by date" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching commandes by date:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}