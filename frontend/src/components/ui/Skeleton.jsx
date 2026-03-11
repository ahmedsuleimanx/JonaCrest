import React from 'react';

/**
 * Skeleton shimmer effect component for loading states
 * PRD Section 5.3 - Loading States & Skeleton UI
 */

// Base skeleton component with shimmer animation
export const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]';
  
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-full',
    image: 'w-full h-48 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
    card: 'w-full h-64 rounded-2xl'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

// Property Card Skeleton
export const PropertyCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
    {/* Image placeholder */}
    <div className="relative">
      <Skeleton variant="image" className="h-52" />
      {/* Price badge skeleton */}
      <div className="absolute top-4 right-4">
        <Skeleton className="w-24 h-8 rounded-lg" />
      </div>
    </div>
    
    {/* Content */}
    <div className="p-5 space-y-4">
      <Skeleton variant="title" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      
      {/* Features row */}
      <div className="flex gap-4">
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-12 h-4" />
        <Skeleton className="w-16 h-4" />
      </div>
      
      {/* Amenities */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="w-8 h-8 rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

// Property List Skeleton (multiple cards)
export const PropertyListSkeleton = ({ count = 6 }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <PropertyCardSkeleton key={i} />
    ))}
  </div>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
        <Skeleton variant="avatar" className="mb-4" />
        <Skeleton variant="title" className="w-16 mb-2" />
        <Skeleton variant="text" className="w-3/4" />
      </div>
    ))}
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ cols = 4 }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <Skeleton variant="text" className={`w-${i === 0 ? 'full' : '3/4'}`} />
      </td>
    ))}
  </tr>
);

// Full Table Skeleton
export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-6 py-4 text-left">
              <Skeleton variant="text" className="w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} cols={cols} />
        ))}
      </tbody>
    </table>
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 4 }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i}>
        <Skeleton variant="text" className="w-24 mb-2" />
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    ))}
    <Skeleton variant="button" className="w-full h-12" />
  </div>
);

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <div className="relative h-[600px] overflow-hidden">
    <Skeleton className="w-full h-full" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <Skeleton variant="title" className="w-96 h-12 mx-auto" />
        <Skeleton variant="text" className="w-64 h-6 mx-auto" />
        <div className="flex justify-center gap-4">
          <Skeleton variant="button" className="w-32" />
          <Skeleton variant="button" className="w-32" />
        </div>
      </div>
    </div>
  </div>
);

// Profile Card Skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100">
    <div className="flex items-center gap-4 mb-6">
      <Skeleton variant="avatar" className="w-16 h-16" />
      <div className="flex-1">
        <Skeleton variant="title" className="w-32 mb-2" />
        <Skeleton variant="text" className="w-48" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton variant="text" className="w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
    </div>
  </div>
);

// Map Skeleton
export const MapSkeleton = () => (
  <div className="relative">
    <Skeleton className="w-full h-80 rounded-xl" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-gray-400 flex items-center gap-2">
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span>Loading map...</span>
      </div>
    </div>
  </div>
);

// Gallery Skeleton
export const GallerySkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="w-full h-96 rounded-2xl" />
    <div className="flex gap-2 overflow-hidden">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="w-24 h-24 rounded-lg flex-shrink-0" />
      ))}
    </div>
  </div>
);

export default {
  Skeleton,
  PropertyCardSkeleton,
  PropertyListSkeleton,
  DashboardStatsSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  FormSkeleton,
  HeroSkeleton,
  ProfileSkeleton,
  MapSkeleton,
  GallerySkeleton
};
