// Lógica JavaScript
const chatOutput = document.getElementById('chat-output');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// --- Event Listeners ---
sendButton.addEventListener('click', handleSendMessage);
userInput.addEventListener('keypress', function(event) {
    // Enviar mensaje al presionar Enter
    if (event.key === 'Enter') {
        event.preventDefault(); // Evitar el comportamiento por defecto (salto de línea)
        handleSendMessage();
    }
});


// --- Funciones ---
function handleSendMessage() {
    const messageText = userInput.value.trim();
    if (messageText) {
        // 1. Mostrar el mensaje del usuario inmediatamente
        displayMessage(messageText, 'user');
        // 2. Limpiar el campo de entrada
        userInput.value = '';
        // 3. Mostrar indicador de "escribiendo" (opcional)
        showTypingIndicator(true);
        // 4. Simular llamada al backend para obtener respuesta de Gemini
        getGeminiResponse(messageText);
    }
}


function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text; // Usar textContent para evitar XSS
    chatOutput.appendChild(messageDiv);
    // Hacer scroll hasta el final del chat
    scrollToBottom();
}


function showTypingIndicator(show) {
    let indicator = chatOutput.querySelector('.typing-indicator');
    if (show) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.classList.add('typing-indicator');
            indicator.textContent = 'Gemini está escribiendo...';
            chatOutput.appendChild(indicator);
            scrollToBottom();
        }
    } else {
        if (indicator) {
            indicator.remove();
        }
    }
}


function scrollToBottom() {
    chatOutput.scrollTop = chatOutput.scrollHeight;
}


async function getGeminiResponse(userMessage) {
    try {
        const response = await fetch("controller.php", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: userMessage }) 
        });
        // Quitar el indicador de "escribiendo"
        showTypingIndicator(false);
        if (!response.ok) {
            // Si la respuesta del backend no es exitosa (ej. error 500)
            const errorData = await response.json().catch(() => ({ detail: 'Error desconocido del servidor' }));
            console.error('Error del backend:', response.status, errorData);
            displayMessage(`Error ${response.status}: ${errorData.detail || 'No se pudo obtener respuesta.'}`, 'bot');
            return;
        }
        const data = await response.json();
        // Asumiendo que tu backend devuelve la respuesta en data.response o similar
        const botResponse = data.response || "Lo siento, no pude procesar la respuesta.";
        displayMessage(botResponse, 'bot');
    } catch (error) {
        showTypingIndicator(false);
        console.error('Error al conectar con el backend:', error);
        displayMessage('Error de conexión. Inténtalo de nuevo.', 'bot');
    }
}
