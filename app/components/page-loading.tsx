"use client";

import { Spin } from "antd";

interface PageLoadingProps {
  description: string;
  className?: string;
}

export default function PageLoading({
  description,
  className = "flex flex-col items-center justify-center h-80",
}: PageLoadingProps) {
  return (
    <div className={className}>
      <Spin size="large" description={description} />
    </div>
  );
}
