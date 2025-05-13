import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { livreurId, commandeIds } = body;
    
    if (!livreurId || !commandeIds || !Array.isArray(commandeIds)) {
      return NextResponse.json(
        { error: "livreurId and commandeIds array are required" }, 
        { status: 400 }
      );
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livreurs/affecter-commandes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      },
      body: JSON.stringify({ livreurId, commandeIds }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to assign commandes" }, 
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error assigning commandes:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}