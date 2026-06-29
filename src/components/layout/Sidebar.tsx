import { Users, CreditCard, Bell, BarChart2, Settings } from 'lucide-react'

type NavItem = 'Members' | 'Dues' | 'Reminders' | 'Reports' | 'Settings'

interface SidebarProps {
  activeItem: NavItem
  onNavigate: (item: NavItem) => void
}

const NAV_ITEMS: { label: NavItem; icon: React.ReactNode }[] = [
  { label: 'Members', icon: <Users size={22} /> },
  { label: 'Dues', icon: <CreditCard size={22} /> },
  { label: 'Reminders', icon: <Bell size={22} /> },
  { label: 'Reports', icon: <BarChart2 size={22} /> },
  { label: 'Settings', icon: <Settings size={22} /> },
]

export function Sidebar({ activeItem, onNavigate }: SidebarProps) {
  return (
    <nav
      className="w-56 flex-shrink-0 bg-[#1e3a5f] flex flex-col min-h-screen"
      aria-label="Main navigation"
    >
      {/* Logo / Club Name */}
      <div className="px-5 py-6 border-b border-[#162d4a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-[#1e3a5f]" />
          </div>
          <div>
            <div className="text-white font-bold text-[16px] leading-tight">All Wool & A Yard Wide</div>
            <div className="text-[#adc1dd] text-sm leading-tight">Members Portal</div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <ul className="flex-1 py-4 list-none m-0 p-0" role="list">
        {NAV_ITEMS.map(({ label, icon }) => {
          const isActive = activeItem === label
          return (
            <li key={label}>
              <button
                onClick={() => onNavigate(label)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left text-[17px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-[#1e3a5f]'
                    : 'text-[#d5e0ee] hover:bg-[#162d4a] hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={isActive ? 'text-[#1e3a5f]' : 'text-[#7a9dc4]'} aria-hidden="true">
                  {icon}
                </span>
                {label}
              </button>
            </li>
          )
        })}
      </ul>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#162d4a]">
        <p className="text-[#7a9dc4] text-sm">All Wool & A Yard Wide</p>
      </div>
    </nav>
  )
}
