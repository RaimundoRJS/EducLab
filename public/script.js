let user = null;

function alternarAuth(login) {
    document.getElementById('loginBox').style.display = login ? 'block' : 'none';
    document.getElementById('cadastroBox').style.display = login ? 'none' : 'block';
}

function mudarAba(id, btn) {
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    btn.classList.add('active');
    if(id === 'homeTab') carregarMural();
    if(id === 'historicoTab') carregarHistorico();
}

function ajustarCamposMural() {
    const tipo = document.getElementById('muralTipo').value;
    document.getElementById('campoTempoPropaganda').style.display = tipo === 'propaganda' ? 'block' : 'none';
}

async function executarCadastro() {
    // A matrícula foi removida do payload, pois o servidor irá gerar
    const payload = {
        nome: document.getElementById('cadNome').value,
        cpf: document.getElementById('cadCpf').value,
        data_nascimento: document.getElementById('cadNascimento').value,
        cargo: document.querySelector('input[name="cadCargo"]:checked').value,
        senha: document.getElementById('cadSenha').value
    };

    const res = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if(data.success) {
        // Exibe a matrícula gerada em destaque para o usuário anotar
        alert(`Cadastro realizado com sucesso!\n\nSeu Perfil: ${data.cargoAtribuido}\nSua MATRÍCULA DE ACESSO é: ${data.matriculaGerada}\n\nAnote-a para fazer o login.`);

        // Limpa os campos do formulário
        document.getElementById('cadNome').value = '';
        document.getElementById('cadCpf').value = '';
        document.getElementById('cadSenha').value = '';

        // Retorna para a tela de login
        alternarAuth(true);
    } else {
        alert(data.message);
    }
}

async function executarLogin() {
    const matriculaInput = document.getElementById('loginMatricula').value.trim();
    const senhaInput = document.getElementById('loginSenha').value;

    // Trava para evitar envio de formulário em branco
    if(!matriculaInput || !senhaInput) {
        alert('Por favor, preencha a matrícula e a senha.');
        return;
    }

    try {
        const payload = { matricula: matriculaInput, senha: senhaInput };

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if(data.success) {
            user = data.user;
            document.getElementById('authScreen').style.display = 'none';
            document.getElementById('appScreen').style.display = 'block';
            document.getElementById('userBadge').innerText = `Logado como: ${user.nome} [${user.cargo}]`;
            configurarPermissoes();
            carregarMural();
        } else {
            // Agora o sistema vai te dizer exatamente o que deu errado
            alert(`Falha no login: ${data.message || 'Erro interno no servidor.'}`);
        }
    } catch (error) {
        alert('Erro de conexão: O servidor Node.js (server.js) está rodando no terminal?');
        console.error('Erro detalhado:', error);
    }
}

function configurarPermissoes() {
    // Regra: Alunos não gerenciam mural nem fazem chamadas. Podem apenas ver os labs e reservar equipamentos.
    if(user.cargo === 'Aluno') {
        document.getElementById('abaGerenciarMural').style.display = 'none';
        document.getElementById('abaChamada').style.display = 'none';
        document.getElementById('btnAgendarLab').style.display = 'none'; // Aluno apenas visualiza labs agendados por terceiros
    } else if (user.cargo === 'Gestor') {
        document.getElementById('abaGerenciarMural').style.display = 'block';
        document.getElementById('abaChamada').style.display = 'none'; // Exceção: Gestor não gera lista de presença
        document.getElementById('btnAgendarLab').style.display = 'inline-block';
    } else {
        document.getElementById('abaGerenciarMural').style.display = 'block';
        document.getElementById('abaChamada').style.display = 'block';
        document.getElementById('btnAgendarLab').style.display = 'inline-block';
    }
}

async function postarNoMural() {
    const payload = {
        tipo: document.getElementById('muralTipo').value,
        titulo: document.getElementById('muralTitulo').value,
        conteudo: document.getElementById('muralConteudo').value,
        midia_url: document.getElementById('muralUrl').value,
        midia_tipo: document.getElementById('muralMidiaTipo').value,
        horas_propaganda: document.getElementById('muralHoras').value,
        autor: user.nome
    };
    await fetch('/api/mural/postar', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
    alert('Postado!');
    mudarAba('homeTab', document.querySelectorAll('.tab-btn')[0]);
}

async function carregarMural() {
    const res = await fetch('/api/mural/listar');
    const lista = await res.json();
    const feed = document.getElementById('muralFeed');
    feed.innerHTML = '';
    lista.forEach(item => {
        let midiaHtml = '';
        if(item.midia_tipo === 'imagem' && item.midia_url) {
            midiaHtml = `<img src="${item.midia_url}" class="mural-media" alt="Poster">`;
        } else if (item.midia_tipo === 'video' && item.midia_url) {
            midiaHtml = `<video src="${item.midia_url}" controls class="mural-media"></video>`;
        }
        feed.innerHTML += `
                    <div class="mural-item">
                        <span class="badge badge-${item.tipo}">${item.tipo.toUpperCase()}</span>
                        <h3>${item.titulo}</h3>
                        <p>${item.conteudo}</p>
                        ${midiaHtml}
                        <small>Publicado por: ${item.autor}</small>
                    </div>`;
    });
}

async function salvarLab() {
    const payload = {
        laboratorio: document.getElementById('labSelect').value,
        nome_responsavel: user.nome,
        data_agendamento: document.getElementById('labData').value,
        hora_inicio: document.getElementById('labHora').value,
        duracao_horas: document.getElementById('labDuracao').value,
        usuario_id: user.id
    };
    await fetch('/api/agendamentos/laboratorio', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
    alert('Agendamento Concluído!');
}

async function salvarEquip() {
    const payload = {
        equipamento: document.getElementById('equipSelect').value,
        quantidade: document.getElementById('equipQtd').value,
        nome_responsavel: user.nome,
        data_reserva: document.getElementById('equipData').value,
        hora_inicio: document.getElementById('equipHora').value,
        duracao_horas: document.getElementById('equipDuracao').value,
        usuario_id: user.id
    };
    await fetch('/api/reservas/equipamento', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
    alert('Reserva Concluída!');
}

async function carregarHistorico() {
    const res = await fetch(`/api/historico/${user.id}`);
    const lista = await res.json();
    const corpo = document.getElementById('historicoCorpo');
    corpo.innerHTML = '';

    lista.forEach(item => {
        const dataReserva = new Date(item.registro);
        const vinteQuatroHorasAtras = new Date();
        vinteQuatroHorasAtras.setHours(vinteQuatroHorasAtras.getHours() - 24);

        // Regra de Negócio: Se passou de 24h da reserva e não devolveu, marca pendência crítica
        const atrasado = (!item.devolvido && dataReserva < vinteQuatroHorasAtras);
        const classeLinha = atrasado ? 'class="atrasado-row"' : '';
        const textoStatus = item.devolvido ? 'Devolvido / Chave Entregue' : (atrasado ? 'Atrasado (E-mail de Cobrança Emitido)' : 'Em Uso / Ativo');

        let acaoBotao = item.devolvido ? '-' : `<button onclick="devolverItem(${item.id}, '${item.tipo}')">Marcar Devolvido</button>`;

        corpo.innerHTML += `
                    <tr ${classeLinha}>
                        <td>${item.item}</td>
                        <td>${new Date(item.data).toLocaleDateString('pt-BR')}</td>
                        <td>${textoStatus}</td>
                        <td>${acaoBotao}</td>
                    </tr>`;
    });
}

async function devolverItem(id, tipo) {
    await fetch('/api/historico/devolver', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, tipo}) });
    carregarHistorico();
}