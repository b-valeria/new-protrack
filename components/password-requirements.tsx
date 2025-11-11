import { Check, X } from "lucide-react"
import type { PasswordRequirements as PasswordRequirementsType } from "@/lib/password-validation"

interface PasswordRequirementsProps {
  validation?: PasswordRequirementsType
  requirements?: PasswordRequirementsType
}

export function PasswordRequirements({ validation, requirements }: PasswordRequirementsProps) {
  const validationData = validation || requirements

  if (!validationData) {
    return null
  }

  const items = [
    { key: "minLength", label: "Mínimo 8 caracteres", met: validationData.minLength },
    { key: "hasUppercase", label: "Al menos una mayúscula", met: validationData.hasUppercase },
    { key: "hasNumber", label: "Al menos un número", met: validationData.hasNumber },
    { key: "hasSpecialChar", label: "Al menos un signo especial", met: validationData.hasSpecialChar },
  ]

  return (
    <div className="space-y-2 text-sm">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          {item.met ? <Check className="h-4 w-4 text-[#00BF63]" /> : <X className="h-4 w-4 text-red-500" />}
          <span className={item.met ? "text-[#00BF63]" : "text-red-500"}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

export const PasswordRequirementsDisplay = PasswordRequirements
