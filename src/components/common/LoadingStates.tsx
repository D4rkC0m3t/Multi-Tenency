import { Box, CircularProgress, Skeleton, Typography, Stack } from '@mui/material';

// Enhanced loading spinner with optional text
export const LoadingSpinner = ({ 
  size = 40, 
  text, 
  fullHeight = false 
}: { 
  size?: number; 
  text?: string; 
  fullHeight?: boolean;
}) => (
  <Box 
    display="flex" 
    flexDirection="column"
    alignItems="center" 
    justifyContent="center" 
    minHeight={fullHeight ? '60vh' : 200}
    gap={2}
  >
    <CircularProgress size={size} />
    {text && (
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    )}
  </Box>
);

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) => (
  <Stack spacing={1}>
    {Array.from({ length: rows }).map((_, index) => (
      <Stack key={index} direction="row" spacing={2} alignItems="center">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton 
            key={colIndex} 
            variant="text" 
            width={colIndex === 0 ? 200 : 100} 
            height={40}
          />
        ))}
      </Stack>
    ))}
  </Stack>
);

// Card skeleton loader
export const CardSkeleton = ({ height = 120 }: { height?: number }) => (
  <Box p={2}>
    <Skeleton variant="text" width="60%" height={24} />
    <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
    <Skeleton variant="rectangular" width="100%" height={height} sx={{ mt: 2 }} />
  </Box>
);

// Form skeleton loader
export const FormSkeleton = () => (
  <Stack spacing={3} p={2}>
    <Skeleton variant="text" width="30%" height={32} />
    <Stack spacing={2}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box key={index}>
          <Skeleton variant="text" width="20%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ mt: 0.5 }} />
        </Box>
      ))}
    </Stack>
    <Stack direction="row" spacing={2} justifyContent="flex-end">
      <Skeleton variant="rectangular" width={80} height={36} />
      <Skeleton variant="rectangular" width={100} height={36} />
    </Stack>
  </Stack>
);

// Dashboard stats skeleton
export const StatsSkeleton = () => (
  <Stack direction="row" spacing={2}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Box key={index} flex={1}>
        <CardSkeleton height={80} />
      </Box>
    ))}
  </Stack>
);

// Button loading state
export const ButtonLoading = ({ 
  loading, 
  children, 
  ...props 
}: { 
  loading: boolean; 
  children: React.ReactNode;
  [key: string]: any;
}) => (
  <Box {...props} sx={{ position: 'relative', ...props.sx }}>
    {children}
    {loading && (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: 1,
        }}
      >
        <CircularProgress size={20} />
      </Box>
    )}
  </Box>
);
