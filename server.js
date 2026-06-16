const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'edulabifs_db',
    password: 'Junio@##23',
    port: 5432,
});

// Função auxiliar para calcular idade
function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

// --- AUTENTICAÇÃO ---

// 1. Rota de Cadastro (com geração de matrícula automática)
app.post('/api/auth/cadastro', async (req, res) => {
    const { nome, cpf, data_nascimento, cargo, senha } = req.body;
    try {
        const idade = calcularIdade(data_nascimento);
        const cargoFinal = idade < 18 ? 'Aluno' : cargo;

        const anoAtual = new Date().getFullYear();
        let prefixo = cargoFinal === 'Aluno' ? 'EDUCIFS' : (cargoFinal === 'Professor' ? 'EDUCPR' : 'EDUCGE');
        const baseMatricula = `${prefixo}${anoAtual}`;

        const queryBusca = "SELECT matricula FROM usuarios WHERE matricula LIKE $1 ORDER BY id DESC LIMIT 1";
        const resultBusca = await pool.query(queryBusca, [`${baseMatricula}%`]);

        let sequencia = 1;
        if (resultBusca.rows.length > 0) {
            const ultimaMatricula = resultBusca.rows[0].matricula;
            const ultimosDigitos = ultimaMatricula.replace(baseMatricula, '');
            sequencia = parseInt(ultimosDigitos) + 1;
        }

        const matriculaGerada = `${baseMatricula}${String(sequencia).padStart(2, '0')}`;

        const queryInsert = 'INSERT INTO usuarios (nome, matricula, cpf, data_nascimento, cargo, senha) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        await pool.query(queryInsert, [nome, matriculaGerada, cpf, data_nascimento, cargoFinal, senha]);

        res.status(201).json({ success: true, cargoAtribuido: cargoFinal, matriculaGerada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao efetuar cadastro.' });
    }
});

// 2. Rota de Login (Verifique se esta parte está no seu arquivo!)
app.post('/api/auth/login', async (req, res) => {
    const { matricula, senha } = req.body;
    try {
        const query = 'SELECT id, nome, cargo FROM usuarios WHERE matricula = $1 AND senha = $2';
        const result = await pool.query(query, [matricula, senha]);

        if (result.rows.length > 0) {
            res.json({ success: true, user: result.rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Matrícula ou senha incorretos.' });
        }
    } catch (error) {
        console.error("Erro interno no login:", error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    }
});

// --- MURAL DE AVISOS ---
app.post('/api/mural/postar', async (req, res) => {
    const { tipo, titulo, conteudo, midia_url, midia_tipo, horas_propaganda, autor } = req.body;
    try {
        let dataExpiracao = new Date();
        if (tipo === 'aviso') {
            dataExpiracao.setHours(dataExpiracao.getHours() + 24); // Fica por 24h
        } else {
            dataExpiracao.setHours(dataExpiracao.getHours() + parseInt(horas_propaganda));
        }

        const query = 'INSERT INTO mural (tipo, titulo, conteudo, midia_url, midia_tipo, data_expiracao, autor) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        await pool.query(query, [tipo, titulo, conteudo, midia_url, midia_tipo, dataExpiracao, autor]);
        res.json({ success: true, message: 'Conteúdo publicado no mural!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false });
    }
});

app.get('/api/mural/listar', async (req, res) => {
    try {
        // Retorna apenas mídias cuja data de expiração seja posterior ao momento atual
        const query = 'SELECT * FROM mural WHERE data_expiracao > CURRENT_TIMESTAMP ORDER BY data_criacao DESC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json([]);
    }
});

// --- AGENDAMENTOS E RESERVAS (OBRIGATÓRIO DETERMINAR PERÍODO) ---
app.post('/api/agendamentos/laboratorio', async (req, res) => {
    const { laboratorio, nome_responsavel, data_agendamento, hora_inicio, duracao_horas, usuario_id } = req.body;
    try {
        const query = 'INSERT INTO agendamentos_laboratorios (laboratorio, nome_responsavel, data_agendamento, hora_inicio, duracao_horas, usuario_id) VALUES ($1, $2, $3, $4, $5, $6)';
        await pool.query(query, [laboratorio, nome_responsavel, data_agendamento, hora_inicio, duracao_horas, usuario_id]);

        // Simulação de e-mail automático enviado ao fim do tempo estipulado
        setTimeout(() => {
            console.log(`[E-MAIL SIMULADO] Para: ${nome_responsavel}. Atenção: Seu tempo de uso do ${laboratorio} se encerrou.`);
        }, 3000);

        res.json({ success: true, message: 'Laboratório reservado com sucesso!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.post('/api/reservas/equipamento', async (req, res) => {
    const { equipamento, quantidade, nome_responsavel, data_reserva, hora_inicio, duracao_horas, usuario_id } = req.body;
    try {
        const query = 'INSERT INTO reservas_equipamentos (equipamento, quantidade, nome_responsavel, data_reserva, hora_inicio, duracao_horas, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        await pool.query(query, [equipamento, quantidade, nome_responsavel, data_reserva, hora_inicio, duracao_horas, usuario_id]);

        setTimeout(() => {
            console.log(`[E-MAIL SIMULADO] Para: ${nome_responsavel}. Atenção: O período de utilização do equipamento (${equipamento}) chegou ao fim.`);
        }, 3000);

        res.json({ success: true, message: 'Equipamento reservado com sucesso!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- HISTÓRICO E COBRANÇAS ---
app.get('/api/historico/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const labs = await pool.query('SELECT id, laboratorio as item, data_agendamento as data, devolvido, data_registro_agendamento as registro, \'laboratorio\' as tipo FROM agendamentos_laboratorios WHERE usuario_id = $1', [usuario_id]);
        const equips = await pool.query('SELECT id, equipamento as item, data_reserva as data, devolvido, data_registro_reserva as registro, \'equipamento\' as tipo FROM reservas_equipamentos WHERE usuario_id = $1', [usuario_id]);

        const completo = [...labs.rows, ...equips.rows];
        res.json(completo);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.post('/api/historico/devolver', async (req, res) => {
    const { id, tipo } = req.body;
    try {
        const tabela = tipo === 'laboratorio' ? 'agendamentos_laboratorios' : 'reservas_equipamentos';
        await pool.query(`UPDATE ${tabela} SET devolvido = true WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Devolução registrada no sistema!' });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- CHAMADA ---
app.post('/api/presencas/registrar', async (req, res) => {
    const { turma, data_aula, aluno_nome, aluno_matricula } = req.body;
    try {
        await pool.query('INSERT INTO presencas (turma, data_aula, aluno_nome, aluno_matricula) VALUES ($1, $2, $3, $4)', [turma, data_aula, aluno_nome, aluno_matricula]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));