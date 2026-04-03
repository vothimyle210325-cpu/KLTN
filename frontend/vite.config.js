import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const DEFAULT_MACRO_PATH =
  "/macros/s/AKfycbythPlaaDtFkj0mEuRyJTSi3K-h0cvuyF6EieYnH2jywNCZ-GfMsUCv6ey4mDxSnMwFjA/exec";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = (env.VITE_API_URL || "").trim();
  let macroPath = DEFAULT_MACRO_PATH;
  if (apiUrl && apiUrl.includes("script.google.com")) {
    try {
      const u = new URL(apiUrl);
      macroPath = u.pathname + (u.search || "");
    } catch {
      /* keep default */
    }
  }

  return {
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://script.google.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/macros/s/AKfycbythPlaaDtFkj0mEuRyJTSi3K-h0cvuyF6EieYnH2jywNCZ-GfMsUCv6ey4mDxSnMwFjA/exec"),
        secure: true
      }
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],
          mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
          forms: ["react-hook-form", "axios"]
        }
      }
    }
  }
};
});
