package com.enquirycrm.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

@Entity
@Table(name = "enquiry")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Enquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 120)
    private String customerName;

    @Size(max = 150)
    private String customerEmail;

    @Size(max = 20)
    @com.fasterxml.jackson.annotation.JsonAlias({"customerMobile"})
    private String customerPhone;

    // Frontend expects mobile alias
    @Transient
    public String getCustomerMobile() { return customerPhone; }

    @Enumerated(EnumType.STRING)
    private EnquiryStatus status = EnquiryStatus.NEW;

    @Enumerated(EnumType.STRING)
    private InterestLevel interestLevel;

    @Enumerated(EnumType.STRING)
    private PropertyType propertyType;

    @Enumerated(EnumType.STRING)
    private BudgetRange budgetRange;

    @Enumerated(EnumType.STRING)
    private LeadSource source = LeadSource.WEBSITE;

    private Integer priority = 1;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sales_person_id")
    private SalesPerson assignedTo;

    @Column(length = 2000)
    private String remarks;

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private Instant createdAt = Instant.now();

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private Instant updatedAt = Instant.now();

    @com.fasterxml.jackson.annotation.JsonFormat(shape = com.fasterxml.jackson.annotation.JsonFormat.Shape.STRING)
    private Instant nextFollowUpAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }
    public EnquiryStatus getStatus() { return status; }
    public void setStatus(EnquiryStatus status) { this.status = status; }
    public InterestLevel getInterestLevel() { return interestLevel; }
    public void setInterestLevel(InterestLevel interestLevel) { this.interestLevel = interestLevel; }
    public SalesPerson getAssignedTo() { return assignedTo; }
    public void setAssignedTo(SalesPerson assignedTo) { this.assignedTo = assignedTo; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Instant getNextFollowUpAt() { return nextFollowUpAt; }
    public void setNextFollowUpAt(Instant nextFollowUpAt) { this.nextFollowUpAt = nextFollowUpAt; }
    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }
    public BudgetRange getBudgetRange() { return budgetRange; }
    public void setBudgetRange(BudgetRange budgetRange) { this.budgetRange = budgetRange; }
    public LeadSource getSource() { return source; }
    public void setSource(LeadSource source) { this.source = source; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
}


