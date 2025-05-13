import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const clientData = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/${id}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to update client" }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}