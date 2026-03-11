import { motion } from 'framer-motion';

export const ShimmerCard = ({ className = '' }) => (
  <div className={`glass-card p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="shimmer w-12 h-12 rounded-xl" />
      <div className="shimmer w-16 h-6 rounded-lg" />
    </div>
    <div className="shimmer w-24 h-4 rounded-lg mb-2" />
    <div className="shimmer w-32 h-8 rounded-lg mb-2" />
    <div className="shimmer w-40 h-3 rounded-lg" />
  </div>
);

export const ShimmerTable = ({ rows = 5 }) => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="shimmer w-48 h-7 rounded-lg" />
      <div className="shimmer w-32 h-10 rounded-xl" />
    </div>
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl">
          <div className="shimmer w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="shimmer w-3/4 h-4 rounded-lg" />
            <div className="shimmer w-1/2 h-3 rounded-lg" />
          </div>
          <div className="shimmer w-20 h-8 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const ShimmerChart = () => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="shimmer w-48 h-6 rounded-lg" />
      <div className="shimmer w-24 h-8 rounded-lg" />
    </div>
    <div className="liquid-shimmer w-full h-[300px]" />
  </div>
);

export const DashboardShimmer = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <div className="shimmer w-64 h-9 rounded-xl mb-3" />
        <div className="shimmer w-80 h-5 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <div className="shimmer w-40 h-10 rounded-xl" />
        <div className="shimmer w-28 h-10 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <ShimmerCard key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <ShimmerChart />
      </div>
      <ShimmerChart />
    </div>
  </motion.div>
);

export const TablePageShimmer = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-6"
  >
    <div className="flex items-center justify-between">
      <div className="shimmer w-48 h-9 rounded-xl" />
      <div className="shimmer w-36 h-10 rounded-xl" />
    </div>
    <ShimmerTable rows={6} />
  </motion.div>
);
