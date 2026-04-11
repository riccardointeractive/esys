'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  ImageUp,
  Library,
  Undo2,
  Redo2,
  FileCode2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadBlogImage } from '@/lib/blog-upload'
import { BlogMediaPickerModal, type BlogMediaSelection } from '@/components/admin/BlogMediaPickerModal'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  active?: boolean
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'vip-rte__btn',
        isActive && 'vip-rte__btn--active'
      )}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  const insertFromLibrary = (item: BlogMediaSelection) => {
    editor
      .chain()
      .focus()
      .setImage({
        src: item.url,
        alt: item.alt,
      })
      .run()
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // reset so same file can be picked again
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadBlogImage(file)
      editor
        .chain()
        .focus()
        .setImage({
          src: result.url,
          alt: result.filename,
        })
        .run()
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  const promptLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previous ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const promptImage = () => {
    const url = window.prompt('URL imagen', 'https://')
    if (!url) return
    editor.chain().focus().setImage({ src: url }).run()
  }

  const pasteHtml = () => {
    const html = window.prompt('Pegar HTML (se insertará parseado, no como texto)', '')
    if (!html) return
    editor.chain().focus().insertContent(html).run()
  }

  return (
    <div className="vip-rte__toolbar">
      <ToolbarButton
        title="Negrita"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
      >
        <Bold size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Cursiva"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
      >
        <Italic size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Tachado"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough size={16} />
      </ToolbarButton>
      <span className="vip-rte__sep" />
      <ToolbarButton
        title="Título 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Título 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 size={16} />
      </ToolbarButton>
      <span className="vip-rte__sep" />
      <ToolbarButton
        title="Lista"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
      >
        <List size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Lista numerada"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Cita"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
      >
        <Quote size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Código"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
      >
        <Code size={16} />
      </ToolbarButton>
      <span className="vip-rte__sep" />
      <ToolbarButton title="Enlace" onClick={promptLink} isActive={editor.isActive('link')}>
        <Link2 size={16} />
      </ToolbarButton>
      <ToolbarButton title="Imagen desde URL" onClick={promptImage}>
        <ImageIcon size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Subir imagen"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 size={16} className="ds-animate-spin" /> : <ImageUp size={16} />}
      </ToolbarButton>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={onFileChange}
        className="vip-rte__file-input"
      />
      <ToolbarButton
        title="Imagen desde la biblioteca del blog"
        onClick={() => setPickerOpen(true)}
      >
        <Library size={16} />
      </ToolbarButton>
      <ToolbarButton title="Pegar HTML" onClick={pasteHtml}>
        <FileCode2 size={16} />
      </ToolbarButton>
      <span className="vip-rte__sep" />
      <ToolbarButton
        title="Deshacer"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo2 size={16} />
      </ToolbarButton>
      <ToolbarButton
        title="Rehacer"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo2 size={16} />
      </ToolbarButton>

      <BlogMediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={insertFromLibrary}
      />
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, active = true }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // StarterKit v3 bundles Link by default; disable it so we can use
        // our own configured Link extension below without a duplicate.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'vip-rte__img' },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'vip-rte__content',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync external value resets (e.g. when loading a record on edit)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value && value !== current && !editor.isFocused) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return <div className="vip-rte vip-rte--loading">Cargando editor...</div>
  }

  return (
    <div className={cn('vip-rte', !active && 'vip-rte--hidden')}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
