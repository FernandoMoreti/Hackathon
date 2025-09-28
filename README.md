# 💻 Tokenizados

## 💡 Tema

**IX HACKATHON FACEF 2025: Inovação Tecnológica em Saúde Suplementar**

Desenvolvimento de uma solução que aplica **Inteligência Artificial (IA)** para melhorar a **experiência do cliente**, a **agilidade dos processos** e a **eficiência** de uma operadora de saúde suplementar.

---

## 🎯 Desafio Proposto

Desenvolver um conjunto de soluções integradas (chatbot com IA Generativa, sistema de autorização de exames e sistema de agendamento de consultas) que demonstrem inovação e aplicabilidade real no setor de saúde suplementar.

--
## 📌 Artefatos de Software

Nesta seção estão disponibilizados os principais artefatos de análise e modelagem do sistema, que auxiliam na compreensão do negócio e no detalhamento técnico.

- 📝 [Business Model Canvas]((https://www.canva.com/design/DAG0PbxLx6s/vIMXw-o3QoWtvr0zTunRww/edit?utm_content=DAG0PbxLx6s&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton))
- 🎭 [Diagrama de Casos de Uso]([link_aqui](https://www.canva.com/design/DAG0LW1lcc8/wUhsOKllU4cEVM8r6NjFig/edit?utm_content=DAG0LW1lcc8&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton))
- 🔄 [Diagrama BPMN]([link_aqui](https://lucid.app/lucidchart/fb30f3c7-c8be-488e-8838-55a969eee649/edit?viewport_loc=-1562%2C-2056%2C6631%2C2900%2Cm-5o7ONTd-nK&invitationId=inv_5e7ffd0e-1184-4b98-a5b4-f63e769a2554))
- 🗂️ [Diagrama Entidade-Relacionamento (DER)]([link_aqui](https://app.brmodeloweb.com/#!/publicview/68d8e8255e31ebea4713f302))
--

## 🚀 Solução

O **Tokenizados** é uma plataforma que integra um **Chatbot Inteligente com IA Generativa**, um **Sistema Automatizado de Autorização de Exames** e um **Sistema de Agendamento de Consultas**, otimizando o atendimento e a gestão de processos para beneficiários e operadoras de saúde, focando na redução de tempo de espera e eliminação de burocracia.

---
## 
---

## ✨ Funcionalidades Implementadas (Tarefas do Regulamento)

### Tarefa 1: Chatbot Inteligente com IA Generativa

* **Descrição:** Chatbot web para responder a dúvidas de beneficiários.
* **Especificações:**
    * Utiliza **Modelo de Linguagem em Grande Escala (LLM)** via API (`[Especificar qual LLM/API foi usado]`).
    * Interpreta perguntas abertas e responde com base em **documentos de contexto** (7 fluxogramas institucionais).
    * Possui funcionalidade para **adicionar/atualizar o conteúdo** utilizado pela IA.

### Tarefa 2: Sistema Automatizado de Autorização de Exames

* **Descrição:** Sistema para ler pedidos de exames (via arquivo) e verificar a necessidade de auditoria.
* **Especificações:**
    * Implementado como **chatbot web**.
    * Utiliza **OCR gratuito** (`ParsePDF`) para leitura da imagem.
    * Possui **banco de dados** contendo a planilha do Rol de Procedimentos.
    * Gera **autorização automática** ou informa a **não autorização/auditoria**.
    * Se houver auditoria, informa o **prazo estimado de retorno**.

### Tarefa 3: Sistema de Agendamento de Consultas

* **Descrição:** Implementação de um sistema para agendamento de consultas médicas.
* **Especificações:**
    * Implementado como **chatbot web**, permitindo agendamento direto.
    * **Fluxo de Agendamento:**
        * Coleta dados (nome, data nasc., especialidade, motivo).
        * Visualiza agendas **disponíveis** (simuladas ou reais).
        * Permite a escolha de data, horário e profissional.
        * Gera uma **confirmação de agendamento** com os dados completos.

---

## 🛠️ Tecnologias Utilizadas

| Categoria | Tecnologia/Ferramenta | Descrição do Uso |
| :--- | :--- | :--- |
| **Frontend** | `[React, Tailwind, HTML/CSS]` | Interface de conversação do Chatbot. |
| **Backend** | `[Node.js/Express, Sequelize]` | Lógica de negócio, integração com o LLM e BD. |
| **Banco de Dados** | `Ex: PostgreSQL]` | Armazenamento do Rol de Procedimentos e Agendas. |
| **Inteligência Artificial** | `[Hugging Face]` | Processamento de Linguagem Natural e Geração de Resposta. |
| **OCR** | `[ParsePDF]` | Leitura e extração de texto de imagens de pedidos de exames. |
| **Modelagem** | `[Lucidchart]` | Geração dos artefatos (BPMN, DER, UML). |

---

## 🧑‍💻 Como Executar o Projeto (Getting Started)

### 1. Pré-requisitos

* `[Node.js v18+]`
* `[Gerenciador de pacotes npm]`
* **Chave de API:** `[Ex: Chave da OpenAI para o serviço de LLM]`

### 2. Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [LINK-DO-SEU-REPOSITÓRIO]
    cd [nome-do-repositorio]
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Ambiente:**
    * Crie um arquivo `.env` na raiz do projeto e insira as suas variáveis:
        ```env
        OPENAI_API_KEY="SUA_CHAVE_AQUI"
        DB_URL="SUA_URL_DE_BANCO_DE_DADOS_AQUI"
        # 
        ```

### 3. Execução

* **Inicie o Servidor Backend:**
    ```bash
    npm run dev
    ```
* **Inicie o Servidor Frontend (Chatbot):**
    ```bash
    npm run dev
    ```

---

## 👥 Equipe Tokenizados

| Nome do Integrante | Contato | |
| :--- | :--- | :--- |
| **Carlos Eduardo Silva de Oliveira** | `cadu11324@gmail.com` | 
| **Pedro Padua Miguel** | `pedropaduam.0702@gmail.com` |
| **Fernando Moreti** | `fernandombolela@gmail.com` |
| **Matehus Reis Ribeira** | `reisribeiromatheus@gmail.com` 
## 🏆 Critérios de Avaliação (Foco)

Nosso projeto foi desenvolvido priorizando os seguintes critérios:

1.  **Cumprimento da Implementação do Software** (Todas as Tarefas)
2.  **Criatividade e Inovação**
3.  **Resolução de Problemas** e Melhoria da Experiência do Usuário
4.  **Qualidade da Entrega** (Execução e Design)
5.  **Entrega dos Artefatos de Software** (Caráter eliminatório)
