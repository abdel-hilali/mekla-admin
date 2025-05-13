import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }
    
    // Forward the formData to the backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plats/${id}/upload-photo`, {
      method: "POST",
      headers: {
        ...(request.headers.get("cookie") 
          ? { "Cookie": request.headers.get("cookie") || "" }
          : {})
      },
      body: backendFormData,
    });

    // Handle different response types
    let responseData;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = text ? { message: text } : {};
    }

    if (!response.ok) {
      const errorMessage = responseData.error || responseData.message || "Failed to update plat image.";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: response.status }
      );
    }

    // Handle both JSON and plain text responses
    const imageUrl = responseData.fileName || responseData.imageUrl || 
                    (typeof responseData === 'string' ? responseData : null);
    
    return NextResponse.json({
      success: true,
      message: "Photo de plat mise à jour avec succès!",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Plat image update error:", error);
    return NextResponse.json(
      { success: false, message: "Une erreur s'est produite lors de la mise à jour de la photo du plat." },
      { status: 500 }
    );
  }
}