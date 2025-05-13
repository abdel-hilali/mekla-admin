import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filter: string }> }
) {
  try {
    const filter = (await params).filter;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plats/${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch plats" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching plats:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}