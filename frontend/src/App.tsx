import { useState, lazy, Suspense } from 'react';
import './App.css';
import { Header, Hero, PaymentBanner, ProductList, Footer, FloatingCart, CartDrawer } from './components/User';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { NotifProvider, NotifContainer } from '@/components/ui/notif';
import { OfflineAlert } from './components/common/OfflineAlert/OfflineAlert';

// Lazy load Admin Portal & Secondary User Pages for high performance on low-end devices
const AdminLayout = lazy(() => import('./components/Admin/AdminLayout/AdminLayout'));
const AboutUs = lazy(() => import('./components/User/AboutUs/AboutUs'));
const OrderTracking = lazy(() => import('./components/User/OrderTracking/OrderTracking'));

const AdminLoadingScreen = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#090D16',
    color: '#F8FAFC',
    gap: '16px',
    fontFamily: 'Inter, system-ui, sans-serif'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(250, 172, 48, 0.2)',
      borderTopColor: '#FAAC30',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.02em', color: '#CBD5E1' }}>
      Memuat Portal Admin Lakstari...
    </span>
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);

const UserViewFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
    color: '#64748B'
  }}>
    <div style={{
      width: '28px',
      height: '28px',
      border: '3px solid #E2E8F0',
      borderTopColor: '#FAAC30',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);

function App() {
  const [role, setRole] = useState<'user' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'user';
  });

  const [currentView, setCurrentView] = useState<'home' | 'about' | 'track-order'>('home');

  const handleSwitchToAdmin = () => {
    setRole('admin');
    window.history.pushState({}, '', '/admin');
  };

  const handleSwitchToUser = () => {
    setRole('user');
    window.history.pushState({}, '', '/');
  };

  return (
    <NotifProvider>
      <CategoryProvider>
        <ProductProvider>
          <CartProvider>
            <NotifContainer />
            <OfflineAlert />
            {role === 'admin' ? (
              <Suspense fallback={<AdminLoadingScreen />}>
                <AdminLayout onSwitchToUser={handleSwitchToUser} />
              </Suspense>
            ) : (
              <>
                <div className="app-container">
                  <Header
                    onSwitchToAdmin={handleSwitchToAdmin}
                    onNavigate={(view) => setCurrentView(view)}
                    currentView={currentView}
                  />

                  {currentView === 'home' && (
                    <>
                      <Hero />
                      <PaymentBanner />
                      <div id="katalog">
                        <ProductList />
                      </div>
                      <Footer onNavigate={(view) => setCurrentView(view)} />
                    </>
                  )}

                  {currentView === 'about' && (
                    <Suspense fallback={<UserViewFallback />}>
                      <AboutUs 
                        onBack={() => setCurrentView('home')} 
                        onNavigateToCatalog={() => {
                          setCurrentView('home');
                          setTimeout(() => {
                            const el = document.getElementById('katalog');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 150);
                        }}
                      />
                      <Footer onNavigate={(view) => setCurrentView(view)} />
                    </Suspense>
                  )}

                  {currentView === 'track-order' && (
                    <Suspense fallback={<UserViewFallback />}>
                      <OrderTracking onBack={() => setCurrentView('home')} />
                      <Footer onNavigate={(view) => setCurrentView(view)} />
                    </Suspense>
                  )}
                </div>

                <FloatingCart />
                <CartDrawer onNavigateToTracking={() => setCurrentView('track-order')} />
              </>
            )}
          </CartProvider>
        </ProductProvider>
      </CategoryProvider>
    </NotifProvider>
  );
}

export default App;
