import { useState } from 'react';
import './App.css';
import { Header, Hero, PaymentBanner, ProductList, Footer, FloatingCart, CartDrawer } from './components/User';
import { AdminLayout } from './components/Admin';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { CategoryProvider } from './context/CategoryContext';
import { NotifProvider, NotifContainer } from '@/components/ui/notif';

function App() {
  const [role, setRole] = useState<'user' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'user';
  });

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
            {role === 'admin' ? (
              <AdminLayout onSwitchToUser={handleSwitchToUser} />
            ) : (
              <div className="app-container">
                <Header onSwitchToAdmin={handleSwitchToAdmin} />
                <Hero />
                <PaymentBanner />
                <ProductList />
                <Footer />
                
                <FloatingCart />
                <CartDrawer />
              </div>
            )}
          </CartProvider>
        </ProductProvider>
      </CategoryProvider>
    </NotifProvider>
  );
}

export default App;
