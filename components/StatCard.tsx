import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color: 'green' | 'blue' | 'orange' | 'red' | 'gray' | 'purple'
  description?: string
}

const colorMap = {
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-700', text: 'text-green-700' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-700', text: 'text-blue-700' },
  orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-700', text: 'text-orange-700' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-700', text: 'text-red-700' },
  gray: { bg: 'bg-gray-50', icon: 'bg-gray-100 text-gray-600', text: 'text-gray-600' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-700', text: 'text-purple-700' },
}

export function StatCard({ title, value, icon: Icon, color, description }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`card ${c.bg} border-0`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${c.text}`}>{value}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-xl ${c.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}
