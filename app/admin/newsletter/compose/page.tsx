"use client";

import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  AnyExtension,
  EditorContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Eye,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Send,
  X,
} from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export default function ComposePage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeCount, setActiveCount] = useState<number | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }) as AnyExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { style: "color: var(--color-accent); text-decoration: underline;" },
      }) as AnyExtension,
    ],
    content: "",
    editorProps: { attributes: { class: "focus:outline-none" } },
  });

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null;
      return {
        bold: ctx.editor.isActive("bold"),
        italic: ctx.editor.isActive("italic"),
        h1: ctx.editor.isActive("heading", { level: 1 }),
        h2: ctx.editor.isActive("heading", { level: 2 }),
        bulletList: ctx.editor.isActive("bulletList"),
        orderedList: ctx.editor.isActive("orderedList"),
        link: ctx.editor.isActive("link"),
        alignLeft: ctx.editor.isActive({ textAlign: "left" }),
        alignCenter: ctx.editor.isActive({ textAlign: "center" }),
        alignRight: ctx.editor.isActive({ textAlign: "right" }),
      };
    },
  });

  const openLinkModal = useCallback(() => {
    const selection = editor?.state.selection;
    if (!selection || selection.empty) {
      toast.error("Sélectionnez d'abord du texte pour créer un lien.");
      return;
    }
    const existing = editor?.getAttributes("link").href ?? "";
    setLinkUrl(existing);
    setShowLinkModal(true);
    setTimeout(() => linkInputRef.current?.focus(), 50);
  }, [editor]);

  const handleInsertLink = useCallback(() => {
    if (!linkUrl.trim()) {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.trim() }).run();
    }
    setShowLinkModal(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const handleRemoveLink = useCallback(() => {
    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setShowLinkModal(false);
    setLinkUrl("");
  }, [editor]);

  const getHtml = () => editor?.getHTML() ?? "";
  const isEmpty = () => { const html = getHtml(); return !html || html === "<p></p>"; };

  const handlePreview = () => {
    if (isEmpty()) { toast.error("Le contenu est vide."); return; }
    setShowPreview(true);
  };

  const handleSendClick = async () => {
    if (!subject.trim()) { toast.error("Veuillez renseigner le sujet."); return; }
    if (isEmpty()) { toast.error("Le contenu est vide."); return; }
    try {
      const res = await fetch("/api/admin/newsletter?status=active");
      const data = await res.json();
      setActiveCount(data.activeCount ?? 0);
    } catch { setActiveCount(0); }
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirm(false);
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), htmlContent: getHtml() }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Erreur lors de l'envoi."); return; }
      toast.success(
        `Campagne envoyée ! ${data.sent} email${data.sent > 1 ? "s" : ""} envoyé${data.sent > 1 ? "s" : ""}${data.failed > 0 ? ` (${data.failed} échec${data.failed > 1 ? "s" : ""})` : ""}.`,
      );
      router.push("/admin/newsletter");
    } catch { toast.error("Impossible de contacter le serveur."); }
    finally { setIsSending(false); }
  };

  if (!editor) return null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <NextLink
          href="/admin/newsletter"
          className="mb-4 inline-flex items-center gap-2 font-body text-sm transition-opacity hover:opacity-70"
          style={{ color: "var(--color-ink-3)" }}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Retour
        </NextLink>
        <p className="type-overline mb-2" style={{ color: "var(--color-accent)" }}>Administration</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.75rem", color: "var(--color-ink)" }}>
          Nouvelle campagne
        </h1>
        <p className="font-body mt-1 text-sm" style={{ color: "var(--color-ink-3)" }}>
          Composez et envoyez votre newsletter
        </p>
      </div>

      {/* Editor */}
      <div className="tiptap-editor overflow-hidden" style={{ border: "var(--rule-hair)", background: "var(--color-paper)" }}>
        {/* Subject */}
        <div className="px-6 py-4" style={{ borderBottom: "var(--rule-soft)" }}>
          <div className="flex items-center gap-3">
            <span className="type-overline w-16 shrink-0" style={{ color: "var(--color-ink-3)" }}>Sujet</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex : Nouvelle collection printemps 2026"
              className="font-body w-full text-sm focus:outline-none"
              style={{ background: "transparent", color: "var(--color-ink)" }}
              maxLength={200}
            />
            <span className="font-body shrink-0 text-xs" style={{ color: "var(--color-ink-3)", opacity: 0.5 }}>
              {subject.length}/200
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-4 py-2" style={{ borderBottom: "var(--rule-soft)", background: "var(--color-paper-2)" }}>
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editorState?.bold ?? false} title="Gras">
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editorState?.italic ?? false} title="Italique">
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editorState?.h1 ?? false} title="Titre 1">
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editorState?.h2 ?? false} title="Titre 2">
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editorState?.bulletList ?? false} title="Liste à puces">
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editorState?.orderedList ?? false} title="Liste numérotée">
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editorState?.alignLeft ?? false} title="Aligner à gauche">
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editorState?.alignCenter ?? false} title="Centrer">
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editorState?.alignRight ?? false} title="Aligner à droite">
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Séparateur">
              <Minus className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton onClick={openLinkModal} active={editorState?.link ?? false} title="Insérer un lien">
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* TipTap zone */}
        <div className="min-h-[280px] px-6 py-5">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-5 py-2.5 font-body text-sm transition-opacity hover:opacity-70"
          style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)", background: "var(--color-paper)" }}
        >
          <Eye className="h-4 w-4" strokeWidth={1.5} />
          Prévisualiser
        </button>

        <button
          onClick={handleSendClick}
          disabled={isSending}
          className="flex items-center gap-2 px-6 py-2.5 font-body text-sm font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.5} />}
          {isSending ? "Envoi en cours..." : "Envoyer la campagne"}
        </button>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Email header */}
            <div style={{ background: "var(--color-ink)", padding: "30px 20px", textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--color-paper)", fontSize: "1.75rem" }}>
                Ylang Créations
              </p>
            </div>
            {/* Email body */}
            <div className="tiptap-editor px-8 py-6">
              <div
                className="ProseMirror"
                style={{ color: "var(--color-ink)", fontSize: "15px", lineHeight: "1.7" }}
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            </div>
            {/* Email footer */}
            <div style={{ background: "var(--color-paper-2)", padding: "20px", textAlign: "center", borderTop: "1px solid #f3f4f6" }}>
              <p style={{ color: "var(--color-ink)", opacity: 0.35, fontSize: "11px", fontFamily: "var(--font-body)", margin: 0 }}>
                Vous recevez cet email car vous êtes inscrit(e) à notre newsletter.{" "}
                <span style={{ color: "var(--color-accent)", textDecoration: "underline" }}>Se désinscrire</span>
              </p>
            </div>
            <div className="flex justify-end px-6 py-4" style={{ borderTop: "var(--rule-soft)" }}>
              <button
                onClick={() => setShowPreview(false)}
                className="font-body text-sm transition-opacity hover:opacity-70"
                style={{ color: "var(--color-ink-3)" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm send modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md bg-white p-8 shadow-2xl" style={{ border: "var(--rule-hair)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.375rem", color: "var(--color-ink)", marginBottom: "0.75rem" }}>
              Confirmer l'envoi
            </p>
            <p className="font-body mb-6 text-sm" style={{ color: "var(--color-ink-3)" }}>
              Vous allez envoyer{" "}
              <strong style={{ color: "var(--color-ink)" }}>«{subject}»</strong> à{" "}
              <strong style={{ color: "var(--color-ink)" }}>
                {activeCount !== null
                  ? `${activeCount} abonné${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}`
                  : "tous les abonnés actifs"}
              </strong>
              . Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 font-body text-sm transition-opacity hover:opacity-70"
                style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex flex-1 items-center justify-center gap-2 py-3 font-body text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link modal */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowLinkModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white shadow-2xl"
            style={{ border: "var(--rule-hair)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "var(--rule-soft)" }}>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" style={{ color: "var(--color-ink-3)" }} strokeWidth={1.5} />
                <p className="font-body font-medium" style={{ color: "var(--color-ink)" }}>Insérer un lien</p>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="transition-opacity hover:opacity-70"
                style={{ color: "var(--color-ink-3)" }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="px-6 py-5">
              <label className="type-overline mb-2 block" style={{ color: "var(--color-ink-3)" }}>URL de destination</label>
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleInsertLink(); if (e.key === "Escape") setShowLinkModal(false); }}
                placeholder="https://ylang-creations.fr/..."
                className="font-body w-full py-3 px-4 text-sm outline-none transition-colors"
                style={{ border: "var(--rule-soft)", color: "var(--color-ink)", background: "var(--color-paper)" }}
              />
              <p className="font-body mt-2 text-xs" style={{ color: "var(--color-ink-3)", opacity: 0.6 }}>
                Laissez vide pour supprimer le lien existant.
              </p>
            </div>

            <div className="flex gap-3 px-6 py-4" style={{ borderTop: "var(--rule-soft)" }}>
              {editorState?.link && (
                <button
                  onClick={handleRemoveLink}
                  className="font-body px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
                  style={{ border: "var(--rule-soft)", color: "#ef4444" }}
                >
                  Supprimer
                </button>
              )}
              <button
                onClick={() => setShowLinkModal(false)}
                className="ml-auto font-body px-4 py-2.5 text-sm transition-opacity hover:opacity-70"
                style={{ border: "var(--rule-soft)", color: "var(--color-ink-3)" }}
              >
                Annuler
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkUrl.trim() && !editorState?.link}
                className="flex items-center gap-2 px-5 py-2.5 font-body text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{ background: "var(--color-ink)", color: "var(--color-paper)" }}
              >
                <Link2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 transition-colors"
      style={{
        background: active ? "var(--color-paper-3)" : "transparent",
        color: active ? "var(--color-ink)" : "var(--color-ink-3)",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px" style={{ background: "var(--color-paper-3)" }} />;
}
