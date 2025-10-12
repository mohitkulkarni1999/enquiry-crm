package com.enquirycrm.repository;

import com.enquirycrm.domain.CrmAdminProfile;
import com.enquirycrm.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CrmAdminProfileRepository extends JpaRepository<CrmAdminProfile, Long> {
    Optional<CrmAdminProfile> findByUser(User user);
}


