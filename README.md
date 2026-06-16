# Edulab 🏫💻

O **edulab** é uma aplicação web Full-Stack desenvolvida como projeto prático para a disciplina de Gerência de Projetos no curso de Ciência da Computação. O sistema atua como um portal centralizado para instituições de ensino, facilitando o gerenciamento de espaços físicos, equipamentos multidisciplinares, comunicação institucional e controle de presença.

---

## 🚀 Funcionalidades

* **Autenticação e Perfis de Acesso (RBAC):**
  * Geração automática de matrícula estruturada (`EDUCIFS`, `EDUCPR`, `EDUCGE` + Ano + Sequência).
  * Controle de permissões baseado na idade e no cargo (Alunos, Professores e Gestores). Menores de 18 anos recebem restrições automáticas de "Aluno".
* **Mural Institucional Dinâmico:**
  * Publicação de Avisos (duração fixa de 24h) e Propagandas (tempo customizado).
  * Suporte a mídias visuais (imagens e vídeos responsivos).
* **Gestão de Espaços e Agendamentos:**
  * Agendamento de 10 laboratórios físicos (Física/Matemática, Química/Biologia, Eletrônica e 7 laboratórios de Informática).
  * Reserva de equipamentos multidisciplinares e esportivos (robótica, esportes, lazer).
  * Obrigatoriedade de estipular o tempo de uso no momento da reserva.
* **Módulo de Chamada Inteligente (Professores):**
  * Geração de QR Code para registro de presença.
  * Simulador mobile para os alunos marcarem presença.
  * Exportação automatizada da lista de frequência para o formato `.xls` (Excel).
* **Histórico e Controle de Devoluções:**
  * Painel de monitoramento de chaves de laboratórios e equipamentos em uso.
  * Alertas e "cobranças" simuladas via e-mail para itens não devolvidos após 24 horas.

---

## 🛠️ Tecnologias Utilizadas

**Frontend:**
* HTML5 estruturado e semântico.
* CSS3 nativo com variáveis CSS e layout responsivo (CSS Grid e Flexbox).
* JavaScript (Vanilla) operando no modelo *Single Page Application* (SPA).

**Backend:**
* Node.js.
* Express.js (Roteamento e APIs RESTful).
* Node-Postgres (`pg`) para comunicação direta com o banco.

**Banco de Dados:**
* PostgreSQL (Estrutura relacional, controle de concorrência nas matrículas e persistência de dados complexos).

---

## ⚙️ Como executar o projeto localmente

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/) (Versão 14 ou superior)
* [PostgreSQL](https://www.postgresql.org/) (e uma interface gráfica como pgAdmin ou DBeaver, opcional)

### 2. Configurando o Banco de Dados
1. Abra o terminal do PostgreSQL (`psql`) ou sua interface gráfica.
2. Crie o banco de dados:
```sql
CREATE DATABASE edulab_db;
```
Conecte-se ao banco edulab_db e execute as queries de criação de tabelas (fornecidas na documentação do projeto ou arquivo .sql na raiz, caso você extraia o script do server.js).

### 3. Rodando a Aplicação
Clone este repositório:

```
git clone [https://github.com/RaimundoRJS/edulab.git](https://github.com/RaimundoRJS/edulab.git)
```
Acesse a pasta do projeto:

```
cd edulab
```
Instale as dependências do Node.js:

```
npm install express pg
```
Importante: Abra o arquivo server.js e atualize as credenciais do banco de dados na constante pool com o seu usuário e senha do Postgres local.

Inicie o servidor:

```
node server.js
```
Abra o navegador e acesse: `http://localhost:3000`

🎓 Contexto Acadêmico
Projeto desenvolvido para simular a criação, o planejamento e o ciclo de vida completo de um software educacional, aplicando conceitos de Gerência de Projetos (Escopo, Tempo, Custos e Integração).

👨‍💻 Autor
Raimundo 🔗 GitHub: @RaimundoRJS
