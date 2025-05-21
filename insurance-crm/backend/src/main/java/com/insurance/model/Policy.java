package com.insurance.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Data
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "client_id")
    private Client client;
    
    @Enumerated(EnumType.STRING)
    private PolicyType policyType;
    
    private Double coverageAmount;
    private Double premiumAmount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    private Integer termYears;
    private String beneficiaryName;
    private String beneficiaryRelation;
    
    // Additional fields for specific policy types
    private Double cashValue; // For whole life and universal life
    private Double investmentComponent; // For variable life
    private Double interestRate; // For universal life
    private Boolean convertible; // For term life
    
    public enum PolicyType {
        TERM_LIFE,           // Basic term life insurance
        WHOLE_LIFE,         // Permanent life insurance with fixed premium
        UNIVERSAL_LIFE,     // Flexible premium permanent life insurance
        VARIABLE_LIFE,      // Permanent life insurance with investment options
        INDEXED_UNIVERSAL_LIFE, // Universal life with market-linked returns
        FINAL_EXPENSE,      // Small whole life policy for funeral expenses
        GROUP_LIFE          // Employer-provided life insurance
    }

    @PrePersist
    @PreUpdate
    public void prePersist() {
        if (startDate == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        
        if (policyType == PolicyType.TERM_LIFE && termYears != null) {
            endDate = startDate.plusYears(termYears);
        }
    }
} 