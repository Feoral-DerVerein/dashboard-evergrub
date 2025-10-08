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
  return <div className="text-center">
      
      
    </div>;
};