import { useState } from 'react';
import './App.css';
import { Header, Hero, PaymentBanner, ProductList, Footer, FloatingCart, CartDrawer, OrderTracking, AboutUs } from './components/User';
import { AdminLayout } from './components/Admin';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { NotifProvider, NotifContainer } from '@/components/ui/notif';
import { OfflineAlert } from './components/common/OfflineAlert/OfflineAlert';

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
              <AdminLayout onSwitchToUser={handleSwitchToUser} />
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
                    <>
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
                    </>
                  )}

                  {currentView === 'track-order' && (
                    <>
                      <OrderTracking onBack={() => setCurrentView('home')} />
                      <Footer onNavigate={(view) => setCurrentView(view)} />
                    </>
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
