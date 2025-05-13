import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const searchParams = request.nextUrl.searchParams;
    const dateDebut = searchParams.get("dateDebut");
    
    if (!dateDebut) {
      return NextResponse.json(
        { error: "dateDebut parameter is required" }, 
        { status: 400 }
      );
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plats/${id}/allergy-stats/week?dateDebut=${dateDebut}`, {
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
        { error: "Failed to fetch plat allergy stats for week" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching plat allergy stats by week:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}