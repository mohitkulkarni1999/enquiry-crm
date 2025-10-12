package com.enquirycrm.web;

import com.enquirycrm.domain.User;
import com.enquirycrm.domain.UserRole;
import com.enquirycrm.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/users", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<User> getAll(@RequestParam(name = "page", defaultValue = "0") int page,
                            @RequestParam(name = "size", defaultValue = "100") int size,
                            @RequestParam(name = "sortBy", defaultValue = "name") String sortBy,
                            @RequestParam(name = "sortDir", defaultValue = "asc") String sortDir) {
        return userService.getAll(page, size, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable(name = "id") Long id) {
        return userService.getById(id);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public User create(@RequestBody User user) {
        return userService.create(user);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public User update(@PathVariable(name = "id") Long id, @RequestBody User update) {
        return userService.update(id, update);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable(name = "id") Long id) {
        userService.delete(id);
    }

    @PutMapping("/{id}/status")
    public User updateStatus(@PathVariable(name = "id") Long id, @RequestParam(name = "active") boolean active) {
        return userService.updateStatus(id, active);
    }

    @GetMapping("/by-role/{role}")
    public List<User> getByRole(@PathVariable(name = "role") UserRole role) {
        return userService.getByRole(role);
    }

    @GetMapping("/active")
    public List<User> getActiveUsers() {
        return userService.getActiveUsers();
    }

    @GetMapping("/active/by-role/{role}")
    public List<User> getActiveUsersByRole(@PathVariable(name = "role") UserRole role) {
        return userService.getActiveUsersByRole(role);
    }

    @GetMapping("/search")
    public Page<User> search(@RequestParam(name = "searchTerm") String searchTerm,
                            @RequestParam(name = "page", defaultValue = "0") int page,
                            @RequestParam(name = "size", defaultValue = "10") int size) {
        return userService.searchUsers(searchTerm, page, size);
    }

    // Analytics endpoints
    @GetMapping("/count/total")
    public long getTotalCount() {
        return userService.getTotalCount();
    }

    @GetMapping("/count/active")
    public long getActiveCount() {
        return userService.getActiveCount();
    }

    @GetMapping("/count/by-role/{role}")
    public long getCountByRole(@PathVariable(name = "role") UserRole role) {
        return userService.getCountByRole(role);
    }

    @GetMapping("/count/active/by-role/{role}")
    public long getActiveCountByRole(@PathVariable(name = "role") UserRole role) {
        return userService.getActiveCountByRole(role);
    }
}
