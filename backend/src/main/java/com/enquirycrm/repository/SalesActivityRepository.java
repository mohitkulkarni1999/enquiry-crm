package com.enquirycrm.repository;

import com.enquirycrm.domain.ActivityType;
import com.enquirycrm.domain.SalesActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface SalesActivityRepository extends JpaRepository<SalesActivity, Long> {

    List<SalesActivity> findAllByEnquiry_Id(Long enquiryId);

    List<SalesActivity> findAllBySalesPerson_Id(Long salesPersonId);

    List<SalesActivity> findAllByActivityType(ActivityType activityType);

    @Query("select sa from SalesActivity sa where sa.activityDate between :from and :to")
    Page<SalesActivity> findByDateRange(@Param("from") Instant from, @Param("to") Instant to, Pageable pageable);

    @Query("select sa from SalesActivity sa where (:term is null or :term = '' or lower(sa.notes) like lower(concat('%', :term, '%')))")
    Page<SalesActivity> search(@Param("term") String term, Pageable pageable);

    @Query("select sa from SalesActivity sa order by sa.activityDate desc")
    Page<SalesActivity> findRecent(Pageable pageable);
}


