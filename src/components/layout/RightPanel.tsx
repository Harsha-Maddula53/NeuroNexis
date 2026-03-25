'use client';

import { ReactNode } from "react";

interface RightPanelProps {
  children: ReactNode;
}

export function RightPanel({ children }: RightPanelProps) {
  return (
    <aside className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 overflow-y-auto hidden lg:block z-10">
      <div className="p-6">
        {children}
      </div>
    </aside>
  );
}
