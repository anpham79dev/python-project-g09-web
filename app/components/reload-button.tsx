'use client';

import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface ReloadButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export default function ReloadButton({ onClick, loading }: ReloadButtonProps) {
  return (
    <Button
      icon={<ReloadOutlined />}
      onClick={onClick}
      loading={loading}
      className="rounded-lg text-xs font-medium h-9 flex items-center"
    >
      Làm mới
    </Button>
  );
}
