import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Orders from './pages/Order';
import Drafts from './pages/Drafts';
import AbandonedCheckouts from './pages/AbandonedCheckouts';
import Products from './pages/Products';
import Collections from './pages/Collections';
import Inventory from './pages/Inventory';
import PurchaseOrders from './pages/PurchaseOrders';
import Transfers from './pages/Transfers';
import GiftCards from './pages/GiftCards';
import Customers from './pages/Customers';
import Segments from './pages/Segments';
import Companies from './pages/Companies';
import Marketing from './pages/Marketing';
import Campaigns from './pages/Campaigns';
import Automations from './pages/Automations';
import Attribution from './pages/Attribution';
import Discounts from './pages/Discounts';
import Markets from './pages/Markets';
import Catalogs from './pages/Catalogs';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import LiveView from './pages/LiveView';
import OnlineStore from './pages/OnlineStore'; // ✅ ADDED THE NEW PAGE IMPORT


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/drafts" element={<Drafts />} />
          <Route path="/orders/abandoned" element={<AbandonedCheckouts />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/collections" element={<Collections />} />
          <Route path="/products/inventory" element={<Inventory />} />
          <Route path="/products/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/products/transfers" element={<Transfers />} />
          <Route path="/products/gift-cards" element={<GiftCards />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/segments" element={<Segments />} />
          <Route path="/customers/companies" element={<Companies />} />
          <Route path="/marketing" element={<Marketing />} />
          <Route path="/marketing/campaigns" element={<Campaigns />} />
          <Route path="/marketing/automations" element={<Automations />} />
          <Route path="/marketing/attribution" element={<Attribution />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/markets" element={<Markets />} />
          <Route path="/catalogs" element={<Catalogs />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/analytics/reports" element={<Reports />} />
          <Route path="/analytics/live-view" element={<LiveView />} />

          {/* ✅ ADDED THE NEW PAGE ROUTE HERE! */}
          <Route path="/online-store" element={<OnlineStore />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}