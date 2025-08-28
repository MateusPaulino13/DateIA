document.addEventListener("DOMContentLoaded", function () {
  const mainNavLinks = document.querySelectorAll("nav .nav-link");
  const mainSections = document.querySelectorAll(".main-section");
  const weekTabs = document.querySelectorAll(".tab-button");
  const weekContents = document.querySelectorAll(".week-content");
  let detailToggles = document.querySelectorAll(".toggle-details");

  const activityThemeInput = document.getElementById("activityThemeInput");
  const generateActivityButton = document.getElementById(
    "generateActivityButton"
  );
  const loadingIndicator = document.getElementById("loadingIndicator");
  const generatedActivityOutput = document.getElementById(
    "generatedActivityOutput"
  );

  const messageTypeSelect = document.getElementById("messageType");
  const messageContextInput = document.getElementById("messageContextInput");
  const generateMessageButton = document.getElementById(
    "generateMessageButton"
  );
  const messageLoadingIndicator = document.getElementById(
    "messageLoadingIndicator"
  );
  const generatedMessageOutputDiv = document.getElementById(
    "generatedMessageOutput"
  );
  const generatedMessageText = document.getElementById("generatedMessageText");
  const copyMessageButton = document.getElementById("copyMessageButton");

  const complimentInput = document.getElementById("complimentInput");
  const generateComplimentButton = document.getElementById(
    "generateComplimentButton"
  );
  const complimentLoadingIndicator = document.getElementById(
    "complimentLoadingIndicator"
  );
  const generatedComplimentOutputDiv = document.getElementById(
    "generatedComplimentOutput"
  );
  const generatedComplimentText = document.getElementById(
    "generatedComplimentText"
  );
  const copyComplimentButton = document.getElementById("copyComplimentButton");

  function showMainSection(targetId) {
    mainSections.forEach((section) => {
      section.classList.remove("active");
      if (section.id === targetId) {
        section.classList.add("active");
      }
    });
    mainNavLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.dataset.target === targetId) {
        link.classList.add("active");
      }
    });
  }

  function updateDetailToggles() {
    detailToggles = document.querySelectorAll(".toggle-details");
    detailToggles.forEach((button) => {
      button.removeEventListener("click", toggleActivityDetails);
      button.addEventListener("click", toggleActivityDetails);
    });
  }

  function toggleActivityDetails() {
    const detailsDiv =
      this.closest(".bg-rose-100").querySelector(".activity-details");
    detailsDiv.classList.toggle("open");
    this.textContent = detailsDiv.classList.contains("open")
      ? "Detalhes ▲"
      : "Detalhes ▼";
  }

  mainNavLinks.forEach((link) => {
    link.addEventListener("click", function () {
      showMainSection(this.dataset.target);
    });
  });

  weekTabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      weekTabs.forEach((t) =>
        t.classList.remove("active", "border-red-600", "text-red-600")
      );
      this.classList.add("active", "border-red-600", "text-red-600");

      weekContents.forEach((content) => content.classList.remove("active"));
      document.getElementById(this.dataset.week).classList.add("active");
    });
  });

  updateDetailToggles();

  showMainSection("cronograma");
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  generateActivityButton.addEventListener("click", async () => {
    const theme = activityThemeInput.value.trim();
    if (!theme) {
      alert("Por favor, digite um tema para a atividade.");
      return;
    }

    loadingIndicator.classList.remove("hidden");
    generatedActivityOutput.innerHTML = "";

    try {
      let chatHistory = [];
      const prompt = `Gere uma ideia de encontro romântico detalhada para um casal na região de Hortolândia/Campinas, com o tema: ${theme}. Inclua: Título da Atividade, Local (com endereço de Hortolândia/Campinas se aplicável, ou genérico se for em casa), Horário Sugerido, Detalhes da Atividade (Preparação, Chegada, Durante, Pós-Atividade), e Observações/Dicas de Personalização. Formate a resposta como um JSON.`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              titulo: { type: "STRING" },
              local: { type: "STRING" },
              horario: { type: "STRING" },
              detalhes: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
              dicas_personalizacao: {
                type: "ARRAY",
                items: { type: "STRING" },
              },
            },
            propertyOrdering: [
              "titulo",
              "local",
              "horario",
              "detalhes",
              "dicas_personalizacao",
            ],
          },
        },
      };

      const apiKey = ""; // coloque a sua quando for usar o projeto
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const generatedActivity = JSON.parse(jsonString);

        const activityHtml = `
                            <div class="bg-rose-100 p-5 rounded-lg shadow">
                                <div class="flex justify-between items-center">
                                    <h4 class="text-xl font-semibold text-red-700">✨ ${
                                      generatedActivity.titulo
                                    }</h4>
                                    <button class="toggle-details bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition">Detalhes ▼</button>
                                </div>
                                <p class="text-sm text-stone-600 mt-1"><strong>Data (Exemplo):</strong> A ser definida</p>
                                <div class="activity-details mt-3 border-t border-red-200 pt-3">
                                    <p><strong>📍 Local:</strong> ${
                                      generatedActivity.local
                                    }</p>
                                    <p><strong>⏰ Horário Sugerido:</strong> ${
                                      generatedActivity.horario
                                    }</p>
                                    <div class="mt-2">
                                        <strong class="text-stone-700">Detalhes da Atividade:</strong>
                                        <ul class="list-disc list-inside text-stone-600 leading-relaxed ml-4">
                                            ${generatedActivity.detalhes
                                              .map(
                                                (detail) => `<li>${detail}</li>`
                                              )
                                              .join("")}
                                        </ul>
                                    </div>
                                    <div class="mt-2">
                                        <strong class="text-stone-700">💡 Observações/Dicas de Personalização:</strong>
                                        <ul class="list-disc list-inside text-stone-600 leading-relaxed ml-4">
                                            ${generatedActivity.dicas_personalizacao
                                              .map((tip) => `<li>${tip}</li>`)
                                              .join("")}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        `;
        generatedActivityOutput.innerHTML = activityHtml;
        updateDetailToggles();
      } else {
        console.error("Unexpected response structure from Gemini API:", result);
        generatedActivityOutput.innerHTML =
          '<p class="text-red-500">Erro ao gerar a atividade. Tente novamente.</p>';
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      generatedActivityOutput.innerHTML =
        '<p class="text-red-500">Erro ao conectar com a IA. Verifique sua conexão ou tente mais tarde.</p>';
    } finally {
      loadingIndicator.classList.add("hidden");
    }
  });

  generateMessageButton.addEventListener("click", async () => {
    const messageType = messageTypeSelect.value;
    const messageContext = messageContextInput.value.trim();

    messageLoadingIndicator.classList.remove("hidden");
    generatedMessageOutputDiv.classList.add("hidden");
    generatedMessageText.textContent = "";

    try {
      let chatHistory = [];
      let prompt = `Gere uma mensagem romântica para minha parceira do tipo "${messageType}". `;
      if (messageContext) {
        prompt += `O contexto adicional é: "${messageContext}". `;
      }
      prompt += `A mensagem deve ser sincera, carinhosa e adequada para um relacionamento romântico. Mantenha um tom positivo e inspirador. Não inclua saudações como 'Olá' ou 'Querida', apenas o corpo da mensagem.`;

      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = ""; // coloque a sua quando for usar o projeto
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const generatedText = result.candidates[0].content.parts[0].text;
        generatedMessageText.textContent = generatedText;
        generatedMessageOutputDiv.classList.remove("hidden");
      } else {
        console.error("Unexpected response structure from Gemini API:", result);
        generatedMessageText.textContent =
          "Erro ao gerar a mensagem. Tente novamente.";
        generatedMessageOutputDiv.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      generatedMessageText.textContent =
        "Erro ao conectar com a IA. Verifique sua conexão ou tente mais tarde.";
      generatedMessageOutputDiv.classList.remove("hidden");
    } finally {
      messageLoadingIndicator.classList.add("hidden");
    }
  });

  generateComplimentButton.addEventListener("click", async () => {
    const complimentTheme = complimentInput.value.trim();
    if (!complimentTheme) {
      alert("Por favor, descreva o que você quer elogiar.");
      return;
    }

    complimentLoadingIndicator.classList.remove("hidden");
    generatedComplimentOutputDiv.classList.add("hidden");
    generatedComplimentText.textContent = "";

    try {
      let chatHistory = [];
      const prompt = `Gere um elogio sincero e carinhoso para minha parceira, baseado no seguinte: "${complimentTheme}". O elogio deve ser inspirador e adequado para um relacionamento romântico. Não inclua saudações ou despedidas.`;
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = { contents: chatHistory };
      const apiKey = ""; // coloque a sua quando for usar o projeto
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (
        result.candidates &&
        result.candidates.length > 0 &&
        result.candidates[0].content &&
        result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0
      ) {
        const generatedText = result.candidates[0].content.parts[0].text;
        generatedComplimentText.textContent = generatedText;
        generatedComplimentOutputDiv.classList.remove("hidden");
      } else {
        console.error("Unexpected response structure from Gemini API:", result);
        generatedComplimentText.textContent =
          "Erro ao gerar o elogio. Tente novamente.";
        generatedComplimentOutputDiv.classList.remove("hidden");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      generatedComplimentText.textContent =
        "Erro ao conectar com a IA. Verifique sua conexão ou tente mais tarde.";
      generatedComplimentOutputDiv.classList.remove("hidden");
    } finally {
      complimentLoadingIndicator.classList.add("hidden");
    }
  });

  copyMessageButton.addEventListener("click", () => {
    const textToCopy = generatedMessageText.textContent;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      alert("Mensagem copiada para a área de transferência!");
    } catch (err) {
      console.error("Falha ao copiar a mensagem:", err);
      alert("Erro ao copiar a mensagem.");
    }
    document.body.removeChild(textArea);
  });

  copyComplimentButton.addEventListener("click", () => {
    const textToCopy = generatedComplimentText.textContent;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      alert("Elogio copiado para a área de transferência!");
    } catch (err) {
      console.error("Falha ao copiar o elogio:", err);
      alert("Erro ao copiar o elogio.");
    }
    document.body.removeChild(textArea);
  });
});
