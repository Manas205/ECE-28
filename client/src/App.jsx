import { useEffect, useMemo, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
  Eye,
  Search,
  X,
  Download,
  ExternalLink,
  ArrowLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import TreeNode from "./components/TreeNode";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Turn the nested tree into a flat list of files, each remembering its folder path
function flatten(node, path = []) {
  if (node.type === "folder") {
    const here = [...path, node.name];
    return node.children.flatMap((c) => flatten(c, here));
  }
  return [{ ...node, path }];
}

export default function App() {
  const [tree, setTree] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [mobileView, setMobileView] = useState("tree"); // "tree" | "preview"

  useEffect(() => {
    fetch(`${API}/api/drive`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setTree(d)))
      .catch(() => setError("Could not reach the server"));
  }, []);

  const files = useMemo(() => (tree ? flatten(tree) : []), [tree]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return files
      .filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.path.join(" ").toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [query, files]);

  function selectFile(item) {
    setSelected(files.find((f) => f.id === item.id) || item);
    setMobileView("preview");
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b bg-white px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6 md:py-4">
        <h1 className="text-xl font-semibold">My Drive</h1>
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="w-full rounded-lg border bg-gray-50 py-2 pl-9 pr-9 text-sm outline-none focus:border-blue-400 focus:bg-white"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-3 md:flex-row md:gap-6 md:p-6">
        {/* Sidebar */}
        <aside
          className={`min-h-0 w-full flex-1 overflow-auto rounded-xl border bg-white p-4 md:w-96 md:flex-none md:shrink-0 ${
            mobileView === "preview" ? "hidden md:block" : "block"
          }`}
        >
          <h2 className="mb-3 text-lg font-semibold">
            {results ? `Results (${results.length})` : "Folder Structure"}
          </h2>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {!tree && !error && <p className="text-sm text-gray-500">Loading...</p>}

          {results ? (
            results.length === 0 ? (
              <p className="text-sm text-gray-500">No files found.</p>
            ) : (
              results.map((f) => (
                <button
                  key={f.id}
                  onClick={() => selectFile(f)}
                  className={`flex w-full items-start gap-2 rounded-md p-2 text-left hover:bg-gray-100 ${
                    selected?.id === f.id ? "bg-blue-50" : ""
                  }`}
                >
                  <FileText size={18} className="mt-0.5 shrink-0 text-gray-500" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-gray-800">{f.name}</span>
                    <span className="block truncate text-xs text-gray-400">
                      {f.path.slice(1).join(" / ")}
                    </span>
                  </span>
                </button>
              ))
            )
          ) : (
            tree && (
              <TreeNode item={tree} selectedId={selected?.id} onSelect={selectFile} />
            )
          )}
        </aside>

        {/* Preview */}
        <section
          className={`min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-white ${
            mobileView === "tree" ? "hidden md:flex" : "flex"
          }`}
        >
          {selected ? (
            <>
              <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
                <button
                  onClick={() => setMobileView("tree")}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 md:hidden"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <div className="flex min-w-0 flex-1 items-center gap-1 text-sm text-gray-500">
                  {selected.path.slice(1).map((p, i) => (
                    <span key={i} className="flex shrink-0 items-center gap-1">
                      {p} <ChevronRight size={14} />
                    </span>
                  ))}
                  <span className="truncate font-medium text-gray-800">{selected.name}</span>
                </div>

                <a
                  href={`https://drive.google.com/uc?export=download&id=${selected.id}`}
                  className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  <Download size={15} /> Download
                </a>
                <a
                  href={`https://drive.google.com/file/d/${selected.id}/view`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  <ExternalLink size={15} /> Open
                </a>
              </div>

              <iframe
                key={selected.id}
                src={selected.previewUrl}
                title={selected.name}
                className="w-full flex-1"
              />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <Eye size={48} />
              <p className="mt-3 text-lg">Select a file to preview</p>
              <p className="text-sm">Click on any file in the folder tree to view it here</p>
            </div>
          )}
        </section>
      </main>
      <Analytics />
    </div>
  );
}