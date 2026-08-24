'use client';

import { ReactNode } from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
}

export default function PageHeader({
  title,
  subtitle,
  actions,
  actionsClassName = 'flex items-center gap-2.5',
}: PageHeaderProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
      <div>
        <Title level={3} className="!mb-0 text-[#111827] !font-bold">
          {title}
        </Title>
        {subtitle && (
          <Text className="text-secondary text-xs mt-1 block">
            {subtitle}
          </Text>
        )}
      </div>
      {actions && <div className={actionsClassName}>{actions}</div>}
    </div>
  );
}
