package com.enquirycrm.web;

import com.enquirycrm.domain.User;
import com.enquirycrm.domain.UserRole;
import com.enquirycrm.service.UserService;
import com.enquirycrm.domain.CrmAdminProfile;
import com.enquirycrm.domain.SuperAdminProfile;
import com.enquirycrm.domain.SalesPerson;
import com.enquirycrm.repository.CrmAdminProfileRepository;
import com.enquirycrm.repository.SuperAdminProfileRepository;
import com.enquirycrm.repository.SalesPersonRepository;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(value = "/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final UserService userService;
    private final CrmAdminProfileRepository crmAdminProfileRepository;
    private final SuperAdminProfileRepository superAdminProfileRepository;
    private final SalesPersonRepository salesPersonRepository;

    public AuthController(UserService userService,
                          CrmAdminProfileRepository crmAdminProfileRepository,
                          SuperAdminProfileRepository superAdminProfileRepository,
                          SalesPersonRepository salesPersonRepository) {
        this.userService = userService;
        this.crmAdminProfileRepository = crmAdminProfileRepository;
        this.superAdminProfileRepository = superAdminProfileRepository;
        this.salesPersonRepository = salesPersonRepository;
    }

    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        try {
            User user = userService.authenticate(request.getUsername(), request.getPassword());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(user));
            response.put("message", "Login successful");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestParam(required = false) String username) {
        try {
            if (username == null || username.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Username required");
                return ResponseEntity.badRequest().body(response);
            }

            User user = userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(user));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping(path = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setPassword(request.getPassword());
            user.setRole(request.getRole() != null ? request.getRole() : UserRole.SALES);
            
            User savedUser = userService.create(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(savedUser));
            response.put("message", "User registered successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping(path = "/register/super-admin", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> registerSuperAdmin(@RequestBody SuperAdminRegisterRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setOrganization(request.getOrganization());
            user.setRole(UserRole.SUPER_ADMIN);
            
            User savedUser = userService.create(user);
            SuperAdminProfile profile = new SuperAdminProfile();
            profile.setUser(savedUser);
            profile.setOrganization(request.getOrganization());
            superAdminProfileRepository.save(profile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(savedUser));
            response.put("message", "Super Administrator account created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping(path = "/register/crm-admin", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> registerCrmAdmin(@RequestBody CrmAdminRegisterRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setPassword(request.getPassword());
            user.setRole(UserRole.CRM_ADMIN);
            
            User savedUser = userService.create(user);
            CrmAdminProfile profile = new CrmAdminProfile();
            profile.setUser(savedUser);
            crmAdminProfileRepository.save(profile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(savedUser));
            response.put("message", "CRM Administrator account created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping(path = "/register/sales", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> registerSales(@RequestBody SalesRegisterRequest request) {
        try {
            User user = new User();
            user.setUsername(request.getUsername());
            user.setName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            user.setPassword(request.getPassword());
            user.setRole(UserRole.SALES);
            
            User savedUser = userService.create(user);
            // Create SalesPerson entry for this sales user
            SalesPerson sp = new SalesPerson();
            sp.setName(savedUser.getName());
            sp.setEmail(savedUser.getEmail());
            sp.setPhone(savedUser.getPhone());
            sp.setAvailable(true);
            salesPersonRepository.save(sp);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(savedUser));
            response.put("message", "Sales Representative account created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("name", user.getName());
        userMap.put("email", user.getEmail());
        userMap.put("phone", user.getPhone());
        userMap.put("role", user.getRole().name());
        userMap.put("active", user.isActive());
        userMap.put("createdAt", user.getCreatedAt());
        userMap.put("lastLogin", user.getLastLogin());
        return userMap;
    }

    // Request DTOs
    public static class LoginRequest {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String username;
        private String name;
        private String email;
        private String phone;
        private String password;
        private UserRole role;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }
    }

    public static class SuperAdminRegisterRequest {
        private String username;
        private String fullName;
        private String email;
        private String password;
        private String organization;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getOrganization() { return organization; }
        public void setOrganization(String organization) { this.organization = organization; }
    }

    public static class CrmAdminRegisterRequest {
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class SalesRegisterRequest {
        private String username;
        private String fullName;
        private String email;
        private String phone;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping(path = "/create-test-users")
    public ResponseEntity<Map<String, Object>> createTestUsers() {
        try {
            // Create Super Admin
            User superAdmin = new User();
            superAdmin.setUsername("super");
            superAdmin.setName("Super Administrator");
            superAdmin.setEmail("super@company.com");
            superAdmin.setPhone("+91 98765 00001");
            superAdmin.setPassword("x");
            superAdmin.setRole(UserRole.SUPER_ADMIN);
            User savedSuperAdmin = userService.create(superAdmin);
            
            SuperAdminProfile superProfile = new SuperAdminProfile();
            superProfile.setUser(savedSuperAdmin);
            superProfile.setOrganization("Company");
            superAdminProfileRepository.save(superProfile);

            // Create CRM Admin
            User crmAdmin = new User();
            crmAdmin.setUsername("admin1");
            crmAdmin.setName("Rajesh Kumar");
            crmAdmin.setEmail("rajesh.kumar@company.com");
            crmAdmin.setPhone("+91 98765 00002");
            crmAdmin.setPassword("admin123");
            crmAdmin.setRole(UserRole.CRM_ADMIN);
            User savedCrmAdmin = userService.create(crmAdmin);
            
            CrmAdminProfile crmProfile = new CrmAdminProfile();
            crmProfile.setUser(savedCrmAdmin);
            crmAdminProfileRepository.save(crmProfile);

            // Create Sales Person
            User salesUser = new User();
            salesUser.setUsername("sales1");
            salesUser.setName("Vikram Singh");
            salesUser.setEmail("vikram.singh@company.com");
            salesUser.setPhone("+91 98765 10001");
            salesUser.setPassword("sales123");
            salesUser.setRole(UserRole.SALES);
            User savedSalesUser = userService.create(salesUser);
            
            SalesPerson salesPerson = new SalesPerson();
            salesPerson.setName("Vikram Singh");
            salesPerson.setEmail("vikram.singh@company.com");
            salesPerson.setPhone("+91 98765 10001");
            salesPerson.setAvailable(true);
            salesPersonRepository.save(salesPerson);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Test users created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to create test users: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping(path = "/update-crm-admin/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateCrmAdmin(@PathVariable("userId") Long userId, @RequestBody CrmAdminRegisterRequest request) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            user.setUsername(request.getUsername());
            user.setName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(request.getPassword());
            }
            user.setRole(UserRole.CRM_ADMIN);
            
            User savedUser = userService.update(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(savedUser));
            response.put("message", "CRM Administrator updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping(path = "/update-sales/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateSales(@PathVariable("userId") Long userId, @RequestBody SalesRegisterRequest request) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            user.setUsername(request.getUsername());
            user.setName(request.getFullName());
            user.setEmail(request.getEmail());
            user.setPhone(request.getPhone());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(request.getPassword());
            }
            user.setRole(UserRole.SALES);
            
            User savedUser = userService.update(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(savedUser));
            response.put("message", "Sales Representative updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping(path = "/update-super-admin/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateSuperAdmin(@PathVariable("userId") Long userId, @RequestBody SuperAdminRegisterRequest request) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            user.setUsername(request.getUsername());
            user.setName(request.getFullName());
            user.setEmail(request.getEmail());
            if (request.getPassword() != null && !request.getPassword().isEmpty()) {
                user.setPassword(request.getPassword());
            }
            user.setRole(UserRole.SUPER_ADMIN);
            
            User savedUser = userService.update(user);
            
            // Update profile
            Optional<SuperAdminProfile> profileOpt = superAdminProfileRepository.findByUser(savedUser);
            if (profileOpt.isPresent()) {
                SuperAdminProfile profile = profileOpt.get();
                profile.setOrganization(request.getOrganization());
                superAdminProfileRepository.save(profile);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", createUserResponse(savedUser));
            response.put("message", "Super Administrator updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Update failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping(path = "/delete-user/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable("userId") Long userId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }

            // Delete associated profiles
            if (user.getRole() == UserRole.CRM_ADMIN) {
                Optional<CrmAdminProfile> crmProfileOpt = crmAdminProfileRepository.findByUser(user);
                if (crmProfileOpt.isPresent()) {
                    crmAdminProfileRepository.delete(crmProfileOpt.get());
                }
            } else if (user.getRole() == UserRole.SUPER_ADMIN) {
                Optional<SuperAdminProfile> superProfileOpt = superAdminProfileRepository.findByUser(user);
                if (superProfileOpt.isPresent()) {
                    superAdminProfileRepository.delete(superProfileOpt.get());
                }
            } else if (user.getRole() == UserRole.SALES) {
                Optional<SalesPerson> salesPersonOpt = salesPersonRepository.findByUser(user);
                if (salesPersonOpt.isPresent()) {
                    salesPersonRepository.delete(salesPersonOpt.get());
                }
            }

            userService.delete(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Delete failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
