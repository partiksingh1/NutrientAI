import React from 'react';
import { View, useColorScheme } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface MarkdownTextProps {
    content: string;
    isUser?: boolean;
}

const MarkdownText: React.FC<MarkdownTextProps> = ({ content, isUser = false }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const getTextColor = () => {
        if (isUser) return '#ffffff';
        return isDark ? '#ffffff' : '#000000';
    };

    const getBackgroundColor = (opacity: number = 0.1) => {
        if (isUser) return `rgba(255,255,255,${opacity})`;
        return isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`;
    };

    const markdownStyles = {
        body: {
            color: getTextColor(),
            fontSize: 14,
            lineHeight: 20,
        },
        paragraph: {
            marginTop: 0,
            marginBottom: 8,
        },
        strong: {
            fontWeight: 'bold' as const,
            color: getTextColor(),
        },
        em: {
            fontStyle: 'italic' as const,
            color: getTextColor(),
        },
        list_item: {
            marginTop: 4,
            marginBottom: 4,
        },
        bullet_list: {
            marginTop: 4,
            marginBottom: 4,
        },
        ordered_list: {
            marginTop: 4,
            marginBottom: 4,
        },
        code_inline: {
            backgroundColor: getBackgroundColor(0.2),
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 4,
            fontFamily: 'monospace',
        },
        code_block: {
            backgroundColor: getBackgroundColor(0.2),
            padding: 8,
            borderRadius: 6,
            marginTop: 4,
            marginBottom: 4,
        },
        blockquote: {
            borderLeftWidth: 3,
            borderLeftColor: isUser ? 'rgba(255,255,255,0.5)' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'),
            paddingLeft: 12,
            marginTop: 4,
            marginBottom: 4,
            fontStyle: 'italic' as const,
        },
        h1: {
            fontSize: 18,
            fontWeight: 'bold' as const,
            marginTop: 8,
            marginBottom: 4,
            color: getTextColor(),
        },
        h2: {
            fontSize: 16,
            fontWeight: 'bold' as const,
            marginTop: 6,
            marginBottom: 4,
            color: getTextColor(),
        },
        h3: {
            fontSize: 15,
            fontWeight: 'bold' as const,
            marginTop: 4,
            marginBottom: 4,
            color: getTextColor(),
        },
    };

    return (
        <View>
            <Markdown
                style={markdownStyles}
                mergeStyle={false}
            >
                {content}
            </Markdown>
        </View>
    );
};

export default MarkdownText;
