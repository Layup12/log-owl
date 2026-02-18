import { createTheme } from '@mui/material/styles'
import type { PaletteMode } from '@mui/material'

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
    },
  })
