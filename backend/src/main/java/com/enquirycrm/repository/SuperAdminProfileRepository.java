package com.enquirycrm.repository;

import com.enquirycrm.domain.SuperAdminProfile;
import com.enquirycrm.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuperAdminProfileRepository extends JpaRepository<SuperAdminProfile, Long> {
    Optional<SuperAdminProfile> findByUser(User user);
}


