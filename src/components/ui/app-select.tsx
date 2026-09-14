import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export interface SelectOption {
  value: string
  label: string
}

const emptyValue = '__all__'

export function AppSelect({
  label,
  value,
  options,
  onValueChange,
  className,
}: {
  label: string
  value: string
  options: SelectOption[]
  onValueChange: (value: string) => void
  className?: string
}) {
  return <Select value={value || emptyValue} onValueChange={next => onValueChange(next === emptyValue ? '' : next)}>
    <SelectTrigger aria-label={label} className={className}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent position="popper" align="start">
      {options.map(option => <SelectItem key={option.value || emptyValue} value={option.value || emptyValue}>{option.label}</SelectItem>)}
    </SelectContent>
  </Select>
}
