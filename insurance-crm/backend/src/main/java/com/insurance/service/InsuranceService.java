package com.insurance.service;

import com.insurance.model.Client;
import com.insurance.model.Policy;
import com.insurance.repository.ClientRepository;
import com.insurance.repository.PolicyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeParseException;

@Service
public class InsuranceService {
    private static final Logger logger = LoggerFactory.getLogger(InsuranceService.class);
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private PolicyRepository policyRepository;
    
    public Double calculatePremium(Client client, Policy policy) {
        validatePolicy(policy);
        double basePremium = calculateBasePremium(client, policy);
        
        try {
            switch (policy.getPolicyType()) {
                case TERM_LIFE:
                    return calculateTermLifePremium(basePremium, policy);
                case WHOLE_LIFE:
                    return calculateWholeLifePremium(basePremium, policy);
                case UNIVERSAL_LIFE:
                    return calculateUniversalLifePremium(basePremium, policy);
                case VARIABLE_LIFE:
                    return calculateVariableLifePremium(basePremium, policy);
                case INDEXED_UNIVERSAL_LIFE:
                    return calculateIndexedUniversalLifePremium(basePremium, policy);
                case FINAL_EXPENSE:
                    return calculateFinalExpensePremium(basePremium, policy);
                case GROUP_LIFE:
                    return calculateGroupLifePremium(basePremium, policy);
                default:
                    throw new IllegalArgumentException("Unknown policy type: " + policy.getPolicyType());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error calculating premium: " + e.getMessage());
        }
    }

    private void validatePolicy(Policy policy) {
        logger.debug("Validating policy: {}", policy);

        if (policy.getCoverageAmount() == null || policy.getCoverageAmount() <= 0) {
            logger.error("Invalid coverage amount: {}", policy.getCoverageAmount());
            throw new IllegalArgumentException("Coverage amount must be greater than 0");
        }
        if (policy.getStartDate() == null) {
            logger.error("Start date is missing");
            throw new IllegalArgumentException("Start date is required");
        }
        try {
            LocalDate.parse(policy.getStartDate().toString());
        } catch (DateTimeParseException e) {
            logger.error("Invalid start date format: {}", policy.getStartDate());
            throw new IllegalArgumentException("Invalid start date format. Expected format: YYYY-MM-DD");
        }
        if (policy.getPolicyType() == null) {
            logger.error("Policy type is missing");
            throw new IllegalArgumentException("Policy type is required");
        }
        if (policy.getBeneficiaryName() == null || policy.getBeneficiaryName().trim().isEmpty()) {
            logger.error("Beneficiary name is missing or empty");
            throw new IllegalArgumentException("Beneficiary name is required");
        }
        if (policy.getBeneficiaryRelation() == null || policy.getBeneficiaryRelation().trim().isEmpty()) {
            logger.error("Beneficiary relation is missing or empty");
            throw new IllegalArgumentException("Beneficiary relation is required");
        }

        // Policy type specific validations
        switch (policy.getPolicyType()) {
            case TERM_LIFE:
                if (policy.getTermYears() == null || policy.getTermYears() <= 0) {
                    logger.error("Invalid term years for Term Life policy: {}", policy.getTermYears());
                    throw new IllegalArgumentException("Term years must be greater than 0 for Term Life policies");
                }
                break;
            case UNIVERSAL_LIFE:
                if (policy.getInterestRate() == null) {
                    logger.error("Interest rate is missing for Universal Life policy");
                    throw new IllegalArgumentException("Interest rate is required for Universal Life policies");
                }
                break;
            case VARIABLE_LIFE:
                if (policy.getInvestmentComponent() == null) {
                    logger.error("Investment component is missing for Variable Life policy");
                    throw new IllegalArgumentException("Investment component is required for Variable Life policies");
                }
                break;
        }
        
        logger.debug("Policy validation successful");
    }
    
    private Double calculateBasePremium(Client client, Policy policy) {
        int age = Period.between(client.getDateOfBirth(), LocalDate.now()).getYears();
        double coverageAmount = policy.getCoverageAmount();
        
        // Base calculation factors
        double ageFactor = 1.0 + (age / 50.0); // Age impact
        double coverageFactor = Math.log10(coverageAmount) / 5.0; // Coverage amount impact
        double incomeFactor = 1.0 - (Math.min(client.getAnnualIncome(), 200000) / 200000 * 0.2); // Income impact
        
        return (coverageAmount / 1000) * ageFactor * coverageFactor * incomeFactor;
    }
    
    private Double calculateTermLifePremium(double basePremium, Policy policy) {
        double termFactor = 1.0 + (policy.getTermYears() / 30.0);
        return basePremium * termFactor * (policy.getConvertible() ? 1.1 : 1.0);
    }
    
    private Double calculateWholeLifePremium(double basePremium, Policy policy) {
        return basePremium * 2.5; // Whole life is typically more expensive than term
    }
    
    private Double calculateUniversalLifePremium(double basePremium, Policy policy) {
        double interestFactor = 1.0 - (policy.getInterestRate() / 10.0);
        return basePremium * 2.0 * interestFactor;
    }
    
    private Double calculateVariableLifePremium(double basePremium, Policy policy) {
        double investmentFactor = 1.0 + (policy.getInvestmentComponent() / policy.getCoverageAmount());
        return basePremium * 2.2 * investmentFactor;
    }
    
    private Double calculateIndexedUniversalLifePremium(double basePremium, Policy policy) {
        return basePremium * 2.3; // Similar to universal life but with market-linked component
    }
    
    private Double calculateFinalExpensePremium(double basePremium, Policy policy) {
        return basePremium * 0.8; // Usually smaller coverage amounts
    }
    
    private Double calculateGroupLifePremium(double basePremium, Policy policy) {
        return basePremium * 0.6; // Group policies typically have lower premiums
    }
    
    @Transactional
    public Policy createPolicy(Long clientId, Policy policy) {
        try {
            logger.info("Creating policy for client {}: {}", clientId, policy);
            
            Client client = clientRepository.findById(clientId)
                    .orElseThrow(() -> {
                        logger.error("Client not found with ID: {}", clientId);
                        return new RuntimeException("Client not found with ID: " + clientId);
                    });

            // Validate the policy
            validatePolicy(policy);

            // Set the client reference
            policy.setClient(client);

            // Calculate and set the premium
            Double premium = calculatePremium(client, policy);
            logger.debug("Calculated premium: {}", premium);
            policy.setPremiumAmount(premium);

            // If it's a term life policy, calculate and set the end date
            if (policy.getPolicyType() == Policy.PolicyType.TERM_LIFE && policy.getTermYears() != null) {
                LocalDate startDate = LocalDate.parse(policy.getStartDate().toString());
                LocalDate endDate = startDate.plusYears(policy.getTermYears());
                policy.setEndDate(endDate);
                logger.debug("Set end date for term life policy: {}", endDate);
            }

            // Save and return the policy
            Policy savedPolicy = policyRepository.save(policy);
            logger.info("Successfully created policy: {}", savedPolicy);
            return savedPolicy;
        } catch (Exception e) {
            logger.error("Error creating policy: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create policy: " + e.getMessage());
        }
    }
    
    public Policy updatePolicy(Long policyId, Policy updatedPolicy) {
        Policy existingPolicy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        
        // Update fields
        existingPolicy.setCoverageAmount(updatedPolicy.getCoverageAmount());
        existingPolicy.setTermYears(updatedPolicy.getTermYears());
        existingPolicy.setBeneficiaryName(updatedPolicy.getBeneficiaryName());
        existingPolicy.setBeneficiaryRelation(updatedPolicy.getBeneficiaryRelation());
        
        // Recalculate premium
        existingPolicy.setPremiumAmount(calculatePremium(existingPolicy.getClient(), existingPolicy));
        
        return policyRepository.save(existingPolicy);
    }
} 