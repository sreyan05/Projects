package com.insurance.repository;

import com.insurance.model.Policy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByClientId(Long clientId);
} 