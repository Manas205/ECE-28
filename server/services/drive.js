const FOLDER_MIME = "application/vnd.google-apps.folder";

function getType(mime) {
  if (mime === FOLDER_MIME) return "folder";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (
    mime === "application/pdf" ||
    mime.includes("msword") ||
    mime.includes("officedocument") ||
    mime.startsWith("application/vnd.google-apps.")
  )
    return "document";
  return "file";
}

function formatBytes(bytes) {
  if (!bytes) return undefined;
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`;
}

export async function fetchFolder(folderId) {
  const url =
    "https://www.googleapis.com/drive/v3/files" +
    `?q='${folderId}'+in+parents+and+trashed=false` +
    "&pageSize=1000&fields=files(id,name,mimeType,size)" +
    `&key=${process.env.API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Drive API error");

  const children = await Promise.all(
    (data.files || []).map(async (f) => {
      const type = getType(f.mimeType);
      if (type === "folder") {
        return { id: f.id, name: f.name, type, children: await fetchFolder(f.id) };
      }
      return {
        id: f.id,
        name: f.name,
        type,
        size: formatBytes(Number(f.size)),
        previewUrl: `https://drive.google.com/file/d/${f.id}/preview`,
      };
    })
  );

  return children.sort((a, b) => {
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
}