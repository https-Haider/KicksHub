import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getGridFSBucket } from "@/lib/images.server";

export async function GET(req: Request, context: any) {
  try {
    // `context` may be a plain object or a Promise-wrapped object depending on Next's runtime.
    // Also `context.params` itself can be a Promise in some Next versions, so await both.
    const resolved = await Promise.resolve(context);
    let params: any = resolved?.params ?? resolved;
    // If params is a Promise (Next may pass Promise-wrapped params), await it as well.
    params = await Promise.resolve(params);
    const id = params?.id;
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const oid = new ObjectId(id);
    const bucket = await getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(oid);

    // Try to determine content-type from filename metadata when possible
    const head = await bucket.find({ _id: oid }).limit(1).toArray();
    const fileDoc = head[0] as any;
    const filename = fileDoc?.filename ?? "image";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mime =
      ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";

    // Convert Node stream to a Web ReadableStream for the Response
    const nodeStream = downloadStream as any;
    const stream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: any) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err: any) => controller.error(err));
      },
      cancel() {
        try {
          nodeStream.destroy();
        } catch (e) {}
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": mime },
    });
  } catch (err: any) {
    console.error("GET /api/images/[id] error:", err);
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
