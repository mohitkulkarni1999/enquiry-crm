package com.enquirycrm.web;

import com.enquirycrm.domain.ActivityType;
import com.enquirycrm.domain.SalesActivity;
import com.enquirycrm.service.SalesActivityService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping(value = "/sales-activities", produces = MediaType.APPLICATION_JSON_VALUE)
public class SalesActivityController {

    private final SalesActivityService salesActivityService;

    public SalesActivityController(SalesActivityService salesActivityService) {
        this.salesActivityService = salesActivityService;
    }

    @GetMapping
    public Page<SalesActivity> getAll(@RequestParam(name = "page", defaultValue = "0") int page,
                                      @RequestParam(name = "size", defaultValue = "100") int size,
                                      @RequestParam(name = "sortBy", defaultValue = "activityDate") String sortBy,
                                      @RequestParam(name = "sortDir", defaultValue = "desc") String sortDir) {
        return salesActivityService.getAll(page, size, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public SalesActivity getById(@PathVariable("id") Long id) { return salesActivityService.getById(id); }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public SalesActivity create(@RequestBody SalesActivity sa) { return salesActivityService.create(sa); }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SalesActivity update(@PathVariable("id") Long id, @RequestBody SalesActivity update) { return salesActivityService.update(id, update); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable("id") Long id) { salesActivityService.delete(id); }

    @GetMapping("/by-enquiry/{enquiryId}")
    public List<SalesActivity> byEnquiry(@PathVariable("enquiryId") Long enquiryId) { return salesActivityService.getByEnquiry(enquiryId); }

    @GetMapping("/by-sales-person/{salesPersonId}")
    public List<SalesActivity> bySalesPerson(@PathVariable("salesPersonId") Long salesPersonId) { return salesActivityService.getBySalesPerson(salesPersonId); }

    @GetMapping("/by-type/{activityType}")
    public List<SalesActivity> byType(@PathVariable("activityType") ActivityType activityType) { return salesActivityService.getByType(activityType); }

    @GetMapping("/by-date-range")
    public Page<SalesActivity> byDateRange(@RequestParam(name = "startDate") Instant startDate,
                                           @RequestParam(name = "endDate") Instant endDate,
                                           @RequestParam(name = "page", defaultValue = "0") int page,
                                           @RequestParam(name = "size", defaultValue = "10") int size) {
        return salesActivityService.getByDateRange(startDate, endDate, page, size);
    }

    @PostMapping("/log")
    public SalesActivity log(@RequestBody SalesActivity sa) { return salesActivityService.logActivity(sa); }

    @GetMapping("/recent")
    public List<SalesActivity> recent(@RequestParam(defaultValue = "10") int limit) { return salesActivityService.getRecent(limit); }

    @GetMapping("/search")
    public Page<SalesActivity> search(@RequestParam(name = "searchTerm") String searchTerm,
                                      @RequestParam(name = "page", defaultValue = "0") int page,
                                      @RequestParam(name = "size", defaultValue = "10") int size) {
        return salesActivityService.search(searchTerm, page, size);
    }

    @GetMapping("/count/total")
    public long totalCount() { return salesActivityService.getTotalCount(); }

    @GetMapping("/count/by-type/{activityType}")
    public long countByType(@PathVariable("activityType") ActivityType activityType) { return salesActivityService.getCountByType(activityType); }

    @GetMapping("/count/by-sales-person/{salesPersonId}")
    public long countBySales(@PathVariable("salesPersonId") Long salesPersonId) { return salesActivityService.getCountBySalesPerson(salesPersonId); }
}


