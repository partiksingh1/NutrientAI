import { TextInput } from "react-native";

export default function Input({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  className = "",
  maxLength = 500,
  multiline = false,
  inputRef,
}: any) {
  return (
    <TextInput
      ref={inputRef}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      onSubmitEditing={onSubmitEditing}
      maxLength={maxLength}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      className={`flex-1 ${multiline ? "min-h-12 max-h-24" : "h-12"} px-4 rounded-xl bg-gray-100 dark:bg-neutral-800 text-black dark:text-white ${className}`}
    />
  );
}
