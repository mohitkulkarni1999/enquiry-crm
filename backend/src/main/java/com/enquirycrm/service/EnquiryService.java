package com.enquirycrm.service;

import com.enquirycrm.domain.Enquiry;
import com.enquirycrm.domain.EnquiryStatus;
import com.enquirycrm.domain.InterestLevel;
import com.enquirycrm.domain.SalesPerson;
import com.enquirycrm.domain.User;
import com.enquirycrm.repository.EnquiryRepository;
import com.enquirycrm.repository.SalesPersonRepository;
import com.enquirycrm.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;
    private final SalesPersonRepository salesPersonRepository;
    private final UserRepository userRepository;

    public EnquiryService(EnquiryRepository enquiryRepository, SalesPersonRepository salesPersonRepository, UserRepository userRepository) {
        this.enquiryRepository = enquiryRepository;
        this.salesPersonRepository = salesPersonRepository;
        this.userRepository = userRepository;
    }

    public Page<Enquiry> getAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortBy == null ? "createdAt" : sortBy);
        sort = "asc".equalsIgnoreCase(sortDir) ? sort.ascending() : sort.descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return enquiryRepository.findAll(pageable);
    }

    public Enquiry getById(Long id) {
        return enquiryRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Enquiry not found"));
    }

    public Enquiry create(Enquiry enquiry) {
        enquiry.setId(null);
        enquiry.setCreatedAt(Instant.now());
        enquiry.setUpdatedAt(Instant.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry update(Long id, Enquiry update) {
        Enquiry existing = getById(id);
        if (update.getCustomerName() != null) existing.setCustomerName(update.getCustomerName());
        if (update.getCustomerEmail() != null) existing.setCustomerEmail(update.getCustomerEmail());
        if (update.getCustomerPhone() != null) existing.setCustomerPhone(update.getCustomerPhone());
        if (update.getStatus() != null) existing.setStatus(update.getStatus());
        if (update.getInterestLevel() != null) existing.setInterestLevel(update.getInterestLevel());
        if (update.getAssignedTo() != null) existing.setAssignedTo(update.getAssignedTo());
        if (update.getRemarks() != null) existing.setRemarks(update.getRemarks());
        if (update.getNextFollowUpAt() != null) existing.setNextFollowUpAt(update.getNextFollowUpAt());
        if (update.getPropertyType() != null) existing.setPropertyType(update.getPropertyType());
        if (update.getBudgetRange() != null) existing.setBudgetRange(update.getBudgetRange());
        if (update.getSource() != null) existing.setSource(update.getSource());
        if (update.getPriority() != null) existing.setPriority(update.getPriority());
        existing.setUpdatedAt(Instant.now());
        return enquiryRepository.save(existing);
    }

    public void delete(Long id) {
        enquiryRepository.deleteById(id);
    }

    public Enquiry assignSalesPerson(Long enquiryId, Long salesPersonId) {
        Enquiry enquiry = getById(enquiryId);
        
        // First try to find by SalesPerson ID
        SalesPerson sp = salesPersonRepository.findById(salesPersonId).orElse(null);
        
        // If not found, try to find by User ID and match by email
        if (sp == null) {
            User user = userRepository.findById(salesPersonId).orElse(null);
            if (user != null && user.getEmail() != null) {
                sp = salesPersonRepository.findByEmail(user.getEmail()).orElse(null);
            }
        }
        
        if (sp == null) {
            throw new NoSuchElementException("Sales person not found with ID: " + salesPersonId);
        }
        
        enquiry.setAssignedTo(sp);
        enquiry.setUpdatedAt(Instant.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry autoAssign(Long enquiryId) {
        Enquiry enquiry = getById(enquiryId);
        List<SalesPerson> available = salesPersonRepository.findAllByAvailableTrue();
        if (available.isEmpty()) {
            throw new IllegalStateException("No available sales persons");
        }
        SalesPerson least = available.stream()
                .min(Comparator.comparingLong(sp -> enquiryRepository.countByAssignedTo_Id(sp.getId())))
                .orElse(available.get(0));
        enquiry.setAssignedTo(least);
        enquiry.setUpdatedAt(Instant.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry updateStatus(Long enquiryId, EnquiryStatus status) {
        Enquiry enquiry = getById(enquiryId);
        enquiry.setStatus(status);
        enquiry.setUpdatedAt(Instant.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry updateInterestLevel(Long enquiryId, InterestLevel level) {
        Enquiry enquiry = getById(enquiryId);
        enquiry.setInterestLevel(level);
        enquiry.setUpdatedAt(Instant.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry addRemarks(Long enquiryId, String remarks) {
        Enquiry enquiry = getById(enquiryId);
        enquiry.setRemarks(remarks);
        enquiry.setUpdatedAt(Instant.now());
        return enquiryRepository.save(enquiry);
    }

    public Enquiry scheduleFollowUp(Long enquiryId, Instant followUpAt) {
        Enquiry enquiry = getById(enquiryId);
        enquiry.setNextFollowUpAt(followUpAt);
        enquiry.setUpdatedAt(Instant.now());
        return enquiryRepository.save(enquiry);
    }

    public Page<Enquiry> search(String term, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String q = term == null ? "" : term.trim();
        // naive search using filtered() with null filters and term in name/email/phone via repository search stub
        return enquiryRepository.search(q, pageable);
    }

    public List<Enquiry> getByStatus(EnquiryStatus status) { return enquiryRepository.findAllByStatus(status); }

    public List<Enquiry> getByInterestLevel(InterestLevel level) { return enquiryRepository.findAllByInterestLevel(level); }

    public List<Enquiry> getBySalesPerson(Long salesPersonId) { return enquiryRepository.findAllByAssignedTo_Id(salesPersonId); }


    public List<Enquiry> getUnassigned() { return enquiryRepository.findAllByAssignedToIsNull(); }

    public List<Enquiry> getActive() { return enquiryRepository.findAllByStatus(EnquiryStatus.IN_PROGRESS); }

    public List<Enquiry> getHotLeads() { return enquiryRepository.findAllByInterestLevel(InterestLevel.HOT); }

    public Page<Enquiry> getFiltered(EnquiryStatus status, InterestLevel interestLevel, Long salesPersonId,
                                     Boolean activeOnly, Instant from, Instant to, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return enquiryRepository.filtered(status, interestLevel, salesPersonId, Boolean.TRUE.equals(activeOnly), from, to, pageable);
    }

    public long getTotalCount() { return enquiryRepository.count(); }
    public long getCountByStatus(EnquiryStatus status) { return enquiryRepository.countByStatus(status); }
    public long getCountByInterestLevel(InterestLevel level) { return enquiryRepository.countByInterestLevel(level); }
    public long getCountBySalesPerson(Long salesPersonId) { return enquiryRepository.countByAssignedTo_Id(salesPersonId); }
}


