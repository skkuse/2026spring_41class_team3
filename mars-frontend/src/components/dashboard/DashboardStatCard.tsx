import type { LucideIcon } from 'lucide-react';

interface DashboardStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  badge: string;
  isLoading?: boolean;
  variant: 'primary' | 'success';
  onClick: () => void;
}

const variantStyles = {
  primary: {
    border: 'hover:border-primary/50',
    iconWrap: 'bg-[#2E2522] border-[#44322B] group-hover:bg-primary/20',
    icon: 'text-primary',
    badge: 'text-primary bg-primary/10 border-primary/20',
    value: 'group-hover:text-primary',
  },
  success: {
    border: 'hover:border-emerald-500/50',
    iconWrap: 'bg-[#222E28] border-[#2B4436] group-hover:bg-emerald-500/20',
    icon: 'text-emerald-500',
    badge: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    value: 'group-hover:text-emerald-500',
  },
};

function DashboardStatCard({
  icon: Icon,
  value,
  label,
  badge,
  isLoading = false,
  variant,
  onClick,
}: DashboardStatCardProps) {
  const styles = variantStyles[variant];

  return (
    <button
      type="button"
      className={`bg-card border border-border rounded-xl p-6 relative flex flex-col justify-between min-h-[140px] cursor-pointer transition-all group text-left ${styles.border}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-lg border transition-all ${styles.iconWrap}`}>
          <Icon className={`w-5 h-5 ${styles.icon}`} strokeWidth={1.5} />
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${styles.badge}`}>
          {badge}
        </span>
      </div>
      <div className="mt-4">
        <h3 className={[
          'font-bold tracking-tight transition-all',
          isLoading
            ? 'text-xs text-muted-foreground/70'
            : `text-3xl text-foreground ${styles.value}`,
        ].join(' ')}
        >
          {value}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </button>
  );
}

export default DashboardStatCard;
