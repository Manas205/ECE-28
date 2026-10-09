import "dotenv/config";
import express from "express";
import cors from "cors";
import { fetchFolder } from "./services/drive.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));

let cache = null;
let cachedAt = 0;
let refreshing = false;
const MAX_AGE = 10 * 60 * 1000; // 10 minutes

let inflight = null;

function refresh() {
  if (!inflight) {
    inflight = (async () => {
      const children = await fetchFolder(process.env.FOLDER_ID);
      cache = { id: process.env.FOLDER_ID, name: "ECE'28", type: "folder", children };
      cachedAt = Date.now();
    })().finally(() => (inflight = null));
  }
  return inflight;
}

app.get("/api/drive", async (req, res) => {
  try {
    if (!cache) {
      await refresh(); // first request only
    } else if (Date.now() - cachedAt > MAX_AGE && !refreshing) {
      refreshing = true; // serve old data now, update in the background
      refresh().catch(console.error).finally(() => (refreshing = false));
    }
    res.json(cache);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 5000, () => console.log("Server running"));