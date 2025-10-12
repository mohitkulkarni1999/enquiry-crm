package com.enquirycrm.service;

import com.enquirycrm.domain.Comment;
import com.enquirycrm.domain.Enquiry;
import com.enquirycrm.domain.User;
import com.enquirycrm.repository.CommentRepository;
import com.enquirycrm.repository.EnquiryRepository;
import com.enquirycrm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private EnquiryRepository enquiryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Comment> getCommentsByEnquiryId(Long enquiryId) {
        return commentRepository.findByEnquiryIdOrderByCommentNumberAsc(enquiryId);
    }

    public Comment addComment(Long enquiryId, Long userId, String commentText) {
        Enquiry enquiry = enquiryRepository.findById(enquiryId)
            .orElseThrow(() -> new RuntimeException("Enquiry not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Get the next comment number
        Integer maxCommentNumber = commentRepository.findMaxCommentNumberByEnquiryId(enquiryId);
        int nextCommentNumber = (maxCommentNumber != null) ? maxCommentNumber + 1 : 1;

        Comment comment = new Comment(enquiry, user, commentText, nextCommentNumber);
        return commentRepository.save(comment);
    }

    public long getCommentCount(Long enquiryId) {
        return commentRepository.countByEnquiryId(enquiryId);
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
