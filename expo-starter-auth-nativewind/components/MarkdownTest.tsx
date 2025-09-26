import React from 'react';
import { View, Text } from 'react-native';
import MarkdownText from './MarkdownText';

// Test component to demonstrate markdown rendering
const MarkdownTest: React.FC = () => {
    const testContent = `# Welcome to NutriAI!

Here's how I can help you with your nutrition:

## **Key Features:**
- **Meal Logging**: Track your daily meals easily
- **Progress Tracking**: Monitor your nutrition goals
- **AI Recommendations**: Get personalized advice

### Today's Tips:
1. **Stay Hydrated**: Drink at least 8 glasses of water
2. **Balanced Meals**: Include protein, carbs, and healthy fats
3. **Regular Exercise**: Combine with your nutrition plan

*Remember: Consistency is key to achieving your goals!*

> "Your health is an investment, not an expense."

Let me know if you have any questions!`;

    return (
        <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Markdown Test (AI Response):
            </Text>
            <View style={{ backgroundColor: '#e0e0e0', padding: 15, borderRadius: 10 }}>
                <MarkdownText content={testContent} isUser={false} />
            </View>
        </View>
    );
};

export default MarkdownTest;

