package com.enquirycrm.service;

import com.enquirycrm.domain.Enquiry;
import com.enquirycrm.repository.EnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private EnquiryRepository enquiryRepository;

    /**
     * Check for follow-up notifications every hour
     * This runs automatically to check for enquiries that need follow-up today
     */
    @Scheduled(fixedRate = 3600000) // Run every hour
    public void checkFollowUpNotifications() {
        LocalDate today = LocalDate.now();
        
        // Find all enquiries with follow-up dates for today
        List<Enquiry> todayFollowUps = enquiryRepository.findByNextFollowUpAtBetween(
            today.atStartOfDay(),
            today.atTime(23, 59, 59)
        );
        
        // Log the notifications (in a real app, you'd send emails/SMS/push notifications)
        if (!todayFollowUps.isEmpty()) {
            System.out.println("=== FOLLOW-UP NOTIFICATIONS ===");
            System.out.println("Date: " + today);
            System.out.println("Total follow-ups today: " + todayFollowUps.size());
            
            for (Enquiry enquiry : todayFollowUps) {
                System.out.println("Customer: " + enquiry.getCustomerName());
                System.out.println("Email: " + enquiry.getCustomerEmail());
                System.out.println("Phone: " + enquiry.getCustomerMobile());
                System.out.println("Follow-up Time: " + enquiry.getNextFollowUpAt());
                System.out.println("Interest Level: " + enquiry.getInterestLevel());
                System.out.println("Status: " + enquiry.getStatus());
                System.out.println("---");
            }
        }
    }

    /**
     * Get follow-up notifications for a specific user
     */
    public List<Enquiry> getFollowUpNotificationsForUser(Long userId) {
        LocalDate today = LocalDate.now();
        
        return enquiryRepository.findByAssignedTo_IdAndNextFollowUpAtBetween(
            userId,
            today.atStartOfDay(),
            today.atTime(23, 59, 59)
        );
    }

    /**
     * Get upcoming follow-ups for a user (next 7 days)
     */
    public List<Enquiry> getUpcomingFollowUpsForUser(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);
        
        return enquiryRepository.findByAssignedTo_IdAndNextFollowUpAtBetween(
            userId,
            today.atStartOfDay(),
            nextWeek.atTime(23, 59, 59)
        );
    }
}
