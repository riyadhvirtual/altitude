import { NavbarPageLayout } from '@/components/navbar/navbar-page-layout';

interface NavbarLayoutProps {
  children: React.ReactNode;
}

export default function NavbarLayout({ children }: NavbarLayoutProps) {
  return <NavbarPageLayout>{children}</NavbarPageLayout>;
}
