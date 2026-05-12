"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, FolderDown, Printer, Save, Share2, Upload } from "lucide-react";
import { usePlanner } from "@/lib/store";
import {
  downloadJson,
  exportBedJson,
  parseBedJson,
  saveToLocal,
} from "@/lib/persistence";

type Status = { kind: "idle" } | { kind: "ok"; msg: string } | { kind: "err"; msg: string };

export function SaveExportMenu() {
  const bed = usePlanner((s) => s.bed);
  const loadBed = usePlanner((s) => s.loadBed);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Clear status after a moment.
  useEffect(() => {
    if (status.kind === "idle") return;
    const t = window.setTimeout(() => setStatus({ kind: "idle" }), 2400);
    return () => window.clearTimeout(t);
  }, [status]);

  function doSave() {
    saveToLocal(bed);
    setStatus({ kind: "ok", msg: "Saved to this browser." });
  }

  function doPrint() {
    // Persist the latest bed so the print page can read it from localStorage,
    // then open the printable sheet in a new tab.
    saveToLocal(bed);
    window.open("/planner/print", "_blank", "noopener");
    setOpen(false);
  }

  function doExport() {
    const safeName = (bed.name || "garden-bed").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(`${safeName}-${stamp}.json`, exportBedJson(bed));
    setStatus({ kind: "ok", msg: "Exported JSON." });
    setOpen(false);
  }

  function pickFile() {
    fileRef.current?.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseBedJson(text);
      if (!parsed) {
        setStatus({ kind: "err", msg: "That file doesn't look like a saved bed." });
        return;
      }
      loadBed(parsed);
      saveToLocal(parsed);
      setStatus({ kind: "ok", msg: "Imported." });
      setOpen(false);
    } catch {
      setStatus({ kind: "err", msg: "Couldn't read that file." });
    }
  }

  async function doShare() {
    const text = exportBedJson(bed);
    try {
      await navigator.clipboard.writeText(text);
      setStatus({ kind: "ok", msg: "Copied JSON to clipboard." });
      setOpen(false);
    } catch {
      setStatus({ kind: "err", msg: "Clipboard unavailable." });
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-leaf-200 bg-white px-3 py-1.5 text-xs font-medium text-leaf-800 hover:bg-leaf-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Save className="h-3.5 w-3.5" /> Save / Export
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-md border border-leaf-200 bg-white shadow-lg"
        >
          <MenuItem icon={<Save className="h-3.5 w-3.5" />} label="Save to this browser" onClick={doSave} />
          <MenuItem
            icon={<Printer className="h-3.5 w-3.5" />}
            label="Printable garden sheet…"
            onClick={doPrint}
          />
          <MenuItem icon={<Download className="h-3.5 w-3.5" />} label="Export as JSON file" onClick={doExport} />
          <MenuItem icon={<Upload className="h-3.5 w-3.5" />} label="Import JSON file…" onClick={pickFile} />
          <MenuItem icon={<Share2 className="h-3.5 w-3.5" />} label="Copy JSON to clipboard" onClick={doShare} />
        </div>
      )}

      {status.kind !== "idle" && (
        <div
          className={`absolute right-0 top-full mt-9 z-30 flex items-center gap-1 whitespace-nowrap rounded-md border px-2 py-1 text-[11px] shadow-sm ${
            status.kind === "ok"
              ? "border-leaf-300 bg-leaf-50 text-leaf-800"
              : "border-rose-300 bg-rose-50 text-rose-700"
          }`}
        >
          {status.kind === "ok" ? <Check className="h-3 w-3" /> : <FolderDown className="h-3 w-3" />}
          {status.msg}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={onFile}
      />
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-leaf-800 hover:bg-leaf-50"
    >
      {icon}
      {label}
    </button>
  );
}
