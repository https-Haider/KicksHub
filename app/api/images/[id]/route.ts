import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getGridFSBucket } from "@/lib/images.server";
import type { Readable } from "stream";

type Context = { params: Promise<{ id: string }> };

interface GridFSFile {
  filename?: string;
  [key: string]: unknown;
}

export async function GET(req: Request, ctx: Context) {
  try {
    const params = await Promise.resolve(ctx.params);
    const id = params.id;
    if (!id)
      return NextResponse.json({ error: "id required" }, { status: 400 });

    const oid = new ObjectId(id);
    const bucket = await getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(oid);

    // Try to determine content-type from filename metadata when possible
    const head = await bucket.find({ _id: oid }).limit(1).toArray();
    const fileDoc = head[0] as unknown as GridFSFile | undefined;
    const filename = fileDoc?.filename ?? "image";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    const mime =
      ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";

    // Convert Node stream to a Web ReadableStream for the Response
    const nodeStream = downloadStream as unknown as Readable;
    const stream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Uint8Array) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err: Error) => controller.error(err));
      },
      cancel() {
        try {
          nodeStream.destroy();
        } catch {
          // ignore destroy errors
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: { "Content-Type": mime },
    });
  } catch (err: unknown) {
    console.error(
      "GET /api/images/[id] error:",
      err instanceof Error ? err.message : err
    );
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
