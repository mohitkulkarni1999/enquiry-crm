import React, { useState, useEffect } from 'react';
import StatisticsCard from './components/common/StatisticsCard';
import FilterBar from './components/common/FilterBar';
import EnquiryTable from './components/common/EnquiryTable';

const CRMDashboard = ({ enquiries = [] }) => {
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    interestLevel: 'all',
    salesPerson: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let filtered = enquiries;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(enq => enq.status === filters.status);
    }
    if (filters.interestLevel !== 'all') {
      filtered = filtered.filter(enq => enq.interestLevel === filters.interestLevel);
    }
    if (filters.salesPerson !== 'all') {
      filtered = filtered.filter(enq => enq.assignedTo?.name === filters.salesPerson);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(enq => 
        enq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.mobile.includes(searchTerm)
      );
    }

    setFilteredEnquiries(filtered);
  }, [enquiries, filters, searchTerm]);

  // Calculate statistics
  const stats = {
    total: enquiries.length,
    new: enquiries.filter(e => e.status === 'new').length,
    inProgress: enquiries.filter(e => e.status === 'in_progress').length,
    notInterested: enquiries.filter(e => e.status === 'not_interested').length,
    unqualified: enquiries.filter(e => e.status === 'unqualified').length,
    booked: enquiries.filter(e => e.status === 'booked').length,
    hot: enquiries.filter(e => e.interestLevel === 'hot').length,
    warm: enquiries.filter(e => e.interestLevel === 'warm').length,
    cold: enquiries.filter(e => e.interestLevel === 'cold').length
  };

  const conversionRate = stats.total > 0 ? ((stats.booked / stats.total) * 100).toFixed(1) : 0;

  const uniqueSalesPersons = [...new Set(enquiries.map(e => e.assignedTo?.name).filter(Boolean))];

  const handleClearFilters = () => {
    setFilters({status: 'all', interestLevel: 'all', salesPerson: 'all', dateRange: 'all'});
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            CRM Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Complete overview of leads, sales performance, and customer management
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatisticsCard title="Total Leads" value={stats.total} color="gray" />
          <StatisticsCard title="New" value={stats.new} color="blue" />
          <StatisticsCard title="In Progress" value={stats.inProgress} color="yellow" />
          <StatisticsCard title="Booked" value={stats.booked} color="green" />
          <StatisticsCard title="Hot Leads" value={stats.hot} color="red" />
          <StatisticsCard title="Conversion" value={`${conversionRate}%`} color="purple" />
        </div>

        {/* Interest Level Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <StatisticsCard 
            title=" Hot Leads" 
            value={stats.hot} 
            color="red"
            className="bg-white rounded-lg p-4 shadow-md"
          />
          <StatisticsCard 
            title=" Warm Leads" 
            value={stats.warm} 
            color="yellow"
            className="bg-white rounded-lg p-4 shadow-md"
          />
          <StatisticsCard 
            title=" Cold Leads" 
            value={stats.cold} 
            color="blue"
            className="bg-white rounded-lg p-4 shadow-md"
          />
        </div>

        {/* Filters and Search */}
        <FilterBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          uniqueSalesPersons={uniqueSalesPersons}
        />

        {/* Leads Table */}
        <EnquiryTable enquiries={filteredEnquiries} />
      </div>
    </div>
  );
};

export default CRMDashboard;
