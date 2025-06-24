/**
 * Utility functions for handling right-to-left (RTL) text direction
 * Supports Hebrew, Arabic, and other RTL languages
 */

/**
 * Detects if a string contains RTL (right-to-left) characters
 * @param text - The text to check
 * @returns true if the text contains RTL characters
 */
export const isRTLText = (text: string): boolean => {
  // Unicode ranges for RTL scripts:
  // \u0591-\u07FF: Hebrew, Arabic, Syriac, Arabic Supplement, Thaana, NKo
  // \uFB1D-\uFDFF: Hebrew Presentation Forms, Arabic Presentation Forms-A
  // \uFE70-\uFEFF: Arabic Presentation Forms-B
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
  return rtlChars.test(text);
};

/**
 * Gets the appropriate text direction for a string
 * @param text - The text to analyze
 * @returns 'rtl' for right-to-left text, 'ltr' for left-to-right text
 */
export const getTextDirection = (text: string): 'ltr' | 'rtl' => {
  return isRTLText(text) ? 'rtl' : 'ltr';
};

/**
 * Gets CSS properties for proper RTL text rendering
 * @param text - The text to analyze
 * @returns CSS properties object for MUI sx prop
 */
export const getRTLTextStyles = (text: string) => {
  const isRTL = isRTLText(text);
  return {
    direction: getTextDirection(text),
    textAlign: isRTL ? 'right' : 'left',
    unicodeBidi: 'embed'
  } as const;
};

/**
 * Gets CSS properties for isolated RTL text (prevents text direction bleeding)
 * @param text - The text to analyze
 * @returns CSS properties object for MUI sx prop
 */
export const getIsolatedRTLTextStyles = (text: string) => {
  return {
    direction: getTextDirection(text),
    unicodeBidi: 'isolate',
    display: 'inline-block'
  } as const;
};
