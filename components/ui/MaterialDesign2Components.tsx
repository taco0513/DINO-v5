'use client'

import { 
  Button,
  TextField,
  Chip,
  Fab,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  LinearProgress,
  CircularProgress
} from '@mui/material'

// Material Design 2 스타일 컴포넌트 래퍼들
// MUI가 기본적으로 Material Design 2를 따르므로 대부분 그대로 사용

interface MD2ButtonProps {
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  fullWidth?: boolean
}

export function MD2Button(props: MD2ButtonProps) {
  return <Button {...props} />
}

interface MD2TextFieldProps {
  label?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  required?: boolean
  disabled?: boolean
  variant?: 'outlined' | 'filled' | 'standard'
  className?: string
  placeholder?: string
  fullWidth?: boolean
  multiline?: boolean
  rows?: number
  select?: boolean
  children?: React.ReactNode
}

export function MD2TextField(props: MD2TextFieldProps) {
  return <TextField {...props} />
}

interface MD2ChipProps {
  label: string
  variant?: 'filled' | 'outlined'
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default'
  size?: 'small' | 'medium'
  clickable?: boolean
  onClick?: () => void
  onDelete?: () => void
  className?: string
}

export function MD2Chip(props: MD2ChipProps) {
  return <Chip {...props} />
}

interface MD2FABProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function MD2FAB(props: MD2FABProps) {
  return <Fab {...props} />
}

interface MD2CardProps {
  elevation?: number
  variant?: 'elevation' | 'outlined'
  children: React.ReactNode
  className?: string
}

export function MD2Card({ elevation = 1, variant = 'elevation', children, className }: MD2CardProps) {
  return (
    <Card elevation={elevation} variant={variant} className={className}>
      {children}
    </Card>
  )
}

export { CardContent as MD2CardContent, CardActions as MD2CardActions }

interface MD2ProgressProps {
  variant?: 'determinate' | 'indeterminate'
  value?: number
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  size?: number
  className?: string
}

export function MD2LinearProgress({ variant = 'indeterminate', value, color = 'primary', className }: MD2ProgressProps) {
  return (
    <LinearProgress 
      variant={variant} 
      value={value} 
      color={color} 
      className={className}
    />
  )
}

export function MD2CircularProgress({ variant = 'indeterminate', value, color = 'primary', size, className }: MD2ProgressProps) {
  return (
    <CircularProgress 
      variant={variant} 
      value={value} 
      color={color} 
      size={size}
      className={className}
    />
  )
}

// Material Design 2 아이콘 버튼
interface MD2IconButtonProps {
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default'
  size?: 'small' | 'medium' | 'large'
  edge?: 'start' | 'end' | false
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function MD2IconButton(props: MD2IconButtonProps) {
  return <IconButton {...props} />
}