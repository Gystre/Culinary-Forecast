/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    // fontFamily: {
    //   sans: ["Lato", "sans-serif"], // Default font
    //   latoLight: ["Lato-Light", "sans-serif"],
    //   latoBold: ["Lato-Bold", "sans-serif"],
    // },
    fontSize: {
      /*
            https://type-scale.com/
            21px base size, 1.414 ratio
        */
      h1: [
        "5.653rem",
        {
          lineHeight: "122px",
        },
      ],

      h2: ["3.998rem", "83.95px"],
      h3: ["2.827rem", "59.37px"],
      h4: ["1.999rem", "41.99px"],
      h5: ["1.414rem", "29.69px"],
      h6: ["1rem", "21px"],
      h7: ["0.707rem", "14.85px"],
      p: ["1rem", "25px"],
    },
    extend: {
      colors: {
        primary: "#FEE001",
        secondary: "#FFBB00",
        black: "#171714",
        black75: "#4e4e4c",
        // black50: "#8c8d8f",
        // black25: "#c0c0c1",
        // black10: "#e0e1e1",
        black5: "#e9e9e9",
      },
      animation: {
        bounceSlow: "bounceSlow 2s infinite",
        slideUp: "slideUp 1.5s ease-in-out",
        shake: "shake 0.5s infinite",
      },
    },
  },
  plugins: [],
};
