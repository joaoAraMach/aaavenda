const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Dados fictícios de usuários (substitua por um banco de dados real)
const usuarios = [
  {
    id: 1,
    email: 'admin@bar.com',
    senha: bcrypt.hashSync('admin123', 10), // Senha criptografada
    tipo: 'admin',
  },
  {
    id: 2,
    email: 'vendedor@bar.com',
    senha: bcrypt.hashSync('vendedor123', 10),
    tipo: 'vendedor',
  },
];

// Chave secreta para JWT
const JWT_SECRET = 'segredo_super_secreto';

// Rota de login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarios.find((u) => u.email === email);

  if (!usuario || !bcrypt.compareSync(senha, usuario.senha)) {
    return res.status(401).json({ message: 'Email ou senha incorretos.' });
  }

  // Gera um token JWT
  const token = jwt.sign({ id: usuario.id, tipo: usuario.tipo }, JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token, tipo: usuario.tipo });
});

// Rota para processar pagamento com PushinPay
app.post('/api/pagamento', async (req, res) => {
  const { metodo, valor, itens } = req.body;

  try {
    const response = await axios.post(
      'https://api.pushinpay.com/pagamentos',
      {
        metodo,
        valor,
        itens,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer 18818|4VIMWNXuvvwzLER8UlKSCwO1puMlFtSdIljrg6XT0edd3ff6',
        },
      }
    );

    if (response.data.status === 'aprovado') {
      res.json({ success: true, message: 'Pagamento aprovado!' });
    } else {
      res.status(400).json({ success: false, message: 'Pagamento recusado.' });
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ success: false, message: 'Erro ao processar pagamento.' });
  }
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});