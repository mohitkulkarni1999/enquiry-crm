package com.enquirycrm.web;

import com.enquirycrm.domain.*;
import com.enquirycrm.repository.UserRepository;
import com.enquirycrm.repository.SalesPersonRepository;
import com.enquirycrm.repository.EnquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/test-data")
@CrossOrigin(origins = "http://localhost:5173")
public class TestDataController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SalesPersonRepository salesPersonRepository;
    
    @Autowired
    private EnquiryRepository enquiryRepository;
    
    private final Random random = new Random();

    @PostMapping("/create-sample-enquiries")
    public ResponseEntity<String> createSampleEnquiries() {
        try {
            // Find Akash Dharkar user
            User akashUser = userRepository.findByUsername("AkashD").orElse(null);
            if (akashUser == null) {
                return ResponseEntity.badRequest().body("User AkashD not found");
            }

            // Find or create SalesPerson for Akash
            SalesPerson akashSalesPerson = salesPersonRepository.findAll().stream()
                .filter(sp -> sp.getName().equals("Akash Dharkar") || 
                             (sp.getUser() != null && sp.getUser().getUsername().equals("AkashD")))
                .findFirst()
                .orElse(null);

            if (akashSalesPerson == null) {
                // Create SalesPerson for Akash
                akashSalesPerson = new SalesPerson();
                akashSalesPerson.setName("Akash Dharkar");
                akashSalesPerson.setEmail(akashUser.getEmail());
                akashSalesPerson.setPhone(akashUser.getPhone());
                akashSalesPerson.setAvailable(true);
                akashSalesPerson.setUser(akashUser);
                akashSalesPerson = salesPersonRepository.save(akashSalesPerson);
            }

            // Create sample enquiries for Akash
            List<String[]> customers = Arrays.asList(
                new String[]{"John Smith", "john.smith@email.com", "+91 98765 43210"},
                new String[]{"Sarah Wilson", "sarah.wilson@email.com", "+91 98765 43211"},
                new String[]{"Michael Johnson", "michael.johnson@email.com", "+91 98765 43212"},
                new String[]{"Emma Davis", "emma.davis@email.com", "+91 98765 43213"},
                new String[]{"Alex Chen", "alex.chen@email.com", "+91 98765 43214"},
                new String[]{"Lisa Anderson", "lisa.anderson@email.com", "+91 98765 43215"},
                new String[]{"David Brown", "david.brown@email.com", "+91 98765 43216"},
                new String[]{"Jennifer Taylor", "jennifer.taylor@email.com", "+91 98765 43217"},
                new String[]{"Robert Miller", "robert.miller@email.com", "+91 98765 43218"},
                new String[]{"Maria Garcia", "maria.garcia@email.com", "+91 98765 43219"}
            );

            PropertyType[] propertyTypes = PropertyType.values();
            BudgetRange[] budgetRanges = BudgetRange.values();
            EnquiryStatus[] statuses = {EnquiryStatus.NEW, EnquiryStatus.IN_PROGRESS, EnquiryStatus.INTERESTED, EnquiryStatus.FOLLOW_UP_SCHEDULED};
            InterestLevel[] interestLevels = {InterestLevel.HOT, InterestLevel.WARM, InterestLevel.COLD};
            LeadSource[] leadSources = LeadSource.values();

            int createdCount = 0;
            for (String[] customerData : customers) {
                // Check if enquiry already exists for this customer
                List<Enquiry> existing = enquiryRepository.findAll().stream()
                    .filter(e -> e.getCustomerName().equals(customerData[0]))
                    .toList();
                
                if (existing.isEmpty()) {
                    Enquiry enquiry = new Enquiry();
                    enquiry.setCustomerName(customerData[0]);
                    enquiry.setCustomerEmail(customerData[1]);
                    enquiry.setCustomerPhone(customerData[2]);
                    
                    // Random property details
                    enquiry.setPropertyType(propertyTypes[random.nextInt(propertyTypes.length)]);
                    enquiry.setBudgetRange(budgetRanges[random.nextInt(budgetRanges.length)]);
                    enquiry.setStatus(statuses[random.nextInt(statuses.length)]);
                    enquiry.setInterestLevel(interestLevels[random.nextInt(interestLevels.length)]);
                    enquiry.setSource(leadSources[random.nextInt(leadSources.length)]);
                    enquiry.setPriority(random.nextInt(5) + 1);
                    
                    // Assign to Akash
                    enquiry.setAssignedTo(akashSalesPerson);
                    
                    // Random creation time (last 30 days)
                    Instant createdAt = Instant.now().minus(random.nextInt(30), ChronoUnit.DAYS);
                    enquiry.setCreatedAt(createdAt);
                    enquiry.setUpdatedAt(createdAt.plus(random.nextInt(5), ChronoUnit.HOURS));
                    
                    // Add some remarks
                    String[] remarks = {
                        "Customer interested in premium location",
                        "Looking for immediate possession",
                        "Budget flexible for right property",
                        "Prefers ground floor units",
                        "Needs parking for 2 cars"
                    };
                    enquiry.setRemarks(remarks[random.nextInt(remarks.length)]);
                    
                    enquiryRepository.save(enquiry);
                    createdCount++;
                }
            }

            return ResponseEntity.ok("✅ Created " + createdCount + " sample enquiries for Akash Dharkar (SalesPerson ID: " + akashSalesPerson.getId() + ")");
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating sample data: " + e.getMessage());
        }
    }

    @GetMapping("/check-akash-data")
    public ResponseEntity<String> checkAkashData() {
        try {
            User akashUser = userRepository.findByUsername("AkashD").orElse(null);
            if (akashUser == null) {
                return ResponseEntity.ok("❌ User AkashD not found");
            }

            SalesPerson akashSalesPerson = salesPersonRepository.findAll().stream()
                .filter(sp -> sp.getName().equals("Akash Dharkar") || 
                             (sp.getUser() != null && sp.getUser().getUsername().equals("AkashD")))
                .findFirst()
                .orElse(null);

            if (akashSalesPerson == null) {
                return ResponseEntity.ok("❌ SalesPerson for Akash not found");
            }

            List<Enquiry> akashEnquiries = enquiryRepository.findAllByAssignedTo_Id(akashSalesPerson.getId());

            StringBuilder response = new StringBuilder();
            response.append("✅ Akash Data Check:\n");
            response.append("User ID: ").append(akashUser.getId()).append("\n");
            response.append("User Name: ").append(akashUser.getName()).append("\n");
            response.append("SalesPerson ID: ").append(akashSalesPerson.getId()).append("\n");
            response.append("SalesPerson Name: ").append(akashSalesPerson.getName()).append("\n");
            response.append("Assigned Enquiries: ").append(akashEnquiries.size()).append("\n");
            
            if (!akashEnquiries.isEmpty()) {
                response.append("Sample Enquiries:\n");
                for (int i = 0; i < Math.min(3, akashEnquiries.size()); i++) {
                    Enquiry e = akashEnquiries.get(i);
                    response.append("- ").append(e.getCustomerName()).append(" (").append(e.getCustomerPhone()).append(")\n");
                }
            }

            return ResponseEntity.ok(response.toString());
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error checking data: " + e.getMessage());
        }
    }
}
