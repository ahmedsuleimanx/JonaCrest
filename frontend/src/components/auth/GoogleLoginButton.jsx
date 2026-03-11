import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Backendurl } from '../../App';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Google OAuth Login Button
 * PRD Section 7.1 - Google Authentication (OAuth 2.0)
 * Implements single-click registration and login
 */

const GoogleLoginButton = ({ 
  onSuccess, 
  onError,
  text = 'signin_with',
  className = '' 
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleSuccess = async (credentialResponse) => {
    try {
      // Send Google credential token to backend
      const response = await axios.post(`${Backendurl}/api/users/google-auth`, {
        credential: credentialResponse.credential,
      });

      if (response.data.success) {
        // Login user with returned token
        await login(response.data.token, response.data.user);
        toast.success(`Welcome, ${response.data.user.name}!`);
        
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          navigate('/');
        }
      } else {
        throw new Error(response.data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Google auth error:', error);
      const message = error.response?.data?.message || 'Google login failed';
      toast.error(message);
      if (onError) onError(error);
    }
  };

  const handleError = () => {
    toast.error('Google login failed. Please try again.');
    if (onError) onError(new Error('Google login popup closed'));
  };

  // Don't render if no client ID configured
  if (!clientId) {
    console.warn('Google OAuth: VITE_GOOGLE_CLIENT_ID not configured');
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className={className}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={text}
          shape="rectangular"
          theme="outline"
          size="large"
          width="100%"
          logo_alignment="left"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

/**
 * Divider with "or" text for login forms
 */
export const OrDivider = () => (
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-200"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-4 bg-white text-gray-500">or continue with</span>
    </div>
  </div>
);

export default GoogleLoginButton;
