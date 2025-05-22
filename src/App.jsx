import React from 'react';
import ContactForm from './components/ContactForm';


const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-center mb-6"> Contact Manager</h1>
      <ContactForm />
      
    </div>
  );
};

export default App;
