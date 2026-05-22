package com.mello.steamcard.controllers;

import com.mello.steamcard.services.SteamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/steam")
public class SteamController {

    @Autowired
    private SteamService steamService;

    @GetMapping(value = "/profile/{steamid}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getProfileAndGames(@PathVariable("steamid") String steamId) {
        if (steamId == null || steamId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("{\"error\": \"SteamID inválido.\"}");
        }
        
        try {
            String combinedJson = steamService.getPlayerProfileAndGames(steamId);
            return ResponseEntity.ok(combinedJson);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(String.format("{\"error\": \"Erro ao buscar dados do Steam: %s\"}", e.getMessage()));
        }
    }
}
