<?php
if($_SERVER['REQUEST_METHOD'] == 'POST'){

    $jsonPayload = file_get_contents('php://input');
    $requestData = json_decode($jsonPayload, true);
    
    // Validar que se recibió el 'prompt'
    if (!isset($requestData['prompt']) || empty(trim($requestData['prompt']))) {
        http_response_code(400); // Bad Request
        echo json_encode(['status'=>'error', 'response' => 'Falta el parámetro "prompt" o está vacío en la solicitud.']);
        exit;
    }

    $prompt = trim($requestData['prompt']);

    $responseText = 'Lo siento, no pude obtener una respuesta válida.'; // Respuesta por defecto
    $apiKey = 'AIzaSyDvE_TCVMZagLua2ej02EfDRDMD04ggfKk'; 
    $model = 'gemini-1.5-flash-latest'; 
    $server = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
    // $prompt = "Hola como estas?"; 

    // Construir el cuerpo de la solicitud para la API de Gemini
    $fields = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ],
    ];

    $request = json_encode($fields);
    $ch = curl_init($server);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $data = curl_exec($ch);
    curl_close($ch);
    $geminiData = json_decode($data,true);

    if (isset($geminiData['candidates'][0]['content']['parts'][0]['text'])) {
        $responseText = $geminiData['candidates'][0]['content']['parts'][0]['text'];
        $status = "ok";
    } elseif (isset($geminiData['promptFeedback']['blockReason'])) {
        $reason = $geminiData['promptFeedback']['blockReason'];
        $responseText = "La respuesta fue bloqueada. Razón: {$reason}";
        $status = "error";
    } elseif (isset($geminiData['error'])) {
        $responseText = "Error de la API de Gemini: " . ($geminiData['error']['message'] ?? 'Desconocido');
        $status = "error";
    }

    echo json_encode(['status'=> 'ok','response' => $responseText]);
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['status'=> 'error','response' => 'Método no permitido. Solo se aceptan solicitudes POST.']);
}
?>