"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { useCallback, useEffect } from "react";
import { t } from "@/lib/i18n/sq";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  minHeight?: string;
};

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = (await res.json()) as { path?: string; url?: string; error?: string };
  if (!res.ok) throw new Error(data.error || t.gabimRuajtjes);

  const url =
    data.url ||
    (data.path ? `/api/uploads/${data.path}` : "");
  if (!url) throw new Error(t.gabimRuajtjes);

  return url.startsWith("http") ? url : url;
}

export function RichTextEditor({
  value,
  onChange,
  minHeight = "200px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3 text-ink",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const addImage = useCallback(async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        /* ignore */
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-lg border border-beige bg-ivory" style={{ minHeight }}>
        <div className="flex h-32 items-center justify-center text-choco-soft">
          {t.editorDukeNgarkuar}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-beige bg-ivory">
      <div className="flex flex-wrap gap-2 border-b border-beige bg-cream px-3 py-2">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="B"
        />
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="I"
        />
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          label="•"
        />
        <ToolbarButton active={false} onClick={addImage} label={t.ngarkoImazh} />
      </div>
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs uppercase tracking-wide ${
        active ? "bg-choco text-ivory" : "bg-ivory text-choco hover:bg-beige"
      }`}
    >
      {label}
    </button>
  );
}
