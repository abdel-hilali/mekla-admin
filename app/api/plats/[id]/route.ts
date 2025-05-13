import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plats/${id}`, {
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
        { error: `Erreur lors de la récupération des informations du plat (ID: ${id})` }, 
        { status: response.status }
      );
    }

    const platData = await response.json();
    return NextResponse.json(platData);
  } catch (error) {
    console.error("Error fetching plat:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}