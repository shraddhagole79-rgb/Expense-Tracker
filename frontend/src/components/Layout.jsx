import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top App Bar */}
      <MobileHeader />

      {/* Main Screen Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Mobile Bottom Tab Bar */}
      <BottomNav />
    </div>
  );
}
