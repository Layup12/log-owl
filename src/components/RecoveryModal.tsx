import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@shared/ui'

interface RecoveryModalProps {
  open: boolean
  onClose: () => void
}

export function RecoveryModal({ open, onClose }: RecoveryModalProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Восстановление</DialogTitle>
      <DialogContent>Незавершённые интервалы закрыты по last_seen.</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>OK</Button>
      </DialogActions>
    </Dialog>
  )
}
