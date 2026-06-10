import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar      from './components/Navbar/Navbar';
import Cart        from './components/Cart/Cart';
import AuthModal   from './components/AuthModal/AuthModal';
import Toast       from './components/Toast/Toast';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';

// Lazy-loaded pages — each becomes its own JS chunk
const Home          = lazy(() => import('./pages/Home/Home'));
const Catalog       = lazy(() => import('./pages/Catalog/Catalog'));
const ProductDetail = lazy(() => import('./pages/ProductDetail/ProductDetail'));
const Account       = lazy(() => import('./pages/Account/Account'));
const Orders        = lazy(() => import('./pages/Orders/Orders'));
const OrderDetail   = lazy(() => import('./pages/Orders/OrderDetail'));
const Checkout      = lazy(() => import('./pages/Checkout/Checkout'));
const Wishlist      = lazy(() => import('./pages/Wishlist/Wishlist'));

// Admin pages
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const Dashboard   = lazy(() => import('./pages/Admin/Dashboard/Dashboard'));
const ProductsList = lazy(() => import('./pages/Admin/Products/ProductsList'));
const ProductForm  = lazy(() => import('./pages/Admin/Products/ProductForm'));
const AdminOrders  = lazy(() => import('./pages/Admin/Orders/AdminOrders'));
const AdminUsers   = lazy(() => import('./pages/Admin/Users/AdminUsers'));

// Forces a full remount when navigating between products — keeps ProductDetail state clean
function KeyedProductDetail() {
  const { id } = useParams();
  return <ProductDetail key={id} />;
}

function PageLoader() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--muted)' }}>
      🌍
    </div>
  );
}

export default function App() {
  const init     = useAuthStore(s => s.init);
  const { pathname } = useLocation();
  const isAdmin  = pathname.startsWith('/admin');

  useEffect(() => { init(); }, [init]);

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Navbar />}

      <main style={isAdmin ? undefined : { paddingTop: 'var(--nav-h)' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/catalog"     element={<Catalog />} />
            <Route path="/product/:id" element={<KeyedProductDetail />} />
            <Route path="/account"     element={<Account />} />
            <Route path="/orders"      element={<Orders />} />
            <Route path="/orders/:id"  element={<OrderDetail />} />
            <Route path="/checkout"    element={<Checkout />} />
            <Route path="/wishlist"    element={<Wishlist />} />
            <Route path="/collections" element={<ComingSoon label="Collections" />} />
            <Route path="/about"       element={<ComingSoon label="About" />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index                  element={<Dashboard />} />
              <Route path="products"        element={<ProductsList />} />
              <Route path="products/:id"    element={<ProductForm />} />
              <Route path="orders"          element={<AdminOrders />} />
              <Route path="users"           element={<AdminUsers />} />
            </Route>
            <Route path="*"            element={<ComingSoon label="404 — Page introuvable" />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdmin && <Cart />}
      {!isAdmin && <AuthModal />}
      <Toast />
    </>
  );
}

function ComingSoon({ label }) {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--muted)' }}>
      <div style={{ fontSize: '3rem' }}>🚧</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900, color: 'var(--night)' }}>{label}</div>
      <div>Coming soon</div>
    </div>
  );
}
