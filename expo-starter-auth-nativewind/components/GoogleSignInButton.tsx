import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface GoogleSignInButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'login' | 'register';
  className?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'login',
  className = '',
}) => {
  const { loginWithGoogle, registerWithGoogle } = useAuth();

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    try {
      if (variant === 'login') {
        await loginWithGoogle();
      } else {
        await registerWithGoogle();
      }
    } catch (error) {
      // Error handling is done in the AuthContext
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isLoading}
      className={`flex-row items-center justify-center px-6 py-4 bg-white border border-gray-300 rounded-lg shadow-sm ${className} ${
        disabled || isLoading ? 'opacity-50' : ''
      }`}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <View className="w-5 h-5 mr-3">
            {/* Google Logo SVG */}
            <View className="w-full h-full bg-red-500 rounded-sm items-center justify-center">
              <Text className="text-white text-xs font-bold">G</Text>
            </View>
          </View>
          <Text className="text-gray-700 font-medium text-base">
            {variant === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default GoogleSignInButton;