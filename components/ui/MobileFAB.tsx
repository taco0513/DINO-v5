'use client'

import { useState } from 'react'
import { Fab, useTheme, useMediaQuery } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import AddStayModalEnhanced from '@/components/stays/AddStayModalEnhanced'
import { countries } from '@/lib/data/countries-and-airports'

export default function MobileFAB() {
  const [modalOpen, setModalOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))

  if (!isMobile) return null

  return (
    <>
      <Fab
        color="primary"
        aria-label="add travel record"
        onClick={() => setModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
          boxShadow: 4,
          '&:hover': {
            boxShadow: 6
          }
        }}
      >
        <AddIcon />
      </Fab>

      <AddStayModalEnhanced
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={() => {
          setModalOpen(false)
          // Trigger page refresh to update stays list
          window.location.reload()
        }}
        countries={countries}
      />
    </>
  )
}