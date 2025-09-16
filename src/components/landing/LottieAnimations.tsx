import React from "react";
import { motion } from "framer-motion";
import { Package, Truck, BarChart3 } from "lucide-react";

interface LottieComponentProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const InventoryWarehouseLottie: React.FC<LottieComponentProps> = ({ 
  className = "", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80'
  };

  return (
    <motion.div 
      className={`flex justify-center items-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl border border-green-500/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
        <div className={`${sizeClasses[size]} flex flex-col items-center justify-center relative z-10`}>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-4"
          >
            <Package className="w-16 h-16 text-green-400" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-green-100 mb-2">Warehouse</h3>
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-green-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-green-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-emerald-400/20 rounded-full blur-xl"></div>
      </div>
    </motion.div>
  );
};

export const FertilizerSpreadingLottie: React.FC<LottieComponentProps> = ({ 
  className = "", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80'
  };

  return (
    <motion.div 
      className={`flex justify-center items-center ${className}`}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 backdrop-blur-xl border border-yellow-500/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"></div>
        <div className={`${sizeClasses[size]} flex flex-col items-center justify-center relative z-10`}>
          <motion.div
            animate={{ 
              x: [0, 20, 0],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-4"
          >
            <Truck className="w-16 h-16 text-yellow-400" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-yellow-100 mb-2">Distribution</h3>
            <div className="flex space-x-1">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5] 
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-orange-400/20 rounded-full blur-xl"></div>
      </div>
    </motion.div>
  );
};

export const AnalyticsChartLottie: React.FC<LottieComponentProps> = ({ 
  className = "", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
    xl: 'w-80 h-80'
  };

  return (
    <motion.div 
      className={`flex justify-center items-center ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 backdrop-blur-xl border border-blue-500/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
        <div className={`${sizeClasses[size]} flex flex-col items-center justify-center relative z-10`}>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="mb-4"
          >
            <BarChart3 className="w-16 h-16 text-blue-400" />
          </motion.div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-blue-100 mb-2">Analytics</h3>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-blue-400 rounded-t"
                  style={{ height: `${12 + i * 4}px` }}
                  animate={{ 
                    scaleY: [1, 1.5, 1],
                    opacity: [0.6, 1, 0.6] 
                  }}
                  transition={{ 
                    duration: 2.5,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4 w-12 h-12 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-indigo-400/20 rounded-full blur-xl"></div>
      </div>
    </motion.div>
  );
};

// Compact inline animation for smaller spaces
export const InlineLottie: React.FC<{
  animationType: 'warehouse' | 'fertilizer' | 'analytics';
  className?: string;
}> = ({ animationType, className = "" }) => {
  const icons = {
    warehouse: Package,
    fertilizer: Truck,
    analytics: BarChart3
  };

  const colors = {
    warehouse: 'text-green-400',
    fertilizer: 'text-yellow-400', 
    analytics: 'text-blue-400'
  };

  const IconComponent = icons[animationType];

  return (
    <motion.div 
      className={`inline-block ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      animate={{ 
        y: [0, -5, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{ 
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <IconComponent className={`w-16 h-16 opacity-80 ${colors[animationType]}`} />
    </motion.div>
  );
};
