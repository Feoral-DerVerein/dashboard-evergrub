import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import welcomeBanner from '@/assets/welcome-text.png';
export const DynamicGreeting = () => {
  const [greeting, setGreeting] = useState('');
  const [userName, setUserName] = useState('');
  const {
    user
  } = useAuth();
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      const firstName = user.user_metadata.full_name.split(' ')[0];
      return firstName.toLowerCase() === 'saffire' ? 'Alex' : firstName;
    } else if (user?.email) {
      // Extract name from email if no full name is available
      const emailName = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
      return emailName.toLowerCase() === 'saffire' ? 'Alex' : emailName;
    }
    return 'there'; // Fallback greeting
  };
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
      setUserName(getUserName());
    };

    // Update immediately
    updateGreeting();

    // Update every minute to keep the greeting current
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [user]);
  return (
    <div className="text-center space-y-2 mb-8">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 animate-in fade-in slide-in-from-bottom-3 duration-500">
        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">{userName}</span>
      </h1>
      <p className="text-lg text-gray-500 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
        How can I help you optimize your inventory today?
      </p>
    </div>
  );
};