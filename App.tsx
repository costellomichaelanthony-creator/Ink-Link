
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import DesignGenerator from './components/DesignGenerator';
import Marketplace from './components/Marketplace';
import ArtistList from './components/ArtistList';
import ArtistProfile from './components/ArtistProfile';
import DesignDetail from './components/DesignDetail';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import EditProfile from './components/profile/EditProfile';
import ProtectedRoute from './components/ProtectedRoute';
import BookingForm from './components/bookings/BookingForm';
import BookingDetail from './components/bookings/BookingDetail';
import DesignLab from './components/DesignLab/DesignLab';
import EventList from './components/events/EventList';
import EventDetail from './components/events/EventDetail';
import CreateEvent from './components/events/CreateEvent';

const Footer: React.FC = () => (
  <footer className="bg-ink-950 border-t border-ink-900 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
      <p>&copy; 2024 Ink Link. All rights reserved.</p>
      <div className="mt-4 space-x-4">
        <a href="#" className="hover:text-white">Privacy</a>
        <a href="#" className="hover:text-white">Terms</a>
        <a href="#" className="hover:text-white">Instagram</a>
      </div>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-ink-950 text-gray-100 font-sans flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              
              <Route path="/design" element={<DesignGenerator />} />
              <Route path="/design-lab" element={<DesignLab />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/designs/:id" element={<DesignDetail />} />
              
              <Route path="/artists" element={<ArtistList />} />
              <Route path="/artists/:id" element={<ArtistProfile />} />
              
              {/* Event Routes */}
              <Route path="/events" element={<EventList />} />
              <Route 
                path="/events/new" 
                element={
                  <ProtectedRoute>
                    <CreateEvent />
                  </ProtectedRoute>
                } 
              />
              <Route path="/events/:id" element={<EventDetail />} />

              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/edit" 
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/bookings/request" 
                element={
                  <ProtectedRoute>
                    <BookingForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings/:id" 
                element={
                  <ProtectedRoute>
                    <BookingDetail />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="/bookings" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;