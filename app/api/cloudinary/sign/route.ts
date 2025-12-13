import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary not configured" },
        { status: 501 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    // Build paramsToSign string. If client requested an upload_preset, include it.
    const params: Record<string, string | number> = { timestamp };
    if (body.upload_preset) params["upload_preset"] = body.upload_preset;
    // Optionally include folder or other params if provided
    if (body.folder) params["folder"] = body.folder;

    const keys = Object.keys(params).sort();
    const toSign = keys.map((k) => `${k}=${params[k]}`).join("&");
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex");

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
    });
  } catch (err: unknown) {
    console.error(
      "POST /api/cloudinary/sign error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}
