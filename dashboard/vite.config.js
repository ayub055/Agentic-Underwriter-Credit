import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths so the app works behind the SageMaker Jupyter proxy
  // (served under /proxy/<port>/ instead of /).
  base: "./",
  server: {
    host: true,
    allowedHosts: [".sagemaker.aws"],
  },
  preview: {
    host: true,
    allowedHosts: [".sagemaker.aws"],
  },
});
