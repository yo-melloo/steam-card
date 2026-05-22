package com.mello.steamcard.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
public class SteamService {

    @Value("${steam.api.key}")
    private String steamApiKey;

    private static final String CACHE_KEY_PREFIX = "steam:combined:";
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    private final RestTemplate restTemplate = new RestTemplate();
    
    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    public String resolveSteamId(String input) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException("O nome de usuário ou SteamID não pode ser vazio.");
        }

        String cleaned = input.trim();

        // 1. Extrair o nome/ID de URLs caso tenham sido inseridas completas
        if (cleaned.contains("steamcommunity.com/id/")) {
            String[] parts = cleaned.split("steamcommunity.com/id/");
            if (parts.length > 1) {
                cleaned = parts[1];
                if (cleaned.contains("/")) {
                    cleaned = cleaned.split("/")[0];
                }
            }
        } else if (cleaned.contains("steamcommunity.com/profiles/")) {
            String[] parts = cleaned.split("steamcommunity.com/profiles/");
            if (parts.length > 1) {
                cleaned = parts[1];
                if (cleaned.contains("/")) {
                    cleaned = cleaned.split("/")[0];
                }
            }
        }

        cleaned = cleaned.replaceAll("[/\\s]", "");

        // 2. Se for um SteamID64 de 17 dígitos, usa direto
        if (cleaned.matches("^\\d{17}$")) {
            return cleaned;
        }

        // 3. Senão, tenta resolver como Vanity URL
        String vanityUrl = String.format(
            "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=%s&vanityurl=%s",
            steamApiKey, cleaned
        );
        
        try {
            String response = restTemplate.getForObject(vanityUrl, String.class);
            JsonNode json = objectMapper.readTree(response);
            JsonNode responseNode = json.path("response");
            
            int success = responseNode.path("success").asInt();
            if (success == 1) {
                return responseNode.path("steamid").asText();
            } else {
                throw new RuntimeException("Não foi possível encontrar o usuário '" + cleaned + "' na Steam.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Erro ao resolver nome de usuário na Steam: " + e.getMessage(), e);
        }
    }

    public String getPlayerProfileAndGames(String usernameOrId) {
        // Resolver para SteamID numérico
        String steamId = resolveSteamId(usernameOrId);
        
        String cacheKey = CACHE_KEY_PREFIX + steamId;

        // Tentar obter dados do cache do Redis
        String cachedData = redisTemplate.opsForValue().get(cacheKey);
        if (cachedData != null) {
            System.out.println("Serving from Redis cache for steamId: " + steamId);
            return cachedData;
        }

        try {
            // Buscar resumo do perfil do jogador
            String summaryUrl = String.format(
                "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=%s&steamids=%s",
                steamApiKey, steamId
            );
            String summaryResponse = restTemplate.getForObject(summaryUrl, String.class);

            // Buscar lista de jogos possuídos
            String gamesUrl = String.format(
                "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=%s&steamid=%s&format=json&include_appinfo=true",
                steamApiKey, steamId
            );
            String gamesResponse = restTemplate.getForObject(gamesUrl, String.class);

            // Combinar os JSONs obtidos
            JsonNode summaryJson = objectMapper.readTree(summaryResponse);
            JsonNode gamesJson = objectMapper.readTree(gamesResponse);

            ObjectNode combinedNode = objectMapper.createObjectNode();

            // Extrair o jogador
            JsonNode playersNode = summaryJson.path("response").path("players");
            if (playersNode.isArray() && playersNode.size() > 0) {
                combinedNode.set("player", playersNode.get(0));
            } else {
                combinedNode.putNull("player");
            }

            // Extrair a lista de jogos e quantidade
            JsonNode gamesResponseNode = gamesJson.path("response");
            combinedNode.set("game_count", gamesResponseNode.path("game_count"));
            combinedNode.set("games", gamesResponseNode.path("games"));

            String combinedJson = objectMapper.writeValueAsString(combinedNode);

            // Salvar no cache do Redis
            redisTemplate.opsForValue().set(cacheKey, combinedJson, CACHE_TTL);
            System.out.println("Saved combined data to Redis cache for steamId: " + steamId);

            return combinedJson;
        } catch (Exception e) {
            System.err.println("Error fetching data from Steam API or combining JSON: " + e.getMessage());
            throw new RuntimeException("Falha ao carregar dados da Steam: " + e.getMessage(), e);
        }
    }
}
