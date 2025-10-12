package com.enquirycrm.domain;

public enum UserRole {
    SUPER_ADMIN("Super Admin"),
    CRM_ADMIN("CRM Admin"),
    SALES("Sales Representative");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
