import { AlertCircle, CheckCircle } from 'lucide-react-native';
import { View, Text } from 'react-native';

const toastTextStyles = {
    title: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 4,
        color: 'white',
    },
    message: {
        fontSize: 14,
        color: 'white',
    },
};

const toastConfig = {
    success: (props: {
        text1: string,
        text2: string
    }) => (
        <View
            style={{
                width: '90%',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: 2,
                elevation: 4, // Android shadow
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                backgroundColor: 'rgba(0, 189, 52, 0.9)'
            }}
        >
            <CheckCircle color="white" size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontWeight: '600',
                        fontSize: 16,
                        marginBottom: 3,
                        color: 'white',
                    }}
                    numberOfLines={2}
                >
                    {props.text1}
                </Text>
                {props.text2 && (
                    <Text style={toastTextStyles.message} numberOfLines={2}>
                        {props.text2}
                    </Text>
                )}
            </View>
        </View>
    ),

    error: (props: {
        text1: string,
        text2: string
    }) => (
        <View
            style={{
                width: '90%',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: 16,
                elevation: 4, // Android shadow
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                backgroundColor: 'rgba(215, 38, 61, 0.9)'
            }}
        >
            <AlertCircle color="white" size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontWeight: '600',
                        fontSize: 16,
                        marginBottom: 4,
                        color: 'white',
                    }}
                    numberOfLines={2}
                >
                    {props.text1}
                </Text>
                {props.text2 && (
                    <Text style={toastTextStyles.message} numberOfLines={2}>
                        {props.text2}
                    </Text>
                )}
            </View>
        </View>
    ),
    warn: (props: {
        text1: string,
        text2: string
    }) => (
        <View
            style={{
                width: '90%',
                paddingVertical: 16,
                paddingHorizontal: 20,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                marginTop: 16,
                elevation: 4, // Android shadow
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                backgroundColor: 'rgba(255,204,0, 0.9)'
            }}
        >
            <AlertCircle color="white" size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontWeight: '600',
                        fontSize: 16,
                        marginBottom: 4,
                        color: 'white',
                    }}
                    numberOfLines={2}
                >
                    {props.text1}
                </Text>
                {props.text2 && (
                    <Text style={toastTextStyles.message} numberOfLines={2}>
                        {props.text2}
                    </Text>
                )}
            </View>
        </View>
    )
};

export default toastConfig;
