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

  // Modal lien
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }) as AnyExtension,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          style: "color: #b76e79; text-decoration: underline;",
        },
      }) as AnyExtension,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  // État réactif de la toolbar — mis à jour à chaque transaction TipTap
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
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl.trim() })
        .run();
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

  const isEmpty = () => {
    const html = getHtml();
    return !html || html === "<p></p>";
  };

  const handlePreview = () => {
    if (isEmpty()) {
      toast.error("Le contenu est vide.");
      return;
    }
    setShowPreview(true);
  };

  const handleSendClick = async () => {
    if (!subject.trim()) {
      toast.error("Veuillez renseigner le sujet.");
      return;
    }
    if (isEmpty()) {
      toast.error("Le contenu est vide.");
      return;
    }

    try {
      const res = await fetch("/api/admin/newsletter?status=active");
      const data = await res.json();
      setActiveCount(data.activeCount ?? 0);
    } catch {
      setActiveCount(0);
    }

    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirm(false);
    setIsSending(true);

    try {
      const res = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          htmlContent: getHtml(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'envoi.");
        return;
      }

      toast.success(
        `Campagne envoyée ! ${data.sent} email${data.sent > 1 ? "s" : ""} envoyé${data.sent > 1 ? "s" : ""}${
          data.failed > 0
            ? ` (${data.failed} échec${data.failed > 1 ? "s" : ""})`
            : ""
        }.`,
      );
      router.push("/admin/newsletter");
    } catch {
      toast.error("Impossible de contacter le serveur.");
    } finally {
      setIsSending(false);
    }
  };

  if (!editor) return null;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <NextLink
          href="/admin/newsletter"
          className="text-ylang-charcoal/60 hover:text-ylang-charcoal flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </NextLink>
        <div>
          <h1 className="text-ylang-charcoal text-3xl font-bold">
            Nouvelle campagne
          </h1>
          <p className="text-ylang-charcoal/60">
            Composez et envoyez votre newsletter
          </p>
        </div>
      </div>

      {/* Éditeur */}
      <div className="tiptap-editor overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Champ sujet */}
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-ylang-charcoal/40 w-16 shrink-0 text-sm font-semibold">
              Sujet
            </span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex : Nouvelle collection printemps 2026"
              className="text-ylang-charcoal w-full text-sm focus:outline-none"
              maxLength={200}
            />
            <span className="text-ylang-charcoal/30 shrink-0 text-xs">
              {subject.length}/200
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
          <div className="flex flex-wrap items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editorState?.bold ?? false}
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editorState?.italic ?? false}
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editorState?.h1 ?? false}
              title="Titre 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editorState?.h2 ?? false}
              title="Titre 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editorState?.bulletList ?? false}
              title="Liste à puces"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editorState?.orderedList ?? false}
              title="Liste numérotée"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editorState?.alignLeft ?? false}
              title="Aligner à gauche"
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              active={editorState?.alignCenter ?? false}
              title="Centrer"
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editorState?.alignRight ?? false}
              title="Aligner à droite"
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
            <Divider />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setHorizontalRule().run()
              }
              active={false}
              title="Séparateur"
            >
              <Minus className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={openLinkModal}
              active={editorState?.link ?? false}
              title="Insérer un lien"
            >
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Zone TipTap */}
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePreview}
          className="border-ylang-terracotta text-ylang-charcoal hover:bg-ylang-terracotta/10 flex items-center gap-2 rounded-xl border bg-white px-5 py-3 text-sm font-medium transition-colors"
        >
          <Eye className="h-4 w-4" />
          Prévisualiser
        </button>

        <button
          onClick={handleSendClick}
          disabled={isSending}
          className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#b76e79] to-[#d4a89a] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSending ? "Envoi en cours..." : "Envoyer la campagne"}
        </button>
      </div>

      {/* Modal prévisualisation */}
      {showPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                background:
                  "linear-gradient(135deg, #b76e79 0%, #d4a89a 100%)",
                padding: "30px 20px",
                textAlign: "center",
              }}
            >
              <p
                className="font-abramo-script"
                style={{
                  color: "#fff",
                  fontSize: "34px",
                  margin: "-10px",
                }}
              >
                Ylang Créations
              </p>
            </div>
            <div className="tiptap-editor px-8 py-6">
              <div
                className="ProseMirror"
                style={{ color: "#1a1a1a", fontSize: "15px", lineHeight: "1.7" }}
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            </div>
            <div
              style={{
                backgroundColor: "#f5f1e8",
                padding: "20px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: "#1a1a1a",
                  opacity: 0.4,
                  fontSize: "11px",
                  margin: 0,
                }}
              >
                Vous recevez cet email car vous êtes inscrit(e) à notre
                newsletter.{" "}
                <span
                  style={{ color: "#b76e79", textDecoration: "underline" }}
                >
                  Se désinscrire
                </span>
              </p>
            </div>
            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowPreview(false)}
                className="text-ylang-charcoal/60 hover:text-ylang-charcoal text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation envoi */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="text-ylang-charcoal mb-2 text-xl font-bold">
              Confirmer l'envoi
            </h3>
            <p className="text-ylang-charcoal/60 mb-6 text-sm">
              Vous allez envoyer{" "}
              <strong className="text-ylang-charcoal">«{subject}»</strong> à{" "}
              <strong className="text-ylang-charcoal">
                {activeCount !== null
                  ? `${activeCount} abonné${activeCount > 1 ? "s" : ""} actif${activeCount > 1 ? "s" : ""}`
                  : "tous les abonnés actifs"}
              </strong>
              . Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="border-ylang-terracotta text-ylang-charcoal flex-1 rounded-xl border py-3 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSend}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#b76e79] to-[#d4a89a] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Send className="h-4 w-4" />
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal insertion de lien */}
      {showLinkModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowLinkModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50">
                  <Link2 className="h-4 w-4 text-[#b76e79]" />
                </div>
                <h3 className="text-ylang-charcoal text-base font-semibold">
                  Insérer un lien
                </h3>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-ylang-charcoal/40 hover:text-ylang-charcoal rounded-lg p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              <label className="text-ylang-charcoal/60 mb-2 block text-xs font-medium uppercase tracking-wider">
                URL de destination
              </label>
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleInsertLink();
                  if (e.key === "Escape") setShowLinkModal(false);
                }}
                placeholder="https://ylang-creations.fr/..."
                className="text-ylang-charcoal w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-[#b76e79] focus:outline-none"
              />
              <p className="text-ylang-charcoal/40 mt-2 text-xs">
                Laissez vide pour supprimer le lien existant.
              </p>
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              {editorState?.link && (
                <button
                  onClick={handleRemoveLink}
                  className="text-ylang-charcoal/60 hover:text-red-500 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium transition-colors hover:border-red-200 hover:bg-red-50"
                >
                  Supprimer
                </button>
              )}
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-ylang-charcoal/60 hover:text-ylang-charcoal ml-auto rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkUrl.trim() && !editorState?.link}
                className="flex items-center gap-2 rounded-xl bg-linear-to-r from-[#b76e79] to-[#d4a89a] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Link2 className="h-3.5 w-3.5" />
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
      className={`rounded-lg p-2 transition-colors ${
        active
          ? "bg-pink-100 text-[#b76e79]"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-gray-200" />;
}
