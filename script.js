/* =============================================
   POMODORO TIMER - JAVASCRIPT
   
   Este arquivo contém toda a lógica do timer.
   Está organizado em seções e totalmente
   comentado para facilitar o aprendizado.
   
   Autor: Desenvolvido para fins educacionais
   ============================================= */

/* =============================================
   SEÇÃO 1: VARIÁVEIS GLOBAIS
   
   Aqui declaramos todas as variáveis que serão
   usadas em várias partes do código.
   Usamos nomes em português para facilitar.
   ============================================= */

// Tempo de foco em segundos (50 minutos = 50 * 60 = 3000 segundos)
var tempoFocoEmSegundos = 50 * 60;

// Tempo de descanso em segundos (10 minutos = 10 * 60 = 600 segundos)
var tempoDescansoEmSegundos = 10 * 60;

// Tempo atual restante (começa igual ao tempo de foco)
var tempoRestante = tempoFocoEmSegundos;

// Tempo total do modo atual (para calcular progresso)
var tempoTotal = tempoFocoEmSegundos;

// Variável que guarda o ID do intervalo (para poder parar depois)
// O setInterval retorna um ID que usamos para parar com clearInterval
var intervaloId = null;

// Indica se o timer está rodando ou pausado
var timerRodando = false;

// Indica se estamos no modo foco (true) ou descanso (false)
var modoFoco = true;

// Contador de quantos pomodoros (sessões de foco) foram completados
var sessoesCompletadas = 0;

// Indica se o modo escuro está ativado
var modoEscuroAtivo = false;

// Contexto de áudio para gerar sons (Web Audio API)
var contextoAudio = null;

/* =============================================
   SEÇÃO 2: REFERÊNCIAS AOS ELEMENTOS HTML
   
   Aqui pegamos referências aos elementos do HTML
   para poder manipulá-los com JavaScript.
   Usamos document.getElementById() para isso.
   ============================================= */

// Elemento que mostra o tempo (ex: "25:00")
var elementoTempo = document.getElementById("tempo");

// Elemento que mostra o modo atual ("Modo Foco" ou "Modo Descanso")
var elementoTextoModo = document.getElementById("texto-modo");

// Barra de progresso
var elementoBarraProgresso = document.getElementById("barra-progresso");

// Contador de sessões completadas
var elementoContadorSessoes = document.getElementById("contador-sessoes");

// Botão de alternar tema
var elementoBotaoTema = document.getElementById("botao-tema");

// Input do tempo de foco
var inputFoco = document.getElementById("input-foco");

// Input do tempo de descanso
var inputDescanso = document.getElementById("input-descanso");

/* =============================================
   SEÇÃO 3: FUNÇÕES DE FORMATAÇÃO
   
   Funções auxiliares para formatar dados.
   ============================================= */

/**
 * Função: formatarTempo
 *
 * Converte segundos para o formato MM:SS
 * Exemplo: 125 segundos -> "02:05"
 *
 * @param {number} segundos - O tempo em segundos
 * @returns {string} - O tempo formatado como "MM:SS"
 */
function formatarTempo(segundos) {
   // Calcula quantos minutos inteiros temos
   // Math.floor() arredonda para baixo
   // Dividimos por 60 porque 1 minuto = 60 segundos
   var minutos = Math.floor(segundos / 60);

   // Calcula os segundos restantes
   // O operador % (módulo) retorna o resto da divisão
   // Ex: 125 % 60 = 5 (125 segundos = 2 minutos e 5 segundos)
   var segundosRestantes = segundos % 60;

   // Formata com zero à esquerda se necessário
   // padStart(2, '0') garante que sempre tenha 2 dígitos
   // Ex: 5 vira "05"
   var minutosFormatados = String(minutos).padStart(2, "0");
   var segundosFormatados = String(segundosRestantes).padStart(2, "0");

   // Retorna no formato MM:SS
   return minutosFormatados + ":" + segundosFormatados;
}

/**
 * Função: atualizarDisplay
 *
 * Atualiza o display do timer na tela.
 * Também atualiza a barra de progresso.
 */
function atualizarDisplay() {
   // Atualiza o texto do tempo
   elementoTempo.textContent = formatarTempo(tempoRestante);

   // Calcula a porcentagem de progresso
   // (tempoTotal - tempoRestante) = quanto tempo passou
   // Dividimos pelo total e multiplicamos por 100 para ter %
   var progresso = ((tempoTotal - tempoRestante) / tempoTotal) * 100;

   // Atualiza a largura da barra de progresso
   elementoBarraProgresso.style.width = progresso + "%";

   // Atualiza o título da página para mostrar o tempo
   // Isso permite ver o tempo mesmo com a aba minimizada
   document.title = formatarTempo(tempoRestante) + " - Pomodoro Timer";
}

/* =============================================
   SEÇÃO 4: FUNÇÕES DO TIMER
   
   Funções principais que controlam o timer.
   ============================================= */

/**
 * Função: iniciarTimer
 *
 * Inicia a contagem regressiva do timer.
 * Usa setInterval para executar a cada 1 segundo.
 */
function iniciarTimer() {
   if (timerRodando) {
      return;
   }

   // --- NOVIDADE: Ativa o contexto de áudio no clique do usuário ---
   if (!contextoAudio) {
      contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
   }
   if (contextoAudio.state === "suspended") {
      contextoAudio.resume();
   }
   // -------------------------------------------------------------

   timerRodando = true;

   intervaloId = setInterval(function () {
      tempoRestante = tempoRestante - 1;
      atualizarDisplay();

      if (tempoRestante <= 0) {
         finalizarTimer();
      }
   }, 1000);
}
/**
 * Função: pausarTimer
 *
 * Pausa a contagem regressiva.
 * O tempo é preservado para continuar depois.
 */
function pausarTimer() {
   // Verifica se o timer está rodando
   if (!timerRodando) {
      return; // Se não está rodando, não faz nada
   }

   // clearInterval para a execução do intervalo
   // Usamos o ID que guardamos quando criamos o intervalo
   clearInterval(intervaloId);

   // Marca que o timer não está mais rodando
   timerRodando = false;
}

/**
 * Função: resetarTimer
 *
 * Reseta o timer para o tempo inicial do modo atual.
 */
function resetarTimer() {
   // Para o timer se estiver rodando
   pausarTimer();

   // Define o tempo restante baseado no modo atual
   if (modoFoco) {
      // Se está no modo foco, reseta para o tempo de foco
      tempoRestante = tempoFocoEmSegundos;
      tempoTotal = tempoFocoEmSegundos;
   } else {
      // Se está no modo descanso, reseta para o tempo de descanso
      tempoRestante = tempoDescansoEmSegundos;
      tempoTotal = tempoDescansoEmSegundos;
   }

   // Atualiza o display
   atualizarDisplay();
}

/**
 * Função: finalizarTimer
 *
 * Executada quando o tempo chega a zero.
 * Toca o som, troca o modo e prepara o próximo ciclo.
 */
/**
 * Função: finalizarTimer
 * Executada quando o tempo chega a zero.
 */
function finalizarTimer() {
   pausarTimer();

   if (modoFoco) {
      // Som agudo para fim do foco (800Hz)
      tocarSom(800, 5.0); // Aumentei a duração para 1.5s para você ouvir bem

      sessoesCompletadas = sessoesCompletadas + 1;
      elementoContadorSessoes.textContent = sessoesCompletadas;
   } else {
      // Som grave para fim do descanso (440Hz)
      tocarSom(440, 5.0);
   }

   // Troca o modo automaticamente sem esperar alerta
   trocarModo();
}

/**
 * Função: trocarModo
 *
 * Alterna entre modo foco e modo descanso.
 */
function trocarModo() {
   // Inverte o valor de modoFoco
   // Se era true, vira false. Se era false, vira true.
   modoFoco = !modoFoco;

   // Atualiza o indicador visual
   if (modoFoco) {
      elementoTextoModo.textContent = "🎯 Modo Foco";
      tempoRestante = tempoFocoEmSegundos;
      tempoTotal = tempoFocoEmSegundos;
   } else {
      elementoTextoModo.textContent = "☕ Modo Descanso";
      tempoRestante = tempoDescansoEmSegundos;
      tempoTotal = tempoDescansoEmSegundos;
   }

   // Atualiza o display
   atualizarDisplay();
}

/* =============================================
   SEÇÃO 5: FUNÇÕES DE CONFIGURAÇÃO
   
   Funções que atualizam os tempos quando o
   usuário altera os inputs.
   ============================================= */

/**
 * Função: atualizarTempoFoco
 *
 * Atualiza o tempo de foco quando o usuário
 * altera o valor no input.
 */
function atualizarTempoFoco() {
   // Pega o valor do input e converte para número inteiro
   var minutos = parseInt(inputFoco.value);

   // Valida o valor (deve estar entre 1 e 60)
   if (minutos < 1) {
      minutos = 1;
      inputFoco.value = 1;
   }
   if (minutos > 60) {
      minutos = 60;
      inputFoco.value = 60;
   }

   // Converte minutos para segundos
   tempoFocoEmSegundos = minutos * 60;

   // Se estamos no modo foco e o timer não está rodando, atualiza
   if (modoFoco && !timerRodando) {
      tempoRestante = tempoFocoEmSegundos;
      tempoTotal = tempoFocoEmSegundos;
      atualizarDisplay();
   }
}

/**
 * Função: atualizarTempoDescanso
 *
 * Atualiza o tempo de descanso quando o usuário
 * altera o valor no input.
 */
function atualizarTempoDescanso() {
   // Pega o valor do input e converte para número inteiro
   var minutos = parseInt(inputDescanso.value);

   // Valida o valor (deve estar entre 1 e 30)
   if (minutos < 1) {
      minutos = 1;
      inputDescanso.value = 1;
   }
   if (minutos > 30) {
      minutos = 30;
      inputDescanso.value = 30;
   }

   // Converte minutos para segundos
   tempoDescansoEmSegundos = minutos * 60;

   // Se estamos no modo descanso e o timer não está rodando, atualiza
   if (!modoFoco && !timerRodando) {
      tempoRestante = tempoDescansoEmSegundos;
      tempoTotal = tempoDescansoEmSegundos;
      atualizarDisplay();
   }
}

/* =============================================
   SEÇÃO 6: FUNÇÃO DE ALTERNAR TEMA
   
   Controla a troca entre modo claro e escuro.
   
   COMO FUNCIONA SEM VARIÁVEIS CSS:
   - Adicionamos ou removemos a classe "modo-escuro" do body
   - No CSS, temos estilos específicos para body.modo-escuro
   - Quando a classe está presente, os estilos escuros são aplicados
   - Quando a classe é removida, voltam os estilos claros
   ============================================= */

/**
 * Função: alternarTema
 *
 * Alterna entre modo claro e modo escuro.
 * A troca é feita adicionando/removendo uma classe CSS do body.
 */
function alternarTema() {
   // Pega referência ao elemento body
   var body = document.body;

   // Inverte o estado do modo escuro
   modoEscuroAtivo = !modoEscuroAtivo;

   // Verifica se deve ativar ou desativar o modo escuro
   if (modoEscuroAtivo) {
      // ATIVA o modo escuro
      // classList.add() adiciona uma classe ao elemento
      body.classList.add("modo-escuro");

      // Atualiza o texto do botão
      elementoBotaoTema.textContent = "☀️ Modo Claro";
   } else {
      // DESATIVA o modo escuro (volta ao modo claro)
      // classList.remove() remove uma classe do elemento
      body.classList.remove("modo-escuro");

      // Atualiza o texto do botão
      elementoBotaoTema.textContent = "🌙 Modo Escuro";
   }
}

/* =============================================
   SEÇÃO 7: FUNÇÕES DE SOM
   
   Gera sons usando a Web Audio API.
   Não precisa de arquivos de áudio externos!
   
   COMO FUNCIONA:
   - Criamos um "contexto de áudio" (como um estúdio virtual)
   - Criamos um "oscilador" que gera ondas sonoras
   - Definimos a frequência (altura do som)
   - Conectamos ao alto-falante e tocamos
   ============================================= */

/**
 * Função: tocarSom
 *
 * Toca um som de notificação usando Web Audio API.
 *
 * @param {number} frequencia - Frequência em Hz (ex: 440 = nota Lá)
 * @param {number} duracao - Duração em segundos
 */
function tocarSom(frequencia, duracao) {
   // Cria ou retoma o contexto de áudio
   if (!contextoAudio) {
      contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
   }

   // Se o navegador suspendeu o áudio, precisamos retomar
   if (contextoAudio.state === "suspended") {
      contextoAudio.resume();
   }

   var oscilador = contextoAudio.createOscillator();
   var ganho = contextoAudio.createGain();

   oscilador.type = "sine";
   oscilador.frequency.value = frequencia;
   ganho.gain.value = 0.5;

   oscilador.connect(ganho);
   ganho.connect(contextoAudio.destination);

   oscilador.start(contextoAudio.currentTime);

   // Suaviza o final do som para não dar um "estalo"
   ganho.gain.exponentialRampToValueAtTime(0.01, contextoAudio.currentTime + duracao);
   oscilador.stop(contextoAudio.currentTime + duracao);
}

/* =============================================
   SEÇÃO 8: INICIALIZAÇÃO
   
   Código que roda quando a página carrega.
   ============================================= */

// Atualiza o display assim que a página carrega
// Isso garante que o tempo inicial seja mostrado
atualizarDisplay();

// Exibe mensagem no console para debug
console.log("🍅 Pomodoro Timer carregado com sucesso!");
console.log("Tempo de foco: " + tempoFocoEmSegundos / 60 + " minutos");
console.log("Tempo de descanso: " + tempoDescansoEmSegundos / 60 + " minutos");

/* =============================================
   EXPLICAÇÃO FINAL
   
   ========================================
   🍅 O QUE É A TÉCNICA POMODORO?
   ========================================
   
   A Técnica Pomodoro foi criada por Francesco Cirillo
   nos anos 1980. O nome vem do timer de cozinha em
   formato de tomate (pomodoro em italiano) que ele usava.
   
   A técnica funciona assim:
   1. Escolha uma tarefa para fazer
   2. Configure o timer para 25 minutos
   3. Trabalhe focado até o timer tocar
   4. Faça uma pausa curta de 5 minutos
   5. A cada 4 pomodoros, faça uma pausa longa de 15-30 min
   
   Por que funciona?
   - Divide o trabalho em blocos gerenciáveis
   - Pausas regulares mantêm a mente fresca
   - O timer cria senso de urgência
   - Ajuda a medir quanto tempo você realmente trabalha
   
   ========================================
   ⏱️ COMO O JAVASCRIPT CONTROLA O TEMPO?
   ========================================
   
   O JavaScript usa a função setInterval() para criar
   um "relógio" que executa código a cada intervalo.
   
   setInterval(funcao, 1000) executa a função a cada
   1000 milissegundos (1 segundo).
   
   A cada segundo:
   1. Decrementamos tempoRestante em 1
   2. Atualizamos o display
   3. Verificamos se chegou a zero
   
   Para parar, usamos clearInterval(id), passando
   o ID que setInterval retornou.
   
   ========================================
   🌙 COMO O DARK MODE FUNCIONA SEM VARIÁVEIS CSS?
   ========================================
   
   Em vez de usar variáveis CSS (:root e var(--cor)),
   usamos CLASSES CSS que são adicionadas via JavaScript.
   
   No CSS, definimos estilos normais para o modo claro:
   body { background: branco; color: preto; }
   
   E estilos específicos para quando a classe existe:
   body.modo-escuro { background: preto; color: branco; }
   
   No JavaScript, usamos:
   - body.classList.add('modo-escuro') para ativar
   - body.classList.remove('modo-escuro') para desativar
   
   Quando a classe é adicionada, o navegador aplica
   automaticamente os estilos correspondentes!
   
   ========================================
   🔊 COMO O SOM É DISPARADO?
   ========================================
   
   Usamos a Web Audio API, que permite gerar sons
   diretamente no navegador sem arquivos externos.
   
   1. Criamos um AudioContext (o "estúdio de som")
   2. Criamos um Oscillator (gerador de ondas)
   3. Definimos frequência (altura) e tipo de onda
   4. Conectamos ao alto-falante (destination)
   5. Iniciamos e paramos após X segundos
   
   A frequência é medida em Hertz (Hz):
   - 440 Hz = nota Lá (usada para afinar instrumentos)
   - 600 Hz = som mais grave (usado no fim do descanso)
   - 800 Hz = som mais agudo (usado no fim do foco)
   
   O GainNode controla o volume e permite fazer
   "fade out" para o som não terminar bruscamente.
   
   ============================================= */
