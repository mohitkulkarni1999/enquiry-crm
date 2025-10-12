package com.enquirycrm.web;

import com.enquirycrm.domain.Enquiry;
import com.enquirycrm.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get follow-up notifications for a specific user
     */
    @GetMapping("/follow-up/{userId}")
    public ResponseEntity<List<Enquiry>> getFollowUpNotifications(@PathVariable("userId") Long userId) {
        try {
            List<Enquiry> notifications = notificationService.getFollowUpNotificationsForUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get upcoming follow-ups for a user (next 7 days)
     */
    @GetMapping("/upcoming/{userId}")
    public ResponseEntity<List<Enquiry>> getUpcomingFollowUps(@PathVariable("userId") Long userId) {
        try {
            List<Enquiry> upcomingFollowUps = notificationService.getUpcomingFollowUpsForUser(userId);
            return ResponseEntity.ok(upcomingFollowUps);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
