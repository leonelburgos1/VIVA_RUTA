/** @type {import('tailwindcss').Config} */

module.exports = {

  content: [

    "./src/**/*.{html,ts}",

  ],

  theme: {

    extend: {

      colors: {

        primaryDark: "#1E3D2F",

        primaryGreen: "#6A8F3A",

        primaryBlue: "#2D6F7E",

        primaryLight: "#F2EFE6",

      },

      fontFamily: {

        poppins: ["Poppins", "sans-serif"],

      },

      boxShadow: {

        soft:
          "0 10px 30px rgba(0,0,0,0.08)",

        premium:
          "0 20px 60px rgba(0,0,0,0.12)",

      },

      borderRadius: {

        premium: "28px",

      },

    },

  },

  plugins: [],

}