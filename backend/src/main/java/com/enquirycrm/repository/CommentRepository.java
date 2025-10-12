package com.enquirycrm.repository;

import com.enquirycrm.domain.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByEnquiryIdOrderByCommentNumberAsc(Long enquiryId);
    
    @Query("SELECT MAX(c.commentNumber) FROM Comment c WHERE c.enquiry.id = :enquiryId")
    Integer findMaxCommentNumberByEnquiryId(@Param("enquiryId") Long enquiryId);
    
    long countByEnquiryId(Long enquiryId);
}
