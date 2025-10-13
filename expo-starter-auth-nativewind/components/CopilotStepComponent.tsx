import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useOnboarding } from '@/hooks/useOnboarding';

interface StepComponentProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  handleNext: () => void;
  handlePrev: () => void;
  handleStop: () => void;
  currentStep: number;
  totalSteps: number;
}

const StepComponent: React.FC<StepComponentProps> = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
  totalSteps,
}) => {
  const { handleOnboardingComplete } = useOnboarding();

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Text style={styles.stepCounter}>
            {currentStep} of {totalSteps}
          </Text>
        </View>
        
        <View style={styles.stepBody}>
          <Text style={styles.stepText}>
            {currentStep === 1 && "Welcome to Nutrential! Let's take a quick tour of the main features."}
            {currentStep === 2 && "This is your home screen where you can track your daily nutrition progress."}
            {currentStep === 3 && "Use the AI Chat to get personalized nutrition advice and meal suggestions."}
            {currentStep === 4 && "Track your progress over time with detailed analytics and charts."}
            {currentStep === 5 && "Manage your profile, goals, and app settings here."}
            {currentStep === 6 && "You're all set! Start logging meals and tracking your nutrition journey."}
          </Text>
        </View>
        
        <View style={styles.stepFooter}>
          <View style={styles.buttonContainer}>
            {!isFirstStep && (
              <TouchableOpacity style={styles.button} onPress={handlePrev}>
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={isLastStep ? () => {
                handleOnboardingComplete();
                handleStop();
              } : handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {isLastStep ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.skipButton} onPress={handleStop}>
            <Text style={styles.skipButtonText}>Skip Tour</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stepContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCounter: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepBody: {
    marginBottom: 24,
  },
  stepText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'center',
  },
  stepFooter: {
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
});

export default StepComponent;