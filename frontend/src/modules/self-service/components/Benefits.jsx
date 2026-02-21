import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Heart, Shield, Car, GraduationCap, CreditCard, Calendar, FileText, Download } from 'lucide-react';
import { selfServiceService } from '../../../services/selfServiceService';
import { selectApiData } from '../../../services/api';
import { toast } from 'react-hot-toast';

const Benefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const response = await selfServiceService.getBenefits();
      const apiData = selectApiData(response);

      // Ensure we have an array
      const benefitsList = Array.isArray(apiData) ? apiData : (apiData?.benefits || []);

      setBenefits(benefitsList);
      setEnrollments(benefitsList.filter(b => b.enrolled));
    } catch (error) {
      console.error('Error fetching benefits:', error);
      toast.error('Failed to fetch benefits');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (benefitId, enroll) => {
    try {
      await selfServiceService.updateBenefitEnrollment(benefitId, { enrolled: enroll });

      setBenefits(prev =>
        prev.map(benefit =>
          benefit.id === benefitId
            ? { ...benefit, enrolled: enroll }
            : benefit
        )
      );

      if (enroll) {
        const benefit = benefits.find(b => b.id === benefitId);
        setEnrollments(prev => [...prev, benefit]);
        toast.success(`Successfully enrolled in ${benefit.name}`);
      } else {
        setEnrollments(prev => prev.filter(e => e.id !== benefitId));
        toast.success('Successfully unenrolled from benefit');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('Failed to update enrollment');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Health: 'bg-red-100 text-red-800',
      Insurance: 'bg-blue-100 text-blue-800',
      Transportation: 'bg-green-100 text-green-800',
      Education: 'bg-purple-100 text-purple-800',
      Retirement: 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const totalPremium = enrollments.reduce((sum, benefit) => sum + benefit.premium, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Benefits</h1>
          <p className="text-gray-600 mt-1">Manage your benefits enrollment and view coverage details</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Monthly Premium</p>
          <p className="text-2xl font-bold text-green-600">${totalPremium}</p>
        </div>
      </div>

      {/* Benefits Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Enrolled Benefits</p>
                <p className="text-2xl font-bold text-primary">{enrollments.length}</p>
              </div>
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Benefits</p>
                <p className="text-2xl font-bold text-green-600">{benefits.length}</p>
              </div>
              <Heart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Cost</p>
                <p className="text-2xl font-bold text-purple-600">${totalPremium}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Enrollment</p>
                <p className="text-sm font-medium text-orange-600">Nov 1-30</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {benefits.map((benefit) => {
          const IconComponent = benefit.icon;
          return (
            <Card key={benefit.id} className={`${benefit.enrolled ? 'ring-2 ring-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(benefit.category)}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{benefit.name}</CardTitle>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${benefit.enrolled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {benefit.enrolled ? 'Enrolled' : 'Available'}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Benefit Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Coverage</p>
                      <p className="font-medium">{benefit.coverage}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Provider</p>
                      <p className="font-medium">{benefit.provider}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Monthly Premium</p>
                      <p className="font-medium">${benefit.premium}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Category</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(benefit.category)}`}>
                        {benefit.category}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Coverage */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Coverage Details</p>
                    <div className="space-y-1">
                      {Object.entries(benefit.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{key}:</span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      <button className="flex items-center text-sm text-primary hover:text-blue-800">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </button>
                      <button className="flex items-center text-sm text-green-600 hover:text-green-800">
                        <Download className="h-4 w-4 mr-1" />
                        Download PDF
                      </button>
                    </div>

                    <button
                      onClick={() => handleEnrollment(benefit.id, !benefit.enrolled)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${benefit.enrolled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                    >
                      {benefit.enrolled ? 'Unenroll' : 'Enroll'}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <p><strong>Open Enrollment:</strong> November 1-30, 2024. Changes made during this period will be effective January 1, 2025.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <p><strong>Qualifying Life Events:</strong> You can make changes outside of open enrollment if you experience a qualifying life event (marriage, birth, job change, etc.).</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <p><strong>Premium Deductions:</strong> Premiums are deducted from your paycheck on a pre-tax basis, reducing your taxable income.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
              <p><strong>Questions?</strong> Contact HR at hr@cloudspace.com or call (555) 123-4567 for assistance with your benefits.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Benefits;