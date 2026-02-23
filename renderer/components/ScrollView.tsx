import { Box } from '@renderer/shared/ui'
import React from 'react'

export function ScrollView({
  children,
  sx: _omitSx,
  ...rest
}: React.ComponentProps<typeof Box>) {
  return (
    <Box
      {...rest}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
      }}
    >
      {children}
    </Box>
  )
}
