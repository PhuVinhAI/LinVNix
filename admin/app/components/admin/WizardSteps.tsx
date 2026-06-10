import { Link } from 'react-router'
import { Check, ChevronRight, Lock } from 'lucide-react'

export interface WizardStep {
  key: string
  /** số thứ tự hiển thị, vd "1.2" hoặc "2" */
  number: string
  label: string
  state: 'done' | 'current' | 'upcoming'
  /** cho phép bấm để nhảy tới bước (wizard điều hướng được, không phải nhà tù) */
  to?: string
  /** bước bị khóa cho tới khi hoàn thành bước trước — hiện icon khóa, không bấm được */
  locked?: boolean
}

/**
 * Thanh trình tự bước con của Giai đoạn soạn bài (ADR 0002).
 * Bước hiện tại nổi bật, bước đã soạn có dấu check, bước khóa hiện ổ khóa.
 */
export function WizardSteps({ steps }: { steps: WizardStep[] }) {
  return (
    <nav aria-label="Trình tự soạn" className="flex items-center gap-1.5 flex-wrap">
      {steps.map((step, idx) => (
        <div key={step.key} className="flex items-center gap-1.5">
          {idx > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
          <StepChip step={step} />
        </div>
      ))}
    </nav>
  )
}

function StepChip({ step }: { step: WizardStep }) {
  const base =
    'inline-flex items-center gap-2 rounded-lg border-2 px-3 py-1.5 text-sm font-bold transition-colors'

  if (step.state === 'current') {
    return (
      <span className={`${base} border-primary bg-primary text-primary-foreground`}>
        <span className="tabular-nums">{step.number}</span>
        <span>{step.label}</span>
      </span>
    )
  }

  const inner =
    step.state === 'done' ? (
      <>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
          <Check className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
        </span>
        <span className="tabular-nums">{step.number}</span>
        <span>{step.label}</span>
      </>
    ) : (
      <>
        {step.locked && <Lock className="h-3.5 w-3.5" />}
        <span className="tabular-nums">{step.number}</span>
        <span>{step.label}</span>
      </>
    )

  const tone =
    step.state === 'done'
      ? 'border-border bg-card text-foreground'
      : 'border-border bg-muted/30 text-muted-foreground'

  if (step.to && !step.locked) {
    return (
      <Link to={step.to} className={`${base} ${tone} hover:border-primary`}>
        {inner}
      </Link>
    )
  }
  return <span className={`${base} ${tone}`}>{inner}</span>
}
