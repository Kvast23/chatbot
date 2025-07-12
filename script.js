// Define a chave de API para acessar o serviço da Gemini AI
const CHAVE_API = 'AIzaSyAVP2Y1MdM34qJa24I1ueSkDukifTZ_dZ0';

// Monta a URL completa da API incluindo a chave de acesso
const URL_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CHAVE_API}`;
/*
CHAVE_API: É como uma senha que permite ao nosso programa acessar o serviço da Gemini AI (inteligência artificial do Google).
URL_API: É o endereço na internet onde vamos enviar nossas mensagens para conversar com a IA. Juntamos a URL base com a chave de acesso.
*/

/*___________________________________________________________________________________________________________________________________________________*/

// Obtém a referência para o elemento HTML onde as mensagens do chat serão exibidas
const caixaChat = document.getElementById('chat-box');

// Obtém o campo de entrada de texto onde o usuário digita as mensagens
const entradaTexto = document.getElementById('text-input');

// Obtém o campo de entrada de arquivo para upload de imagens
const entradaImagem = document.getElementById('image-input');

// Obtém o botão que envia as mensagens
const botaoEnviar = document.getElementById('send-button');

// Obtém o indicador que mostra quando uma imagem foi selecionada
const indicadorImagem = document.getElementById('image-indicator');

// Obtém o elemento que exibirá o nome do arquivo de imagem selecionado
const exibicaoNomeArquivo = document.getElementById('file-name');
/*
Aqui estamos pegando os elementos da página HTML (a página web) que vamos usar:
    caixaChat: Onde as mensagens do chat aparecem
    entradaTexto: Onde digitamos nossas mensagens
    entradaImagem: Onde podemos selecionar uma imagem para enviar
    botaoEnviar: O botão para enviar mensagens
    indicadorImagem: Mostra quando uma imagem foi selecionada
    exibicaoNomeArquivo: Mostra o nome do arquivo de imagem selecionado
*/

/*___________________________________________________________________________________________________________________________________________________*/

// Adiciona um "ouvinte" de evento para quando o usuário seleciona uma imagem
entradaImagem.addEventListener('change', function () {
    // Verifica se algum arquivo foi selecionado
    if (this.files && this.files[0]) {
        // Mostra o indicador de imagem (muda o estilo para 'flex' que torna visível)
        indicadorImagem.style.display = 'flex';
        
        // Mostra o nome do arquivo selecionado no elemento de exibição
        exibicaoNomeArquivo.textContent = this.files[0].name;
    } else {
        // Se nenhum arquivo foi selecionado, esconde o indicador
        indicadorImagem.style.display = 'none';
        
        // Limpa o texto que mostra o nome do arquivo
        exibicaoNomeArquivo.textContent = '';
    }
});
/*
Quando alguém seleciona uma imagem:
    Verifica se um arquivo foi realmente selecionado
    Se sim:
        Mostra o indicador de imagem (flex significa "mostre este elemento")
        Mostra o nome do arquivo selecionado
    Se não:
        Esconde o indicador
        Limpa o nome do arquivo
*/

/*___________________________________________________________________________________________________________________________________________________*/

// Função para adicionar uma nova mensagem ao chat
function adicionarMensagem(texto, ehUsuario, urlImagem = null) {
    // Cria um novo elemento div para a mensagem
    const divMensagem = document.createElement('div');
    
    // Adiciona a classe CSS 'message' para estilização básica
    divMensagem.classList.add('message');
    
    // Adiciona classe específica dependendo se é mensagem do usuário ou do bot
    divMensagem.classList.add(ehUsuario ? 'user-message' : 'bot-message');

    // Verifica se há uma imagem e se é mensagem do usuário
    if (urlImagem && ehUsuario) {
        // Se houver texto junto com a imagem, adiciona emoji de câmera
        divMensagem.textContent = texto ? texto + ' 📷' : '📷 Imagem anexada';
        
        // Cria um elemento img para mostrar a pré-visualização
        const img = document.createElement('img');
        
        // Define a URL da imagem a ser exibida
        img.src = urlImagem;
        
        // Adiciona classe CSS para estilizar a pré-visualização
        img.classList.add('image-preview');
        
        // Adiciona uma quebra de linha após o texto
        divMensagem.appendChild(document.createElement('br'));
        
        // Adiciona a imagem após a quebra de linha
        divMensagem.appendChild(img);
    } else {
        // Se não houver imagem, apenas adiciona o texto
        divMensagem.textContent = texto;
    }

    // Adiciona a mensagem completa à caixa de chat
    caixaChat.appendChild(divMensagem);
    
    // Rola a caixa de chat para baixo para mostrar a mensagem mais recente
    caixaChat.scrollTop = caixaChat.scrollHeight;
}
/*
Esta função cria uma nova mensagem no chat:
    Cria um novo elemento div (um bloco na página)
    Adiciona classes CSS para estilizar:
        message: estilo básico para todas as mensagens
        user-message ou bot-message: estilos diferentes para usuário e bot
    Se houver imagem e for mensagem do usuário:
        Adiciona um emoji de câmera 📷
        Cria um elemento de imagem e mostra a pré-visualização
        Adiciona uma quebra de linha (br)
    Adiciona a mensagem à caixa de chat
    Rola a caixa de chat para baixo para mostrar a mensagem mais recente
*/

/*___________________________________________________________________________________________________________________________________________________*/

// Função assíncrona para enviar mensagem à API do Gemini
async function enviarMensagem(texto, imagemBase64 = null) {
    try {
        // Prepara o corpo da requisição com a mensagem de texto
        let corpoRequisicao = {
            contents: [{
                parts: [{
                    text: texto
                }]
            }]
        };

        // Se houver imagem em formato base64, adiciona à requisição
        if (imagemBase64) {
            corpoRequisicao.contents[0].parts.push({
                inline_data: {
                    mime_type: "image/jpeg",  // Tipo do arquivo de imagem
                    data: imagemBase64       // Dados da imagem codificados
                }
            });
        }

        // Faz a requisição POST para a API do Gemini
        const resposta = await fetch(URL_API, {
            method: 'POST',                     // Método HTTP POST para enviar dados
            headers: {
                'Content-Type': 'application/json'  // Tipo de conteúdo sendo enviado
            },
            body: JSON.stringify(corpoRequisicao)  // Converte o objeto para JSON
        });

        // Converte a resposta para formato JSON
        const dados = await resposta.json();

        // Verifica se a resposta tem a estrutura esperada e extrai o texto
        if (dados.candidates && dados.candidates[0].content.parts[0].text) {
            return dados.candidates[0].content.parts[0].text;  // Retorna a resposta do bot
        } else {
            throw new Error('Resposta inesperada da API');  // Lança erro se a estrutura for diferente
        }
    } catch (erro) {
        // Em caso de erro, registra no console e retorna mensagem amigável
        console.error('Erro ao chamar API do Gemini:', erro);
        return "Desculpe, ocorreu um erro ao processar sua mensagem.";
    }
}
/*
Esta função envia a mensagem para a Gemini AI:
    Prepara os dados para enviar:
        Cria um objeto com a mensagem de texto
        Se houver imagem, converte para formato base64 e adiciona
    Faz a requisição para a API:
        Usa o método POST (para enviar dados)
        Define o tipo de conteúdo como JSON
        Converte o objeto para string JSON
    Processa a resposta:
        Verifica se a resposta tem a estrutura esperada
        Retorna o texto da resposta do bot
    Se algo der errado, mostra mensagem de erro no console e retorna uma mensagem amigável para o usuário
*/

/*___________________________________________________________________________________________________________________________________________________*/

// Adiciona um "ouvinte" de evento para o clique no botão enviar
botaoEnviar.addEventListener('click', async () => {
    // Obtém o texto digitado (removendo espaços extras no início/fim)
    const texto = entradaTexto.value.trim();
    
    // Obtém o arquivo de imagem selecionado (se existir)
    const arquivo = entradaImagem.files[0];

    // Se não houver texto nem imagem, não faz nada
    if (!texto && !arquivo) return;

    // Variável para armazenar a URL temporária da imagem
    let urlImagemUsuario = null;
    
    // Se houver imagem selecionada
    if (arquivo) {
        // Cria uma URL temporária para a imagem
        urlImagemUsuario = URL.createObjectURL(arquivo);
        
        // Adiciona a mensagem do usuário com a imagem ao chat
        adicionarMensagem(texto, true, urlImagemUsuario);
    } else {
        // Adiciona apenas o texto da mensagem do usuário
        adicionarMensagem(texto, true);
    }

    // Variável para armazenar a imagem em formato base64
    let imagemBase64 = null;
    
    // Se houver imagem, converte para base64
    if (arquivo) {
        imagemBase64 = await new Promise((resolve) => {
            // Cria um leitor de arquivos
            const leitor = new FileReader();
            
            // Define o que acontece quando o arquivo é carregado
            leitor.onload = (e) => {
                // Extrai a parte dos dados base64 (após a vírgula)
                const stringBase64 = e.target.result.split(',')[1];
                
                // Resolve a promessa com os dados da imagem
                resolve(stringBase64);
            };
            
            // Inicia a leitura do arquivo como URL de dados
            leitor.readAsDataURL(arquivo);
        });
    }

    // Prepara a mensagem completa para a API
    const mensagemCompleta = arquivo ? 
        (texto ? `${texto} (anexei uma imagem)` : "Analise esta imagem") : 
        texto;
    
    // Envia a mensagem para a API e aguarda a resposta
    const respostaBot = await enviarMensagem(mensagemCompleta, imagemBase64);
    
    // Adiciona a resposta do bot ao chat
    adicionarMensagem(respostaBot, false);

    // Limpa o campo de texto após enviar
    entradaTexto.value = '';
    
    // Limpa o campo de arquivo
    entradaImagem.value = '';
    
    // Esconde o indicador de imagem
    indicadorImagem.style.display = 'none';
    
    // Limpa o nome do arquivo exibido
    exibicaoNomeArquivo.textContent = '';

    // Se foi criada uma URL temporária para a imagem, libera a memória
    if (urlImagemUsuario) {
        URL.revokeObjectURL(urlImagemUsuario);
    }
});

/*
Quando o botão é clicado:
    Pega o texto digitado e a imagem selecionada
    Se não tiver nada, não faz nada
    Se tiver imagem:
        Cria uma URL temporária para mostrar a imagem no chat
        Adiciona a mensagem do usuário com a imagem
    Converte a imagem para base64 (formato que a API entende)
    Prepara a mensagem completa:
        Se tiver texto e imagem: junta os dois
        Se só tiver imagem: pede para analisar a imagem
    Envia para a API e mostra a resposta do bot
    Limpa os campos de entrada e indicadores
    Libera a memória da URL temporária da imagem
*/

/*___________________________________________________________________________________________________________________________________________________*/

// Adiciona um "ouvinte" para o evento de pressionar tecla no campo de texto
entradaTexto.addEventListener('keypress', (e) => {
    // Verifica se a tecla pressionada foi Enter
    if (e.key === 'Enter') {
        // Simula um clique no botão enviar
        botaoEnviar.click();
    }
});
/*
Quando o usuário pressiona Enter no campo de texto:
    Simula um clique no botão enviar (para facilitar o uso)
*/
