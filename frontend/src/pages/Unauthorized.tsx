
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (user) {
      navigate(`/${user.role}-dashboard`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <img src="/lovable-uploads/504aea1c-9ed5-463f-b85c-62fb8d70d7fa.png" alt="KORUS" className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-4 text-primary">Access Denied</h1>
        <p className="text-xl text-gray-600 mb-8">You don't have permission to access this page.</p>
        <Button onClick={handleGoBack} className="bg-primary hover:bg-primary/90">
          Go Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
