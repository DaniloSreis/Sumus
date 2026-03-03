import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

export const config = {
  nominatimApi: process.env.NOMINATIM_API,
  orsApi: process.env.ORS_API,
  orsKey: process.env.ORS_KEY,
  country: process.env.COUNTRY || "br",
};

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "assets")));

app.get("/request", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "request-ride.html"));
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🌍 Configurado para o país: ${config.country}`);
});

// TODO: Add default values if dotenv variables is null
// Example: foo: process.env.FOO || null

