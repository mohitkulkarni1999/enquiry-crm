package com.enquirycrm.web;

import com.enquirycrm.domain.Comment;
import com.enquirycrm.domain.Enquiry;
import com.enquirycrm.domain.EnquiryStatus;
import com.enquirycrm.domain.InterestLevel;
import com.enquirycrm.service.CommentService;
import com.enquirycrm.service.EnquiryService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/enquiries", produces = MediaType.APPLICATION_JSON_VALUE)
public class EnquiryController {

    private final EnquiryService enquiryService;
    private final CommentService commentService;

    public EnquiryController(EnquiryService enquiryService, CommentService commentService) {
        this.enquiryService = enquiryService;
        this.commentService = commentService;
    }

    @GetMapping
    public Page<Enquiry> getAll(@RequestParam(name = "page", defaultValue = "0") int page,
                                @RequestParam(name = "size", defaultValue = "100") int size,
                                @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
                                @RequestParam(name = "sortDir", defaultValue = "desc") String sortDir) {
        return enquiryService.getAll(page, size, sortBy, sortDir);
    }

    @GetMapping("/{id}")
    public Enquiry getById(@PathVariable(name = "id") Long id) { return enquiryService.getById(id); }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Enquiry create(@RequestBody Enquiry enquiry) { return enquiryService.create(enquiry); }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public Enquiry update(@PathVariable(name = "id") Long id, @RequestBody Enquiry update) { return enquiryService.update(id, update); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable(name = "id") Long id) { enquiryService.delete(id); }

    @PostMapping("/{enquiryId}/assign/{salesPersonId}")
    public Enquiry assign(@PathVariable(name = "enquiryId") Long enquiryId, @PathVariable(name = "salesPersonId") Long salesPersonId) { return enquiryService.assignSalesPerson(enquiryId, salesPersonId); }

    @PostMapping("/{enquiryId}/auto-assign")
    public Enquiry autoAssign(@PathVariable(name = "enquiryId") Long enquiryId) { return enquiryService.autoAssign(enquiryId); }

    @PutMapping("/{enquiryId}/status")
    public Enquiry updateStatus(@PathVariable(name = "enquiryId") Long enquiryId, @RequestParam(name = "status") EnquiryStatus status) { return enquiryService.updateStatus(enquiryId, status); }

    @PutMapping("/{enquiryId}/interest-level")
    public Enquiry updateInterest(@PathVariable(name = "enquiryId") Long enquiryId, @RequestParam(name = "interestLevel") InterestLevel interestLevel) { return enquiryService.updateInterestLevel(enquiryId, interestLevel); }

    @PostMapping(path = "/{enquiryId}/remarks", consumes = MediaType.TEXT_PLAIN_VALUE)
    public Enquiry addRemarks(@PathVariable(name = "enquiryId") Long enquiryId, @RequestBody String remarks) { return enquiryService.addRemarks(enquiryId, remarks); }

    @GetMapping("/search")
    public Page<Enquiry> search(@RequestParam(name = "searchTerm") String searchTerm,
                                @RequestParam(name = "page", defaultValue = "0") int page,
                                @RequestParam(name = "size", defaultValue = "10") int size) {
        return enquiryService.search(searchTerm, page, size);
    }

    @GetMapping("/by-status/{status}")
    public java.util.List<Enquiry> byStatus(@PathVariable(name = "status") EnquiryStatus status) { return enquiryService.getByStatus(status); }

    @GetMapping("/by-interest-level/{interestLevel}")
    public java.util.List<Enquiry> byInterest(@PathVariable(name = "interestLevel") InterestLevel interestLevel) { return enquiryService.getByInterestLevel(interestLevel); }

    @GetMapping("/by-sales-person/{salesPersonId}")
    public java.util.List<Enquiry> bySalesPerson(@PathVariable(name = "salesPersonId") Long salesPersonId) { return enquiryService.getBySalesPerson(salesPersonId); }


    @GetMapping("/unassigned")
    public java.util.List<Enquiry> unassigned() { return enquiryService.getUnassigned(); }

    @GetMapping("/active")
    public java.util.List<Enquiry> active() { return enquiryService.getActive(); }

    @GetMapping("/hot-leads")
    public java.util.List<Enquiry> hotLeads() { return enquiryService.getHotLeads(); }

    @PostMapping("/{enquiryId}/schedule-follow-up")
    public Enquiry schedule(@PathVariable(name = "enquiryId") Long enquiryId, @RequestParam(name = "followUpDate") Instant followUpDate) { return enquiryService.scheduleFollowUp(enquiryId, followUpDate); }

    @GetMapping("/filtered")
    public Page<Enquiry> filtered(@RequestParam(name = "status", required = false) EnquiryStatus status,
                                  @RequestParam(name = "interestLevel", required = false) InterestLevel interestLevel,
                                  @RequestParam(name = "salesPersonId", required = false) Long salesPersonId,
                                  @RequestParam(name = "activeOnly", defaultValue = "false") boolean activeOnly,
                                  @RequestParam(name = "from", required = false) Instant from,
                                  @RequestParam(name = "to", required = false) Instant to,
                                  @RequestParam(name = "page", defaultValue = "0") int page,
                                  @RequestParam(name = "size", defaultValue = "10") int size) {
        return enquiryService.getFiltered(status, interestLevel, salesPersonId, activeOnly, from, to, page, size);
    }

    @GetMapping("/count/total")
    public long totalCount() { return enquiryService.getTotalCount(); }

    @GetMapping("/count/by-status/{status}")
    public long countByStatus(@PathVariable(name = "status") EnquiryStatus status) { return enquiryService.getCountByStatus(status); }

    @GetMapping("/count/by-interest-level/{interestLevel}")
    public long countByInterest(@PathVariable(name = "interestLevel") InterestLevel interestLevel) { return enquiryService.getCountByInterestLevel(interestLevel); }

    @GetMapping("/count/by-sales-person/{salesPersonId}")
    public long countBySales(@PathVariable(name = "salesPersonId") Long salesPersonId) { return enquiryService.getCountBySalesPerson(salesPersonId); }

    // Comment endpoints
    @GetMapping("/{enquiryId}/comments")
    public List<Comment> getComments(@PathVariable(name = "enquiryId") Long enquiryId) {
        return commentService.getCommentsByEnquiryId(enquiryId);
    }

    @PostMapping("/{enquiryId}/comments")
    public Comment addComment(@PathVariable(name = "enquiryId") Long enquiryId, 
                             @RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String commentText = request.get("commentText").toString();
        return commentService.addComment(enquiryId, userId, commentText);
    }

    @GetMapping("/{enquiryId}/comments/count")
    public long getCommentCount(@PathVariable(name = "enquiryId") Long enquiryId) {
        return commentService.getCommentCount(enquiryId);
    }

    @DeleteMapping("/comments/{commentId}")
    public void deleteComment(@PathVariable(name = "commentId") Long commentId) {
        commentService.deleteComment(commentId);
    }
}


