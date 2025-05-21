package com.insurance.controller;

import com.insurance.model.Client;
import com.insurance.model.Policy;
import com.insurance.repository.ClientRepository;
import com.insurance.service.InsuranceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class InsuranceController {
    private static final Logger logger = LoggerFactory.getLogger(InsuranceController.class);

    @Autowired
    private InsuranceService insuranceService;

    @Autowired
    private ClientRepository clientRepository;

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        logger.error("Runtime error occurred: ", e);
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(Map.of("message", e.getMessage()));
    }

    // Client endpoints
    @PostMapping("/clients")
    public ResponseEntity<Client> createClient(@RequestBody Client client) {
        return ResponseEntity.ok(clientRepository.save(client));
    }

    @GetMapping("/clients")
    public ResponseEntity<List<Client>> getAllClients() {
        logger.debug("Fetching all clients");
        List<Client> clients = clientRepository.findAll();
        logger.debug("Found {} clients", clients.size());
        logger.debug("Clients data: {}", clients);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/clients/{id}")
    public ResponseEntity<Client> getClient(@PathVariable Long id) {
        return ResponseEntity.ok(clientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + id)));
    }

    // Policy endpoints
    @PostMapping("/clients/{clientId}/policies")
    public ResponseEntity<Policy> createPolicy(
            @PathVariable Long clientId,
            @RequestBody Policy policy) {
        try {
            logger.info("Received policy creation request for client {}: {}", clientId, policy);
            Policy createdPolicy = insuranceService.createPolicy(clientId, policy);
            logger.info("Successfully created policy: {}", createdPolicy);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPolicy);
        } catch (RuntimeException e) {
            logger.error("Failed to create policy for client {}: {}", clientId, e.getMessage(), e);
            throw new RuntimeException("Failed to create policy: " + e.getMessage());
        }
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<Policy> updatePolicy(
            @PathVariable Long id,
            @RequestBody Policy policy) {
        try {
            return ResponseEntity.ok(insuranceService.updatePolicy(id, policy));
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to update policy: " + e.getMessage());
        }
    }

    // Premium calculation endpoint
    @PostMapping("/calculate-premium")
    public ResponseEntity<Double> calculatePremium(
            @RequestParam Long clientId,
            @RequestBody Policy policy) {
        try {
            Client client = clientRepository.findById(clientId)
                    .orElseThrow(() -> new RuntimeException("Client not found with ID: " + clientId));
            return ResponseEntity.ok(insuranceService.calculatePremium(client, policy));
        } catch (RuntimeException e) {
            throw new RuntimeException("Failed to calculate premium: " + e.getMessage());
        }
    }
} 