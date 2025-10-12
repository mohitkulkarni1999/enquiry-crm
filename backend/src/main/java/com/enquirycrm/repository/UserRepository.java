package com.enquirycrm.repository;

import com.enquirycrm.domain.User;
import com.enquirycrm.domain.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(UserRole role);
    
    List<User> findByActiveTrue();
    
    List<User> findByRoleAndActiveTrue(UserRole role);
    
    @Query("SELECT u FROM User u WHERE u.active = true AND u.role = :role")
    Page<User> findActiveUsersByRole(@Param("role") UserRole role, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<User> searchUsers(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    long countByRole(UserRole role);
    
    long countByActiveTrue();
    
    long countByRoleAndActiveTrue(UserRole role);
}
