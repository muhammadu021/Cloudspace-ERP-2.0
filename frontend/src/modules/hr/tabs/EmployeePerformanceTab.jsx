import React from 'react';
import { Badge } from '../../../design-system/components';
import { useGetEmployeePerformanceQuery } from '../../../store/api/hrApi';

export const EmployeePerformanceTab = ({ employee }) => {
  const { data: performance, isLoading } = useGetEmployeePerformanceQuery(employee.id);

  if (isLoading) {
    return <div>Loading performance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600">Overall Rating</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {performance?.overallRating || 'N/A'}
          </div>
          <div className="text-xs text-blue-600 mt-1">out of 5</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600">Goals Completed</div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {performance?.goalsCompleted || 0}
          </div>
          <div className="text-xs text-green-600 mt-1">this year</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600">Reviews</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {performance?.reviews?.length || 0}
          </div>
          <div className="text-xs text-purple-600 mt-1">total</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-sm text-orange-600">Last Review</div>
          <div className="text-sm font-bold text-orange-900 mt-1">
            {performance?.lastReviewDate 
              ? new Date(performance.lastReviewDate).toLocaleDateString()
              : 'N/A'}
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reviews</h3>
        {performance?.reviews?.length > 0 ? (
          <div className="space-y-4">
            {performance.reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{review.title}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString()} • by {review.reviewer}
                    </div>
                  </div>
                  <Badge variant="info">Rating: {review.rating}/5</Badge>
                </div>
                <p className="text-sm text-gray-700">{review.comments}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No performance reviews yet</p>
          </div>
        )}
      </div>

      {/* Goals */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Goals</h3>
        {performance?.goals?.length > 0 ? (
          <div className="space-y-3">
            {performance.goals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{goal.title}</div>
                  <div className="text-sm text-gray-600">Due: {new Date(goal.dueDate).toLocaleDateString()}</div>
                </div>
                <Badge variant={goal.status === 'completed' ? 'success' : 'warning'}>
                  {goal.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No goals set</p>
          </div>
        )}
      </div>
    </div>
  );
};
