import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; type: string }> }
) {
  try {
    const paramsData = await params;
    const id = paramsData.id;
    const type = paramsData.type;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plat-calories/${id}/${type}`, {
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
        { error: `Erreur lors de la récupération des calories et prix du plat (ID: ${id}, Type: ${type})` }, 
        { status: response.status }
      );
    }

    const caloriesData = await response.json();
    return NextResponse.json(caloriesData);
  } catch (error) {
    console.error("Error fetching plat calories:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}