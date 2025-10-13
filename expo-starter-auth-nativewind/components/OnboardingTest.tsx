import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useOnboarding } from '@/hooks/useOnboarding';

export default function OnboardingTest() {
  const { 
    isOnboardingCompleted, 
    isLoading, 
    startOnboarding, 
    completeOnboarding, 
    resetOnboarding 
  } = useOnboarding();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading onboarding status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding Test</Text>
      <Text style={styles.status}>
        Status: {isOnboardingCompleted ? 'Completed' : 'Not Completed'}
      </Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={startOnboarding}
      >
        <Text style={styles.buttonText}>Start Onboarding</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={completeOnboarding}
      >
        <Text style={styles.buttonText}>Complete Onboarding</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={resetOnboarding}
      >
        <Text style={styles.buttonText}>Reset Onboarding</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});