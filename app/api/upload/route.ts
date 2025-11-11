import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload request received")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    console.log("[v0] Uploading file:", file.name, "Size:", file.size, "Type:", file.type)

    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      console.error("[v0] BLOB_READ_WRITE_TOKEN not found")
      return NextResponse.json({ error: "Token de Blob no configurado" }, { status: 500 })
    }

    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `productos/${timestamp}-${sanitizedName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Vercel Blob using REST API
    const uploadUrl = `https://blob.vercel-storage.com/${filename}`

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": file.type,
        "x-content-type": file.type,
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error("[v0] Blob upload failed:", errorText)
      return NextResponse.json(
        { error: "Error al subir a Blob", details: errorText },
        { status: uploadResponse.status },
      )
    }

    const result = await uploadResponse.json()
    console.log("[v0] Upload successful:", result)

    return NextResponse.json({
      url: result.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      {
        error: "Error al subir archivo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
