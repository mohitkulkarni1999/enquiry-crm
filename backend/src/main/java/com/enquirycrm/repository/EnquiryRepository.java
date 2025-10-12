package com.enquirycrm.repository;

import com.enquirycrm.domain.Enquiry;
import com.enquirycrm.domain.EnquiryStatus;
import com.enquirycrm.domain.InterestLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {

    Page<Enquiry> findAllByStatus(EnquiryStatus status, Pageable pageable);

    List<Enquiry> findAllByStatus(EnquiryStatus status);

    List<Enquiry> findAllByInterestLevel(InterestLevel interestLevel);

    List<Enquiry> findAllByAssignedTo_Id(Long salesPersonId);

    List<Enquiry> findAllByAssignedToIsNull();

    @Query("select e from Enquiry e where ( :term is null or :term = '' or " +
            "lower(e.customerName) like lower(concat('%', :term, '%')) or " +
            "lower(e.customerEmail) like lower(concat('%', :term, '%')) or " +
            "lower(e.customerPhone) like lower(concat('%', :term, '%')) or " +
            "lower(e.remarks) like lower(concat('%', :term, '%')) )")
    Page<Enquiry> search(@Param("term") String term, Pageable pageable);

    @Query("select e from Enquiry e where " +
            "(:status is null or e.status = :status) and " +
            "(:interestLevel is null or e.interestLevel = :interestLevel) and " +
            "(:salesPersonId is null or e.assignedTo.id = :salesPersonId) and " +
            "(:activeOnly = false or e.status in (com.enquirycrm.domain.EnquiryStatus.IN_PROGRESS, com.enquirycrm.domain.EnquiryStatus.FOLLOW_UP)) and " +
            "(:from is null or e.createdAt >= :from) and " +
            "(:to is null or e.createdAt <= :to)")
    Page<Enquiry> filtered(@Param("status") EnquiryStatus status,
                           @Param("interestLevel") InterestLevel interestLevel,
                           @Param("salesPersonId") Long salesPersonId,
                           @Param("activeOnly") boolean activeOnly,
                           @Param("from") Instant from,
                           @Param("to") Instant to,
                           Pageable pageable);

    long countByStatus(EnquiryStatus status);

    long countByInterestLevel(InterestLevel interestLevel);

    long countByAssignedTo_Id(Long salesPersonId);

    // Follow-up notification methods
    List<Enquiry> findByNextFollowUpAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<Enquiry> findByAssignedTo_IdAndNextFollowUpAtBetween(Long salesPersonId, LocalDateTime start, LocalDateTime end);
}


