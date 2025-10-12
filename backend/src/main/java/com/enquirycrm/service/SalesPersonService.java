package com.enquirycrm.service;

import com.enquirycrm.domain.SalesPerson;
import com.enquirycrm.repository.EnquiryRepository;
import com.enquirycrm.repository.SalesPersonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class SalesPersonService {

    private final SalesPersonRepository salesPersonRepository;
    private final EnquiryRepository enquiryRepository;

    public SalesPersonService(SalesPersonRepository salesPersonRepository, EnquiryRepository enquiryRepository) {
        this.salesPersonRepository = salesPersonRepository;
        this.enquiryRepository = enquiryRepository;
    }

    public Page<SalesPerson> getAll(int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by(sortBy == null ? "name" : sortBy);
        sort = "asc".equalsIgnoreCase(sortDir) ? sort.ascending() : sort.descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return salesPersonRepository.findAll(pageable);
    }

    public SalesPerson getById(Long id) {
        return salesPersonRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Sales person not found"));
    }

    public SalesPerson create(SalesPerson sp) { sp.setId(null); return salesPersonRepository.save(sp); }

    public SalesPerson update(Long id, SalesPerson update) {
        SalesPerson existing = getById(id);
        existing.setName(update.getName());
        existing.setEmail(update.getEmail());
        existing.setPhone(update.getPhone());
        existing.setAvailable(update.isAvailable());
        return salesPersonRepository.save(existing);
    }

    public void delete(Long id) { salesPersonRepository.deleteById(id); }

    public List<SalesPerson> getAvailable() { return salesPersonRepository.findAllByAvailableTrue(); }

    public SalesPerson getLeastEnquiries() {
        return salesPersonRepository.findAll().stream()
                .min((a, b) -> Long.compare(enquiryRepository.countByAssignedTo_Id(a.getId()), enquiryRepository.countByAssignedTo_Id(b.getId())))
                .orElseThrow(() -> new NoSuchElementException("No sales persons"));
    }

    public Page<SalesPerson> search(String term, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return salesPersonRepository.search(term == null ? "" : term.trim(), pageable);
    }

    public SalesPerson updateAvailability(Long id, boolean available) {
        SalesPerson sp = getById(id);
        sp.setAvailable(available);
        return salesPersonRepository.save(sp);
    }

    public long getTotalCount() { return salesPersonRepository.count(); }
    public long getAvailableCount() { return salesPersonRepository.findAllByAvailableTrue().size(); }
}


