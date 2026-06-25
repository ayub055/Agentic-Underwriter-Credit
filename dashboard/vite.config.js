import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { parseBankingReport, parseBureauReport } from "./src/lib/reportParse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORTS = {
  banking: resolve(__dirname, "public/reports/banking_agent_report.html"),
  bureau: resolve(__dirname, "public/reports/bureau_agent_report.html"),
};

// Exposes `virtual:report-data` — the parsed banking/bureau report figures +
// summary, extracted from public/reports/*.html at build time (and re-extracted
// when those files change in dev). Only the small parsed JSON ships to the
// client, never the multi-MB HTML. This is what makes the demo's "Agent
// narrative" and branch variables track the actual generated reports.
function reportData() {
  const VID = "virtual:report-data";
  const RESOLVED = "\0" + VID;
  const read = (p) => {
    try {
      return readFileSync(p, "utf8");
    } catch {
      return "";
    }
  };
  const build = () =>
    `export const BANKING_REPORT = ${JSON.stringify(parseBankingReport(read(REPORTS.banking)))};\n` +
    `export const BUREAU_REPORT = ${JSON.stringify(parseBureauReport(read(REPORTS.bureau)))};\n`;

  return {
    name: "report-data",
    resolveId(id) {
      if (id === VID) return RESOLVED;
    },
    load(id) {
      if (id === RESOLVED) return build();
    },
    configureServer(server) {
      const files = Object.values(REPORTS);
      server.watcher.add(files);
      server.watcher.on("change", (file) => {
        if (!files.includes(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        // re-parse + push a reload so the narration/values update live
        server.ws.send({ type: "full-reload" });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), reportData()],
  // Relative asset paths so the app works behind the SageMaker Jupyter proxy
  // (served under /proxy/<port>/ instead of /).
  base: "./",
  server: {
    host: true,
    port: 8080,
    strictPort: true,
    allowedHosts: [".sagemaker.aws"],
  },
  preview: {
    host: true,
    port: 8080,
    strictPort: true,
    allowedHosts: [".sagemaker.aws"],
  },
});
