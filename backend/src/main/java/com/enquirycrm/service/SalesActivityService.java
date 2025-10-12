package com.enquirycrm.service;

import com.enquirycrm.domain.ActivityType;
import com.enquirycrm.domain.SalesActivity;
import com.enquirycrm.repository.SalesActivityRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SalesActivityService {

    private final SalesActivityRepository salesActivityRepository;

    public SalesActivityService(SalesActivityRepository salesActivityRepository) {
        this.salesActivityRepository = salesActivityRepository;
    }

    public Page<SalesActivity> getAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortBy == null ? "activityDate" : sortBy);
        sort = "asc".equalsIgnoreCase(sortDir) ? sort.ascending() : sort.descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return salesActivityRepository.findAll(pageable);
    }

    public SalesActivity getById(Long id) {
        return salesActivityRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Activity not found"));
    }

    public SalesActivity create(SalesActivity sa) { sa.setId(null); return salesActivityRepository.save(sa); }

    public SalesActivity update(Long id, SalesActivity update) {
        SalesActivity existing = getById(id);
        existing.setActivityType(update.getActivityType());
        existing.setNotes(update.getNotes());
        existing.setActivityDate(update.getActivityDate());
        existing.setEnquiry(update.getEnquiry());
        existing.setSalesPerson(update.getSalesPerson());
        return salesActivityRepository.save(existing);
    }

    public void delete(Long id) { salesActivityRepository.deleteById(id); }

    public List<SalesActivity> getByEnquiry(Long enquiryId) { return salesActivityRepository.findAllByEnquiry_Id(enquiryId); }

    public List<SalesActivity> getBySalesPerson(Long salesPersonId) { return salesActivityRepository.findAllBySalesPerson_Id(salesPersonId); }

    public List<SalesActivity> getByType(ActivityType type) { return salesActivityRepository.findAllByActivityType(type); }

    public Page<SalesActivity> getByDateRange(Instant from, Instant to, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("activityDate").descending());
        return salesActivityRepository.findByDateRange(from, to, pageable);
    }

    public SalesActivity logActivity(SalesActivity sa) { return salesActivityRepository.save(sa); }

    public List<SalesActivity> getRecent(int limit) { return salesActivityRepository.findRecent(PageRequest.of(0, limit)).getContent(); }

    public Page<SalesActivity> search(String term, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("activityDate").descending());
        return salesActivityRepository.search(term == null ? "" : term.trim(), pageable);
    }

    public long getTotalCount() { return salesActivityRepository.count(); }
    public long getCountByType(ActivityType type) { return salesActivityRepository.findAllByActivityType(type).size(); }
    public long getCountBySalesPerson(Long salesPersonId) { return salesActivityRepository.findAllBySalesPerson_Id(salesPersonId).size(); }
}


