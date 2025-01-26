<?php
// Définir l'en-tête pour permettre les requêtes CORS (si nécessaire)
header('Access-Control-Allow-Origin: http://www.behavioralproject.org');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

// Récupérer les données JSON envoyées par le client
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Valider les données
if (!isset($data['topic']) || !isset($data['question']) || empty($data['topic']) || empty($data['question'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data: topic and question are required.']);
    exit;
}

// Ajouter un horodatage si non fourni
if (!isset($data['timestamp'])) {
    $data['timestamp'] = date('Y-m-d\TH:i:s'); // ISO 8601
}

// Préparer la ligne à ajouter au fichier
$logEntry = json_encode($data) . PHP_EOL;

// Enregistrer dans un fichier texte
$file = 'interactions.log'; // Nom du fichier
if (file_put_contents($file, $logEntry, FILE_APPEND | LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to write to log file.']);
    exit;
}

// Répondre avec succès
http_response_code(200);
echo json_encode(['success' => 'Interaction saved successfully.']);
?>
