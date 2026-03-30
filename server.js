import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

export const config = {
    nominatimApi: process.env.NOMINATIM_API,
    orsApi: process.env.ORS_API,
    orsKey: process.env.ORS_KEY,
    country: process.env.COUNTRY || 'br',
    backendUrl: process.env.BACKEND_URL,
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'assets')));

app.get("/env", (req, res) => {
  res.status(200).json(JSON.stringify(config))
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/request', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'request-ride.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'account.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'signup.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`🌍 Configurado para o país: ${config.country}`);
});

// Função para demonstrar a conexão funcional entre backend e frontend
async function testLogin() {
    const response = await fetch(config.backendUrl + '/passenger/login', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({
            email: 'Luzinete@sumus.com',
            password: 'senha321',
        }),
    });

    const data = await response.json();

    console.log(data);
}

// TODO: Add default values if dotenv variables is null
// Example: foo: process.env.FOO || null
