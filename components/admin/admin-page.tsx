import { Plus } from 'lucide-react';
import { ReactNode } from 'react';

import { PageLayout } from '@/components/page-layout';
import { Button } from '@/components/ui/button';

interface AdminPageProps {
  title: string;
  description?: string;
  searchBar?: ReactNode;
  createDialog: ReactNode;
  table: ReactNode;
}

export function AdminPage({
  title,
  description,
  searchBar = null,
  createDialog,
  table,
}: AdminPageProps) {
  return (
    <PageLayout
      title={title}
      description={description}
      headerRight={
        <>
          {searchBar}
          <div className="[&>*]:w-full">{createDialog}</div>
        </>
      }
    >
      {table}
    </PageLayout>
  );
}

export function CreateButton({ text }: { text: string }) {
  return (
    <Button className="gap-2" size="default">
      <Plus className="h-4 w-4" />
      {text}
    </Button>
  );
}
