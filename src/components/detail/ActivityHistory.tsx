import { Clock } from 'lucide-react'
import type { ActivityEntry } from '../../types'
import { formatDate } from '../../utils/dates'

interface ActivityHistoryProps {
  activity: ActivityEntry[]
}

export function ActivityHistory({ activity }: ActivityHistoryProps) {
  const sorted = [...activity].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-[#1e3a5f]" aria-hidden="true" />
        Activity History
      </h3>
      {sorted.length === 0 ? (
        <p className="text-gray-500 text-[16px]">No activity recorded yet.</p>
      ) : (
        <ol className="relative border-l-2 border-gray-200 ml-3 space-y-5" aria-label="Activity history">
          {sorted.map(entry => (
            <li key={entry.id} className="ml-5">
              <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-[#1e3a5f] border-2 border-white" aria-hidden="true" />
              <time className="text-sm text-gray-500" dateTime={entry.date}>
                {formatDate(entry.date)}
              </time>
              <p className="text-[17px] text-gray-800 mt-0.5">{entry.description}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
