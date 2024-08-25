import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import UserProfile from './components/UserProfile';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Callback from './components/Callback'; // Changed back to 'Callback'

const App: React.FC = () => {
  console.log('Auth0 Domain:', process.env.REACT_APP_AUTH0_DOMAIN);
  console.log('Auth0 Client ID:', process.env.REACT_APP_AUTH0_CLIENT_ID);
  console.log('Auth0 Audience:', process.env.REACT_APP_AUTH0_AUDIENCE);
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN || ''}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID || ''}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/callback`,
        audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
      }}
      onRedirectCallback={(appState) => {
        console.log('Redirect callback triggered', appState);
        window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname);
      }}
      cacheLocation="localstorage"
    >
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/callback" element={<Callback />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Auth0Provider>
  );
};

export default App;