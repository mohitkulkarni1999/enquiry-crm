package com.enquirycrm.web;

import com.enquirycrm.domain.SalesPerson;
import com.enquirycrm.service.SalesPersonService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/sales-persons", produces = MediaType.APPLICATION_JSON_VALUE)
public class SalesPersonController {

    private final SalesPersonService salesPersonService;

    public SalesPersonController(SalesPersonService salesPersonService) {
        this.salesPersonService = salesPersonService;
    }

    @GetMapping
    public Page<SalesPerson> getAll(@RequestParam(name = "page", defaultValue = "0") int page,
                                    @RequestParam(name = "size", defaultValue = "100") int size,
                                    @RequestParam(name = "sortBy", defaultValue = "name") String sortBy,
                                    @RequestParam(name = "sortDir", defaultValue = "asc") String sortDir) {
        return salesPersonService.getAll(page, size, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public SalesPerson getById(@PathVariable(name = "id") Long id) { return salesPersonService.getById(id); }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public SalesPerson create(@RequestBody SalesPerson sp) { return salesPersonService.create(sp); }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SalesPerson update(@PathVariable(name = "id") Long id, @RequestBody SalesPerson update) { return salesPersonService.update(id, update); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable(name = "id") Long id) { salesPersonService.delete(id); }

    @GetMapping("/available")
    public List<SalesPerson> available() { return salesPersonService.getAvailable(); }

    @GetMapping("/least-enquiries")
    public SalesPerson least() { return salesPersonService.getLeastEnquiries(); }

    @GetMapping("/search")
    public Page<SalesPerson> search(@RequestParam(name = "searchTerm") String searchTerm,
                                    @RequestParam(name = "page", defaultValue = "0") int page,
                                    @RequestParam(name = "size", defaultValue = "10") int size) {
        return salesPersonService.search(searchTerm, page, size);
    }

    @PutMapping("/{id}/availability")
    public SalesPerson availability(@PathVariable(name = "id") Long id, @RequestParam(name = "available") boolean available) { return salesPersonService.updateAvailability(id, available); }

    @GetMapping("/count/total")
    public long totalCount() { return salesPersonService.getTotalCount(); }

    @GetMapping("/count/available")
    public long availableCount() { return salesPersonService.getAvailableCount(); }
}


