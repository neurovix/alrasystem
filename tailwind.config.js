/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // IBM Condensed
        "ibm-condensed-bold": ["IBMCondensedBold", "sans-serif"],
        "ibm-condensed-light": ["IBMCondensedLight","sans-serif"],
        "ibm-condensed-semibold": ["IBMCondensedSemibold","sans-serif"],
        "ibm-condensed-regular": ["IBMCondensedRegular","sans-serif"],
        // IBM Devanagari
        "ibm-devanagari-bold": ["IBMDevanagariBold", "sans-serif"],
        "ibm-devanagari-regular": ["IBMDevanagariRegular","sans-serif"],
        // IBM Italic
        "ibm-italic-medium": ["IBMItalicMedium","sans-serif"],
      }
    },
  },
  plugins: [],
}