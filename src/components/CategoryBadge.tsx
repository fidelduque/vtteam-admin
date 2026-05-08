import type { Category } from '../types'

interface Props {
  category?: Category | null
  small?: boolean
}

export default function CategoryBadge({ category, small }: Props) {
  if (!category) return null
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-0.5 text-xs'
      }`}
      style={{ backgroundColor: category.color + '33', color: category.color }}
    >
      {category.name}
    </span>
  )
}
