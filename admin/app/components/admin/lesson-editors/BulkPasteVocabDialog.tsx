import { useMemo, useRef, useState } from 'react'
import { FileSpreadsheet, Sparkles, Upload, Download, X } from 'lucide-react'
import { read, utils, write } from 'xlsx'
import { toast } from 'sonner'
import { Button } from '@/app/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'
import { Textarea } from '@/app/components/ui/textarea'
import { POS_OPTIONS } from './shared/PartOfSpeechPicker'

type ParsedItem = {
  word: string
  translation: string
  partOfSpeech?: string
  phonetic?: string
  exampleSentence?: string
}

const POS_VALUES = new Set(POS_OPTIONS.map((p) => p.value))

const HEADER_ALIASES: Record<keyof ParsedItem, string[]> = {
  word: ['word', 'từ', 'tu', 'vietnamese', 'vi', 'tiếng việt', 'tieng viet'],
  translation: ['translation', 'bản dịch', 'ban dich', 'meaning', 'english', 'en', 'nghĩa'],
  partOfSpeech: ['partofspeech', 'part of speech', 'loại từ', 'loai tu', 'loại', 'loai', 'pos'],
  phonetic: ['phonetic', 'phiên âm', 'phien am', 'pronunciation', 'ipa'],
  exampleSentence: ['example', 'examplesentence', 'ví dụ', 'vi du', 'câu ví dụ', 'cau vi du'],
}

function normalizeHeader(h: unknown): string {
  return String(h ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function findField(header: string): keyof ParsedItem | null {
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.includes(header)) return field as keyof ParsedItem
  }
  return null
}

function parseTSV(input: string): ParsedItem[] {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  return lines.map((line) => {
    const cols = line.split(/\t|\s{2,}|\s\|\s|;/).map((c) => c.trim())
    const [word, translation, maybePos, phonetic, example] = cols
    const pos = maybePos && POS_VALUES.has(maybePos.toLowerCase()) ? maybePos.toLowerCase() : undefined
    return {
      word: word ?? '',
      translation: translation ?? '',
      partOfSpeech: pos,
      phonetic: phonetic || undefined,
      exampleSentence: example || undefined,
    }
  })
}

function parseSheet(rows: unknown[][]): ParsedItem[] {
  if (rows.length === 0) return []
  // Detect header row
  const firstRow = rows[0].map(normalizeHeader)
  const hasHeader = firstRow.some((h) => findField(h) !== null)

  if (hasHeader) {
    const fieldMap = firstRow.map(findField)
    return rows.slice(1).map((row) => {
      const item: ParsedItem = { word: '', translation: '' }
      row.forEach((cell, i) => {
        const field = fieldMap[i]
        if (!field) return
        const val = String(cell ?? '').trim()
        if (field === 'partOfSpeech') {
          item.partOfSpeech = val && POS_VALUES.has(val.toLowerCase()) ? val.toLowerCase() : undefined
        } else if (val) {
          ;(item as Record<string, string>)[field] = val
        }
      })
      return item
    })
  }

  // No header — assume column order [word, translation, partOfSpeech, phonetic, example]
  return rows.map((row) => {
    const cells = row.map((c) => String(c ?? '').trim())
    const [word, translation, maybePos, phonetic, example] = cells
    const pos = maybePos && POS_VALUES.has(maybePos.toLowerCase()) ? maybePos.toLowerCase() : undefined
    return {
      word: word ?? '',
      translation: translation ?? '',
      partOfSpeech: pos,
      phonetic: phonetic || undefined,
      exampleSentence: example || undefined,
    }
  })
}

function downloadTemplate() {
  const data = [
    ['word', 'translation', 'partOfSpeech', 'phonetic', 'exampleSentence'],
    ['xin chào', 'hello', 'phrase', '/sin tʃaːw/', 'Tôi xin chào bạn.'],
    ['cảm ơn', 'thank you', 'phrase', '', ''],
    ['quyển sách', 'book', 'noun', '', 'Tôi đọc quyển sách này.'],
  ]
  const ws = utils.aoa_to_sheet(data)
  ws['!cols'] = [{ wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 28 }]
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Từ vựng')
  const buf = write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mau-tu-vung.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function BulkPasteVocabDialog({
  open,
  onOpenChange,
  existingCount,
  onImport,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingCount: number
  onImport: (items: ParsedItem[]) => Promise<void>
}) {
  const [text, setText] = useState('')
  const [fileItems, setFileItems] = useState<ParsedItem[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const parsedFromText = useMemo(() => parseTSV(text), [text])
  const parsed = fileItems ?? parsedFromText
  const valid = parsed.filter((p) => p.word && p.translation)

  const handleFile = async (file: File) => {
    try {
      const buf = await file.arrayBuffer()
      const wb = read(buf, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      if (!sheetName) {
        toast.error('File không có sheet nào')
        return
      }
      const rows = utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, defval: '' })
      const items = parseSheet(rows)
      if (items.length === 0) {
        toast.warning('Không tìm thấy dữ liệu trong file')
        return
      }
      setFileItems(items)
      setFileName(file.name)
      setText('')
      toast.success(`Đã đọc ${items.length} dòng từ ${file.name}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể đọc file')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const clearFile = () => {
    setFileItems(null)
    setFileName(null)
  }

  const handleImport = async () => {
    if (valid.length === 0) return
    setBusy(true)
    try {
      await onImport(valid)
      toast.success(`Đã thêm ${valid.length} từ vựng`)
      setText('')
      clearFile()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể nhập')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        dimBackdrop={false}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Nhập từ Excel
          </DialogTitle>
          <DialogDescription>
            Tải lên file <strong>.xlsx</strong> hoặc <strong>.csv</strong>, hoặc dán dữ liệu từ Excel/Google Sheets vào ô bên dưới.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* File upload + template */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
            {fileName ? (
              <div className="flex items-center gap-2 rounded-lg border-2 border-primary/40 bg-primary/5 px-3 py-2.5">
                <FileSpreadsheet className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{fileName}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {parsed.length} dòng đọc được
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={clearFile} className="h-8 w-8" aria-label="Bỏ file">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add('border-primary', 'bg-primary/5')
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFile(file)
                }}
                className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold">Chọn file hoặc kéo thả vào đây</div>
                  <div className="text-xs text-muted-foreground">Hỗ trợ .xlsx, .xls, .csv</div>
                </div>
              </button>
            )}
            <Button variant="outline" onClick={downloadTemplate} className="sm:w-auto">
              <Download className="h-4 w-4" />
              Tải mẫu Excel
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            className="sr-only"
            aria-hidden
          />

          {/* OR divider + paste textarea */}
          {!fileName && (
            <>
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hoặc dán</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="rounded-lg border-2 border-border bg-muted/30 p-3 text-xs text-muted-foreground font-mono whitespace-pre">
                {`xin chào\thello\tphrase\t/sin tʃaːw/\tTôi xin chào bạn.
cảm ơn\tthank you\tphrase
quyển sách\tbook\tnoun`}
              </div>

              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Dán dữ liệu từ Excel/Google Sheets vào đây (mỗi dòng một từ, cột cách bằng Tab)..."
                className="min-h-28 font-mono text-sm"
              />
            </>
          )}

          {/* Preview */}
          {parsed.length > 0 && (
            <div className="rounded-lg border-2 border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b-2 border-border bg-muted/30 px-3 py-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Xem trước
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  <strong className="text-foreground">{valid.length}</strong> hợp lệ
                  {parsed.length - valid.length > 0 && ` · ${parsed.length - valid.length} bỏ qua`}
                  {' · '}sẽ thêm từ #{existingCount + 1}
                </span>
              </div>
              <div className="max-h-48 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/40 border-b border-border sticky top-0">
                    <tr>
                      <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">Từ</th>
                      <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">Bản dịch</th>
                      <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">Loại</th>
                      <th className="text-left px-2 py-1.5 font-bold text-muted-foreground">Ví dụ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.slice(0, 50).map((item, i) => {
                      const isValid = item.word && item.translation
                      return (
                        <tr
                          key={i}
                          className={`border-b border-border last:border-b-0 ${isValid ? '' : 'opacity-50 bg-destructive/5'}`}
                        >
                          <td className="px-2 py-1 font-bold">{item.word || '—'}</td>
                          <td className="px-2 py-1">{item.translation || '—'}</td>
                          <td className="px-2 py-1 text-muted-foreground">{item.partOfSpeech ?? 'phrase'}</td>
                          <td className="px-2 py-1 text-muted-foreground truncate max-w-[200px]">{item.exampleSentence ?? ''}</td>
                        </tr>
                      )
                    })}
                    {parsed.length > 50 && (
                      <tr>
                        <td colSpan={4} className="px-2 py-1 text-center text-muted-foreground italic">
                          ... và {parsed.length - 50} dòng nữa
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={busy || valid.length === 0}>
            {busy ? 'Đang nhập...' : `Nhập ${valid.length} từ`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
