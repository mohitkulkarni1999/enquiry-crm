import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const SuccessPage = ({ onNewEnquiry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-8 lg:py-12 px-2 sm:px-4 lg:px-6">
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto">
        <Card>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Enquiry Submitted Successfully!
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              Your enquiry has been received and will be processed shortly
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              What happens next?
            </h2>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 mt-0.5">
                  1
                </div>
                <p>Our sales team will review your enquiry within 2 hours</p>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 mt-0.5">
                  2
                </div>
                <p>A dedicated sales expert will be assigned to your case</p>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 mt-0.5">
                  3
                </div>
                <p>You'll receive a call to understand your requirements in detail</p>
              </div>
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs mr-3 mt-0.5">
                  4
                </div>
                <p>Property recommendations matching your budget will be shared</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>Phone: +91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>Email: sales@enquirycrm.com</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={onNewEnquiry}
            >
              Submit Another Enquiry
            </Button>
            <Button
              variant="success"
              className="flex-1"
              onClick={() => window.location.href = 'tel:+919876543210'}
            >
              Call Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SuccessPage;
