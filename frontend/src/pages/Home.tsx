import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-4">Welcome to Stojanovic-One</h2>
        <p>This is the home page of our application.</p>
      </main>
      <Footer />
    </div>
  );
};

export default Home;