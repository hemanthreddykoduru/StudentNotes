import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import NoteDetails from './pages/NoteDetails';
import MyPurchases from './pages/MyPurchases';
import Subscription from './pages/Subscription';
import ProtectedRoute from './components/ProtectedRoute';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/AdminDashboard';
import MyAccount from './pages/MyAccount';
import AuthHandler from './components/AuthHandler';

// Placeholders for now
const NoteDetailsPlaceholder = () => <div>Details Page</div>;
const MyPurchasesPlaceholder = () => <div>My Purchases</div>;

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthHandler />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notes/:id" element={<NoteDetails />} />
            <Route
              path="/my-purchases"
              element={
                <ProtectedRoute>
                  <MyPurchases />
                </ProtectedRoute>
              }
            />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
            />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/pricing" element={<Subscription />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
