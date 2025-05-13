import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const platData = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plats/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      },
      body: JSON.stringify(platData),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to create plat" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating plat:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}