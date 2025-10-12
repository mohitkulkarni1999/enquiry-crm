import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const FilterBar = ({ 
  searchTerm, 
  onSearchChange,
  filters, 
  onFilterChange,
  onClearFilters,
  uniqueSalesPersons = []
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'not_interested', label: 'Not Interested' },
    { value: 'unqualified', label: 'Unqualified' },
    { value: 'booked', label: 'Booked' }
  ];

  const interestLevelOptions = [
    { value: 'all', label: 'All Interest Levels' },
    { value: 'hot', label: 'Hot' },
    { value: 'warm', label: 'Warm' },
    { value: 'cold', label: 'Cold' }
  ];

  const salesPersonOptions = [
    { value: 'all', label: 'All Sales Persons' },
    ...uniqueSalesPersons.map(sp => ({ value: sp, label: sp }))
  ];

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-md mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Management</h2>
      
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by name, email, or mobile number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="focus:ring-purple-500"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={filters.status}
          onChange={(e) => onFilterChange({...filters, status: e.target.value})}
          options={statusOptions}
          className="focus:ring-purple-500"
        />

        <Select
          value={filters.interestLevel}
          onChange={(e) => onFilterChange({...filters, interestLevel: e.target.value})}
          options={interestLevelOptions}
          className="focus:ring-purple-500"
        />

        <Select
          value={filters.salesPerson}
          onChange={(e) => onFilterChange({...filters, salesPerson: e.target.value})}
          options={salesPersonOptions}
          className="focus:ring-purple-500"
        />

        <Button
          variant="secondary"
          onClick={onClearFilters}
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterBar;
