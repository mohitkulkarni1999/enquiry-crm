package com.enquirycrm.service;

import com.enquirycrm.domain.User;
import com.enquirycrm.domain.UserRole;
import com.enquirycrm.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Page<User> getAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") 
            ? Sort.by(sortBy).descending() 
            : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return userRepository.findAll(pageable);
    }

    public User getById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User create(User user) {
        // Check if username or email already exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new RuntimeException("Email already exists: " + user.getEmail());
            }
        }

        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        
        return userRepository.save(user);
    }

    public User update(Long id, User updateData) {
        User user = getById(id);
        
        // Update fields
        if (updateData.getName() != null) {
            user.setName(updateData.getName());
        }
        if (updateData.getEmail() != null && !updateData.getEmail().equals(user.getEmail())) {
            if (!updateData.getEmail().isBlank()) {
                if (userRepository.existsByEmail(updateData.getEmail())) {
                    throw new RuntimeException("Email already exists: " + updateData.getEmail());
                }
            }
            user.setEmail(updateData.getEmail());
        }
        if (updateData.getPhone() != null) {
            user.setPhone(updateData.getPhone());
        }
        if (updateData.getRole() != null) {
            user.setRole(updateData.getRole());
        }
        if (updateData.getPassword() != null && !updateData.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateData.getPassword()));
        }
        
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public void delete(Long id) {
        User user = getById(id);
        userRepository.delete(user);
    }

    public User updateStatus(Long id, boolean active) {
        User user = getById(id);
        user.setActive(active);
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    public User updateLastLogin(Long id) {
        User user = getById(id);
        user.setLastLogin(Instant.now());
        return userRepository.save(user);
    }

    public List<User> getByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }

    public List<User> getActiveUsersByRole(UserRole role) {
        return userRepository.findByRoleAndActiveTrue(role);
    }

    public Page<User> searchUsers(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return userRepository.searchUsers(searchTerm, pageable);
    }

    public boolean validatePassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public User authenticate(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.isActive() && passwordEncoder.matches(password, user.getPassword())) {
                updateLastLogin(user.getId());
                return user;
            }
        }
        throw new RuntimeException("Invalid username or password");
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User update(User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setUpdatedAt(Instant.now());
        return userRepository.save(user);
    }

    // Analytics methods
    public long getTotalCount() {
        return userRepository.count();
    }

    public long getActiveCount() {
        return userRepository.countByActiveTrue();
    }

    public long getCountByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    public long getActiveCountByRole(UserRole role) {
        return userRepository.countByRoleAndActiveTrue(role);
    }
}
