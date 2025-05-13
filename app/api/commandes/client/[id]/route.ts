import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/commandes/client/${id}`, {
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
        { success: false, message: "Échec du chargement des commandes" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching user commandes:", error);
    const message = error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement des commandes.";
    return NextResponse.json(
      { success: false, message }, 
      { status: 500 }
    );
  }
}