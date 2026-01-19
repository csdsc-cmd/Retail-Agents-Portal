import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import GlobalHealthBanner from './GlobalHealthBanner';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <GlobalHealthBanner />
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
