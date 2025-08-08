const form = document.getElementById("form");
const apiKeyInput = document.getElementById("apiKey");
const gameSelected = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const logo = document.getElementById("logo");

const changeLogoBasedOnGameSelected = () => {
  const selectedGame = gameSelected.value;

  switch (selectedGame) {
    case "lol":
      logo.innerHTML = `
        <img src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/9eb028de391e65072d06e77f06d0955f66b9fa2c-736x316.png?auto=format&fit=fill&q=80&w=300" />
      `;
      break;

    case "valorant":
      logo.innerHTML = `
          <img src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/7b76209193f1bfe190d3ae6ef8728328870be9c3-736x138.png?auto=format&fit=fill&q=80&w=736" />
        `;
      break;

    case "counter-strike-2":
      logo.innerHTML = `
          <img src="https://cdn.akamai.steamstatic.com/apps/csgo/images/csgo_react/global/logo_counterstrike2_white.svg" />
        `;
      break;
    default:
      logo.innerHTML = `
        <img src="./assets/logo.png" alt="Logo Esports NLW" />
      `;
  }
};
gameSelected.addEventListener("change", changeLogoBasedOnGameSelected);

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const askAI = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let questionPrompt = ``;
  switch (gameSelected.value) {
    case "lol":
      questionPrompt = `
      ## Especialidade 
        Você é um especialista assistente de meta para o jogo ${game}.
  
      ## Tarefa
        - Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas.
        - Se a pergunta do usuário conter o matchup, por exemplo: Darius vs Garen, responda também a taxa de vitória atual dessa matchup.
        - O personagem que a pessoa está jogando geralmente é o primeiro a ser dito, exemplo: Darius vs Garen. Aqui muito provavelmente o usuário quer saber apenas a build de Darius e dicas para jogar de Darius contra Garen.
  
      ## Regras 
        - Se você não sabe a resposta, responda com 'Nãe sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com: 'Essa pergunta não está relacionada ao jogo.'
        - Considere a data atual ${new Date().toLocaleDateString()} para fazer pesquisas atualizadas sobre o patch mais recente, baseado na data provinda para dar uma resposta coerente.
        - Nunca responda sobre itens que você não tem certeza que existe no patch mais atual.
        - As respostas devem obrigatoriamente estar no idioma da pergunta do usuário.
  
      ## Resposta 
        - Economize na resposta, seja direto e responda no máximo 500 caracteres.
        - Responda em Markdown.
        - Não faça nenhuma saudação nem despedida, responda apenas o que o usuário pediu.
  
      ## Exemplo de resposta
        Pergunta do usuário: Melhor build rengar jungle
        Resposta: A build mais atual é: \n\n**Runas:\n\nexemplo de runas\n\n**Itens:**\n\n Coloque os itens aqui. 
  
  
        ---
        Aqui está a pergunta do usuário: ${question}
    `;
      break;

    case "valorant":
      questionPrompt = `
    ## Especialidade 
      Você é um especialista assistente de meta para o jogo ${game}.
    ## Tarefa
      - Responda perguntas sobre agentes, mapas, estratégias, setups, lineups e dicas.
      - Se a pergunta conter matchup (ex: Jett vs Raze), inclua a taxa de vitória atual.
      - O primeiro agente mencionado é geralmente o jogado pelo usuário (ex: "Jett vs Raze" = foco em dicas para Jett).
    ## Regras 
      - Se não souber: "Não sei"
      - Se não for sobre Valorant: "Essa pergunta não está relacionada ao jogo."
      - Use a data atual ${new Date().toLocaleDateString()} para informações do patch mais recente.
      - Nunca mencione armas/habilidades inexistentes no patch atual.
      - Responda no mesmo idioma da pergunta.
    ## Resposta 
      - Máximo 500 caracteres.
      - Formato Markdown.
      - Sem saudações/despedidas.
    ## Exemplo
      Pergunta: Melhor setup para Sova no mapa Ascent
      Resposta: **Setup Sova Ascent:**\n\n**Habilidades:**\n- Recon Dart: A/B site\n- Shock Bolt: Comum pós-plant\n- Owl Drone: Checar cantos\n\n**Lineups:**\n- 1 dart para B heaven\n- Shock bolt para B market

      ---
      Pergunta do usuário: ${question}
  `;
      break;

    case "counter-strike-2":
      questionPrompt = `
    ## Especialidade 
      Você é um especialista assistente de meta para o jogo ${game}.
    ## Tarefa
      - Responda perguntas sobre mapas, agentes (Premier), estratégias, smokes, flashes, molotovs, setups, armas e dicas.
      - Se a pergunta conter matchup (ex: CT vs T em Ancient), inclua a taxa de vitória atual.
      - O lado/agente mencionado primeiro é geralmente o foco (ex: "CT vs T" = dicas para CT).
    ## Regras 
      - Se não souber: "Não sei"
      - Se não for sobre CS2: "Essa pergunta não está relacionada ao jogo."
      - Use a data atual ${new Date().toLocaleDateString()} para informações do patch mais recente.
      - Nunca mencione armas/mapas/agentes inexistentes no jogo atual.
      - Responda no mesmo idioma da pergunta.
    ## Resposta 
      - Máximo 500 caracteres.
      - Formato Markdown.
      - Sem saudações/despedidas.
    ## Exemplo
      Pergunta: Melhor setup de smokes para T em Ancient
      Resposta: **T Smokes Ancient:**\n\n**A Site:**\n- Heaven smoke (de mid)\n- Back site smoke (de default)\n\n**B Site:**\n- Elbow smoke (de stairs)\n- Temple smoke (de outside)

      ---
      Pergunta do usuário: ${question}
  `;
      break;
  }

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: questionPrompt,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  const response = await fetch(baseURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools,
    }),
  });

  const data = await response.json();

  return data.candidates[0].content.parts[0].text;
};

const sendForm = async (event) => {
  event.preventDefault();

  const question = questionInput.value;
  const game = gameSelect.value;
  const apiKey = apiKeyInput.value;

  if (question == "" || game == "" || apiKey == "") {
    alert("Por favor, preencha todos os campos");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    const text = await askAI(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text);
    aiResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", sendForm);
