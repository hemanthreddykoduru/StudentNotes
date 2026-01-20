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
import AuthHandler from './components/AuthHandler';

// Placeholders for now
const NoteDetailsPlaceholder = () => <div>Details Page</div>;
const MyPurchasesPlaceholder = () => <div>My Purchases</div>;

function App() {
  return (
    <Router>
      <AuthHandler />
      <div className="min-h-screen bg-gray-50">
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
