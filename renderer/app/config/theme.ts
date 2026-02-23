import type { PaletteMode } from '@mui/material'
import { createTheme } from '@mui/material/styles'

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: (theme) => {
          const scrollbarThumb =
            theme.palette.mode === 'dark'
              ? theme.palette.grey[600]
              : theme.palette.grey[400]
          const scrollbarTrack =
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[200]
          return {
            html: { height: '100%', overflow: 'hidden' },
            body: { height: '100%', overflow: 'hidden' },
            '#root': { height: '100%', overflow: 'hidden' },
            // Firefox
            '*': {
              scrollbarWidth: 'thin',
              scrollbarColor: `${scrollbarThumb} ${scrollbarTrack}`,
            },
            // WebKit (Chrome, Safari, Edge)
            '*::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '*::-webkit-scrollbar-track': {
              background: scrollbarTrack,
              borderRadius: 4,
            },
            '*::-webkit-scrollbar-thumb': {
              background: scrollbarThumb,
              borderRadius: 4,
            },
            '*::-webkit-scrollbar-thumb:hover': {
              background:
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[500]
                  : theme.palette.grey[500],
            },
          }
        },
      },
    },
  })
