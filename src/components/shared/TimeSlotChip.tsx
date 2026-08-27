export function TimeSlotChip({
  startTime,
  endTime,
  selected,
  disabled,
  onClick,
}: {
  startTime: string
  endTime: string
  selected: boolean
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
        disabled
          ? 'cursor-not-allowed border-border bg-muted text-muted-foreground line-through'
          : selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-foreground'
      }`}
    >
      {startTime} - {endTime}
    </button>
  )
}
