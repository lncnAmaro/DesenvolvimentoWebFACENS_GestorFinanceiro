import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
app.use(express.json()); // API aceita JSON

app.use(cors({
  origin: 'http://localhost:4200', //URL do Angular
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

mongoose.connect(process.env.MONGODB_URI, { dbName: 'Aula' }).then(() => console.log('Conectado ao MongoDB')).catch(err => console.error('Erro na conexão: ', err.message));

// Modelo Transação
const transacaoSchema = new mongoose.Schema({
  tipo: { type: String, required: true, trim: true, enum: ['entrada', 'saida'] },
  categoria: { type: String, required: true, trim: true, minlength: 2 },
  valor: { type: Number, required: true, min: 0 },
  data: { type: Date, required: true },
  descricao: { type: String, trim: true, default: '' }
}, { collection: 'Transacoes', timestamps: true });

const Transacao = mongoose.model('Transacao', transacaoSchema, 'Transacoes');

// Rota inicial
app.get('/', (req, res) => res.json({ msg: 'API rodando' }));

// Criar transação
app.post('/transacoes', async (req, res) => {
    const transacao = await Transacao.create(req.body);
    res.status(201).json(transacao);
})

//Listar transações
app.get('/transacoes', async (req, res) => {
    const transacao = await Transacao.find();
    res.json(transacao);
})

// Inserir detalhe na transação
app.put('/transacoes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const transacao = await Transacao.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true, overwrite: true }
    );
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(transacao);
  } catch (err) {
  res.status(400).json({ error: err.message });
  }
});

// Apagar transação
app.delete('/transacoes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const transacao = await Transacao.findByIdAndDelete(req.params.id);
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json({ ok: true });
  } catch (err) {
  res.status(500).json({ error: err.message });
  }
});

// Mostrar transações
app.get('/transacoes/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const transacao = await Transacao.findById(req.params.id);
    if (!transacao) return res.status(404).json({ error: 'Transação não encontrada' });
    res.json(transacao);
  } catch (err) {
  res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(process.env.PORT, () => console.log(`Servidor rodando em http://localhost:${process.env.PORT}`));