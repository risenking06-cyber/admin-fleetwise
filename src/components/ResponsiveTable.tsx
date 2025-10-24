import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className = '' }: ResponsiveTableProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ResponsiveTableHeaderProps {
  children: ReactNode;
}

export function ResponsiveTableHeader({ children }: ResponsiveTableHeaderProps) {
  return (
    <thead className="bg-muted/50 border-b border-border">
      {children}
    </thead>
  );
}

interface ResponsiveTableBodyProps {
  children: ReactNode;
}

export function ResponsiveTableBody({ children }: ResponsiveTableBodyProps) {
  return (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  );
}

interface ResponsiveTableRowProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ResponsiveTableRow({ children, onClick, className = '' }: ResponsiveTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-muted/30 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  header?: boolean;
}

export function ResponsiveTableCell({ children, className = '', header = false }: ResponsiveTableCellProps) {
  const Tag = header ? 'th' : 'td';
  const baseClass = header
    ? 'text-left py-3 px-4 text-sm font-semibold text-foreground whitespace-nowrap'
    : 'py-3 px-4 text-sm text-foreground';

  return (
    <Tag className={`${baseClass} ${className}`}>
      {children}
    </Tag>
  );
}
