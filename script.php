<?php
// purge_firefly_account.php
// Permanently delete a Firefly account and all its transactions.

$env = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($env as $line) {
    if (str_contains($line, '=')) {
        [$key, $value] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

$base   = rtrim($_ENV['FIREFLY_API_URL'] ?? '', '/');
$token  = $_ENV['FIREFLY_API_TOKEN'] ?? '';
$account = 111; // ⚠️ Change to the account ID you want to delete

if (!$base || !$token) {
    die("Missing FIREFLY_API_URL or FIREFLY_API_TOKEN in .env\n");
}

if (!str_ends_with($base, '/api/v1')) {
    $base .= '/api/v1';
}

function callDelete(string $url, string $token): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => "DELETE",
        CURLOPT_HTTPHEADER     => [
            "Authorization: Bearer $token",
            "Accept: application/json",
        ],
    ]);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return [$status, $res];
}

echo "💣 Permanently deleting Firefly account ID $account...\n";

[$status, $body] = callDelete("$base/accounts/$account", $token);

if (in_array($status, [200, 204])) {
    echo "✅ Account $account and all associated transactions deleted permanently.\n";
} else {
    echo "❌ Failed to delete account. HTTP $status\n";
    echo "Response: $body\n";
}

echo "Done.\n";
