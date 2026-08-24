'use client';

import { ReactNode } from 'react';
import { Card } from 'antd';

interface StatCardProps {
  label: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  value: ReactNode;
  valueClassName?: string;
  footer?: ReactNode;
  hoverBorderClassName?: string;
  className?: string;
  onClick?: () => void;
}

export default function StatCard({
  label,
  icon,
  iconClassName = 'bg-emerald-50 text-[#006C49]',
  value,
  valueClassName = 'text-[#111827]',
  footer,
  hoverBorderClassName = 'hover:border-emerald-300',
  className,
  onClick,
}: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      className={
        className ??
        `border border-[#E5E7EB] shadow-xs rounded-xl ${hoverBorderClassName} transition-all${onClick ? ' cursor-pointer' : ''}`
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-secondary text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconClassName}`}>
          {icon}
        </div>
      </div>
      <div className="mt-2.5">
        <div className={`text-2xl font-bold font-mono ${valueClassName}`}>
          {value}
        </div>
        {footer}
      </div>
    </Card>
  );
}
