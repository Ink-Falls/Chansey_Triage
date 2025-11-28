export function getTriageColors(theme: any, highContrast: boolean) {
  if (highContrast) {
    return {
      bg: "#000000",
      text: "#FFFFFF",
      button: "#7F4EF0",
      buttonText: "#FFFFFF",
      border: "#FFFFFF",
      card: "#111",
      subtle: "#333",
    };
  }

  return {
    bg: theme.background,
    text: theme.text,
    button: "#7EFD94",
    buttonText: "#000000",
    border: theme.cardBorder,
    card: theme.card,
    subtle: theme.text + "30", // 30% opacity
  };
}
