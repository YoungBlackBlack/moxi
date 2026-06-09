import { NextResponse } from "next/server";
import { uploadOrderFile } from "@/lib/storage";
import { uploadFileSchema } from "@/lib/validation";
import { orderService } from "@/server/order.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择要上传的文件" }, { status: 400 });
    }
    try {
      const uploaded = await uploadOrderFile({
        orderId: id,
        fileName: file.name,
        mimeType: file.type,
        bytes: await file.arrayBuffer()
      });
      const saved = await orderService.addFile(id, {
        originalName: file.name,
        url: uploaded.url,
        size: file.size,
        mimeType: file.type
      });
      return NextResponse.redirect(new URL(`/orders/${id}`, request.url), 303);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "unknown error" }, { status: 400 });
    }
  }

  const payload = uploadFileSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const file = await orderService.addFile(id, payload.data);
  return NextResponse.json({ file }, { status: 201 });
}
