const allowedExtensions = new Set(["psd", "ai", "zip", "rar", "7z", "png", "jpg", "jpeg", "pdf"]);
const maxFileSize = 1024 * 1024 * 1024;

export function validateOrderFile(file: { originalName: string; size: number }) {
  const ext = file.originalName.split(".").pop()?.toLowerCase() ?? "";
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!allowedExtensions.has(ext)) {
    errors.push(`不支持的文件类型：.${ext || "unknown"}`);
  }

  if (file.size > maxFileSize) {
    errors.push("文件超过 1GB，建议拆分或联系管理员");
  }

  if (!/[1-9][0-9]{4,}/.test(file.originalName)) {
    warnings.push("文件名里未识别到 QQ 号，请确认命名符合报价表要求");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}
