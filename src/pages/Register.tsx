/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {RegisterForm} from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';

export function Register() {
  const { register, isRegistering, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard/files');
    }
  }, [isAuthenticated, navigate]);

  const handleRegisterSubmit = async (data: any) => {
    try {
      const successData = await register({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      if (successData.success) {
        navigate('/login');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] p-4 select-none">
      <div className="absolute inset-0 bg-radial-gradient from-blue-50/50 to-transparent pointer-events-none" />
      <RegisterForm
        onSubmit={handleRegisterSubmit}
        isLoading={isRegistering}
        onLoginRedirect={handleLoginRedirect}
      />
    </div>
  );
}
