'use client';

import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  size?: 'large' | 'middle' | 'small';
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  className = 'rounded-lg',
  size,
}: SearchInputProps) {
  return (
    <Input
      prefix={<SearchOutlined className="text-gray-400 mr-1" />}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      allowClear
      size={size}
      className={className}
    />
  );
}
