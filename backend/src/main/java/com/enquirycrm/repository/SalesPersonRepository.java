package com.enquirycrm.repository;

import com.enquirycrm.domain.SalesPerson;
import com.enquirycrm.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SalesPersonRepository extends JpaRepository<SalesPerson, Long> {

    List<SalesPerson> findAllByAvailableTrue();
    
    Optional<SalesPerson> findByEmail(String email);
    
    Optional<SalesPerson> findByUser(User user);

    @Query("select sp from SalesPerson sp where " +
            "(:term is null or :term = '' or lower(sp.name) like lower(concat('%', :term, '%')) or " +
            "lower(sp.email) like lower(concat('%', :term, '%')) or " +
            "lower(sp.phone) like lower(concat('%', :term, '%')))")
    Page<SalesPerson> search(@Param("term") String term, Pageable pageable);
}


