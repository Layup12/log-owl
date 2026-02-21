import React from 'react'
import { Box } from '@renderer/shared/ui'

/**
 * Область с собственным скроллом. Заполняет родителя (родитель должен иметь position: relative и заданную высоту).
 * Размер задаётся через position: absolute; inset: 0 — не зависит от flex.
 */
export function ScrollView({ children, sx: _omitSx, ...rest }: React.ComponentProps<typeof Box>) {
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
