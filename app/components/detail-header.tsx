'use client';

import { ReactNode } from 'react';
import { Button, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface DetailHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  onBack: () => void;
  backLabel?: string;
  actions?: ReactNode;
}

export default function DetailHeader({
  title,
  subtitle,
  badge,
  onBack,
  backLabel = 'Quay lại',
  actions,
}: DetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button icon={<ArrowLeftOutlined />} onClick={onBack} className="rounded-lg">
          {backLabel}
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Title level={3} className="!mb-0 text-[#111827]">
              {title}
            </Title>
            {badge}
          </div>
          {subtitle && (
            <Text className="text-secondary text-xs">
              {subtitle}
            </Text>
          )}
        </div>
      </div>
      {actions}
    </div>
  );
}
