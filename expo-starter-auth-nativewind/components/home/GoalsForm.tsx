import { i18n } from "@/lib/i18next";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";

export type GoalsPayload = {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
};

type GoalsFormProps = {
    /** initial values for edit mode; if omitted it's treated as empty/new */
    initial?: Partial<GoalsPayload>;
    /** called with sanitized numeric payload */
    onSubmit: (payload: GoalsPayload) => void;
    /** called when user cancels / closes form */
    onCancel?: () => void;
    /** button label (defaults to Save Goals) */
    submitLabel?: string;
    /** disable submit while parent is saving */
    loading?: boolean;
};

/**
 * Reusable Goals Form component.
 * - Keeps local string inputs (so partial inputs don't break)
 * - Validates numeric values before calling onSubmit
 */
export default function GoalsForm({
    initial,
    onSubmit,
    onCancel,
    submitLabel = `${i18n.t("goalsForm.saveGoals")}`,
    loading = false,
}: GoalsFormProps) {
    const [calories, setCalories] = useState(initial?.calories?.toString() ?? "");
    const [protein, setProtein] = useState(initial?.protein?.toString() ?? "");
    const [carbs, setCarbs] = useState(initial?.carbs?.toString() ?? "");
    const [fats, setFats] = useState(initial?.fats?.toString() ?? "");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // keep in sync if parent changes initial values
        setCalories(initial?.calories?.toString() ?? "");
        setProtein(initial?.protein?.toString() ?? "");
        setCarbs(initial?.carbs?.toString() ?? "");
        setFats(initial?.fats?.toString() ?? "");
        setError(null);
    }, [initial]);

    const validateAndSubmit = () => {
        setError(null);

        const c = Number(calories);
        const p = Number(protein);
        const cb = Number(carbs);
        const f = Number(fats);

        if ([c, p, cb, f].some(n => Number.isNaN(n))) {
            setError(`${i18n.t("goalsForm.errorInvalidNumbers")}`);
            return;
        }

        if (c <= 0) {
            setError(`${i18n.t("goalsForm.errorCaloriesZero")}`);
            return;
        }

        // Basic sanity upper-limits (optional; tweak as needed)
        if (p < 0 || cb < 0 || f < 0) {
            setError(`${i18n.t("goalsForm.errorNegativeMacros")}`);
            return;
        }

        onSubmit({
            calories: Math.round(c),
            protein: Math.round(p),
            carbs: Math.round(cb),
            fats: Math.round(f),
        });
    };

    return (
        <View className="relative bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
            {/* Close button placeholder — parent can render one if required */}
            {/* Fields */}
            <View className="mb-2">
                <Text className="mb-1 capitalize text-sm text-black dark:text-white">calories</Text>
                <TextInput
                    keyboardType="numeric"
                    placeholder={i18n.t("goalsForm.enterCalories")}
                    value={calories}
                    onChangeText={setCalories}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                />
            </View>

            <View className="mb-2">
                <Text className="mb-1 capitalize text-sm text-black dark:text-white">protein (g)</Text>
                <TextInput
                    keyboardType="numeric"
                    placeholder={i18n.t("goalsForm.enterProtein")}
                    value={protein}
                    onChangeText={setProtein}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                />
            </View>

            <View className="mb-2">
                <Text className="mb-1 capitalize text-sm text-black dark:text-white">carbs (g)</Text>
                <TextInput
                    keyboardType="numeric"
                    placeholder={i18n.t("goalsForm.enterCarbs")}
                    value={carbs}
                    onChangeText={setCarbs}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                />
            </View>

            <View className="mb-3">
                <Text className="mb-1 capitalize text-sm text-black dark:text-white">fats (g)</Text>
                <TextInput
                    keyboardType="numeric"
                    placeholder={i18n.t("goalsForm.enterFats")}
                    value={fats}
                    onChangeText={setFats}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                />
            </View>

            {error && (
                <Text className="text-red-600 text-sm mb-3" style={{ marginBottom: 8 }}>
                    {error}
                </Text>
            )}

            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={validateAndSubmit}
                    disabled={loading}
                    className="flex-1 bg-green-600 rounded-md py-3 items-center justify-center"
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold text-base">{submitLabel}</Text>
                    )}
                </TouchableOpacity>

                {onCancel && (
                    <TouchableOpacity
                        onPress={onCancel}
                        className="px-4 py-3 rounded-md items-center justify-center border border-gray-300"
                    >
                        <Text>{i18n.t("goalsForm.cancel")}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
