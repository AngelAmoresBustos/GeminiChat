// Estado del Chat
let isChatOpen = false; // Variable faltante que causaba el error    

// Endpoint de la API  de DeepSeek en local
const ENDPOINT = "http://192.168.100.6:1234/v1/chat/completions";  

// Estado del chat
let chatHistory = [
    { role: 'system', content: 'Eres un experto en facturación electrónica ecuatoriana y normativa del SRI. No respondas preguntas fuera de esta area. Responde de manera clara y precisa.' }
];


async function getDeepSeekResponse(userInput) {
        
        showTypingIndicator();

        try {
            console.log([...chatHistory, { role: 'user', content: userInput }]);
            const response = await fetch(ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer`
                },
                body: JSON.stringify({
                    model: 'deepseek-coder-v2-lite-instruct',
                    messages: [...chatHistory, { role: 'user', content: userInput }],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) throw new Error('Error en la API');
            
            const data = await response.json();

            return data.choices[0].message.content;

        } catch (error) {
            console.error('Error:', error);
            return 'Lo siento, estoy teniendo dificultades técnicas. Por favor intenta nuevamente más tarde.';
        } finally {
            hideTypingIndicator();
        }
}


// Funciones del Chat
function toggleChat() {
    const container = document.getElementById('chatContainer');
    isChatOpen = !isChatOpen;
    container.style.display = isChatOpen ? 'flex' : 'none';
}


function appendMessage(message, isUser = false) {
    const messagesDiv = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = message;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}


function showTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'block';
    document.getElementById('userInput').value = '';
}


function hideTypingIndicator() {
    document.getElementById('typingIndicator').style.display = 'none';
}


async function handleUserInput() {
        const userInput = document.getElementById('userInput');
        const question = userInput.value.trim();
        
        if (!question) return;

        appendMessage(question, true);

        showTypingIndicator();
        
        try {
            const response = await getDeepSeekResponse(question);
            appendMessage(response);
        } catch (error) {
            appendMessage('Error al conectar con el servicio. Intenta nuevamente.');
        } finally {
            hideTypingIndicator();
        }
}


function handleKeyPress(event) {
    if (event.key === 'Enter') {
        handleUserInput();
    }
}