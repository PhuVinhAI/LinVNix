import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
} from 'react'
import { Plus } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover'

export interface PromptVariable {
  key: string
  label: string
  description: string
}

export interface PromptVariableGroup {
  groupLabel: string
  variables: PromptVariable[]
}

// Variables actually substituted at runtime by `SimulationAiService.buildSystemInstruction`.
// Adding a chip here is a no-op unless the backend kwargs include it.
const PROMPT_VARIABLES: PromptVariableGroup[] = [
  {
    groupLabel: 'Học viên',
    variables: [
      {
        key: 'learner.level',
        label: 'Cấp độ học viên',
        description: 'Trình độ CEFR hiện tại (A1, A2, B1, B2, C1, C2)',
      },
      {
        key: 'learner.nativeLanguage',
        label: 'Tiếng mẹ đẻ',
        description: 'Tiếng mẹ đẻ học viên đã khai báo trong hồ sơ',
      },
      {
        key: 'learner.preferredDialect',
        label: 'Phương ngữ ưa thích',
        description: 'Phương ngữ tiếng Việt ưa thích (Bắc, Trung, Nam)',
      },
    ],
  },
  {
    groupLabel: 'Nhân vật học viên đóng vai',
    variables: [
      {
        key: 'playable.name',
        label: 'Tên nhân vật',
        description: 'Tên nhân vật mà học viên đang đóng vai trong tình huống',
      },
      {
        key: 'playable.role',
        label: 'Vai trò nhân vật',
        description: 'Vai trò của nhân vật học viên (ví dụ: du khách, học sinh)',
      },
    ],
  },
  {
    groupLabel: 'Tình huống',
    variables: [
      {
        key: 'scenario.title',
        label: 'Tên tình huống',
        description: 'Tên tình huống đã đặt ở phần Thông tin tình huống',
      },
      {
        key: 'scenario.description',
        label: 'Mô tả tình huống',
        description: 'Mô tả bối cảnh tình huống',
      },
    ],
  },
  {
    groupLabel: 'Cấu hình phiên',
    variables: [
      {
        key: 'maxTurns',
        label: 'Số lượt tối đa',
        description: 'Số lượt nói tối đa (hoặc "unlimited" nếu không giới hạn)',
      },
    ],
  },
]

const VARIABLES_BY_KEY = new Map<string, PromptVariable>()
for (const group of PROMPT_VARIABLES) {
  for (const variable of group.variables) {
    VARIABLES_BY_KEY.set(variable.key, variable)
  }
}

const PLACEHOLDER_REGEX = /\{\{([^{}]+?)\}\}/g

const CHIP_CLASS =
  'inline-flex items-center align-baseline rounded-md bg-primary/10 text-primary border-2 border-primary/30 px-1.5 py-0.5 mx-0.5 text-xs font-bold select-none cursor-default'

function createChip(key: string): HTMLElement {
  const span = document.createElement('span')
  span.setAttribute('data-prompt-variable', key)
  span.setAttribute('contenteditable', 'false')
  span.className = CHIP_CLASS
  const variable = VARIABLES_BY_KEY.get(key)
  span.textContent = variable?.label ?? key
  return span
}

function appendText(root: HTMLElement, text: string) {
  if (!text) return
  const parts = text.split('\n')
  parts.forEach((part, index) => {
    if (index > 0) root.appendChild(document.createElement('br'))
    if (part) root.appendChild(document.createTextNode(part))
  })
}

function renderTemplate(template: string, root: HTMLElement) {
  root.replaceChildren()
  if (!template) return
  PLACEHOLDER_REGEX.lastIndex = 0
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = PLACEHOLDER_REGEX.exec(template)) !== null) {
    if (match.index > lastIndex) {
      appendText(root, template.slice(lastIndex, match.index))
    }
    const key = match[1].trim()
    root.appendChild(createChip(key))
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < template.length) {
    appendText(root, template.slice(lastIndex))
  }
}

function serializeEditor(root: HTMLElement): string {
  let result = ''

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? ''
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    const key = el.getAttribute('data-prompt-variable')
    if (key) {
      result += `{{${key}}}`
      return
    }
    if (el.tagName === 'BR') {
      result += '\n'
      return
    }
    const isBlock = el.tagName === 'DIV' || el.tagName === 'P'
    if (isBlock && result.length > 0 && !result.endsWith('\n')) {
      result += '\n'
    }
    Array.from(el.childNodes).forEach(walk)
  }

  Array.from(root.childNodes).forEach(walk)
  return result
}

function isEditorEmpty(root: HTMLElement): boolean {
  if (root.querySelector('[data-prompt-variable]')) return false
  return (root.textContent ?? '').length === 0
}

export function SystemPromptEditor({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  required?: boolean
}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)
  const lastSerialized = useRef<string>(value)
  const initialized = useRef(false)
  const [empty, setEmpty] = useState(value.length === 0)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    if (initialized.current && value === lastSerialized.current) return
    renderTemplate(value, editor)
    lastSerialized.current = value
    initialized.current = true
    setEmpty(isEditorEmpty(editor))
  }, [value])

  useEffect(() => {
    if (!placeholderRef.current) return
    renderTemplate(placeholder ?? '', placeholderRef.current)
  }, [placeholder])

  const emitChange = () => {
    const editor = editorRef.current
    if (!editor) return
    const serialized = serializeEditor(editor)
    lastSerialized.current = serialized
    setEmpty(isEditorEmpty(editor))
    onChange(serialized)
  }

  const handlePaste = (e: ReactClipboardEvent<HTMLDivElement>) => {
    e.preventDefault()
    const text = e.clipboardData?.getData('text/plain') ?? ''
    if (!text) return
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    range.deleteContents()
    const fragment = document.createDocumentFragment()
    const parts = text.split('\n')
    parts.forEach((part, index) => {
      if (index > 0) fragment.appendChild(document.createElement('br'))
      if (part) fragment.appendChild(document.createTextNode(part))
    })
    const lastNode = fragment.lastChild
    range.insertNode(fragment)
    if (lastNode) {
      range.setStartAfter(lastNode)
      range.setEndAfter(lastNode)
      selection.removeAllRanges()
      selection.addRange(range)
    }
    emitChange()
  }

  const insertVariable = (key: string) => {
    const editor = editorRef.current
    if (!editor) return
    editor.focus()
    const selection = window.getSelection()
    let range: Range
    if (
      selection &&
      selection.rangeCount > 0 &&
      selection.anchorNode &&
      editor.contains(selection.anchorNode)
    ) {
      range = selection.getRangeAt(0)
    } else {
      range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
    }
    range.deleteContents()
    const chip = createChip(key)
    const trailingSpace = document.createTextNode(' ')
    range.insertNode(trailingSpace)
    range.insertNode(chip)
    range.setStartAfter(trailingSpace)
    range.setEndAfter(trailingSpace)
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
    emitChange()
    setPickerOpen(false)
  }

  return (
    <div className="relative rounded-lg border-2 border-input bg-card transition-colors focus-within:border-primary overflow-hidden">
      <div className="flex items-center gap-2 border-b-2 border-border bg-muted/30 px-2 py-1.5">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border-2 border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Chèn biến
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            onCloseAutoFocus={(e) => e.preventDefault()}
            className="w-80 max-h-[420px] overflow-y-auto p-3"
          >
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Chọn biến để chèn vào vị trí con trỏ.
              </p>
              {PROMPT_VARIABLES.map((group) => (
                <div key={group.groupLabel} className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group.groupLabel}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.variables.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => insertVariable(v.key)}
                        title={v.description}
                        className="inline-flex items-center rounded-md border-2 border-border bg-card px-2 py-1 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/5 transition-colors"
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <p className="text-[11px] text-muted-foreground">
          Biến sẽ được thay bằng giá trị thật khi học viên bắt đầu hội thoại
        </p>
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-required={required}
          onInput={emitChange}
          onPaste={handlePaste}
          className="min-h-44 w-full px-3 py-2 text-sm leading-relaxed outline-none whitespace-pre-wrap break-words"
        />
        <div
          ref={placeholderRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-3 top-2 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground opacity-70 ${empty ? '' : 'hidden'}`}
        />
      </div>

      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value}
          onChange={() => {}}
          className="absolute inset-0 h-px w-px opacity-0 pointer-events-none"
        />
      )}
    </div>
  )
}
